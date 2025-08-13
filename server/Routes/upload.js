// server/Routes/upload.js
const express = require("express");
const router = express.Router();
const uploadProduct = require("../Middleware/uploadProduct");
const uploadReview = require("../Middleware/uploadReview");

// Upload product images to temp folder
router.post("/upload/products", uploadProduct.array("file", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const productId = req.body.productId || req.query.productId || "temp";

  const filePaths = req.files.map(
    (file) => `/products/${productId}/Images/${file.filename}`
  );

  // If uploading one at a time, send single filePath for frontend
  if (filePaths.length === 1) {
    return res.json({
      message: "Product image uploaded",
      filePath: filePaths[0],
    });
  }

  res.json({
    message: "Product images uploaded",
    filePaths,
  });
});

// Upload review images/videos
router.post("/upload/reviews", uploadReview.array("file", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const filePaths = req.files.map((file) => `reviews/${file.filename}`);
  res.json({ message: "Review media uploaded", filePaths });
});

module.exports = router;
