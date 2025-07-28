//sellerRoutes.js
const express = require("express");
const {
  register,
  login,
  resetPassword,
  updateSeller,
  getProfile,
} = require("../Controllers/sellerController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.put("/update/:id", updateSeller);
router.get("/getprofile", getProfile);
module.exports = router;
