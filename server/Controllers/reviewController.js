const fs = require("fs");
const path = require("path");
const Product = require("../Models/Product");

// Add a new review
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images = [] } = req.body; // images are already uploaded
    const userId = req.userId;

    console.log("User ID:", userId);
    console.log("Product ID:", productId);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already reviewed
    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === userId.toString()
    );
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    // Create new review
    const review = {
      user: userId,
      rating: Number(rating),
      comment,
      images, // directly use uploaded image paths
    };

    product.reviews.push(review);

    // Update ratings
    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      reviews: product.reviews,
      ratings: product.ratings,
    });
  } catch (error) {
    console.error("Add review error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    let { rating, comment, images } = req.body;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Move new images from temp → product folder
    if (images && images.length > 0) {
      const newPaths = [];
      images.forEach((imgPath) => {
        if (imgPath.includes("/reviews/temp/Images/")) {
          const fileName = path.basename(imgPath);
          const oldPath = path.join(__dirname, `../uploads${imgPath}`);
          const newDir = path.join(
            __dirname,
            `../uploads/reviews/${productId}/Images`
          );
          fs.mkdirSync(newDir, { recursive: true });

          const newPath = path.join(newDir, fileName);
          fs.renameSync(oldPath, newPath);

          newPaths.push(`/reviews/${productId}/Images/${fileName}`);
        } else {
          newPaths.push(imgPath);
        }
      });
      images = newPaths;
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    review.images = images ?? review.images;

    // Recalculate ratings
    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({
      message: "Review updated",
      reviews: product.reviews,
      ratings: product.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Delete review images from disk
    if (review.images && review.images.length > 0) {
      deleteFiles(review.images);
    }

    review.remove();

    // Recalculate ratings
    if (product.reviews.length > 0) {
      product.ratings.count = product.reviews.length;
      product.ratings.average =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length;
    } else {
      product.ratings = { average: 0, count: 0 };
    }

    await product.save();

    res.json({
      message: "Review deleted & images cleaned",
      reviews: product.reviews,
      ratings: product.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews of a product
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate(
      "reviews.user",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      reviews: product.reviews,
      ratings: product.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
