/**
 * Package imports
*/
import fetch from "node-fetch";
import * as dotenv from 'dotenv'

/**
 * Internal declarations
*/
dotenv.config();

/**
 * Destructuring
*/
const { PAYPAL_BASE, PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

//////////////////////
// PayPal API helpers
//////////////////////

export async function createOrder(data) {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_BASE}/v2/checkout/orders`;
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: data.product.cost,
                    },
                },
            ],
        }),
    });

    return handleResponse(response);
}

export async function capturePayment(orderId) {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return handleResponse(response);
}

export async function generateAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString("base64");
    const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

async function handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(errorMessage);
}