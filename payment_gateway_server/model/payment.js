import mongoose from "mongoose";

const PaymentDetailsSchema = new mongoose.Schema({
    razorpayDetails: {
        orderId: String,
        paymentId: String,
        signature: String,
    },
    success: Boolean,
});

export default mongoose.model('PaymentDetail', PaymentDetailsSchema);