const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const orderController = require("../Controllers/orderController");
const userController = require("../Controllers/userController");
const advertisementController = require("../Controllers/advertisementController");
// 🚚 Tracking & Return Management
router.post("/:orderId/update-tracking", adminController.updateTracking);
router.post("/orders/approve-return", orderController.approveReturnRequest);
router.post(
  "/order/return-picked-refund",
  orderController.markReturnCollectedAndRefund
);

// 👤 Users
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/user/:id", adminController.updateUser);
router.delete("/user/:id", adminController.deleteUser);

// 🛍️ Products
router.get("/products", adminController.getAllProducts); // Add if not defined in controller yet
router.put("/product/:id", adminController.updateProduct); // <-- ✅ Update Product
router.delete("/product/:id", adminController.deleteProduct); // <-- ✅ Delete Product

// 🧾 Orders
router.put("/order/:id", adminController.updateOrder); // <-- ✅ Update Order (status/tracking)
router.delete("/order/:id", adminController.deleteOrder); // <-- ✅ Delete Order
router.post("/mark-delivered", orderController.markOrderAsDelivered);

// 🛒 Sellers
router.get("/sellers", adminController.getAllSellers);
router.put("/seller/:id", adminController.updateSeller);
router.delete("/seller/:id", adminController.deleteSeller);
//router.put("/seller/edit/:id", adminController.editSellerByAdmin);

router.post("/", advertisementController.addAdvertisement);

module.exports = router;
