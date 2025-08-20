const express = require("express");
const {
  addReview,
  updateReview,
  deleteReview,
  getReviews,
} = require("../Controllers/reviewController");
const auth = require("../Middleware/auth"); // 👈 JWT auth middleware
// 👈 Admin auth middleware
const router = express.Router();

// Reviews
router.post("/:productId/reviews", auth, addReview);
router.get("/:productId/reviews", getReviews);
router.put("/:productId/reviews/:reviewId", updateReview);
router.delete("/:productId/reviews/:reviewId", auth, deleteReview);

module.exports = router;
