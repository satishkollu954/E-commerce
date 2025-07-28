//Middleware/adminAuth.js
const Seller = require("../Models/Seller");

const adminAuth = async (req, res, next) => {
  const sellerId = req.cookies?.sellerId;
  if (!sellerId)
    return res.status(401).json({ message: "Not logged in as admin/seller" });

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(401).json({ message: "Seller not found" });

    if (seller.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.admin = seller; // Attach full seller/admin object
    next();
  } catch (err) {
    res.status(500).json({ message: "Admin auth error" });
  }
};

module.exports = adminAuth;
