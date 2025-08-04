//User.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
  },
  { _id: true }
); // 👈 This ensures each address has a unique _id

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    addresses: [addressSchema],
    wishlist: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        size: { type: String },
      },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        size: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
