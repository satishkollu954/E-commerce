// Routes/faqRoutes.js
const express = require("express");
const router = express.Router();
const faqController = require("../Controllers/faqController");

// Optional: add authentication middleware if only admin can manage FAQs
// const { adminAuth } = require("../Middleware/auth");

// Public route to get all FAQs
router.get("/", faqController.getAllFaqs);
router.get("/:id", faqController.getFaqById);

// Admin routes for CRUD
// router.use(adminAuth);
router.post("/", faqController.createFaq);
router.put("/:id", faqController.updateFaq);
router.delete("/:id", faqController.deleteFaq);

module.exports = router;
