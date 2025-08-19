// Advertisement.js
const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    // Offer info
    title: {
      type: String,
      required: true,
      trim: true, // e.g., "Summer Sale - 50% Off"
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      required: true, // e.g., URL from Cloudinary/S3
    },
    link: {
      type: String, // Landing page URL
    },

    // Coupon details
    couponCode: {
      type: String,
      trim: true, // e.g., "SUMMER50"
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // percentage = % off, fixed = flat amount
    },
    discountValue: {
      type: Number, // value for discountType
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number, // optional cap for % discounts
    },

    // Targeting
    applicableCategories: [
      {
        type: String,
        enum: ["men", "women", "child", "unisex"], // matches Product.category
      },
    ],
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],

    // Validity
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Usage limits
    usageLimit: { type: Number }, // total global usage
    perUserLimit: { type: Number }, // usage per customer

    // Status
    isActive: { type: Boolean, default: true },

    // Created by (Admin name or ID as plain string)
    createdBy: {
      type: String,
      trim: true,
      default: "admin", // e.g., "Super Admin"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
