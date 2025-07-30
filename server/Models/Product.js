//Product.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    images: [String], // array of image URLs
    videos: [String], // array of video URLs
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["men", "women", "child"],
      required: true,
    },
    childAgeGroup: {
      type: String, // Only for child products (optional)
      enum: ["1-5", "6-15", "16-25"],
    },

    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // percent
    finalPrice: { type: Number }, // auto-calculated in pre-save hook

    sku: { type: String, required: true, unique: true },

    sizes: [String], // ["S", "M", "L", "XL"]
    colors: [String], // ["red", "blue"]
    stockQuantity: { type: Number, default: 0 },

    images: [String], // Array of image URLs
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

// Pre-save hook to calculate finalPrice
productSchema.pre("save", function (next) {
  if (this.discount) {
    this.finalPrice = Math.round(
      this.price - (this.price * this.discount) / 100
    );
  } else {
    this.finalPrice = this.price;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
