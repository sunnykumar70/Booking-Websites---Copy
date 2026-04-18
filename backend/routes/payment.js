const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

router.get('/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.json({ message: "Payment verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid payment signature" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify signature" });
    }
});

module.exports = router;
