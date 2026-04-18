const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetOtpEmail,
  sendPasswordChangedEmail,
} = require("../utils/emailService");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const getAdminEmails = () =>
  [process.env.ADMIN_EMAIL, process.env.SMTP_USER]
    .filter(Boolean)
    .map((email) => normalizeEmail(email));
const resolveUserRole = (email) =>
  getAdminEmails().includes(normalizeEmail(email)) ? "admin" : "client";
const RESET_TOKEN_TTL_MS =
  Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 30) * 60 * 1000;

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashed,
    role: resolveUserRole(normalizedEmail),
  });

  res.status(201).json({
    _id: user._id,
    token: generateToken(user._id, user.role),
    role: user.role,
  });

  sendWelcomeEmail({ name: user.name, email: user.email }).catch((error) => {
    console.error(`Welcome email failed for ${user.email}: ${error.message}`);
  });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Wrong password" });

  const resolvedRole = resolveUserRole(normalizedEmail);
  if (user.role !== resolvedRole) {
    user.role = resolvedRole;
    await user.save({ validateBeforeSave: false });
  }

  res.json({
    _id: user._id,
    token: generateToken(user._id, user.role),
    role: user.role,
  });

  sendLoginAlertEmail({ name: user.name, email: user.email }).catch((error) => {
    console.error(`Login alert email failed for ${user.email}: ${error.message}`);
  });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body?.email);

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({
      message:
        "If an account exists with this email, a password reset OTP has been sent.",
    });
  }

  const resetOtp = String(crypto.randomInt(100000, 1000000));
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetOtp)
    .digest("hex");

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save({ validateBeforeSave: false });

  sendPasswordResetOtpEmail({
    name: user.name,
    email: user.email,
    otp: resetOtp,
  }).catch((error) => {
    console.error(`Password reset OTP email failed for ${user.email}: ${error.message}`);
  });

  return res.json({
    message:
      "If an account exists with this email, a password reset OTP has been sent.",
  });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP and new password are required" });
  }

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(String(otp).trim())
    .digest("hex");

  const user = await User.findOne({
    email: normalizedEmail,
    resetPasswordToken: hashedResetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: "OTP is invalid or expired" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendPasswordChangedEmail({ name: user.name, email: user.email }).catch((error) => {
    console.error(`Password changed email failed for ${user.email}: ${error.message}`);
  });

  return res.json({ message: "Password reset successful. Please login again." });
};
