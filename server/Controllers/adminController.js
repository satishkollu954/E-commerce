//adminController.js
const User = require("../Models/User");
const Seller = require("../Models/Seller");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Order = require("../Models/Order");
const product = require("../Models/Product");
const Product = require("../Models/Product");

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
  console.log("Fetching all sellers");
  try {
    const sellers = await Seller.find({
      email: { $ne: "admin@gmail.com" },
    }).sort({ createdAt: -1 });
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
// Update tracking info
exports.updateTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingInfo } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { trackingInfo },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Tracking info updated successfully",
      order,
    });
  } catch (err) {
    console.error("Tracking update failed:", err);
    res.status(500).json({ message: "Failed to update tracking" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone } = req.body;

    if (name) user.name = name;
    if (phone) {
      const existingphone = await User.findOne({ phone });
      if (existingphone) {
        return res.status(400).json({ message: "Phone already exists" });
      }
      user.phone = phone;
    }

    // if (role) user.role = role; // optional, only if admin is allowed to update role

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
};

exports.updateSeller = async (req, res) => {
  const { name, phone, storeName, gstNumber, businessAddress, isApproved } =
    req.body;

  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    // Update fields
    seller.name = name ?? seller.name;
    if (phone) {
      const existingPhone = await Seller.findOne({ phone });

      if (existingPhone && existingPhone._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Phone already exists" });
      }

      seller.phone = phone;
    }

    seller.storeName = storeName ?? seller.storeName;
    seller.gstNumber = gstNumber ?? seller.gstNumber;
    seller.businessAddress = businessAddress ?? seller.businessAddress;
    seller.isApproved = isApproved ?? seller.isApproved; // Admin can update approval status

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
        isApproved: seller.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
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

// Delete user by Admin
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// @desc Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};

// PUT /api/admin/product/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating product with ID:", id);
    const product = await Product.findById(id);
    console.log("Found product:", product);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, isApproved } = req.body;
    console.log("Request body:", req.body);
    if (name) product.name = name;
    if (isApproved !== undefined) product.isApproved = isApproved;
    console.log("Product before saving:", product);
    await product.save();
    console.log("Product updated successfully:", product);
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: err.message });
  }
};

// DELETE /api/admin/product/:id
exports.deleteProduct = async (req, res) => {
  try {
    // 1. Find product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // 2. Delete product
    await Product.findByIdAndDelete(req.params.id);

    // 3. Remove product reference from seller
    await Seller.findByIdAndUpdate(product.seller, {
      $pull: { products: product._id },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};

// PUT /api/admin/order/:id
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      trackingInfo,
      deliveredAt,
      cancelReason,
      returnRequest,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (orderStatus) order.orderStatus = orderStatus;
    if (deliveredAt) order.deliveredAt = deliveredAt;
    if (cancelReason) order.cancelReason = cancelReason;
    if (trackingInfo) order.trackingInfo = trackingInfo;
    if (returnRequest) order.returnRequest = returnRequest;

    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update order", error: err.message });
  }
};

// DELETE /api/admin/order/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: err.message });
  }
};
