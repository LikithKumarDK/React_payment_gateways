/**
 * Package imports
*/
import * as dotenv from 'dotenv'
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import shortid from 'shortid';
import Stripe from 'stripe';
import { v4 as uuidv4 } from "uuid";
import { Client, Environment } from 'square';

/**
 * Local file imports
*/
import paymentModel from "../model/payment.js";
import { createOrder, capturePayment } from "../helpers/paypal-api.js";

/**
 * Internal declarations
*/
dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
const client = new Client({
    accessToken: process.env.SQ_ACCESS_TOKEN,
    environment: Environment.Sandbox,
});

/**
 * Razor pay
 * Create orders
*/
router.post('/orders', async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: req.body.amount * 100,
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString("hex"),
            payment_capture: 1,
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something went wrong" });
            }
            res.status(200).json({ data: order });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Razor pay
 * Payment verify 
**/
router.post('/verify', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            /** Update payment transaction to payment detail db */
            paymentModel.create({
                razorpayDetails: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                },
                success: true,
            });
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * Paypal
 * Create orders
*/
router.post("/create-paypal-order", async (req, res) => {
    try {
        const order = await createOrder(req.body);
        console.log(order);
        res.json(order);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * Paypal
 * Capture payment
*/
router.post("/capture-paypal-order", async (req, res) => {
    const { orderID } = req.body;
    try {
        const captureData = await capturePayment(orderID);
        res.json(captureData);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * Stripe
 * Checkout
*/
router.post('/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.lineItems,
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000'
        })
        return res.status(201).json(session)
    } catch (error) {
        return res.status(500).json(error)
    }
})

/**
 * Square
 * Checkout
*/
router.post("/square-pay", async (req, res) => {
    let body = req.body;
    body.idempotencyKey = uuidv4();
    body.amountMoney = {
        amount: 1,
        currency: 'USD',
    };

    let paymentResponse = client?.paymentsApi?.createPayment(body);
    res.send(paymentResponse);
});

export default router;