// server/Routes/upload.js
const express = require("express");
const router = express.Router();
const uploadProduct = require("../Middleware/uploadProduct");
const uploadReview = require("../Middleware/uploadReview");

// For seller product image
router.post("/upload/products", uploadProduct.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  res.json({
    message: "Product image uploaded",
    filePath: `/products/${req.file.filename}`,
  });
});

// For review image or video
// For review images or videos (up to 5 files)
router.post("/upload/reviews", uploadReview.array("file", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const filePaths = req.files.map((file) => `reviews/${file.filename}`);

  res.json({
    message: "Review media uploaded",
    filePaths,
  });
});

module.exports = router;
