const bcrypt = require("bcryptjs");
const User = require("../Models/User");

// Register User
exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(400).json({ message: "Phone already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, email, password: hashed });

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    res.status(201).json({
      message: "Registered",
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("userId");
  res.json({ message: "Logged out" });
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.addresses.push(req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: "Failed to add address" });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    Object.assign(address, req.body);
    await user.save();
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: "Failed to update address" });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};
