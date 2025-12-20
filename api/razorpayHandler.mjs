
import Razorpay from "razorpay";
import crypto from "crypto";

// Safely initialize Razorpay client
const getRazorpayClient = () => {
    const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
        console.warn("⚠️ Razorpay client not initialized. Missing environment variables.");
        return null;
    }
    try {
        return new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_SECRET,
        });
    } catch (e) {
        console.error("Failed to init Razorpay:", e);
        return null;
    }
};

const razorpay = getRazorpayClient();

export const createOrder = async (req, res) => {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }

    try {
        const options = {
            amount: Math.round(amount), // amount in the smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        res.status(200).json({ status: "ok" });
    } else {
        res.status(400).json({ status: "failed", error: "Invalid signature" });
    }
};
