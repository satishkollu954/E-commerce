//productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const auth = require("../Middleware/auth");

// Create product
router.post("/", auth, productController.addProduct);

// Add new images to product
router.post("/products/:id/images", productController.addProductImages);

// Delete specific images from product
router.delete("/products/:id/images", productController.deleteProductImages);

// Get all products
router.get("/", productController.getAllProducts);

//  Fetch all products by seller
router.get("/seller/:sellerId/products", productController.getSellerProducts);

//  Fetch variants (sizes/age group) for a product
router.get("/:productId/variants", productController.getProductVariants);

//  Fetch products by category (men/women/child/unisex)
router.get("/category/:category", productController.getProductsByCategory);

//Get single product with size/childAgeGroup query
router.get("/:id", productController.getProductById);

//Update variant by size/childAgeGroup
router.patch(
  "/products/:id/variant/:variantId",
  productController.updateProductByVariantId
);

//Update product by productId
router.patch("/products/:id", productController.updateProduct);

// Delete product by size/childAgeGroup
router.delete(
  "/products/:id/variant/:variantId",
  productController.deleteProduct
);

// Delete product by productid
router.delete("/products/:id", productController.deleteProductById);

// Product Review
router.post("/:productId/review", auth, productController.addProductReview);

// Delete product review
router.delete(
  "/:productId/review/:reviewId",
  auth,
  productController.deleteProductReview
);

module.exports = router;
