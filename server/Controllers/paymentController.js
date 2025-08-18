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
  const { products } = req.body;

  try {
    // 1️⃣ Recalculate subtotal using variant.finalPrice
    let subtotal = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");

      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error("Invalid variant");

      subtotal += variant.finalPrice * item.quantity;
    }

    // 2️⃣ Apply shipping if subtotal < 500
    const shippingFee = subtotal < 500 ? 50 : 0;
    const totalAmount = subtotal + shippingFee;

    // 3️⃣ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // -> paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    });

    // 4️⃣ Include verifiedAmount in the response
    res.json({ ...razorpayOrder, verifiedAmount: totalAmount });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
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

  // Validate signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  try {
    // 1️⃣ Recalculate subtotal
    let subtotal = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");

      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error("Invalid variant");

      subtotal += variant.finalPrice * item.quantity;
    }

    // 2️⃣ Reapply shipping fee
    const shippingFee = subtotal < 500 ? 50 : 0;
    const totalAmount = subtotal + shippingFee;

    // 3️⃣ Create Order
    const order = await Order.create({
      user: req.userId,
      products,
      shippingAddress,
      totalAmount,
      paymentType: paymentType || "Online",
      paymentStatus: "Paid",
    });

    // 4️⃣ Create Payment + attach to order
    const payment = await Payment.create({
      user: req.userId,
      order: order._id,
      gateway: "Razorpay",
      status: "Success",
      amount: totalAmount,
      razorpay_order_id,
      razorpay_payment_id,
    });

    order.payment = payment._id;
    await order.save();

    // 4️⃣ Reduce stock for each variant
    for (const item of products) {
      const prod = await Product.findById(item.product);
      const variant = prod.variants.id(item.variantId);
      if (variant) {
        variant.stock -= item.quantity;
        await prod.save();
      }
    }

    // 5️⃣ Push order into user's order list
    await User.findByIdAndUpdate(req.userId, {
      $push: { orders: order._id },
    });

    // 5️⃣ Send confirmation email
    const user = await User.findById(req.userId);
    // console.log("User found:", user.email);

    // Build email product rows
    const productsHtml = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        const variant = product.variants.id(item.variantId);
        return `
      <tr>
        <td style="padding:8px 12px; border:1px solid #eee;">${
          product.name
        }</td>
        <td style="padding:8px 12px; border:1px solid #eee;">
          ${variant.size || variant.childAgeGroup || "-"}
        </td>
        <td style="padding:8px 12px; text-align:center; border:1px solid #eee;">${
          item.quantity
        }</td>
        <td style="padding:8px 12px; text-align:right; border:1px solid #eee;">₹${
          variant.finalPrice
        }</td>
      </tr>
    `;
      })
    );

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; overflow:hidden">
  <!-- Header -->
  <div style="background:#1976d2; color:#fff; padding:20px; text-align:center">
    <h2 style="margin:0;">Thank you for your order!</h2>
  </div>

  <!-- Body -->
  <div style="padding:20px;">
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>Thank you for shopping with <strong>FitFusion</strong>. Your order has been <b>successfully placed</b>.</p>

    <h4 style="margin-top:20px;">🧾 Order Details</h4>
    <p><strong>Order ID:</strong> ${order._id}<br>
       <strong>Order Date:</strong> ${new Date().toLocaleDateString()}<br>
       <strong>Payment Method:</strong> ${paymentType}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; font-size:14px; margin-bottom:20px;">
      <thead>
        <tr style="background:#f7f7f7;">
          <th style="padding:8px 12px; text-align:left; border:1px solid #eee;">Product</th>
          <th style="padding:8px 12px; text-align:left; border:1px solid #eee;">Variant</th>
          <th style="padding:8px 12px; text-align:center; border:1px solid #eee;">Qty</th>
          <th style="padding:8px 12px; text-align:right; border:1px solid #eee;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productsHtml}
      </tbody>
    </table>

    <p style="text-align:right; font-weight:bold; font-size:16px;">Total Amount: ₹${totalAmount}</p>

    <h4 style="margin-top:30px;">📦 Shipping Address</h4>
    <p>
      ${shippingAddress.name}<br>
      ${shippingAddress.street}, ${shippingAddress.city}, ${
      shippingAddress.state
    }<br>
      ${shippingAddress.country} – ${shippingAddress.pincode}<br>
      Phone: ${shippingAddress.phone}
    </p>

    <p style="margin-top:30px;">We will notify you once your order has been shipped. If you have any questions, feel free to contact our support team.</p>

    <p style="margin-top:20px;">Kind regards,<br><strong>FitFusion Team</strong></p>
  </div>

  <!-- Footer -->
  <div style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#888;">
    © ${new Date().getFullYear()} FitFusion. All rights reserved.
  </div>
</div>
`;

    await sendEmail({
      to: user.email,
      subject: "Order Placed Successfully",
      html,
    });

    res.json({ message: "Payment verified and order placed", order });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
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
