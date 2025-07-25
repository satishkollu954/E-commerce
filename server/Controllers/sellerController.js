const bcrypt = require("bcryptjs");
const Seller = require("../Models/Seller");
const OtpVerification = require("../Models/OtpVerification"); // for reset password OTP

// Register
exports.register = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    storeName,
    gstNumber,
    businessAddress,
  } = req.body;

  try {
    const exists = await Seller.findOne({ $or: [{ email }, { mobile }] });
    if (exists)
      return res
        .status(400)
        .json({ message: "Email or Mobile already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      name,
      phone,
      email,
      password: hashedPassword,
      storeName,
      gstNumber,
      businessAddress,
    });

    res.cookie("sellerId", seller._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    res.status(201).json({
      message: "Seller registered successfully",
      seller: {
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.cookie("sellerId", seller._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    res.json({
      message: "Login successful",
      seller,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Reset Password (after OTP verification)
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    seller.password = hashed;
    await seller.save();

    // Optional: Remove OTP record
    await OtpVerification.deleteOne({ email });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
};

// Update Seller Profile (excluding email, password, role)
exports.updateSeller = async (req, res) => {
  const { id } = req.params;

  // Destructure only allowed fields
  const { name, phone, storeName, gstNumber, businessAddress } = req.body;

  try {
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update allowed fields only
    seller.name = name ?? seller.name;
    seller.phone = phone ?? seller.phone;
    seller.storeName = storeName ?? seller.storeName;
    seller.gstNumber = gstNumber ?? seller.gstNumber;
    seller.businessAddress = businessAddress ?? seller.businessAddress;

    await seller.save();

    res.json({
      message: "Seller profile updated successfully",
      seller,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
