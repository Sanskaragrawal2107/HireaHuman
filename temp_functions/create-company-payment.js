
import Razorpay from "npm:razorpay@2.9.2";

const RAZORPAY_KEY_ID = "rzp_test_S846vyMlkBhDUg";
const RAZORPAY_KEY_SECRET = "6ogBi5eUEFrd4MIDl4mmLuED";
const COMPANY_VERIFICATION_AMOUNT = 100000; // 1000.00 INR in paise

export default async function (req) {
    console.log("Function create-company-payment started");

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
        const { user_id, company_id, email } = body;

        if (!user_id || !company_id || !email) {
            throw new Error("User ID, Company ID, and Email are required");
        }

        console.log("Initializing Razorpay instance...");
        const instance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });

        // Create a one-time payment order
        console.log("Creating payment order...");
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

        console.log("Order created:", order);

        return new Response(JSON.stringify({
            order_id: order.id,
            key_id: RAZORPAY_KEY_ID,
            amount: COMPANY_VERIFICATION_AMOUNT,
            email: email
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });

    } catch (error) {
        console.error("Error in create-company-payment:", error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: corsHeaders });
    }
}
