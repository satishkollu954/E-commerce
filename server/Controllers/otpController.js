// controllers/otpController.js
const nodemailer = require("nodemailer");
const OtpVerification = require("../Models/OtpVerification");
const sendEmail = require("../utils/sendEmail");
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ✉️ Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // your Gmail address
    pass: process.env.MAIL_PASS, // app password (not Gmail password)
  },
});

// 📩 Send OTP via Email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();

  try {
    // Save or update OTP in DB
    const savedata = await OtpVerification.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("Saved OTP:", savedata);

    // HTML Email content
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007bff; color: #ffffff; padding: 16px; text-align: center;">
            <h2>Welcome to FitFusion!</h2>
          </div>
          <div style="padding: 24px;">
            <p>Dear user,</p>
            <p>Thank you for registering with <strong>FitFusion</strong>. Please use the following OTP to complete your verification:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #007bff;">${otp}</span>
            </div>
            <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
            <hr />
            <p style="font-size: 12px; color: #888888;">
              E-Shop is your one-stop destination for amazing products and unbeatable prices.
              Stay tuned for the latest deals and offers!
            </p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 12px; font-size: 12px; color: #666;">
            &copy; ${new Date().getFullYear()} E-Shop. All rights reserved.
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Your OTP for E-Shop Verification",
      html,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Email OTP Error:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OtpVerification.findOne({ email: email });

    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    await record.deleteOne();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Verification failed", error: err.message });
  }
};
