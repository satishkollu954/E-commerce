// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const admin = require("../Middleware/adminAuth");
const protect = require("../Middleware/auth");
// 🛒 Place order
router.post("/place", protect, orderController.placeOrder);

// 📦 Mark order as delivered (admin only)
//router.post("/mark-delivered", admin, orderController.markOrderAsDelivered);

// ❌ Cancel order (user)
router.post("/cancel", protect, orderController.cancelOrder);

// 🔄 Initiate return request (user)
router.post("/return/initiate", protect, orderController.initiateReturnRequest);

// ✅ Approve return request (admin only)
router.post("/return/approve", admin, orderController.approveReturnRequest);

// 📥 Collect return & refund (admin only)
router.post(
  "/return/collect-refund",
  admin,
  orderController.markReturnCollectedAndRefund
);

// Reject return request (admin only)
router.post("/return/reject", admin, orderController.rejectReturnRequest);

// 📃 Get all orders (admin only)
router.get("/", admin, orderController.getAllOrders);

// 📃 Get all orders of a user
router.get("/my-orders", protect, orderController.getUserOrders);

// 🔍 Get a single order (user)
router.get("/:orderId", protect, orderController.getSingleOrder);

// 🔍 Get a single order (admin)
router.get(
  "/admin/:orderId",

  admin,
  orderController.getSingleOrderAdmin
);
module.exports = router;
