// Controllers/orderController.js
const { refundViaRazorpay } = require("../utils/razorpayRefund");
const sendEmail = require("../utils/sendEmail");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const User = require("../Models/User");
// ----------------------
// PLACE ORDER
// ----------------------
exports.placeOrder = async (req, res) => {
  const userId = req.userId;
  const { products, shippingAddress, paymentType, totalAmount } = req.body;

  if (!paymentType || !["COD", "Online"].includes(paymentType)) {
    return res.status(400).json({ message: "Invalid payment type" });
  }

  try {
    let subtotal = 0;
    const populatedProducts = [];

    // Build populatedProducts & reduce stock
    for (const { product, variantId, quantity } of products) {
      const prod = await Product.findById(product);
      if (!prod) throw new Error("Product not found");
      const variant = prod.variants.id(variantId);
      if (!variant) throw new Error("Variant not found");

      if (variant.stock < quantity) {
        throw new Error(`"${prod.name}" is out of stock for selected variant`);
      }

      subtotal += variant.finalPrice * quantity;
      variant.stock -= quantity;
      await prod.save();

      populatedProducts.push({
        product: prod._id,
        variantId: variant._id,
        name: prod.name,
        variant: {
          size: variant.size,
          childAgeGroup: variant.childAgeGroup,
          color: variant.color,
        },
        price: variant.finalPrice,
        quantity,
      });
    }

    // Apply shipping fee (<500)
    const shippingFee = subtotal < 500 ? 50 : 0;
    const finalRate = subtotal + shippingFee;

    // Create Order
    const newOrder = await Order.create({
      user: userId,
      products: populatedProducts,
      shippingAddress,
      totalAmount: finalRate,
      paymentType,
      paymentStatus: "Pending",
      status: "Placed",
    });

    // Push order to user.orders
    await User.findByIdAndUpdate(userId, { $push: { orders: newOrder._id } });

    // Build email products html
    const productsHtml = populatedProducts
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px; border:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px; border:1px solid #eee;">${
            item.variant.size || item.variant.childAgeGroup || "-"
          }</td>
          <td style="padding:8px 12px; text-align:center; border:1px solid #eee;">${
            item.quantity
          }</td>
          <td style="padding:8px 12px; text-align:right; border:1px solid #eee;">₹${
            item.price
          }</td>
        </tr>`
      )
      .join("");

    const user = await User.findById(userId);

    // Use same HTML email as online
    const html = `
<div style="font-family: Arial, sans-serif; max-width:650px; margin:auto; border:1px solid #e5e5e5; border-radius:8px;">
  <div style="background:#1976d2; color:#fff; text-align:center; padding:20px;">
    <h2 style="margin:0;">Thank you for your order!</h2>
  </div>
  <div style="padding:20px;">
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>Your order has been <b>successfully placed</b> with Cash on Delivery.</p>
    <h4>🧾 Order Details</h4>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="background:#f7f7f7;">
          <th style="padding:8px 12px; border:1px solid #eee;">Product</th>
          <th style="padding:8px 12px; border:1px solid #eee;">Variant</th>
          <th style="padding:8px 12px; border:1px solid #eee; text-align:center;">Qty</th>
          <th style="padding:8px 12px; border:1px solid #eee; text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productsHtml}
      </tbody>
    </table>
    <p style="text-align:right; font-weight:bold;">Total Amount: ₹${finalRate}</p>
    <h4>📦 Shipping Address</h4>
    <p>${shippingAddress.name}<br>
       ${shippingAddress.street}, ${shippingAddress.city}, ${
      shippingAddress.state
    }<br>
       ${shippingAddress.country} – ${shippingAddress.pincode}<br>
       Phone: ${shippingAddress.phone}</p>
    <p style="margin-top:20px;">Kind regards,<br><strong>FitFusion Team</strong></p>
  </div>
  <div style="background:#f6f6f6; padding:15px; text-align:center; font-size:12px;">
    © ${new Date().getFullYear()} FitFusion. All rights reserved.
  </div>
</div>`;

    await sendEmail({
      to: user.email,
      subject: "Order Placed Successfully",
      html,
    });

    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.markOrderAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = "Delivered";
    order.deliveredAt = new Date();
    await order.save();

    const html = `
<div style="font-family: Arial, sans-serif; max-width:650px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; overflow:hidden;">
  <div style="background:#28a745; color:#fff; text-align:center; padding:20px;">
    <h2 style="margin:0">📦 Your Order Has Been Delivered</h2>
  </div>

  <div style="padding:20px;">
    <p>Dear <strong>${order.user.name}</strong>,</p>

    <p>We are happy to confirm that your order <strong>#${
      order._id
    }</strong> was <strong>successfully delivered</strong> to the address below.</p>

    <h4 style="margin-top:20px;">📍 Delivery Address</h4>
    <p>
      ${order.shippingAddress.name}<br/>
      ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${
      order.shippingAddress.state
    }<br/>
      ${order.shippingAddress.country} – ${order.shippingAddress.pincode}<br/>
      Phone: ${order.shippingAddress.phone}
    </p>

    <p><strong>Delivered On:</strong> ${new Date(
      order.deliveredAt
    ).toLocaleDateString()}</p>

    <p>We hope you enjoy your purchase! We would love to hear how your experience was.</p>

    <div style="text-align:center; margin:30px 0;">
      <a href="YOUR_REVIEW_URL_HERE" style="background:#1976d2; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
        ⭐ Rate Your Order
      </a>
    </div>

    <p style="margin-top:10px;">Thank you for shopping with <strong>FitFusion</strong>!</p>

    <p style="margin:20px 0 0;">Best regards,<br><strong>FitFusion Team</strong></p>
  </div>

  <div style="background:#f6f6f6; padding:15px; text-align:center; font-size:12px; color:#888;">
    © ${new Date().getFullYear()} FitFusion. All rights reserved.
  </div>
</div>
`;

    if (!order.emailSentOnDelivered) {
      await sendEmail({
        to: order.user.email,
        subject: "📦 Order Delivered",
        html,
      });
      order.emailSentOnDelivered = true;
      await order.save();
    }

    res.status(200).json({ message: "Order marked as delivered" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// CANCEL ORDER
// ----------------------
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "user payment"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      ["Shipped", "Delivered", "Returned", "Cancelled"].includes(order.status)
    ) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    // Cancel the order
    order.status = "Cancelled";
    await order.save();

    // Refund only if prepaid and already collected
    if (
      order.paymentType === "Online" &&
      order.status === "Collected" &&
      order.payment?.razorpayPaymentId
    ) {
      await refundViaRazorpay(
        order.payment.razorpayPaymentId,
        order.totalAmount
      );
      order.paymentStatus = "Refunded";
      await order.save();

      await sendEmail({
        to: order.user.email,
        subject: "💰 Refund Completed",
        html: `<p>Your refund of ₹${order.totalAmount} has been processed successfully.</p>`,
      });
    }

    await sendEmail({
      to: order.user.email,
      subject: "❌ Order Cancelled",
      html: `<p>Hello ${order.user.name},</p><p>Your order <b>${order._id}</b> has been cancelled successfully.</p>`,
    });

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// INITIATE RETURN
// ----------------------
exports.initiateReturnRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "user"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Return can only be requested after delivery" });
    }

    if (order.returnRequest.requested) {
      return res.status(400).json({ message: "Return already requested" });
    }

    order.returnRequest = { requested: true, reason, status: "Pending" };
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "📦 Return Request Initiated",
      html: `<p>Hello ${order.user.name},</p><p>Your return request for Order ID: <b>${order._id}</b> has been initiated.</p><p>Reason: ${reason}</p>`,
    });

    res.status(200).json({ message: "Return request submitted successfully" });
  } catch (err) {
    console.error("Return Request Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------
// APPROVE RETURN
// ----------------------
exports.approveReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("Approving return request for order:", orderId);
    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      !order.returnRequest.requested ||
      order.returnRequest.status !== "Pending"
    ) {
      return res
        .status(400)
        .json({ message: "No pending return request found" });
    }

    order.returnRequest.status = "Approved";
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "✅ Return Approved",
      html: `<p>Hello ${order.user.name},</p><p>Your return for Order ID: <b>${order._id}</b> has been approved. Pickup will be arranged soon.</p>`,
    });

    res.status(200).json({ message: "Return approved successfully" });
  } catch (err) {
    console.error("Approve Return Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------
// COLLECT RETURN & REFUND
// ----------------------
exports.markReturnCollectedAndRefund = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("user payment");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnRequest.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Return not approved or already processed" });
    }

    // Mark return collected
    order.status = "Returned";
    order.returnRequest.status = "Approved"; // keeps approved flag
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "🚚 Return Collected",
      html: `<p>Hello ${order.user.name},</p><p>Your returned product for Order ID: <b>${order._id}</b> has been collected. Refund is being processed.</p>`,
    });

    // Refund only if prepaid
    if (order.paymentType === "Online" && order.payment?.razorpayPaymentId) {
      await refundViaRazorpay(
        order.payment.razorpayPaymentId,
        order.totalAmount
      );
      order.paymentStatus = "Refunded";
    }

    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "💰 Refund Completed",
      html: `<p>Your refund of ₹${order.totalAmount} has been processed successfully.</p>`,
    });

    res.status(200).json({ message: "Return collected & refund processed" });
  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------
// GET ORDERS
// ----------------------
exports.getAllOrders = async (req, res) => {
  console.log("Fetching all orders for admin", req.admin);
  if (req.admin !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId }).populate(
    "products.product"
  );
  res.json(orders);
};

exports.getSingleOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.orderId;
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "products.product",
      "name images category"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    console.error("Get Single Order Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSingleOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user")
      .populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    console.error("Admin Get Single Order Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
