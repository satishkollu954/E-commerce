const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const isAuthenticatedUser = require("../Middleware/auth");
const isAdmin = require("../Middleware/adminAuth");

// Checkout / Place Order
router.post("/checkout", isAuthenticatedUser, orderController.placeOrder);

// Get user's own orders
router.get("/my-orders", isAuthenticatedUser, orderController.getUserOrders);

// Admin - Get all orders
router.get("/admin/orders", isAdmin, orderController.getAllOrders);

// User - Initiate return request
router.post(
  "/return/initiate",
  isAuthenticatedUser,
  orderController.initiateReturnRequest
);

// Admin - Approve return request
router.post(
  "/return/approve",

  isAdmin,
  orderController.approveReturnRequest
);

// Admin - Mark item as returned and refund initiated
router.post(
  "/return/refund",

  isAdmin,
  orderController.markReturnCollectedAndRefund
);

module.exports = router;
