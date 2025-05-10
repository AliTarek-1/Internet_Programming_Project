const express = require('express');
const router = express.Router();
const { 
  adminLogin, 
  adminRegister, 
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins
} = require('../controllers/adminController');
const { verifyToken, restrictTo } = require('../controllers/verifyToken');

// Public routes
router.post('/login', adminLogin);
router.post('/register', adminRegister);

// Protected routes (require authentication)
router.get('/profile', verifyToken, restrictTo('admin', 'superadmin'), getAdminProfile);
router.put('/profile', verifyToken, restrictTo('admin', 'superadmin'), updateAdminProfile);
router.get('/all', verifyToken, restrictTo('superadmin'), getAllAdmins);

module.exports = router;
