//orderController.js

const { refundViaRazorpay } = require("../utils/razorpayRefund");
const sendEmail = require("../utils/sendEmail");

exports.placeOrder = async (req, res) => {
  const userId = req.userId;
  const { products, shippingAddress, paymentType } = req.body;

  if (!paymentType || !["COD", "Online"].includes(paymentType)) {
    return res.status(400).json({ message: "Invalid payment type" });
  }

  try {
    let totalAmount = 0;

    const populatedProducts = await Promise.all(
      products.map(async ({ product, quantity }) => {
        const prod = await Product.findById(product);
        if (!prod) throw new Error("Product not found");
        if (prod.countInStock < quantity)
          throw new Error(`Product "${prod.name}" is out of stock`);
        totalAmount += prod.price * quantity;
        return { product: prod._id, quantity };
      })
    );

    // Reduce stock
    for (let { product, quantity } of products) {
      await Product.findByIdAndUpdate(product, {
        $inc: { countInStock: -quantity },
      });
    }

    const newOrder = await Order.create({
      user: userId,
      products: populatedProducts,
      totalAmount,
      shippingAddress,
      paymentType,
      paymentStatus: paymentType === "COD" ? "Pending" : "Paid", // or handle Razorpay separately
    });

    const user = await User.findById(userId);

    await sendEmail({
      to: user.email,
      subject: "🛒 Order Confirmation",
      html: `<h2>Order Confirmed</h2><p>Hi ${user.name}, your order is confirmed with <b>${paymentType}</b> method.<br>Total: ₹${totalAmount}</p>`,
    });

    res.status(201).json({ message: "Order placed", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Return Request Initiated mehod
exports.initiateReturnRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message: "Return can only be requested after delivery",
      });
    }

    if (
      order.orderStatus === "Return Initiated" ||
      order.orderStatus === "returnApproved"
    ) {
      return res
        .status(400)
        .json({ message: "Return already initiated or approved" });
    }

    order.orderStatus = "Return Initiated";
    order.returnRequest = {
      reason,
      requestedAt: new Date(),
    };

    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "📦 Return Request Initiated",
      html: `<p>Hello ${order.user.name},</p><p>Your return request has been successfully initiated for Order ID: <b>${order._id}</b>.</p><p>Reason: ${reason}</p>`,
    });

    return res
      .status(200)
      .json({ message: "Return request submitted successfully" });
  } catch (err) {
    console.error("Return request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Return Request Approve mehod
// Mark return collected & refund user (safe refund trigger)
exports.markReturnCollectedAndRefund = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("user payment");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "Return Approved") {
      return res.status(400).json({
        message: "Return not approved yet or already processed",
      });
    }

    // Step 1: Mark as collected
    order.orderStatus = "Return Picked";
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "🚚 Return Picked & Refund Initiated",
      html: `<p>Hello ${order.user.name},</p><p>Your returned product for Order ID: <b>${order._id}</b> has been picked up. Refund is being processed.</p>`,
    });

    // Step 2: Trigger refund only now
    if (order.paymentType === "Online") {
      // replace with your Razorpay refund method
      await refundViaRazorpay(
        order.payment.razorpayPaymentId,
        order.totalAmount
      );
    }

    // Step 3: Update order & notify user
    order.orderStatus = "Refunded";
    order.paymentStatus = "Refunded";
    await order.save();

    await sendEmail(
      order.user.email,
      "Refund Completed",
      `<p>Your refund of ₹${order.totalAmount} is successfully processed after return pickup.</p>`
    );

    return res.status(200).json({ message: "Refund processed successfully" });
  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.approveReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "Return Initiated") {
      return res
        .status(400)
        .json({ message: "No return request found to approve" });
    }

    order.orderStatus = "returnApproved";
    order.returnRequest.approvedAt = new Date();

    await order.save();

    // (Optional) Send email to user here: "Return approved. Refund will be processed soon."
    await sendEmail({
      to: order.user.email,
      subject: "✅ Return Approved",
      html: `<p>Hello ${order.user.name},</p><p>Your return request for Order ID: <b>${order._id}</b> has been approved. A pickup will be scheduled soon.</p>`,
    });

    return res.status(200).json({ message: "Return approved successfully" });
  } catch (err) {
    console.error("Return approval error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Show all orders for admin
exports.getAllOrders = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};

// Show user orders
exports.getUserOrders = async (req, res) => {
  const userId = req.userId;
  const orders = await Order.find({ user: userId }).populate("items.product");
  res.json(orders);
};
