const User = require("../Models/User");

const authMiddleware = async (req, res, next) => {
  const userId = req.cookies?.userId;
  if (!userId) return res.status(401).json({ message: "Not logged in" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.userId = user._id;
    next();
  } catch (err) {
    res.status(500).json({ message: "Auth error" });
  }
};

module.exports = authMiddleware;
