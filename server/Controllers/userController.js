//userController.js
const bcrypt = require("bcryptjs");
const User = require("../Models/User");
const OtpVerification = require("../Models/OtpVerification");
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
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// 🔐 Reset password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user);
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Clean up OTP entry
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

//Add to wishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add to wishlist", error: err.message });
  }
};

//remove Wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();
    res.json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to remove from wishlist", error: err.message });
  }
};

//Get Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

//get Order history by userId
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

//Add to Cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock === 0) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Added to cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Add to cart failed", error: err.message });
  }
};

//Get cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.product");

    const cartWithStatus = user.cart.map((item) => {
      if (!item.product) {
        return {
          product: null,
          status: "Product no longer exists",
          quantity: item.quantity,
        };
      } else if (item.product.stock === 0) {
        return {
          product: item.product,
          status: "Product is out of stock",
          quantity: item.quantity,
        };
      } else {
        return {
          product: item.product,
          status: "Available",
          quantity: item.quantity,
        };
      }
    });

    res.status(200).json({ cart: cartWithStatus });
  } catch (err) {
    res.status(500).json({ message: "Fetch cart failed", error: err.message });
  }
};

//Update Cart
exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);

    const item = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await user.save();

    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Update cart failed", error: err.message });
  }
};

//Remove Cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    res.status(200).json({ message: "Removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Remove failed", error: err.message });
  }
};

//clear Cart
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
