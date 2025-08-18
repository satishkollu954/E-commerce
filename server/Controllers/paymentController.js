// Controllers/paymentController.js
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const User = require("../Models/User");
const Payment = require("../Models/Payment");
const sendEmail = require("../utils/sendEmail");
const getUserFromPayment = require("../utils/getUserFromPayment");

// ✅ Create Razorpay Order (amount is always validated from DB)
// ✅ Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { products, totalAmount } = req.body;
  console.log("Creating Razorpay order for products:", products);
  const finalAmount = totalAmount;
  try {
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");

      // ✅ If product has variants
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error("Invalid variant");

      totalAmount += variant.finalPrice * item.quantity;
    }

    const options = {
      amount: finalAmount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ ...razorpayOrder, verifiedAmount: totalAmount });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({
      message: "Failed to create order",
      error: err.message,
    });
  }
};

// ✅ Verify Payment → Create Order → Link Payment
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    products,
    shippingAddress,
    paymentType,
  } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  try {
    // Recalculate amount securely
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");
      totalAmount += product.price * item.quantity;
    }

    // Create Order first
    const order = await Order.create({
      user: req.userId,
      products,
      shippingAddress,
      totalAmount,
      paymentType: paymentType || "Online",
      paymentStatus: "Paid",
    });

    // Create Payment linked to Order + User
    const payment = await Payment.create({
      user: req.userId,
      order: order._id,
      gateway: "Razorpay",
      status: "Success",
      razorpay_order_id,
      razorpay_payment_id,
    });

    // Update order with payment reference
    order.payment = payment._id;
    await order.save();

    const user = await User.findById(req.userId);
    await sendEmail(
      user.email,
      "Order Placed Successfully",
      `<p>Hi ${user.name},</p><p>Your order <b>#${order._id}</b> has been placed successfully. Thank you for shopping with us!</p>`
    );

    res.json({ message: "Payment verified and order placed", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify payment", error: error.message });
  }
};

// ✅ Cash On Delivery
exports.placeCODOrder = async (req, res) => {
  const { cart, shippingAddress } = req.body;

  try {
    let totalAmount = 0;
    for (const item of cart) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.userId,
      products: cart,
      shippingAddress,
      totalAmount,
      paymentType: "COD",
      paymentStatus: "Pending",
    });

    const user = await User.findById(req.userId);
    await sendEmail(
      user.email,
      "Order Placed (COD)",
      `<p>Hi ${user.name},</p><p>Your order <b>#${order._id}</b> has been placed with Cash on Delivery.</p>`
    );

    res.json({ message: "COD order placed", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place COD order", error: error.message });
  }
};

// ✅ Razorpay Webhook Handler
exports.handleWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === "payment.failed") {
    const paymentId = event.payload.payment.entity.id;
    const user = await getUserFromPayment(paymentId); // implement lookup
    if (user) {
      await sendEmail(
        user.email,
        "Payment Failed – Action Required",
        `<p>Hi ${user.name},</p><p>Your payment <b>${paymentId}</b> failed. Please retry.</p>`
      );
    }
  }

  if (event.event === "refund.processed") {
    const refund = event.payload.refund.entity;
    const user = await getUserFromPayment(refund.payment_id);
    const payment = await Payment.findOne({
      razorpay_payment_id: refund.payment_id,
    });
    const order = await Order.findById(payment.order).populate(
      "products.product"
    );

    if (user) {
      await sendEmail(
        user.email,
        "Refund Processed",
        `<p>Hi ${user.name},</p><p>Your refund of <b>₹${(
          refund.amount / 100
        ).toFixed(2)}</b> for order <b>#${
          order._id
        }</b> has been processed.</p>`
      );
    }
  }

  res.status(200).send("Webhook received");
};
