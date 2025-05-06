const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Middleware to verify JWT tokens and protect routes
 * Checks for token in Authorization header, cookies, or query parameters
 */
async function verifyToken(req, res, next) {
  try {
    // Check multiple sources for the token
    let token;
    
    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    
    // 2. Check cookies (if no token in header)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 3. Check query parameters (least secure, but sometimes necessary)
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    // If no token found in any location
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided."
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user (without returning the password)
    const user = await User.findById(decoded.id).select("-password");
    
    // Check if user still exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user associated with this token no longer exists."
      });
    }
    
    // Add user info to request object
    req.user = user;
    req.userId = decoded.id;
    req.userRole = user.role;
    
    // Continue to the protected route
    next();
    
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again."
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "An error occurred while authenticating."
    });
  }
}

/**
 * Middleware to restrict access based on user role
 * @param {Array} roles - Array of allowed roles
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    // verifyToken middleware should be called before this
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource"
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
}

module.exports = { verifyToken, restrictTo };
