
import Razorpay from "npm:razorpay@2.9.2";

const RAZORPAY_KEY_ID = "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = "6ogBi5eUEFrd4MIDl4mmLuED";
const PLAN_NAME = "BlueTech Membership";
const PLAN_AMOUNT = 19900; // 199.00 INR

export default async function (req) {
    console.log("Function create-subscription started");

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
        console.log("Parsing request body...");
        const body = await req.json();
        console.log("Request body:", body);
        const { user_id, email } = body;

        if (!user_id) {
            throw new Error("User ID required");
        }

        console.log("Initializing Razorpay instance...");
        const instance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        // 1. Check if plan exists
        console.log("Fetching plans...");
        const plans = await instance.plans.all({ count: 20 });
        console.log("Plans fetched:", plans);

        let planId = plans.items.find(p => p.item.name === PLAN_NAME && p.item.amount === PLAN_AMOUNT && p.period === 'monthly')?.id;

        if (!planId) {
            console.log("Plan not found, creating new plan...");
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
            console.log("Plan created:", plan);
            planId = plan.id;
        } else {
            console.log("Plan found:", planId);
        }

        // 2. Create Subscription
        // Start immediately
        console.log("Creating subscription...");
        const subscription = await instance.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // 10 years
            quantity: 1,
            notes: {
                user_id: user_id,
                user_email: email
            }
        });
        console.log("Subscription created:", subscription);

        return new Response(JSON.stringify({
            subscription_id: subscription.id,
            key_id: RAZORPAY_KEY_ID
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("Error in create-subscription:", error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: corsHeaders });
    }
}
