const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  { _id: true }
); // 👈 This ensures each address has a unique _id

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
