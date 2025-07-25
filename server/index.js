//index.js
const dotenv = require("dotenv");
dotenv.config({ path: "./data.env" });
const express = require("express");
const sellerRoutes = require("./Routes/sellerRoutes");
const cors = require("cors");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db");
const otpRoutes = require("./Routes/otpRoutes");
const userRoutes = require("./Routes/userRoutes");

connectDB();
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);

app.use("/api/seller", sellerRoutes);
