// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const isAuthenticated = require("../Middleware/auth");
const isAdmin = require("../Middleware/adminAuth");

// User actions
router.post("/place", isAuthenticated, orderController.placeOrder);
router.get("/my-orders", isAuthenticated, orderController.getUserOrders);
router.get("/:orderId", isAuthenticated, orderController.getSingleOrder);
router.post(
  "/return/initiate",
  isAuthenticated,
  orderController.initiateReturnRequest
);

// Admin actions
router.get("/", isAuthenticated, isAdmin, orderController.getAllOrders);
router.get(
  "/admin/:orderId",
  isAuthenticated,
  isAdmin,
  orderController.getSingleOrderAdmin
);
router.post(
  "/deliver",
  isAuthenticated,
  isAdmin,
  orderController.markOrderAsDelivered
);
router.post(
  "/return/approve",
  isAuthenticated,
  isAdmin,
  orderController.approveReturnRequest
);
router.post(
  "/return/collect-refund",
  isAuthenticated,
  isAdmin,
  orderController.markReturnCollectedAndRefund
);

module.exports = router;
