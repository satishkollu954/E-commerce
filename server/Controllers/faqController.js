// Controllers/faqController.js
const Faq = require("../Models/Faq");

// Create a new FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Question and Answer are required" });
    }

    const faq = new Faq({ question, answer });
    await faq.save();

    res.status(201).json({ message: "FAQ created successfully", faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all FAQs (optional: filter active ones)
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json(faq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, isActive } = req.body;

    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();
    res.status(200).json({ message: "FAQ updated successfully", faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an FAQ (soft delete or permanent)
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    // Soft delete
    faq.isActive = false;
    await faq.save();

    // OR permanent delete: await Faq.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
