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
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    });

    // 4️⃣ Return order + verifiedAmount
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
    // 1️⃣ Recalculate subtotal + shippingFee
    let subtotal = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Invalid product");
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error("Invalid variant");
      subtotal += variant.finalPrice * item.quantity;
    }
    const shippingFee = subtotal < 500 ? 50 : 0;
    const totalAmount = subtotal + shippingFee;

    // 3️⃣ Build populatedProducts similar to COD
    const populatedProducts = [];
    for (const item of products) {
      const prod = await Product.findById(item.product);
      const variant = prod.variants.id(item.variantId);

      populatedProducts.push({
        product: prod._id,
        name: prod.name,
        variantId: variant._id,
        variant: {
          size: variant.size,
          childAgeGroup: variant.childAgeGroup,
          color: variant.color,
        },
        price: variant.finalPrice,
        quantity: item.quantity,
        images: prod.images || [],
      });
    }

    const order = await Order.create({
      user: req.userId,
      products: populatedProducts,
      shippingAddress,
      totalAmount,
      paymentType: paymentType || "Online",
      paymentStatus: "Paid",
      deliveredAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Estimated delivery in 5 days
    });

    // 3️⃣ Create Payment
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

    // 4️⃣ Reduce stock for selected variants
    for (const item of products) {
      const prod = await Product.findById(item.product);
      const variant = prod.variants.id(item.variantId);
      if (variant) {
        variant.stock -= item.quantity;
        await prod.save();
      }
    }

    // 5️⃣ Push order into user.orders
    await User.findByIdAndUpdate(req.userId, {
      $push: { orders: order._id },
    });

    // 6️⃣ Build HTML and send mail
    const user = await User.findById(req.userId);
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
          </tr>`;
      })
    );

    const html = `
<div style="font-family: Arial, sans-serif; max-width:650px; margin:auto; border:1px solid #e5e5e5; border-radius:8px;">
  <div style="background:#1976d2; color:#fff; text-align:center; padding:20px;">
    <h2 style="margin:0;">Thank you for your order!</h2>
  </div>
  <div style="padding:20px;">
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>Your order has been <b>successfully placed</b>.</p>
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
        ${productsHtml.join("")}
      </tbody>
    </table>
    <p style="text-align:right; font-weight:bold;">Total Amount: ₹${totalAmount}</p>
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
  const { products, shippingAddress } = req.body;

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

    // 2️⃣ Shipping fee
    const shippingFee = subtotal < 500 ? 50 : 0;
    const totalAmount = subtotal + shippingFee;

    // 3️⃣ Build populatedProducts
    const populatedProducts = [];
    for (const item of products) {
      const prod = await Product.findById(item.product);
      const variant = prod.variants.id(item.variantId);

      populatedProducts.push({
        product: prod._id,
        name: prod.name,
        variant: {
          size: variant.size,
          childAgeGroup: variant.childAgeGroup,
          color: variant.color,
        },
        price: variant.finalPrice,
        quantity: item.quantity,
        images: prod.images || [],
      });

      // Reduce stock
      variant.stock -= item.quantity;
      await prod.save();
    }

    // 4️⃣ Create order
    const order = await Order.create({
      user: req.userId,
      products: populatedProducts,
      shippingAddress,
      totalAmount,
      paymentType: "COD",
      paymentStatus: "Pending",
    });

    // 5️⃣ Add to user's order list
    await User.findByIdAndUpdate(req.userId, { $push: { orders: order._id } });

    // 6️⃣ Build email HTML SAME as online checkout
    const user = await User.findById(req.userId);

    const productsHtml = populatedProducts
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 12px; border:1px solid #eee;">${
              item.name
            }</td>
            <td style="padding:8px 12px; border:1px solid #eee;">${
              item.variant.size || item.variant.childAgeGroup || "-"
            }</td>
            <td style="padding:8px 12px; text-align:center; border:1px solid #eee;">${
              item.quantity
            }</td>
            <td style="padding:8px 12px; text-align:right; border:1px solid #eee;">₹${
              item.price
            }</td>
          </tr>
        `
      )
      .join("");

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
    <p style="text-align:right; font-weight:bold;">Total Amount: ₹${totalAmount}</p>
    <h4>📦 Shipping Address</h4>
    <p>${shippingAddress.name}<br>
       ${shippingAddress.street}, ${shippingAddress.city}, ${
      shippingAddress.state
    }<br>
       ${shippingAddress.country} – ${shippingAddress.pincode}<br>
       Phone: ${shippingAddress.phone}
    </p>
    <p style="margin-top:20px;">Kind regards,<br><strong>FitFusion Team</strong></p>
  </div>
  <div style="background:#f6f6f6; padding:15px; text-align:center; font-size:12px;">
    © ${new Date().getFullYear()} FitFusion. All rights reserved.
  </div>
</div>
`;

    await sendEmail({
      to: user.email,
      subject: "Order Placed Successfully",
      html,
    });

    res.json({ message: "COD order placed", order });
  } catch (error) {
    console.error("❌ COD order error:", error);
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
      // Payment Failed Email
      await sendEmail(
        user.email,
        "⚠️ Payment Failed – Action Required",
        `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background: #dc3545; padding: 20px; text-align: center; color: white;">
      <h2>Payment Failed</h2>
    </div>
    <div style="padding: 20px; color: #333;">
      <p>Hi <b>${user.name}</b>,</p>
      <p>Unfortunately, your recent payment attempt <b>(Payment ID: ${paymentId})</b> was <span style="color:#dc3545;">unsuccessful</span>.</p>
      <p>Please retry your payment to continue with your order.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://yourwebsite.com/retry-payment/${paymentId}" style="background:#dc3545; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">Retry Payment</a>
      </div>
      <p>If you face any issues, contact our support team immediately.</p>
    </div>
    <div style="background:#f8f9fa; padding:15px; text-align:center; font-size:12px; color:#666;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
  `
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
      // Refund Processed Email
      await sendEmail(
        user.email,
        "💰 Refund Processed Successfully",
        `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background: #28a745; padding: 20px; text-align: center; color: white;">
      <h2>Refund Processed</h2>
    </div>
    <div style="padding: 20px; color: #333;">
      <p>Hi <b>${user.name}</b>,</p>
      <p>We have successfully processed your refund of <b>₹${(
        refund.amount / 100
      ).toFixed(2)}</b> for order <b>#${order._id}</b>.</p>
      <p>The refunded amount will reflect in your account within <b>5-7 business days</b>, depending on your bank.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://yourwebsite.com/orders/${
          order._id
        }" style="background:#28a745; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">View Order</a>
      </div>
      <p>If you have any queries, feel free to reach out to us.</p>
    </div>
    <div style="background:#f8f9fa; padding:15px; text-align:center; font-size:12px; color:#666;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
  `
      );
    }
  }

  res.status(200).send("Webhook received");
};
