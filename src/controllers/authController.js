const { Router } = require("express");
const router = Router(); // Create an Express router instance

const jwt = require("jsonwebtoken"); // Import jsonwebtoken for token operations
const { verifyToken, restrictTo } = require("./verifyToken"); // Import the verifyToken middleware
const path = require("path"); // Import path module for working with file paths
const User = require("../models/User"); // Import the User model

// Load environment variables from .env file
require("dotenv").config();

// Set cookie options for JWT tokens
const cookieOptions = {
  httpOnly: true, // Cannot be accessed by client-side JavaScript
  secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
  sameSite: 'strict', // Mitigate CSRF attacks
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object containing _id
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

/**
 * Send token response with cookie
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Generate token
  const token = generateToken(user);
  
  // Remove password from output
  user.password = undefined;
  
  // Set cookie
  res.cookie('token', token, cookieOptions);
  
  // Send response
  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

/**
 * @route GET /
 * @description Redirects the root path to the dashboard.
 */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Test endpoint to verify server connectivity
router.get("/api/test", (req, res) => {
  console.log('Test endpoint hit');
  res.json({ success: true, message: "API is working" });
});

// Debug endpoint to check MongoDB connection
router.get("/api/db-status", async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log('MongoDB connection state:', stateMap[connectionState]);
    
    // Try to count users as a test
    let userCount = 0;
    try {
      userCount = await User.countDocuments();
    } catch (countError) {
      console.error('Error counting users:', countError);
    }
    
    res.json({
      success: true,
      dbState: stateMap[connectionState],
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth',
      userCount: userCount
    });
  } catch (error) {
    console.error('Error checking DB status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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
  console.log('🔐 Signup request received:', { ...req.body, password: '***' });
  
  try {
    const { username, email, password, role } = req.body;
    console.log('📋 Extracted data:', { username, email, passwordLength: password?.length, role });

    // Basic validation: Check if all required fields are provided
    if (!username || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: "All fields are required." 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long." 
      });
    }

    // Check if a user with the same email already exists
    console.log('🔍 Checking if email already exists:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists in database');
      return res.status(400).json({ 
        success: false,
        message: "Email already exists." 
      });
    }

    // Create a new User instance
    console.log('👤 Creating new user instance');
    
    // Generate a unique userID
    const userID = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    console.log('🔑 Generated userID:', userID);
    
    const user = new User({
      userID, // Add the generated userID
      username,
      email,
      password, // Password will be encrypted below
      role: role === 'admin' ? 'admin' : 'user' // Only allow admin role if explicitly specified
    });
    console.log('📝 User instance created:', { id: user._id, username: user.username, email: user.email });

    // Encrypt the password before saving
    console.log('🔒 Encrypting password...');
    user.password = await user.encryptPassword(user.password);
    console.log('✅ Password encrypted');

    // Save the new user to the database
    console.log('💾 Attempting to save user to database...');
    try {
      // Log the MongoDB connection status
      const mongoose = require('mongoose');
      console.log('🔍 MongoDB connection state:', mongoose.connection.readyState);
      console.log('🔍 MongoDB connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth');
      
      // Log the user object before saving
      console.log('📝 User object before saving:', JSON.stringify(user, null, 2));
      
      // Try to save with a timeout
      const savedUser = await Promise.race([
        user.save(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database save operation timed out after 5 seconds')), 5000))
      ]);
      
      console.log('✅ User saved successfully:', { id: savedUser._id, username: savedUser.username, email: savedUser.email });
    } catch (saveError) {
      console.error('❌ Error saving user to database:', saveError);
      console.error('Stack trace:', saveError.stack);
      throw saveError; // Re-throw to be caught by the outer catch block
    }

    // Generate JWT token and send response
    console.log('🎟️ Generating token response...');
    const token = generateToken(user);
    
    // Remove password from output
    user.password = undefined;
    
    // Set cookie
    res.cookie('token', token, cookieOptions);
    
    // Send success response with token and user data
    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now logged in.',
      token,
      user: {
        id: user._id,
        userID: user.userID,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
    console.log('✅ Token response sent - User automatically signed in');
  } catch (error) {
    console.error("❌ Signup Error:", error);
    console.error("Stack trace:", error.stack);
    
    // More detailed error information
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      keyValue: error.keyValue, // For duplicate key errors
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        kind: error.errors[key].kind
      })) : undefined
    };
    
    console.error("Detailed error information:", JSON.stringify(errorDetails, null, 2));
    
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
      error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
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
      try {
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
            password: await new User().encryptPassword(Math.random().toString(36).slice(-8)), // Random password for Google users
          });
          await user.save();
        }

        // Use helper function to send token response
        return sendTokenResponse(user, 200, res);
      } catch (googleError) {
        console.error("Google Auth Error:", googleError);
        return res.status(401).json({
          success: false,
          message: "Google authentication failed.",
          error: process.env.NODE_ENV === 'development' ? googleError.message : undefined
        });
      }
    }

    // === Email/password login fallback ===
    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }

    // Check if password matches
    const validPassword = await user.validatePassword(password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }

    // Use helper function to send token response
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /logout
 * @description Logs out the user by clearing the JWT cookie
 */
router.get('/logout', (req, res) => {
  // Clear the JWT cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route GET /me
 * @description Get the currently logged in user's profile
 * @access Private
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    // User is already available in req.user from verifyToken middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /me
 * @description Update user profile
 * @access Private
 */
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateFields = {};

    // Only update fields that are provided
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    // If trying to update email, check if it's already in use by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        });
      }
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /updatepassword
 * @description Update user password
 * @access Private
 */
router.put('/updatepassword', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if both passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id);

    // Check if current password matches
    const isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Update password
    user.password = await user.encryptPassword(newPassword);
    await user.save();

    // Send new token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
