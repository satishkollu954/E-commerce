// productController.js
const Product = require("../Models/Product");
const Seller = require("../Models/Seller");
const User = require("../Models/User");
const Order = require("../Models/Order");

function generateSKU(productName) {
  const prefix = productName.slice(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

// @desc Add a new product
exports.addProduct = async (req, res) => {
  try {
    const {
      seller: sellerId,
      name,
      description,
      category,
      variants = [],
      images = [],
      reviews = [],
    } = req.body;

    if (!sellerId)
      return res.status(400).json({ message: "Seller ID is required" });

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (!seller.isApproved)
      return res
        .status(403)
        .json({ message: "Seller is not approved by admin" });

    // Validate variants based on category
    for (const variant of variants) {
      if (category === "child") {
        if (!variant.childAgeGroup) {
          return res
            .status(400)
            .json({ message: "childAgeGroup is required for child category" });
        }
      } else {
        if (!variant.size) {
          return res.status(400).json({
            message: "size is required for men/women/unisex category",
          });
        }
      }
      if (!variant.price || !variant.stock) {
        return res
          .status(400)
          .json({ message: "Each variant must include price and stock" });
      }
    }

    // Validate review users (if any)
    for (const review of reviews) {
      if (!review.user)
        return res.status(400).json({ message: "Review user ID is missing" });

      const user = await User.findById(review.user);
      if (!user)
        return res
          .status(404)
          .json({ message: `User not found: ${review.user}` });
    }

    // Generate unique SKU
    let skuu;
    do {
      skuu = generateSKU(name);
    } while (await Product.findOne({ sku: skuu }));

    // Clean up variants based on category
    const cleanedVariants = variants.map((v) => {
      const cleaned = {
        price: v.price,
        stock: v.stock,
        discount: v.discount || 0,
      };

      if (category === "child") {
        if (!v.childAgeGroup) {
          throw new Error("childAgeGroup is required for child category");
        }
        cleaned.childAgeGroup = v.childAgeGroup;
      } else {
        if (!v.size) {
          throw new Error("size is required for men/women/unisex category");
        }
        cleaned.size = v.size;
      }

      return cleaned;
    });

    const product = new Product({
      name,
      description,
      category,
      seller: sellerId,
      variants: cleanedVariants,
      images,
      sku: skuu,
      reviews,
    });

    const savedProduct = await product.save();

    seller.products.push(savedProduct._id);
    await seller.save();

    res.status(201).json({
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("reviews.user", "name");
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

// Get products by seller ID
exports.getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const products = await Product.find({ seller: sellerId }).populate(
      "seller",
      "storeName email"
    );
    res.status(200).json({ message: "Products fetched", products });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching seller products",
      error: error.message,
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ["men", "women", "child", "unisex"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    let query = { isApproved: true };

    if (category === "men" || category === "women") {
      query.$or = [{ category }, { category: "unisex" }];
    } else {
      query.category = category;
    }
    console.log(`Fetching products for category: ${category}`, query);
    const products = await Product.find(query);
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    console.log(
      `Fetched ${products.length} products for category: ${category} and the products is `,
      products
    );
    res.status(200).json({ message: `Products for '${category}'`, products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get product by ID with size/childAgeGroup filter
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { size, childAgeGroup } = req.query;
    let filteredVariants = product.variants;

    if (product.category === "child") {
      if (!childAgeGroup) {
        return res
          .status(400)
          .json({ message: "childAgeGroup is required in query" });
      }
      filteredVariants = product.variants.filter(
        (v) => v.childAgeGroup === childAgeGroup
      );
    } else {
      if (!size) {
        return res.status(400).json({ message: "size is required in query" });
      }
      filteredVariants = product.variants.filter((v) => v.size === size);
    }

    if (filteredVariants.length === 0) {
      return res.status(404).json({ message: "No matching variant found" });
    }

    res.json({ ...product.toObject(), variants: filteredVariants });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: err.message });
  }
};

// Update product variant by variantId
exports.updateProduct = async (req, res) => {
  try {
    const { variantId } = req.params; // get from URL: /product/:id/variant/:variantId
    const { updateVariant } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Update allowed fields
    const updatableFields = [
      "price",
      "stock",
      "discount",
      "size",
      "childAgeGroup",
    ];
    updatableFields.forEach((field) => {
      if (updateVariant[field] !== undefined) {
        variant[field] = updateVariant[field];
      }
    });

    // Auto recalculate finalPrice
    const discount = variant.discount || 0;
    variant.finalPrice = Math.round(
      variant.price - (variant.price * discount) / 100
    );

    await product.save();
    res.json({ message: "Variant updated", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update variant", error: err.message });
  }
};

// Delete product variant by variantId or entire product if no variants left
exports.deleteProduct = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Remove the specific variant
    variant.remove();

    if (product.variants.length === 0) {
      await Product.findByIdAndDelete(id);
      return res.json({ message: "All variants deleted, product removed" });
    }

    await product.save();
    res.json({ message: "Variant deleted", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete variant", error: err.message });
  }
};
// Delete product variant by variantId or entire product if no variants left
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // Remove the specific variant
    variant.remove();

    if (product.variants.length === 0) {
      await Product.findByIdAndDelete(id);
      return res.json({ message: "All variants deleted, product removed" });
    }

    await product.save();
    res.json({ message: "Variant deleted", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete variant", error: err.message });
  }
};

// Get product variants
exports.getProductVariants = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { category, variants } = product;
    let availableVariants = [];

    if (category === "child") {
      availableVariants = variants.map((v) => ({
        childAgeGroup: v.childAgeGroup,
        stock: v.stock,
        finalPrice: v.finalPrice,
      }));
    } else {
      availableVariants = variants.map((v) => ({
        size: v.size,
        stock: v.stock,
        finalPrice: v.finalPrice,
      }));
    }

    res.status(200).json({ category, availableVariants });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get variants", error: err.message });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, images = [], videos = [] } = req.body;
    const userId = req.user._id;

    const hasPurchased = await Order.findOne({
      user: userId,
      "products.product": productId,
      orderStatus: "Delivered",
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Only buyers can review." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    const newReview = { user: userId, rating, comment, images, videos };
    product.reviews.push(newReview);

    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.ratings.count;

    await product.save();
    res.status(201).json({ message: "Review added", reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ message: "Review failed", error: err.message });
  }
};

// Delete review
exports.deleteProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    review.remove();

    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.ratings.count === 0
        ? 0
        : product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.ratings.count;

    await product.save();
    res
      .status(200)
      .json({ message: "Review deleted", reviews: product.reviews });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete review", error: err.message });
  }
};
