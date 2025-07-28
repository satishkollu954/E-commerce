//adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const orderController = require("../Controllers/orderController");
const sellerController = require("../Controllers/sellerController");
const userController = require("../Controllers/userController");

// Admin edits and approves seller
router.put("/sellers/:id/edit", adminController.editSellerByAdmin);
router.delete("/seller/:id", adminController.deleteSeller);
router.post("/sellers", adminController.addSellerByAdmin); // Add
router.get("/sellers", adminController.getAllSellers); // Get all
router.get("/sellers/:id", adminController.getSellerById); // Get by ID
router.post("/:orderId/update-tracking", adminController.updateTracking);

router.get("/orders/approve-return", orderController.approveReturnRequest);
router.post(
  "/order/return-picked-refund",
  orderController.markReturnCollectedAndRefund
);

// Seller routes
router.get("/sellers", sellerController.getAllSellers);
router.get("/sellers/:id", sellerController.getSellerById);
router.post("/sellers", sellerController.addSellerByAdmin);
router.put("/sellers/:id", sellerController.editSellerByAdmin);
router.delete("/sellers/:id", sellerController.deleteSeller);

// User routes
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
