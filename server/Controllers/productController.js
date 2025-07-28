//productController.js
const Product = require("../Models/Product");
const Seller = require("../Models/Seller");
const User = require("../Models/User");

function generateSKU(productName) {
  const prefix = productName.slice(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000); // random 4-digit number
  return `${prefix}-${random}`;
}
// Example: TSH-4872

// @desc Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { seller: sellerId, reviews = [], name } = req.body;
    let skuu;
    do {
      skuu = generateSKU(name);
    } while (await Product.findOne({ skuu }));
    req.body.sku = skuu;
    // 1. Validate Seller
    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (!seller.isApproved) {
      return res.status(403).json({
        message: "Seller is not approved by admin. Cannot add products.",
      });
    }

    // 2. Validate All Review Users
    for (const review of reviews) {
      if (!review.user) {
        return res.status(400).json({ message: "Review user ID is missing" });
      }

      const user = await User.findById(review.user);
      if (!user) {
        return res
          .status(404)
          .json({ message: `User not found for review: ${review.user}` });
      }
    }
    console.log(req.body);
    // 3. Save Product
    const product = new Product(req.body);
    const savedProduct = await product.save();
    console.log("Saved Product:", savedProduct);
    // 4. Link Product to Seller
    seller.products.push(savedProduct._id);
    await seller.save();

    res.status(201).json({
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

// @desc Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("reviews.user", "name");

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};

// @desc Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name "
    );
    if (product.stockQuantity <= 0) {
      return res
        .status(200)
        .json({ message: "Product is out of stock", product });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

// @desc Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

// @desc Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
  }
};

//Review For Product
exports.addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images, videos } = req.body;
    const userId = req.user._id;

    // ✅ Check if user bought the product
    const hasPurchased = await Order.findOne({
      user: userId,
      "products.product": productId,
      orderStatus: "Delivered", // optional: allow only after delivery
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "Only users who bought this product can leave a review.",
      });
    }

    // ✅ Check if user already reviewed this product
    const product = await Product.findById(productId);
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // ✅ Add review
    const newReview = {
      user: userId,
      rating,
      comment,
      images,
      videos,
    };

    product.reviews.push(newReview);
    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.ratings.count;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      reviews: product.reviews,
    });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Delete review by reviewer
exports.deleteProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Find the review
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    // Ensure user is the author
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review.",
      });
    }

    // Remove review
    review.remove();

    // Update ratings
    const updatedCount = product.reviews.length;
    const updatedAverage =
      updatedCount === 0
        ? 0
        : product.reviews.reduce((sum, r) => sum + r.rating, 0) / updatedCount;

    product.ratings.count = updatedCount;
    product.ratings.average = updatedAverage;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
