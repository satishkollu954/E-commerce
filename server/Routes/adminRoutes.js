const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminController");
const orderController = require("../Controllers/orderController");
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

module.exports = router;
