// userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const auth = require("../Middleware/auth");

// 🔐 Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/send-otp", userController.sendOtp);
router.post("/resetPassword", userController.resetPassword);
router.post("/logout", userController.logout);

// 👤 Profile routes
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

// 📦 Address routes
router.post("/address", auth, userController.addAddress);
router.put("/address/:addressId", auth, userController.updateAddress);
router.delete("/address/:addressId", auth, userController.deleteAddress);

// ❤️ Wishlist routes (variantId used instead of size)
router.post("/wishlist", auth, userController.addToWishlist);
router.get("/wishlist", auth, userController.getWishlist);
router.delete(
  "/wishlist/:productId/:variantId",
  auth,
  userController.removeFromWishlist
);

// 🛒 Cart routes (variantId used instead of size)
router.post("/cart", auth, userController.addToCart);
router.get("/cart", auth, userController.getCart);
router.put("/cart", auth, userController.updateCartItem);
router.delete(
  "/cart/:productId/:variantId",
  auth,
  userController.removeFromCart
);
router.delete("/cart", auth, userController.clearCart);

// 📦 Orders
router.get("/orders", auth, userController.getOrderHistory);

// 🔢 Count (wishlist + cart)
router.get("/count", auth, userController.getWishlistAndCartCount);

// 🛠 Admin routes (if needed)
router.get("/all", userController.getAllUsers); // optionally restrict with admin auth
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);

module.exports = router;
