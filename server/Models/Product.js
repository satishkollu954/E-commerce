const mongoose = require("mongoose");

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    images: [String],
    videos: [String],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Variant Schema
const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      validate: {
        validator: function (v) {
          // Required for non-child categories
          if (this?.parent()?.category !== "child") {
            return v != null && v !== "";
          }
          return true;
        },
        message: "Size is required for men, women, or unisex categories",
      },
    },
    childAgeGroup: {
      type: String,
      enum: ["5-6", "7-8", "9-10", "11-12", "13-14"],
      validate: {
        validator: function (v) {
          // Required for child category
          if (this?.parent()?.category === "child") {
            return v != null && v !== "";
          }
          return true;
        },
        message: "Child age group is required for child category",
      },
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number },
    stock: { type: Number, required: true },
  },
  { _id: false }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    category: {
      type: String,
      enum: ["men", "women", "child", "unisex"],
      required: true,
    },

    sku: { type: String, required: true, unique: true },
    colors: [String],
    variants: [variantSchema],

    images: [String], // general product-level images
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sellers",
      required: true,
    },

    isApproved: { type: Boolean, default: false },
    shippingCharge: { type: Number, default: 0 },
    deliveryTime: { type: String, default: "3-5 business days" },

    reviews: [reviewSchema],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    tags: [String],
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

// Auto calculate finalPrice for each variant
productSchema.pre("save", function (next) {
  this.variants = this.variants.map((variant) => {
    const discount = variant.discount || 0;
    const final = Math.round(variant.price - (variant.price * discount) / 100);
    return { ...variant, finalPrice: final };
  });
  next();
});

module.exports = mongoose.model("Product", productSchema);
