const express = require("express");
const router = express.Router();
const {
  addAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
} = require("../Controllers/advertisementController");

const auth = require("../Middleware/adminAuth"); // Admin authentication

// CRUD routes
router.post("/", auth, addAdvertisement);
router.get("/", getAllAdvertisements);
router.get("/:id", getAdvertisementById);
router.put("/:id", auth, updateAdvertisement);
router.delete("/:id", auth, deleteAdvertisement);

module.exports = router;
