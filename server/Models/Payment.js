const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    gateway: {
      type: String,
      enum: ["Razorpay", "Stripe", "PayPal"], // ready for future
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    stripe_payment_id: String,
    paypal_transaction_id: String,

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    failureReason: String,
    refunds: [
      {
        refundId: String,
        amount: Number,
        status: String, // processed, failed, etc.
        createdAt: Date,
        reason: String,
      },
    ],
    // Optional, if refunds supported later
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
