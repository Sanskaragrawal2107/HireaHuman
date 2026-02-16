import { createClient } from "npm:@insforge/sdk";

const PAYU_KEY = Deno.env.get("PAYU_KEY") || "eI5LXm";
const PAYU_SALT = Deno.env.get("PAYU_SALT") || "x4khTkYlorltBXGTWRmzkSWQsYFfStpc";
const PAYU_BASE_URL = Deno.env.get("PAYU_BASE_URL") || "https://test.payu.in";
const COMPANY_AMOUNT = "1000.00"; // INR — server-enforced

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
        
        // Decode JWT to extract user ID
        const userId = getUserIdFromToken(userToken);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
        }

        // Create client with edgeFunctionToken for RLS-protected DB queries
        const insforge = createClient({ baseUrl: insforgeUrl, edgeFunctionToken: userToken });

        const body = await req.json();
        const { user_id, company_id, email } = body;

        if (!user_id || !company_id || !email) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
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

        // Generate unique transaction ID (max 25 chars for PayU)
        const txnid = `CV${company_id.substring(0, 8)}${Date.now()}`.substring(0, 25);

        const productinfo = "Company Verification Deposit";
        const firstname = (email.split('@')[0] || 'User').substring(0, 50);
        const surl = `${Deno.env.get("FRONTEND_URL") || "https://hireahuman.vercel.app"}/verify-company?payment=success&type=company&txnid=${txnid}`;
        const furl = `${Deno.env.get("FRONTEND_URL") || "https://hireahuman.vercel.app"}/verify-company?payment=failed&type=company`;

        // Generate PayU hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
        const hashString = `${PAYU_KEY}|${txnid}|${COMPANY_AMOUNT}|${productinfo}|${firstname}|${email}|${user_id}|${company_id}||||||||${PAYU_SALT}`;
        const hash = await generateSha512(hashString);

        return new Response(JSON.stringify({
            key: PAYU_KEY,
            txnid,
            amount: COMPANY_AMOUNT,
            productinfo,
            firstname,
            email,
            surl,
            furl,
            hash,
            udf1: user_id,
            udf2: company_id,
            payu_base_url: PAYU_BASE_URL
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("create-company-payment error:", error.message);
        return new Response(JSON.stringify({ error: "Payment initialization failed" }), {
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
