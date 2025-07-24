const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const auth = require("../Middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/profile", auth, userController.getProfile);

// Address routes
router.post("/address", auth, userController.addAddress);
router.put("/address/:addressId", auth, userController.updateAddress);
router.delete("/address/:addressId", auth, userController.deleteAddress);

module.exports = router;
