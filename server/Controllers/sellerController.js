//sellerController.js
const bcrypt = require("bcryptjs");
const Seller = require("../Models/Seller");
const OtpVerification = require("../Models/OtpVerification"); // for reset password OTP
const otpController = require("./otpController");
const sendEmail = require("../utils/sendEmail");

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

    // Set cookie
    res.cookie("sellerId", seller._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    // ✅ Send welcome email to seller
    const dashboardUrl = "http://localhost:5173/seller-login"; // replace with actual dashboard URL

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h2>🎉 Welcome to FitFusion, ${seller.name}!</h2>
        </div>
        <div style="padding: 20px; background-color: #fafafa;">
          <p>Hi <b>${seller.name}</b>,</p>
          <p>Thank you for registering as a seller on <b>FitFusion</b>. We are excited to have you on board!</p>
          
          <p>Here’s a quick summary of your seller account:</p>
          <ul style="line-height: 1.6;">
            <li><b>Store Name:</b> ${seller.storeName}</li>
            <li><b>GST Number:</b> ${seller.gstNumber}</li>
            <li><b>Email:</b> ${seller.email}</li>
            <li><b>Phone:</b> ${seller.phone}</li>
            <li><b>Business Address:</b> ${seller.businessAddress}</li>
          </ul>

          <p>You can now log in to your seller dashboard and start adding products, managing orders, and growing your business.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>

          <p>We’re here to support you every step of the way. Welcome aboard!</p>

          <p style="margin-top: 20px;">Best regards,<br><b>FitFusion Seller Support Team</b></p>
        </div>

        <div style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #888;">
          This is an automated message. Please do not reply directly.<br>
          &copy; ${new Date().getFullYear()} FitFusion. All rights reserved.
        </div>
      </div>
    `;

    await sendEmail({
      to: seller.email,
      subject: "Welcome to FitFusion Seller Platform!",
      html: emailHtml,
    });

    res.status(201).json({
      message: "Seller registered successfully",
      seller,
    });
  } catch (err) {
    console.error(err);
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
  console.log("Resetting password for:", email);
  console.log("New password provided:", newPassword);
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    // console.log("Seller found:", seller);
    const hashed = await bcrypt.hash(newPassword, 10);
    seller.password = hashed;
    // console.log("Hashed password:", hashed);
    await seller.save();
    // console.log("Password reset successfully for:", email);
    // Optional: Remove OTP record
    await OtpVerification.deleteOne({ email });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Sending OTP to:", email);
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    await otpController.sendOtp(email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
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
  const { name, phone, storeName, gstNumber, password, businessAddress } =
    req.body;

  try {
    const seller = await Seller.findById(req.userId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    // Update fields
    seller.name = name ?? seller.name;
    seller.phone = phone ?? seller.phone;
    seller.storeName = storeName ?? seller.storeName;
    seller.gstNumber = gstNumber ?? seller.gstNumber;
    seller.businessAddress = businessAddress ?? seller.businessAddress;
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
    const sellers = await Seller.find({ email: { $ne: "admin@gmail.com" } });
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
