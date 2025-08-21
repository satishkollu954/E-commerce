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
        images: prod.images || [],
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
      deliveredAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Estimated delivery in 3 days
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
    const userId = req.userId;

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
        subject: "❌ Order Cancelled - FitFusion",
        html: `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:#ff4d4f; padding:15px; text-align:center; color:white; font-size:20px; font-weight:bold;">
        Order Cancelled
      </div>
      <div style="padding:20px; color:#333;">
        <p>Hello <b>${order.user.name}</b>,</p>
        <p>We regret to inform you that your order <b>#${
          order._id
        }</b> has been <span style="color:#ff4d4f; font-weight:bold;">cancelled</span>.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p style="margin-top:20px;">Thank you for shopping with <b>FitFusion</b>.</p>
      </div>
      <div style="background:#f0f0f0; padding:10px; text-align:center; font-size:12px; color:#888;">
        &copy; ${new Date().getFullYear()} FitFusion. All rights reserved.
      </div>
    </div>
  </div>
  `,
      });
      await sendEmail({
        to: order.user.email,
        subject: "💰 Refund Processed - FitFusion",
        html: `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:#28a745; padding:15px; text-align:center; color:white; font-size:20px; font-weight:bold;">
        Refund Completed
      </div>
      <div style="padding:20px; color:#333;">
        <p>Hello <b>${order.user.name}</b>,</p>
        <p>We have successfully processed your refund for order <b>#${
          order._id
        }</b>.</p>
        <p>Refund Amount: <b style="color:#28a745;">₹${
          order.totalAmount
        }</b></p>
        <p>The amount will reflect in your account within 5–7 business days depending on your bank.</p>
        <p style="margin-top:20px;">Thank you for your patience and for shopping with <b>FitFusion</b>.</p>
      </div>
      <div style="background:#f0f0f0; padding:10px; text-align:center; font-size:12px; color:#888;">
        &copy; ${new Date().getFullYear()} FitFusion. All rights reserved.
      </div>
    </div>
  </div>
  `,
      });
    }

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
    const userId = req.userId;

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

    order.returnRequest = { requested: true, reason, status: "Processing" };
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "📦 Return Request Initiated - FitFusion",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
    <h2 style="color: #2c3e50; text-align: center;">Return Request Initiated</h2>
    
    <p>Hi <b>${order.user.name}</b>,</p>
    
    <p>We have received your <b>return request</b> for the following order:</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Status:</b> Processing</p>
      <p><b>Reason:</b> ${reason}</p>
    </div>

    <p>Our team will review your request and get back to you with further instructions within <b>2-3 business days</b>.</p>

    <hr style="margin: 20px 0;" />
    
    <p style="font-size: 12px; color: #7f8c8d; text-align: center;">
      This is an automated email from <b>FitFusion</b>. Please do not reply.  
      For support, contact us at <a href="mailto:support@fitfusion.com">support@fitfusion.com</a>.
    </p>
  </div>
  `,
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
      order.returnRequest.status !== "Processing" ||
      order.status !== "Delivered"
    ) {
      return res
        .status(400)
        .json({ message: "No pending return request found" });
    }

    order.returnRequest.status = "Approved";
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "✅ Return Approved - Order " + order._id,
      html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #0d6efd; padding: 16px; text-align: center; color: white;">
      <h2 style="margin: 0;">Return Approved</h2>
    </div>

    <!-- Body -->
    <div style="padding: 20px;">
      <p style="font-size: 16px;">Hello <b>${order.user.name}</b>,</p>
      
      <p style="font-size: 15px;">
        We’re writing to let you know that your <b>return request</b> for 
        <span style="color: #0d6efd;">Order ID: ${order._id}</span> has been 
        <span style="color: green; font-weight: bold;">approved</span>.
      </p>

      <p style="font-size: 15px;">
        Our courier partner will contact you shortly to arrange a pickup. 
        Once the item has been collected and verified, your refund will be processed.
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #0d6efd; padding: 12px; margin: 20px 0; font-size: 14px;">
        <b>Next Steps:</b>
        <ul style="margin: 8px 0 0 20px; padding: 0;">
          <li>Keep the product in its original condition with packaging.</li>
          <li>Hand it over to the pickup agent.</li>
          <li>Refund will be initiated within 3-5 business days after verification.</li>
        </ul>
      </div>

      <p style="font-size: 15px;">Thank you for shopping with us. We’re here to help if you have any questions.</p>

      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        Regards,<br/>
        <b>Customer Support Team</b><br/>
        Your Company Name
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #777;">
      © ${new Date().getFullYear()} Your Company Name. All rights reserved.
    </div>
  </div>
  `,
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

    // Step 1: Mark return collected
    order.status = "Returned";
    order.returnRequest.status = "Returned";
    await order.save();

    await sendEmail({
      to: order.user.email,
      subject: "🚚 Return Collected - Order Update",
      html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4CAF50; color: white; padding: 16px; text-align: center;">
        <h2 style="margin: 0;">Return Collected</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hello <b>${order.user.name}</b>,</p>
        <p>We have successfully <b>collected</b> your returned product for:</p>
        <p style="font-size: 16px;"><b>Order ID:</b> ${order._id}</p>
        <p>Your refund is now being processed and will be completed shortly.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p style="margin-top: 20px;">Thank you for shopping with <b>FitFusion</b>! 🙏</p>
      </div>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} FitFusion. All Rights Reserved.
      </div>
    </div>
  </div>
  `,
    });

    // Step 2: Process Refund if prepaid
    if (order.paymentType === "Online" && order.payment?.razorpayPaymentId) {
      await refundViaRazorpay(
        order.payment.razorpayPaymentId,
        order.totalAmount
      );

      // Update statuses after successful refund
      order.paymentStatus = "Refunded";
      order.status = "Refunded"; // ✅ also mark order as refunded
      await order.save();

      await sendEmail({
        to: order.user.email,
        subject: "💰 Refund Processed Successfully",
        html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2196F3; color: white; padding: 16px; text-align: center;">
        <h2 style="margin: 0;">Refund Completed</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hello <b>${order.user.name}</b>,</p>
        <p>Your refund has been <b>successfully processed</b> for:</p>
        <p style="font-size: 16px;"><b>Order ID:</b> ${order._id}</p>
        <p style="font-size: 16px; color: #4CAF50;"><b>Refund Amount:</b> ₹${
          order.totalAmount
        }</p>
        <p>The refunded amount will be credited to your original payment method within 3–5 business days (depending on your bank).</p>
        <p>If you have any concerns, please contact our support team.</p>
        <p style="margin-top: 20px;">We look forward to serving you again at <b>FitFusion</b>! 🛍️</p>
      </div>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} FitFusion. All Rights Reserved.
      </div>
    </div>
  </div>
  `,
      });
    }

    res.status(200).json({ message: "Return collected & refund processed" });
  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject Return Request
// Reject return request
exports.rejectReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Rejecting return request for order:", order);
    console.log("==> ", order.returnRequest);
    if (order.returnRequest.status !== "Processing") {
      return res
        .status(400)
        .json({ message: "Return request is not in processing state" });
    }

    order.returnRequest.status = "Rejected";
    order.status = "Cancelled"; // mark order as cancelled
    order.returnRejectedAt = new Date();
    console.log("Updated order:", order);
    await order.save();

    // Optional: notify user via email
    // await sendEmail(order.user.email, "Return Request Rejected", `Your return request for order ${order._id} has been rejected.`);

    res.status(200).json({
      message: "Return request rejected successfully",
      order,
    });
  } catch (error) {
    console.error("Error rejecting return request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  const orders = await Order.find().populate("user", "_id name email");
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
