const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Set cookie options for JWT tokens
const cookieOptions = {
  httpOnly: true, // Cannot be accessed by client-side JavaScript
  secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
  sameSite: 'strict', // Mitigate CSRF attacks
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Generate JWT token for an admin
 * @param {Object} admin - Admin object containing _id
 * @returns {String} JWT token
 */
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin._id,
      role: admin.role,
      email: admin.email,
      isAdmin: true
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

/**
 * Send token response with cookie
 * @param {Object} admin - Admin object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (admin, statusCode, res) => {
  // Generate token
  const token = generateToken(admin);
  
  // Remove password from output
  admin.password = undefined;
  
  // Set cookie
  res.cookie('token', token, cookieOptions);
  
  // Send response
  res.status(statusCode).json({
    success: true,
    token,
    admin
  });
};

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password."
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }

    // Send token response
    sendTokenResponse(admin, 200, res);
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Register new admin
 * @route   POST /api/admin/register
 * @access  Public (should be restricted in production)
 */
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password."
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists."
      });
    }

    // Generate a unique admin ID
    const adminCount = await Admin.countDocuments();
    const adminID = `ADM${(adminCount + 1).toString().padStart(4, '0')}`;

    // Create new admin
    const admin = new Admin({
      adminID,
      name,
      email,
      password,
      role: role === 'superadmin' ? 'superadmin' : 'admin' // Only allow superadmin if explicitly specified
    });

    // Save admin to database
    await admin.save();

    // Send token response
    sendTokenResponse(admin, 201, res);
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin only)
 */
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found."
      });
    }
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving admin profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/profile
 * @access  Private (Admin only)
 */
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateFields = {};

    // Only update fields that are provided
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    // If trying to update email, check if it's already in use
    if (email && email !== req.user.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another admin."
        });
      }
    }

    // Update the admin
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found."
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Update Admin Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all admins
 * @route   GET /api/admin/all
 * @access  Private (SuperAdmin only)
 */
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error("Get All Admins Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving admins.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
