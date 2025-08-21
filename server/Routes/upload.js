// server/Routes/upload.js
const express = require("express");
const router = express.Router();
const uploadProduct = require("../Middleware/uploadProduct");
const uploadReview = require("../Middleware/uploadReview");
const uploadAdvertisement = require("../Middleware/uploadAdvertisement");
const { addReview } = require("../Controllers/reviewController");
const authMiddleware = require("../Middleware/auth");
const fs = require("fs");
const path = require("path");

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
// ✅ One route handles upload + save
router.post(
  "/reviews/:productId",
  authMiddleware,
  uploadReview.array("images", 5),
  async (req, res) => {
    try {
      const { productId } = req.params;

      // move images to final folder
      const uploadedPaths = req.files.map((file) => {
        const finalPath = `/products/${productId}/reviews/Images/${file.filename}`;
        const tempPath = file.path; // temp file path
        const finalFullPath = path.join(__dirname, "..", "public", finalPath);

        // create folder if not exists
        fs.mkdirSync(path.dirname(finalFullPath), { recursive: true });

        // move file
        fs.renameSync(tempPath, finalFullPath);

        return finalPath;
      });

      // assign to req.body for controller
      req.body.images = uploadedPaths;

      await addReview(req, res);

      // temp files are now gone because renameSync moves them
    } catch (error) {
      console.error("Upload+Review error:", error);
      res.status(500).json({ message: "Upload+Review failed" });
    }
  }
);

router.post(
  "/upload/advertisements",
  uploadAdvertisement.array("file", 5), // max 5 images
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const advertisementId =
      req.body.advertisementId || req.query.advertisementId || "temp";

    const filePaths = req.files.map(
      (file) => `/advertisements/${advertisementId}/images/${file.filename}`
    );

    // ALWAYS return `filePaths` as an array
    res.json({
      message: "Advertisement images uploaded",
      filePaths,
    });
  }
);

module.exports = router;
