// productController.js
const Product = require("../Models/Product");
const Seller = require("../Models/Seller");
const User = require("../Models/User");
const Order = require("../Models/Order");
const fs = require("fs");
const path = require("path");

function generateSKU(productName) {
  const prefix = productName.slice(0, 3).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

// Helper: delete entire product folder
const deleteProductFolder = (productId) => {
  const folderPath = path.join(__dirname, `../uploads/reviews/${productId}`);
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
};

// @desc Add a new product
exports.addProduct = async (req, res) => {
  //  console.log(req.body);
  try {
    let {
      name,
      description,
      category,
      variants = [],
      reviews = [],
      images = [], // temp paths from frontend
    } = req.body;

    const sellerId = req.userId;
    if (!sellerId)
      return res.status(400).json({ message: "Seller ID is required" });

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (!seller.isApproved)
      return res.status(403).json({ message: "Seller not approved" });

    // Clean variants
    variants = variants.map((v) => {
      if (category === "child") {
        const { size, ...rest } = v;
        return rest;
      } else {
        const { childAgeGroup, ...rest } = v;
        return rest;
      }
    });

    // Validate variants
    for (const variant of variants) {
      if (category === "child" && !variant.childAgeGroup) {
        return res.status(400).json({ message: "childAgeGroup is required" });
      }
      if (category !== "child" && !variant.size) {
        return res.status(400).json({ message: "size is required" });
      }
      if (!variant.price || !variant.stock) {
        return res.status(400).json({ message: "Price and stock required" });
      }
    }

    // Validate reviews
    for (const review of reviews) {
      if (review.user) {
        const user = await User.findById(review.user);
        if (!user) {
          return res
            .status(404)
            .json({ message: `User not found: ${review.user}` });
        }
      }
    }

    // Generate unique SKU
    let skuu;
    do {
      skuu = generateSKU(name);
    } while (await Product.findOne({ sku: skuu }));

    // Create product
    const product = new Product({
      name,
      description,
      category,
      seller: sellerId,
      variants,
      sku: skuu,
      reviews,
      images: [],
    });

    const savedProduct = await product.save();

    // Final directory
    const finalDir = path.join(
      __dirname,
      `../uploads/products/${savedProduct._id}/Images`
    );
    fs.mkdirSync(finalDir, { recursive: true });

    const movedPaths = [];

    // Move only current product’s temp files
    for (const imgPath of images) {
      const filename = path.basename(imgPath);
      const tempPath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        "temp",
        "Images",
        filename
      );
      const newPath = path.join(finalDir, filename);

      if (fs.existsSync(tempPath)) {
        try {
          fs.renameSync(tempPath, newPath); // move file
          movedPaths.push(`/products/${savedProduct._id}/Images/${filename}`);
          console.log(`✅ Moved ${filename}`);
        } catch (err) {
          console.error(`⚠ Error moving ${filename}:`, err);
        }
      }
    }

    // Save final image paths
    savedProduct.images = movedPaths;
    await savedProduct.save();

    // ❌ REMOVE: global cleanup of temp folder
    // ✅ Instead: only remove the temp files for this product (already moved above)

    // Link product to seller
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
    // console.log(`Fetching products for category: ${category}`, query);
    const products = await Product.find(query)
      .populate("reviews.user", "name") // populate user name
      .exec();
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    // console.log(
    //   `Fetched ${products.length} products for category: ${category} and the products is `,
    //   products
    // );
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
exports.updateProductByVariantId = async (req, res) => {
  try {
    const { variantId } = req.params; // get from URL: /product/:id/variant/:variantId
    const { updateVariant } = req.body;
    console.log(updateVariant);
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

// Update product fields (except restricted ones)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Product ID from URL
    const updates = { ...req.body };
    // Remove restricted fields
    const restrictedFields = ["sku", "seller", "isApproved"];
    restrictedFields.forEach((field) => delete updates[field]);

    // Update the product
    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true, // return updated document
      runValidators: true, // validate against schema
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

// Delete product variant by variantId or entire product if no variants left
exports.deleteProduct = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    console.log("Deleting product:", id, "variantId:", variantId);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Remove the specific variant
    product.variants.pull({ _id: variantId });

    // If no variants left, delete the entire product + clean folders
    if (product.variants.length === 0) {
      await Product.findByIdAndDelete(id);

      // Remove product from seller’s list
      await Seller.findByIdAndUpdate(product.seller, {
        $pull: { products: product._id },
      });

      // Delete product images folder
      const productDir = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        product._id.toString()
      );
      if (fs.existsSync(productDir)) {
        fs.rmSync(productDir, { recursive: true, force: true });
        console.log(`✅ Deleted product folder: ${productDir}`);
      }

      // Delete review images folder
      deleteProductFolder(id);

      await Seller.findByIdAndUpdate(product.seller, {
        $pull: { products: product._id },
      });

      return res.json({ message: "All variants deleted, product removed" });
    }

    // Save updated product (if still variants left)
    await product.save();
    res.json({ message: "Variant deleted", product });
  } catch (err) {
    console.error("Delete variant error:", err);
    res.status(500).json({
      message: "Failed to delete variant",
      error: err.message,
    });
  }
};

// Delete product by Id
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all review images folder
    deleteProductFolder(id);

    // Delete the product from DB
    await Product.findByIdAndDelete(id);

    // Remove from seller's products
    await Seller.findByIdAndUpdate(product.seller, {
      $pull: { products: product._id },
    });

    // Delete product images folder
    const productDir = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      product._id.toString()
    );
    if (fs.existsSync(productDir)) {
      fs.rmSync(productDir, { recursive: true, force: true });
      console.log(`✅ Deleted product folder: ${productDir}`);
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
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

// Add images to an existing product
exports.addProductImages = async (req, res) => {
  try {
    const { id } = req.params; // product ID
    const { images } = req.body; // array of image paths from /temp/Images

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const tempDir = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      "temp",
      "Images"
    );
    const productDir = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      id,
      "Images"
    );

    fs.mkdirSync(productDir, { recursive: true });

    const newImagePaths = [];

    for (const img of images) {
      const filename = path.basename(img);
      const oldPath = path.join(tempDir, filename);
      const newPath = path.join(productDir, filename);

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        newImagePaths.push(`/products/${id}/Images/${filename}`);
      }
    }

    product.images.push(...newImagePaths);
    await product.save();

    res.json({ message: "Images added successfully", product });
  } catch (err) {
    console.error("Add product images error:", err);
    res
      .status(500)
      .json({ message: "Failed to add product images", error: err.message });
  }
};

// Delete specific images from product + cleanup folder if empty
exports.deleteProductImages = async (req, res) => {
  try {
    const { id } = req.params; // product ID
    const { images } = req.body; // array of image paths to delete

    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ message: "No images provided for deletion" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productDir = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      id,
      "Images"
    );

    // Remove images from disk
    for (const img of images) {
      const filename = path.basename(img);
      const filePath = path.join(productDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Filter out deleted images from DB
    product.images = product.images.filter(
      (imgPath) => !images.includes(imgPath)
    );
    await product.save();

    // Cleanup if Images folder is now empty
    if (fs.existsSync(productDir) && fs.readdirSync(productDir).length === 0) {
      fs.rmdirSync(productDir, { recursive: true });
      console.log(`Deleted empty Images folder for product ${id}`);
    }

    // Cleanup product folder if fully empty (no other subfolders/files)
    const productFolder = path.join(__dirname, "..", "uploads", "products", id);
    if (
      fs.existsSync(productFolder) &&
      fs.readdirSync(productFolder).length === 0
    ) {
      fs.rmdirSync(productFolder, { recursive: true });
      console.log(`Deleted empty product folder for product ${id}`);
    }

    res.json({ message: "Images deleted successfully", product });
  } catch (err) {
    console.error("Delete product images error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete product images", error: err.message });
  }
};
