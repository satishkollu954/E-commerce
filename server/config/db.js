// config/db.js
const mongoose = require("mongoose");
const Seller = require("../Models/Seller");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    await createAdminSeller();
    console.log(`MongoDB Connected: `);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

const createAdminSeller = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || "admin";
  const name = process.env.ADMIN_NAME || "Admin";

  const existingAdmin = await Seller.findOne({ email, role });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists in Seller DB");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new Seller({
    name,
    email,
    phone: "1234567898",
    password: hashedPassword,
    role,
    storeName: "AdminStore",
    gstNumber: "NA",
    businessAddress: "Admin HQ",
  });

  await admin.save();
  console.log("✅ Admin inserted into Seller collection");
};

module.exports = connectDB;
