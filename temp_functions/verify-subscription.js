import { createClient } from "npm:@insforge/sdk";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "6ogBi5eUEFrd4MIDl4mmLuED";

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
        const { payment_id, subscription_id, signature, user_id } = body;

        if (!payment_id || !subscription_id || !signature || !user_id) {
            return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: corsHeaders });
        }

        // Ensure the token owner matches the requested user_id
        if (user.id !== user_id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
        }

        // 1. Verify Signature using HMAC SHA256
        const message = payment_id + "|" + subscription_id;
        const generated_signature = await generateHmacSha256(message, RAZORPAY_KEY_SECRET);

        if (generated_signature !== signature) {
            return new Response(JSON.stringify({ success: false, message: "Invalid Signature" }), { status: 400, headers: corsHeaders });
        }

        // 2. Verify payment status with Razorpay API
        const basicAuth = btoa(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET);
        const paymentRes = await fetch("https://api.razorpay.com/v1/payments/" + payment_id, {
            headers: {
                'Authorization': "Basic " + basicAuth,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentRes.ok) {
            console.error('Razorpay payment fetch failed:', paymentRes.status);
            return new Response(JSON.stringify({ success: false, message: 'Unable to verify payment with Razorpay' }), { status: 400, headers: corsHeaders });
        }

        const paymentObj = await paymentRes.json();
        if (paymentObj.status !== 'captured') {
            return new Response(JSON.stringify({ success: false, message: 'Payment not captured' }), { status: 400, headers: corsHeaders });
        }

        if (String(paymentObj.subscription_id) !== String(subscription_id)) {
            return new Response(JSON.stringify({ success: false, message: 'Subscription mismatch' }), { status: 400, headers: corsHeaders });
        }

        // 3. Idempotent DB update
        const { data: existing } = await insforge.database
            .from('profiles')
            .select('id, bluetech_badge, bluetech_subscription_status')
            .eq('id', user_id)
            .maybeSingle();

        if (existing?.bluetech_badge && existing?.bluetech_subscription_status === 'active') {
            return new Response(JSON.stringify({ success: true, data: existing }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const { data, error } = await insforge.database
            .from('profiles')
            .update({
                bluetech_badge: true,
                bluetech_subscription_status: 'active',
                bluetech_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', user_id)
            .select();

        if (error) {
            console.error("DB update error:", error.message);
            throw error;
        }

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("verify-subscription error:", error.message);
        return new Response(JSON.stringify({ error: "Verification failed" }), {
            status: 500, headers: corsHeaders
        });
    }
}

async function generateHmacSha256(message, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
