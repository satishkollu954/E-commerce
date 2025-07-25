const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "seller" },
    storeName: { type: String, required: true },
    gstNumber: { type: String },
    businessAddress: { type: String },
    isApproved: { type: Boolean, default: false }, // Admin approval

    // Optional for tracking product ownership
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sellers", sellerSchema);
