
import { createClient } from "npm:@insforge/sdk";

const RAZORPAY_KEY_ID = "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = "6ogBi5eUEFrd4MIDl4mmLuED";

export default async function (req) {
    console.log("verify-subscription function started");

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        console.log("Handling OPTIONS request");
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== "POST") {
        console.log("Method not allowed:", req.method);
        return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        console.log("Request body:", JSON.stringify(body));
        const { payment_id, subscription_id, signature, user_id } = body;

        if (!payment_id || !subscription_id || !signature || !user_id) {
            throw new Error("Missing required parameters");
        }

        // 1. Verify Signature manually using HMAC SHA256
        const message = payment_id + "|" + subscription_id;
        const generated_signature = await generateHmacSha256(message, RAZORPAY_KEY_SECRET);

        console.log("Signature verification:", {
            received: signature,
            generated: generated_signature,
            match: generated_signature === signature
        });

        if (generated_signature !== signature) {
            return new Response(JSON.stringify({ success: false, message: "Invalid Signature" }), { status: 400, headers: corsHeaders });
        }

        // 2. Verify payment status with Razorpay API
        const basicAuth = typeof btoa === 'function'
            ? btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
            : Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentRes.ok) {
            const bodyText = await paymentRes.text();
            console.error('Failed to fetch payment from Razorpay:', paymentRes.status, bodyText);
            return new Response(JSON.stringify({ success: false, message: 'Unable to verify payment with Razorpay' }), { status: 400, headers: corsHeaders });
        }

        const paymentObj = await paymentRes.json();
        console.log('Razorpay payment object:', paymentObj);

        if (paymentObj.status !== 'captured') {
            console.error('Payment not captured:', paymentObj.status);
            return new Response(JSON.stringify({ success: false, message: 'Payment not captured' }), { status: 400, headers: corsHeaders });
        }

        if (String(paymentObj.subscription_id) !== String(subscription_id)) {
            console.error('Subscription ID mismatch:', paymentObj.subscription_id, subscription_id);
            return new Response(JSON.stringify({ success: false, message: 'Subscription mismatch' }), { status: 400, headers: corsHeaders });
        }

        // 3. Update Database using InsForge Client (idempotent)
        const insforgeUrl = Deno.env.get("INSFORGE_BASE_URL");
        const insforgeKey = Deno.env.get("ANON_KEY");

        if (!insforgeUrl || !insforgeKey) {
            throw new Error("Missing InsForge configuration in environment");
        }

        console.log("Creating InsForge client with baseUrl:", insforgeUrl);

        const insforge = createClient({
            baseUrl: insforgeUrl,
            anonKey: insforgeKey
        });

        // Check existing profile state
        const { data: existing, error: fetchErr } = await insforge.database.from('profiles').select('id, bluetech_badge, bluetech_subscription_status').eq('id', user_id).maybeSingle();
        if (fetchErr) {
            console.error('Failed to fetch profile:', fetchErr);
            throw fetchErr;
        }

        if (existing?.bluetech_badge && existing?.bluetech_subscription_status === 'active') {
            console.log('Profile already active, returning success');
            return new Response(JSON.stringify({ success: true, data: existing }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
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
            console.error("Database update error:", error);
            throw error;
        }

        console.log("Profile updated successfully:", data);

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("verify-subscription error:", error);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack 
        }), { status: 500, headers: corsHeaders });
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
