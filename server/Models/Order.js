// models/Order.js
const mongoose = require("mongoose");

// a single item inside an order
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId, // <-- reference to the specific product.variants[_id]
      required: true,
    },
    name: String, // product name (copied for history)
    variant: {
      size: String,
      childAgeGroup: String,
      color: String,
    },
    price: Number, // final price at the time of purchase
    quantity: { type: Number, required: true },
    images: [String], // optional thumbnail (copied from product/variant)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [orderItemSchema],

    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    totalAmount: { type: Number, required: true },

    paymentType: { type: String, enum: ["COD", "Online"], default: "Online" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    status: {
      type: String,
      enum: [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Placed",
    },

    deliveredAt: { type: Date },

    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      status: {
        type: String,
        enum: ["Pending", "Processing", "Approved", "Rejected", "Returned"],
        default: "Pending",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
