const { Router } = require("express");
const router = Router(); // Create an Express router instance

const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token operations
const verifyToken = require("./verifyToken"); // Import the verifyToken middleware
const path = require("path"); // Import path module for working with file paths
const User = require("../models/User"); // Import the User model (assuming it's in ../models/User)

// Load environment variables from .env file
require("dotenv").config();

/**
 * @route GET /
 * @description Redirects the root path to the dashboard.
 */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

/**
 * @route POST /signup
 * @description Handles user registration. Creates a new user, encrypts the password,
 * saves the user to the database, generates a JWT token, and returns the token.
 * @param {string} req.body.username - The username for the new user.
 * @param {string} req.body.email - The email for the new user.
 * @param {string} req.body.password - The password for the new user.
 */
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation: Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Create a new User instance
    const user = new User({
      username,
      email,
      password, // Password will be encrypted below
    });

    // Encrypt the password before saving (assuming encryptPassword method exists on User model)
    user.password = await user.encryptPassword(user.password);

    // Save the new user to the database
    await user.save();

    // Generate a JWT token for the newly registered user
    // The token payload contains the user's ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24, // Token expires in 24 hours
    });

    // Send a success response with auth status and token
    res.status(201).json({ auth: true, token }); // Use 201 for resource created
  } catch (error) {
    console.error("Signup Error:", error);
    // Pass the error to the next error-handling middleware
    next(error);
  }
});

/**
 * @route GET /dashboard
 * @description Serves the dashboard HTML page. This route does NOT require authentication
 * to load the HTML file itself. Authentication is handled by client-side JS
 * when fetching data for the dashboard.
 */
// *** Make sure verifyToken is NOT here for the HTML file route ***
router.get("/dashboard", (req, res, next) => {
  // Assuming your dashboard HTML file is named index.html and is in a 'public' folder
  // one level up from the 'controllers' folder. Adjust the path as needed.
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

/**
 * @route POST /signin
 * @description Handles user login. Finds the user by email, validates the password,
 * generates a JWT token, and returns the token in a JSON response.
 * @param {string} req.body.email - The email for login.
 * @param {string} req.body.password - The password for login.
 */
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/signin", async (req, res, next) => {
  try {
    const { email, password, credential } = req.body;

    // === Google Sign-In path ===
    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const userEmail = payload.email;
      const username = payload.name || "GoogleUser";

      // Try to find existing user
      let user = await User.findOne({ email: userEmail });

      // If not found, create a new user
      if (!user) {
        user = new User({
          username,
          email: userEmail,
          password: "", // No password needed for Google users
        });
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24,
      });

      return res.status(200).json({ auth: true, token });
    }

    // === Email/password login fallback ===
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        auth: false,
        token: null,
        message: "No user exists with this email.",
      });
    }

    const validPassword = await user.validatePassword(password);

    if (!validPassword) {
      return res.status(401).json({
        auth: false,
        token: null,
        message: "Password is incorrect.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    res.status(200).json({ auth: true, token });

  } catch (error) {
    console.error("Signin Error:", error);
    next(error);
  }
});

module.exports = router;
