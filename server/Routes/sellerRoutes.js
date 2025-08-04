//sellerRoutes.js
const express = require("express");
const {
  register,
  login,
  resetPassword,
  updateSeller,
  getProfile,
  getAllSellers,
} = require("../Controllers/sellerController");
const router = express.Router();
const auth = require("../Middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.put("/update", auth, updateSeller);
router.get("/getprofile", auth, getProfile);
router.get("/getallsellers", getAllSellers);

module.exports = router;
