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
            subject: "Your order has been shipped!",
            text: `Your order ${order._id} is now shipped via ${courier}.`,
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
            subject: "Order Delivered!",
            text: `Your order ${order._id} has been delivered. Thank you for shopping!`,
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
            subject: "Order Cancelled",
            text: `Order ${order._id} has been cancelled.`,
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
