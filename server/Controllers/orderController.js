// Controllers/orderController.js
const { refundViaRazorpay } = require("../utils/razorpayRefund");
const sendEmail = require("../utils/sendEmail");
const Product = require("../Models/Product");
const Order = require("../Models/Order");
const User = require("../Models/User");
// ----------------------
// PLACE ORDER (unchanged)
// ----------------------
exports.placeOrder = async (req, res) => {
  const userId = req.user._id;
  const { products, shippingAddress, paymentType } = req.body;

  if (!paymentType || !["COD", "Online"].includes(paymentType)) {
    return res.status(400).json({ message: "Invalid payment type" });
  }

  try {
    let totalAmount = 0;
    const populatedProducts = [];

    for (const { product, variantId, quantity } of products) {
      const prod = await Product.findById(product);
      if (!prod) throw new Error("Product not found");

      const variant = prod.variants.id(variantId);
      if (!variant) throw new Error("Variant not found");

      if (variant.stock < quantity)
        throw new Error(`"${prod.name}" is out of stock for selected variant`);

      totalAmount += variant.finalPrice * quantity;

      variant.stock -= quantity;
      await prod.save();

      populatedProducts.push({
        product: prod._id,
        name: prod.name,
        variant: {
          size: variant.size,
          childAgeGroup: variant.childAgeGroup,
          color: variant.color,
        },
        price: variant.finalPrice,
        quantity,
        image: variant.image,
      });
    }

    const newOrder = await Order.create({
      user: userId,
      products: populatedProducts,
      totalAmount,
      shippingAddress,
      paymentType,
      paymentStatus: paymentType === "COD" ? "Pending" : "Paid",
      status: "Placed",
    });

    const user = await User.findById(userId);

    await sendEmail({
      to: user.email,
      subject: "🛒 Order Confirmation",
      html: `<h2>Order Confirmed</h2><p>Hi ${user.name}, your order is confirmed with <b>${paymentType}</b>.<br>Total: ₹${totalAmount}</p>`,
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

    if (!order.emailSentOnDelivered) {
      await sendEmail({
        to: order.user.email,
        subject: "📦 Order Delivered",
        html: `<p>Hello ${order.user.name},</p><p>Your order with ID <b>${order._id}</b> has been delivered successfully.</p>`,
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
  if (req.user.role !== "admin") {
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
