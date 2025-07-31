//Middleware/auth.js
const Seller = require("../Models/Seller");
const User = require("../Models/User");

const authMiddleware = async (req, res, next) => {
  const userId = req.cookies?.userId;
  const role = req.cookies?.role;
  console.log("Auth Middleware - User ID:", userId, "Role:", role);
  if (!userId) return res.status(401).json({ message: "Not logged in" });
  if (role == "seller") {
    try {
      const seller = await Seller.findById(userId);

      if (!seller) return res.status(401).json({ message: "Seller not found" });

      req.userId = seller._id;
      next();
    } catch (err) {
      res.status(500).json({ message: "Auth error" });
    }
  }

  if (role == "user") {
    try {
      const user = await User.findById(userId);

      if (!user) return res.status(401).json({ message: "User not found" });

      req.userId = user._id;
      next();
    } catch (err) {
      res.status(500).json({ message: "Auth error" });
    }
  }
};

module.exports = authMiddleware;
