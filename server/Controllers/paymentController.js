//paymentController.js
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const User = require("../Models/User");
const Payment = require("../Models/Payment");
const sendEmail = require("../utils/sendEmail");
const getUserFromPayment = require("../utils/getUserFromPayment");

// Create Razorpay Order (Secure amount calculation)
exports.createOrder = async (req, res) => {
  const { products } = req.body;

  try {
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");
      totalAmount += product.price * item.quantity;
    }

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ ...razorpayOrder, verifiedAmount: totalAmount });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

// Verify Payment and Store Order
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
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");
      totalAmount += product.price * item.quantity;
    }

    const payment = await Payment.create({
      gateway: "Razorpay",
      status: "Success",
      razorpay_order_id,
      razorpay_payment_id,
    });

    const order = await Order.create({
      user: req.userId,
      products,
      shippingAddress,
      totalAmount,
      paymentType: paymentType || "Online",
      paymentStatus: "Paid",
      payment: payment._id,
    });

    const user = await User.findById(req.userId);
    await sendEmail(user.email, order);

    res.json({ message: "Payment verified and order placed", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify payment", error: error.message });
  }
};

// Cash On Delivery
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
    await sendEmail(user.email, order);

    res.json({ message: "COD order placed", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place COD order", error });
  }
};

// Razorpay Webhook Handler (for failed payment, etc.)
exports.handleWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === "payment.failed") {
    const paymentId = event.payload.payment.entity.id;
    const user = await getUserFromPayment(paymentId); // Implement as needed
    await sendEmail(
      user.email,
      "Payment Failed – Action Required",
      `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    <h2 style="color: #e53935;">Payment Failed</h2>
    <p>Hi ${user.name || "Customer"},</p>
    <p>Unfortunately, your payment with ID <strong>${paymentId}</strong> was not successful.</p>
    
    <p>Please try placing your order again or contact support if the amount was deducted from your account.</p>

    <a href="https://yourfrontenddomain.com/cart" style="display: inline-block; padding: 10px 20px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
      Retry Payment
    </a>

    <hr />
    <p style="font-size: 14px; color: #555;">We're here to help. If you need assistance, just reply to this email.</p>

    <p style="margin-top: 30px;">Regards,<br><strong>YourStore Support</strong></p>
  </div>
  `
    );
  }

  if (event.event === "refund.processed") {
    const refund = event.payload.refund.entity;
    const user = await getUserFromPayment(refund.payment_id); // Implement as needed
    const payment = await Payment.findOne({ paymentId: refund.payment_id });
    const order = await Order.findById(payment.orderId).populate(
      "products.productId"
    );

    await sendEmail(
      user.email,
      "Your Refund Has Been Processed",
      `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
    <h2 style="color: #4CAF50;">Refund Processed</h2>

    <p>Hi ${user.name || "Customer"},</p>

    <p>We’ve processed your refund of <strong>₹${(refund.amount / 100).toFixed(
      2
    )}</strong> for your order <strong>#${order._id}</strong>.</p>

    <p><strong>Products:</strong> ${order.products
      .map((p) => p.product.name)
      .join(", ")}</p>

    <p><strong>Payment ID:</strong> ${refund.payment_id}</p>

<p>The refunded amount will be credited to your original payment method within 5–7 business days.</p>
<p>If you do not receive your refund by then, please contact our support team.</p>

    <hr />
    <p style="font-size: 14px; color: #555;">If you have any questions, reply to this email or reach out to our support team.</p>

    <p style="margin-top: 30px;">Thank you,<br><strong>YourStore Team</strong></p>
  </div>
  `
    );
  }

  res.status(200).send("Webhook received");
};
