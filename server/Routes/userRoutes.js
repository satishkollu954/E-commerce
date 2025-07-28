const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const auth = require("../Middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/resetPassword", userController.resetPassword);
router.post("/logout", userController.logout);
router.get("/profile", auth, userController.getProfile);

// Address routes
router.post("/address", auth, userController.addAddress);
router.put("/address/:addressId", auth, userController.updateAddress);
router.delete("/address/:addressId", auth, userController.deleteAddress);

router.post("/wishlist", auth, userController.addToWishlist);
router.delete("/wishlist/:productId", auth, userController.removeFromWishlist);
router.get("/wishlist", auth, userController.getWishlist);
router.get("/orders", auth, userController.getOrderHistory);

//Cart Routes
router.post("/cart", auth, userController.addToCart);
router.get("/cart", auth, userController.getCart);
router.put("/cart", auth, userController.updateCartItem);
router.delete("/cart/:productId", auth, userController.removeFromCart);
router.delete("/cart", auth, userController.clearCart);
module.exports = router;
