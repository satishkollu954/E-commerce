//sellerController.js
const bcrypt = require("bcryptjs");
const Seller = require("../Models/Seller");
const OtpVerification = require("../Models/OtpVerification"); // for reset password OTP

// Register
exports.register = async (req, res) => {
  console.log("satish");
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
    const exists = await Seller.findOne({ $or: [{ email }, { phone }] });
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
      seller,
    });
    console.log(res);
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

// Get Profile seller
exports.getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.userId).select("-password");
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update Seller Profile (excluding email, password, role)

exports.updateSeller = async (req, res) => {
  const { id } = req.params;

  const { name, phone, storeName, gstNumber, password, businessAddress } =
    req.body;

  try {
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update fields
    seller.name = name ?? seller.name;
    seller.phone = phone ?? seller.phone;
    seller.storeName = storeName ?? seller.storeName;
    seller.gstNumber = gstNumber ?? seller.gstNumber;
    seller.businessAddress = businessAddress ?? seller.businessAddress;

    // ✅ Hash and update password if provided
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      seller.password = hashedPassword;
    }

    await seller.save();

    res.json({
      message: "Seller profile updated successfully",
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        storeName: seller.storeName,
        gstNumber: seller.gstNumber,
        businessAddress: seller.businessAddress,
        // Don't send password back
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a seller by ID
exports.deleteSeller = async (req, res) => {
  try {
    const deletedSeller = await Seller.findByIdAndDelete(req.params.id);
    if (!deletedSeller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit seller details
exports.editSellerByAdmin = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json({ message: "Seller updated", seller });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add seller by admin
exports.addSellerByAdmin = async (req, res) => {
  try {
    const newSeller = new Seller(req.body);
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    await newSeller.save();
    res.status(201).json({ message: "Seller added successfully", newSeller });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
