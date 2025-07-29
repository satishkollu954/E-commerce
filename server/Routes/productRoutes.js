//productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const auth = require("../Middleware/auth");

router.post("/", productController.addProduct);
router.get("/", productController.getAllProducts);
router.get("/", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/:productId/review", auth, productController.addProductReview);
router.delete(
  "/:productId/review/:reviewId",
  auth,
  productController.deleteProductReview
);

router.get("/seller/:sellerId/products", productController.getSellerProducts);

module.exports = router;
