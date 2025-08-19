// Models/Faq.js
const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // To allow soft delete or disable FAQ
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
