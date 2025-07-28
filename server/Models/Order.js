//Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      label: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentType: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
      default: "Online",
    },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    deliveredAt: {
      type: Date,
    },
    cancelReason: String,
    discountAmount: Number,
    couponCode: String,
    orderStatus: {
      type: String,
      enum: [
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Requested", // step 1
        "Return Approved", // step 2 (approved by admin)
        "Return Picked", // ✅ step 3 (product collected)
        "Refunded",
      ],
      default: "Processing",
    },
    returnRequest: {
      reason: String,
      requestedAt: Date,
      approvedAt: Date,
    },

    trackingInfo: {
      courier: String,
      trackingId: String,
      status: String, // e.g. "In Transit", "Delivered"
      expectedDelivery: Date,
    },
    emailSentOnShipped: {
      type: Boolean,
      default: false,
    },
    emailSentOnDelivered: {
      type: Boolean,
      default: false,
    },
    emailSentOnCancelled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
