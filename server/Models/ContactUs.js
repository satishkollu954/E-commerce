const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Message must be at least 5 characters long"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);
