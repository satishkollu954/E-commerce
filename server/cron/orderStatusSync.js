const cron = require("node-cron");
const Order = require("../Models/Order");
const User = require("../Models/User");
const sendEmail = require("../utils/sendEmail"); // your existing util

// Simulated function — in production, call real shipping API here
const getTrackingStatus = async (courier, trackingId) => {
  // Replace with real API call
  return {
    status: "Delivered", // Simulate status change for demo
    expectedDelivery: new Date(),
  };
};

cron.schedule("*/5 * * * *", async () => {
  console.log("🔁 Cron Job: Checking order status...");

  try {
    const orders = await Order.find({
      trackingInfo: { $exists: true },
    }).populate("user");

    for (const order of orders) {
      const { courier, trackingId } = order.trackingInfo || {};
      if (!courier || !trackingId) continue;

      const tracking = await getTrackingStatus(courier, trackingId);
      if (!tracking?.status) continue;

      // === SHIPPED STATUS ===
      if (tracking.status === "Shipped" && order.orderStatus !== "Shipped") {
        order.orderStatus = "Shipped";
        order.trackingInfo.status = "Shipped";

        if (!order.emailSentOnShipped) {
          await sendEmail({
            to: order.user.email,
            subject: "📦 Your Order Has Been Shipped!",
            html: `
  <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px; border-radius:8px;">
    <h2 style="color:#007bff;">Great news, ${
      order.user.name || "Customer"
    }!</h2>
    <p>Your order <strong>#${
      order._id
    }</strong> has been <span style="color:#28a745;">shipped</span>.</p>
    
    <p><strong>Courier:</strong> ${courier}<br/>
    <strong>Tracking ID:</strong> ${trackingId}</p>
    
    <p>You can track your package by clicking the button below:</p>
    <a href="https://trackinglink.com/${trackingId}" style="background:#007bff; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Track My Order</a>
    
    <hr/>
    <p style="font-size:12px; color:#777;">Thank you for shopping with us!</p>
  </div>
  `,
          });

          order.emailSentOnShipped = true;
        }

        await order.save();
      }

      // === DELIVERED STATUS ===
      if (
        tracking.status === "Delivered" &&
        order.orderStatus !== "Delivered"
      ) {
        order.orderStatus = "Delivered";
        order.trackingInfo.status = "Delivered";

        if (!order.emailSentOnDelivered) {
          await sendEmail({
            to: order.user.email,
            subject: "✅ Your Order Has Been Delivered!",
            html: `
  <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px; border-radius:8px;">
    <h2 style="color:#28a745;">Your package has arrived!</h2>
    <p>We’re happy to inform you that your order <strong>#${order._id}</strong> has been <span style="color:#28a745;">delivered</span>.</p>
    
    <p>We hope you love your purchase. If you have any issues, feel free to <a href="https://yourwebsite.com/support">contact our support</a>.</p>
    
    <p style="margin-top:20px;">We’d love your feedback:</p>
    <a href="https://yourwebsite.com/review/${order._id}" style="background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Leave a Review</a>
    
    <hr/>
    <p style="font-size:12px; color:#777;">Thanks for choosing us!</p>
  </div>
  `,
          });

          order.emailSentOnDelivered = true;
        }

        await order.save();
      }

      // === CANCELLED STATUS ===
      if (
        tracking.status === "Cancelled" &&
        order.orderStatus !== "Cancelled"
      ) {
        order.orderStatus = "Cancelled";
        order.trackingInfo.status = "Cancelled";

        if (!order.emailSentOnCancelled) {
          await sendEmail({
            to: order.user.email,
            subject: "❌ Your Order Has Been Cancelled",
            html: `
  <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px; border-radius:8px;">
    <h2 style="color:#dc3545;">Order Cancelled</h2>
    <p>We’re sorry to inform you that your order <strong>#${order._id}</strong> has been <span style="color:#dc3545;">cancelled</span>.</p>
    
    <p>If you didn’t request this cancellation or if you’d like assistance, please contact our <a href="https://yourwebsite.com/support">support team</a>.</p>
    
    <p style="margin-top:20px;">Want to reorder?</p>
    <a href="https://yourwebsite.com/shop" style="background:#dc3545; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Shop Again</a>
    
    <hr/>
    <p style="font-size:12px; color:#777;">We hope to serve you better next time.</p>
  </div>
  `,
          });

          order.emailSentOnCancelled = true;
        }

        await order.save();
      }
    }
  } catch (err) {
    console.error("❌ Cron Job Error:", err.message);
  }
});
