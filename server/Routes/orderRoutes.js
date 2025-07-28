const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/orderController");
const authMiddleware = require("../Middleware/auth");

router.post("/place", authMiddleware, orderController.placeOrder);
router.get("/admin/orders", authMiddleware, orderController.getAllOrders);
router.get("/my-orders", authMiddleware, orderController.getUserOrders);
router.get(
  "/return-request",
  authMiddleware,
  orderController.initiateReturnRequest
);
module.exports = router;
