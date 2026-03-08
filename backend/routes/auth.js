const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendOtpEmail } = require("../services/email");

const jwtSecret = process.env.JWT_SECRET;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** Middleware: require Authorization Bearer <token>, set req.userId */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }
  const token = authHeader.slice(7);
  if (!jwtSecret) {
    return res.status(500).json({ message: "Server configuration error." });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** POST /api/auth/register — Sign up: name, email, password */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!trimmedEmail) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required." });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character (@$!%*?&).",
      });
    }

    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({ message: "Account already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });

    const result = await sendOtpEmail(trimmedEmail, otp);
    if (!result.sent) {
      await User.findByIdAndDelete(user._id);
      if (result.notConfigured) {
        return res.status(503).json({ message: "Email service is not configured. Please set MAIL_HOST, MAIL_USER, and MAIL_PASS in the server .env to send verification emails." });
      }
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email.",
      email: trimmedEmail,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/** POST /api/auth/verify-otp — Verify email with OTP */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const otpStr = typeof otp === "string" ? otp.trim() : "";

    if (!trimmedEmail || !otpStr) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (user.otp !== otpStr) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/** POST /api/auth/resend-otp — Resend OTP for existing unverified user */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account does not exist. Please sign up." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified. You can log in." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const result = await sendOtpEmail(trimmedEmail, otp);
    if (!result.sent) {
      if (result.notConfigured) {
        return res.status(503).json({ message: "Email service is not configured. Please set MAIL_HOST, MAIL_USER, and MAIL_PASS in the server .env to send verification emails." });
      }
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email.",
      email: trimmedEmail,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/** POST /api/auth/login — Login with email and password */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account does not exist. Please sign up." });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    if (!jwtSecret) {
      console.error("JWT_SECRET is not set.");
      return res.status(500).json({ message: "Server configuration error." });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/** POST /api/auth/change-password — Change password (requires Bearer token) */
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof currentPassword !== "string") {
      return res.status(400).json({ message: "Current password is required." });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required." });
    }
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character (@$!%*?&).",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
