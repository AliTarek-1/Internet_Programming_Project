const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const { verifyToken } = require("./verifyToken");

const User = require("../models/User");
const Admin = require("../models/Admin"); // ✅ <-- Add this
require("dotenv").config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user);
  user.password = undefined;
  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// -------------------------------------------
// Admin Registration
// -------------------------------------------
router.post("/register-admin", async (req, res) => {
  try {
    const { adminID, name, email, password } = req.body;

    if (!adminID || !name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    const admin = new Admin({ adminID, name, email, password });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        adminID: admin.adminID,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("❌ ERROR during /register-admin:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
});

// -------------------------------------------
// Admin Login
// -------------------------------------------
router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found." });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "fallbacksecret", // Make sure .env contains JWT_SECRET
      { expiresIn: "1h" }
    );

    // 4. Respond with token
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// -------------------------------------------
// Regular User Signup
// -------------------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    const user = new User({
      username,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });
    user.password = await user.encryptPassword(user.password);
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during signup." });
  }
});

// -------------------------------------------
// Regular User Signin
// -------------------------------------------
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    const isMatch = await user.validatePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ success: false, message: "Error logging in." });
  }
});

// -------------------------------------------
// Logout
// -------------------------------------------
router.get("/logout", (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// -------------------------------------------
// Authenticated User Profile
// -------------------------------------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// -------------------------------------------
module.exports = router;
