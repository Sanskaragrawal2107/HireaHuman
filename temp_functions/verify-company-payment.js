import { createClient } from "npm:@insforge/sdk";

const PAYU_KEY = Deno.env.get("PAYU_KEY") || "gtKFFx";
const PAYU_SALT = Deno.env.get("PAYU_SALT") || "4R38IvwiV57FwVpsgOvTXBdLE4tHUXFW";
const PAYU_BASE_URL = Deno.env.get("PAYU_BASE_URL") || "https://test.payu.in";

export default async function (req) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
        // Auth: Verify the caller is a logged-in user
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
        }

        const insforgeUrl = Deno.env.get("INSFORGE_BASE_URL");
        if (!insforgeUrl) {
            throw new Error("Server configuration error");
        }

        const userToken = authHeader.replace('Bearer ', '');
        const userId = getUserIdFromToken(userToken);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
        }

        const insforge = createClient({ baseUrl: insforgeUrl, edgeFunctionToken: userToken });

        const body = await req.json();
        const { txnid, user_id, company_id } = body;

        if (!txnid || !user_id || !company_id) {
            return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: corsHeaders });
        }

        // Ensure the token owner matches the requested user_id
        if (userId !== user_id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
        }

        // Verify the user owns this company
        const { data: company, error: compErr } = await insforge.database
            .from('companies')
            .select('id, user_id')
            .eq('id', company_id)
            .eq('user_id', userId)
            .maybeSingle();

        if (compErr || !company) {
            return new Response(JSON.stringify({ error: "Company not found or access denied" }), { status: 403, headers: corsHeaders });
        }

        // 1. Verify payment with PayU verify_payment API
        const verifyHash = await generateSha512(`${PAYU_KEY}|verify_payment|${txnid}|${PAYU_SALT}`);

        const formData = new URLSearchParams();
        formData.append('key', PAYU_KEY);
        formData.append('command', 'verify_payment');
        formData.append('var1', txnid);
        formData.append('hash', verifyHash);

        const verifyRes = await fetch(`${PAYU_BASE_URL}/merchant/postservice.php?form=2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        if (!verifyRes.ok) {
            console.error('PayU verify API failed:', verifyRes.status);
            return new Response(JSON.stringify({ success: false, message: 'Unable to verify payment with PayU' }), { status: 400, headers: corsHeaders });
        }

        const verifyData = await verifyRes.json();
        const txnDetails = verifyData?.transaction_details?.[txnid];

        if (!txnDetails || txnDetails.status !== 'success') {
            console.error('PayU payment not successful:', JSON.stringify(txnDetails));
            return new Response(JSON.stringify({ success: false, message: 'Payment not successful' }), { status: 400, headers: corsHeaders });
        }

        // 2. Verify udf1 (user_id) and udf2 (company_id) match
        if (txnDetails.udf1 !== user_id || txnDetails.udf2 !== company_id) {
            return new Response(JSON.stringify({ success: false, message: 'Transaction data mismatch' }), { status: 400, headers: corsHeaders });
        }

        // 3. Idempotent DB update
        const { data: existing } = await insforge.database
            .from('companies')
            .select('id, subscription_status')
            .eq('id', company_id)
            .maybeSingle();

        if (existing?.subscription_status === 'paid') {
            return new Response(JSON.stringify({ success: true, data: existing }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const { data, error } = await insforge.database
            .from('companies')
            .update({
                subscription_status: 'paid',
                subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', company_id)
            .select();

        if (error) {
            console.error("DB update error:", error.message);
            throw error;
        }

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("verify-company-payment error:", error.message);
        return new Response(JSON.stringify({ error: "Verification failed" }), {
            status: 500, headers: corsHeaders
        });
    }
}

function getUserIdFromToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload.sub || payload.user_id || null;
    } catch { return null; }
}

async function generateSha512(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
