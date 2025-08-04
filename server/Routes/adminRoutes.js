const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const orderController = require("../Controllers/orderController");
const userController = require("../Controllers/userController");

// Tracking & Return
router.post("/:orderId/update-tracking", adminController.updateTracking);
router.get("/orders/approve-return", orderController.approveReturnRequest);
router.post(
  "/order/return-picked-refund",
  orderController.markReturnCollectedAndRefund
);

// Users
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
