//utils/razorpayRefund
const razorpay = require("../config/razorpay");
const Payment = require("../Models/Payment");
const Order = require("../Models/Order");
const sendEmail = require("./sendEmail");

/**
 * Refund a payment via Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in rupees (₹)
 * @returns {Promise<Object>} - Razorpay refund response
 */
const refundViaRazorpay = async (paymentId, amount) => {
  try {
    const refundAmount = amount * 100; // convert ₹ to paise

    // Step 1: Create refund via Razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmount,
      speed: "normal",
      notes: {
        reason: "Return pickup confirmed",
      },
    });

    console.log("Refund successful:", refund);

    // Step 2: Update payment record in DB
    const paymentDoc = await Payment.findOne({
      razorpay_payment_id: paymentId,
    });
    if (!paymentDoc) {
      console.warn("⚠️ Payment record not found for:", paymentId);
      return refund;
    }

    paymentDoc.status = "Refunded";
    paymentDoc.refunds.push({
      refundId: refund.id,
      amount,
      status: refund.status,
      createdAt: new Date(),
      reason: "Product return confirmed",
    });
    await paymentDoc.save();

    // Step 3: Get order + user info for email
    const order = await Order.findOne({ payment: paymentDoc._id }).populate(
      "user products.product"
    );
    if (!order) {
      console.warn("⚠️ Order not found for payment ID:", paymentId);
      return refund;
    }

    const orderId = order._id.toString().slice(-6).toUpperCase(); // last 6 chars
    const productNames = order.products.map((p) => p.product.name).join(", ");

    // Step 4: Send email to User
    await sendEmail(
      order.user.email,
      "🎉 Refund Completed",
      `
  <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;background-color:#f9f9f9;">
    <div style="background-color:#ffffff;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);overflow:hidden;">
      <div style="background-color:#4CAF50;padding:20px;color:#fff;text-align:center;">
        <h2 style="margin:0;">Refund Processed</h2>
      </div>
      <div style="padding:20px;">
        <p>Hi <strong>${order.user.name}</strong>,</p>
        <p>We're pleased to inform you that your refund has been successfully processed for the following order:</p>
        <ul style="list-style:none;padding-left:0;">
          <li><strong>Order ID:</strong> ${order._id}</li>
          <li><strong>Refund Amount:</strong> ₹${order.totalAmount}</li>
          <li><strong>Payment Mode:</strong> ${order.paymentType}</li>
        </ul>
        <p>It may take 3-5 business days for the refund to reflect in your account, depending on your bank.</p>
        <p>Thanks for shopping with us! If you have any questions, feel free to reply to this email.</p>
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#999;margin-top:20px;">
      This is an automated message from [Your Store Name]. Please do not reply directly to this email.
    </p>
  </div>
  `
    );

    // Step 5: Notify Admin
    await sendEmail({
      to: "admin@example.com", // replace with env.ADMIN_EMAIL
      subject: "🔁 Refund Processed via Razorpay",
      html: `
        <h2>Refund Processed</h2>
        <p><strong>User:</strong> ${order.user.name} (${order.user.email})</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Products:</strong> ${productNames}</p>
        <p><strong>Refunded:</strong> ₹${amount}</p>
        <p><strong>Refund ID:</strong> ${refund.id}</p>
        <p><strong>Status:</strong> ${refund.status}</p>
      `,
    });

    return refund;
  } catch (err) {
    console.error("❌ Refund failed:", err);
    throw new Error("Refund via Razorpay failed");
  }
};

module.exports = { refundViaRazorpay };
