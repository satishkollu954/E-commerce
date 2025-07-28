//paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");
const authMiddleware = require("../Middleware/auth");
const adminAuth = require("../Middleware/adminAuth");

router.post("/create-order", authMiddleware, paymentController.createOrder);
router.post("/verify", authMiddleware, paymentController.verifyPayment);
router.post("/cod-order", authMiddleware, paymentController.placeCODOrder);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;
