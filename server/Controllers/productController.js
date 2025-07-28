//productController.js
const Product = require("../Models/Product");
const Seller = require("../Models/Seller");
const User = require("../Models/User");

// @desc Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { seller: sellerId, reviews = [] } = req.body;

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

    // 3. Save Product
    const product = new Product(req.body);
    const savedProduct = await product.save();

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
