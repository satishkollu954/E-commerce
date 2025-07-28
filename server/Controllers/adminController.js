//adminController.js
const Seller = require("../Models/Seller");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Admin edit and approve seller
exports.editSellerByAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, phone, storeName, gstNumber, businessAddress, isApproved } =
    req.body;

  try {
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Don't update email or password
    seller.name = name ?? seller.name;
    seller.phone = phone ?? seller.phone;
    seller.storeName = storeName ?? seller.storeName;
    seller.gstNumber = gstNumber ?? seller.gstNumber;
    seller.businessAddress = businessAddress ?? seller.businessAddress;
    seller.isApproved = isApproved ?? seller.isApproved;

    await seller.save();

    // Send approval email if approved
    if (isApproved) {
      await sendApprovalEmail(seller.email, seller.name);
    }

    res.json({
      message: "Seller updated successfully",
      seller,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
const sendApprovalEmail = async (toEmail, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER, // your email
      pass: process.env.MAIL_PASS, // app password
    },
  });

  const mailOptions = {
    from: `"E-Commerce Admin" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your Seller Account is Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f8f8;">
        <div style="background-color: #fff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4CAF50;">🎉 Congratulations ${name}!</h2>
          <p>Your seller account has been <strong>approved</strong> by the admin.</p>
          <p>You can now log in to your dashboard and start managing your store.</p>
          <br/>
          <a href="https://yourfrontendurl.com/seller/login" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          <br/><br/>
          <p>Regards,<br/>E-Commerce Team</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Delete Seller by Admin
exports.deleteSeller = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await Seller.findByIdAndDelete(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ message: "Seller deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete seller",
      error: error.message,
    });
  }
};

// Admin creates a new seller
exports.addSellerByAdmin = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    storeName,
    gstNumber,
    businessAddress,
    isApproved,
  } = req.body;

  try {
    const exists = await Seller.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = await Seller.create({
      name,
      phone,
      email,
      password: hashedPassword,
      storeName,
      gstNumber,
      businessAddress,
      isApproved: isApproved ?? true, // default approved if admin is adding
    });

    res.status(201).json({
      message: "Seller created successfully by admin",
      seller: newSeller,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add seller", error: err.message });
  }
};

//Get All Sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.status(200).json(sellers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sellers", error: err.message });
  }
};

//Get Seller By Id
exports.getSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json(seller);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch seller", error: err.message });
  }
};

// POST /api/admin/:orderId/update-tracking
exports.updateTracking = async (req, res) => {
  const { orderId } = req.params;
  const { trackingInfo } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { trackingInfo },
      { new: true }
    );
    res.json({ message: "Tracking updated", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update tracking" });
  }
};
