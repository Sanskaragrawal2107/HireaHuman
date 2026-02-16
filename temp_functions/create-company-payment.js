
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from "npm:@insforge/sdk";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "6ogBi5eUEFrd4MIDl4mmLuED";
const COMPANY_VERIFICATION_AMOUNT = 100000; // 1000.00 INR in paise — server-enforced

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
        // ── Auth: Verify the caller is a logged-in user ──
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
        }

        const insforgeUrl = Deno.env.get("INSFORGE_BASE_URL");
        const insforgeKey = Deno.env.get("ANON_KEY");
        if (!insforgeUrl || !insforgeKey) {
            throw new Error("Server configuration error");
        }

        const userToken = authHeader.replace('Bearer ', '');
        const insforge = createClient({ baseUrl: insforgeUrl, edgeFunctionToken: userToken });
        const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
        }

        const body = await req.json();
        const { user_id, company_id, email } = body;

        if (!user_id || !company_id || !email) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
        }

        // Ensure the token owner matches the requested user_id
        if (user.id !== user_id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
        }

        // Verify the user owns this company
        const { data: company, error: compErr } = await insforge.database
            .from('companies')
            .select('id, user_id')
            .eq('id', company_id)
            .eq('user_id', user.id)
            .maybeSingle();

        if (compErr || !company) {
            return new Response(JSON.stringify({ error: "Company not found or access denied" }), { status: 403, headers: corsHeaders });
        }

        const instance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        // Create a one-time payment order (amount enforced server-side)
        const order = await instance.orders.create({
            amount: COMPANY_VERIFICATION_AMOUNT,
            currency: "INR",
            receipt: `company_${company_id.substring(0, 8)}`,
            notes: {
                user_id: user_id,
                company_id: company_id,
                user_email: email,
                purpose: "Company Verification Deposit"
            }
        });

        return new Response(JSON.stringify({
            order_id: order.id,
            key_id: RAZORPAY_KEY_ID,
            amount: COMPANY_VERIFICATION_AMOUNT,
            email: email
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
