const bcrypt = require("bcryptjs");
const User = require("../Models/User");
const Product = require("../Models/Product");
const OtpVerification = require("../Models/OtpVerification");
const sendEmail = require("../utils/sendEmail");
// Register User
exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    const existingemail = await User.findOne({ email });
    if (existingemail)
      return res.status(401).json({ message: "Email already exists" });

    const existingphone = await User.findOne({ phone });
    if (existingphone)
      return res.status(402).json({ message: "Phone already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, email, password: hashed });

    // Set cookie
    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    });

    // ✅ Welcome email with Get Started button
    const dashboardUrl = "http://localhost:5173/user-login"; // replace with actual URL

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h2>🎉 Welcome to FitFusion, ${user.name}!</h2>
        </div>
        <div style="padding: 20px; background-color: #fafafa;">
          <p>Hi <b>${user.name}</b>,</p>
          <p>Thank you for registering with <b>FitFusion</b>. We are thrilled to have you on board!</p>
          <p>Here’s a quick summary of your account:</p>
          <ul style="line-height: 1.6;">
            <li><b>Name:</b> ${user.name}</li>
            <li><b>Email:</b> ${user.email}</li>
            <li><b>Phone:</b> ${user.phone}</li>
          </ul>
          <p>You can now log in and explore our platform. Make sure to complete your profile for the best experience.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>

          <p>We’re excited to help you achieve your goals!</p>
          <p style="margin-top: 20px;">Best regards,<br><b>FitFusion Team</b></p>
        </div>
        <div style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #888;">
          This is an automated message. Please do not reply directly.<br>
          &copy; ${new Date().getFullYear()} FitFusion. All rights reserved.
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Welcome to FitFusion!",
      html: emailHtml,
    });

    res.status(201).json({
      message: "Registered successfully",
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
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

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Sending OTP to:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await otpController.sendOtp(email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    await OtpVerification.deleteOne({ email });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
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

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    console.log(";;;;;;", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phone, email, password } = req.body;

    if (name) user.name = name;
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone && existingPhone._id.toString() !== user._id.toString())
        return res.status(400).json({ message: "Phone already exists" });
      user.phone = phone;
    }
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== user._id.toString())
        return res.status(400).json({ message: "Email already exists" });
      user.email = email;
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();
    console.log("////////", user);
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// Address Operations
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

// Wishlist
exports.addToWishlist = async (req, res) => {
  const { productId, variantId } = req.body;
  console.log("Adding to wishlist", productId, variantId);
  try {
    const user = await User.findById(req.userId);
    // console.log("User found", user._id, user.email);
    const exists = user.wishlist.some(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );
    //console.log("Wishlist exists", exists);
    if (!exists) {
      user.wishlist.push({ product: productId, variantId });
      await user.save();
    }
    //console.log("Wishlist updated", user.wishlist);
    res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add to wishlist", error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId, variantId } = req.params;
  try {
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist.filter(
      (item) =>
        item.product.toString() !== productId ||
        item.variantId.toString() !== variantId
    );
    await user.save();
    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to remove from wishlist", error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist.product");
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

// Cart
exports.addToCart = async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  // console.error("Adding to cart", productId, variantId, quantity);
  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);
    // console.log("Product found", productId, product);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    const existing = user.cart.find(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );
    console.log("Existing cart item", existing);
    if (existing) existing.quantity += quantity;
    else user.cart.push({ product: productId, variantId, quantity });
    console.log("Cart before save", user.cart);
    await user.save();
    console.log("Cart after save", user.cart);
    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.product");
    let totalPrice = 0;
    const cart = user.cart
      .map((item) => {
        const product = item.product;
        const variant = product?.variants?.id(item.variantId);
        if (!product || !variant) return null;

        const itemTotal = variant.finalPrice * item.quantity;
        totalPrice += itemTotal;

        return {
          _id: item._id,
          product,
          variant,
          quantity: item.quantity,
          itemTotal,
        };
      })
      .filter(Boolean);
    res.status(200).json({ cart, totalPrice });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving cart", error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  try {
    const user = await User.findById(req.userId);
    const item = user.cart.find(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    await user.save();

    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId, variantId } = req.params;
  try {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter(
      (item) =>
        item.product.toString() !== productId ||
        item.variantId.toString() !== variantId
    );
    await user.save();
    res.status(200).json({ message: "Removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Remove failed", error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.cart = [];
    await user.save();
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Clear cart failed", error: err.message });
  }
};

// Wishlist/Cart Count
exports.getWishlistAndCartCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      wishlistCount: user.wishlist.length,
      cartCount: user.cart.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counts", error: err.message });
  }
};

// Orders
exports.getOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("orders");
    res.json(user.orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

// Admin: Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
