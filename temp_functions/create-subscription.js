
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from "npm:@insforge/sdk";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "6ogBi5eUEFrd4MIDl4mmLuED";
const PLAN_NAME = "BlueTech Membership";
const PLAN_AMOUNT = 19900; // 199.00 INR — server-enforced

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
        const { user_id } = body;

        // Ensure the token owner matches the requested user_id
        if (user.id !== user_id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
        }

        const instance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        // 1. Find or create plan (amount enforced server-side)
        const plans = await instance.plans.all({ count: 20 });
        let planId = plans.items.find(
            p => p.item.name === PLAN_NAME && p.item.amount === PLAN_AMOUNT && p.period === 'monthly'
        )?.id;

        if (!planId) {
            const plan = await instance.plans.create({
                period: "monthly",
                interval: 1,
                item: {
                    name: PLAN_NAME,
                    amount: PLAN_AMOUNT,
                    currency: "INR",
                    description: "BlueTech Verification Badge - Monthly"
                }
            });
            planId = plan.id;
        }

        // 2. Create Subscription
        const subscription = await instance.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120,
            quantity: 1,
            notes: {
                user_id: user_id,
                user_email: user.email
            }
        });

        return new Response(JSON.stringify({
            subscription_id: subscription.id,
            key_id: RAZORPAY_KEY_ID
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("create-subscription error:", error.message);
        return new Response(JSON.stringify({ error: "Payment initialization failed" }), {
            status: 500, headers: corsHeaders
        });
    }
}
