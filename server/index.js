//index.js
require("./cron/orderStatusSync"); // Ensure it's imported
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const uploadRoute = require("./Routes/upload");
const sellerRoutes = require("./Routes/sellerRoutes");
const cors = require("cors");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db");
const otpRoutes = require("./Routes/otpRoutes");
const userRoutes = require("./Routes/userRoutes");
const adminRoute = require("./Routes/adminRoutes");
const productRoute = require("./Routes/productRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const cookieParser = require("cookie-parser");
connectDB();
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.use("/uploads", express.static("uploads"));

// Use upload route
app.use("/api", uploadRoute);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/product", productRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
