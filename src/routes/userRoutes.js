const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('orders')
      .populate('reviews');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, phone, birthDate, gender } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        username,
        email,
        phone,
        birthDate,
        gender,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});

// Add a new address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }
    
    // If new address is set as default, unset default for all other addresses
    if (req.body.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    user.addresses.push(req.body);
    await user.save();
    
    res.status(201).json({ 
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
});

// Update an address
router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(
      address => address._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If updated address is set as default, unset default for all other addresses
    if (req.body.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    // Update the address
    Object.keys(req.body).forEach(key => {
      user.addresses[addressIndex][key] = req.body[key];
    });
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});

// Delete an address
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(
      address => address._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Remove the address
    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);
    
    // If the deleted address was the default and there are other addresses,
    // make the first one the default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({ 
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});

// Get user payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('paymentMethods');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ paymentMethods: user.paymentMethods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
  }
});

// Add a new payment method
router.post('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If this is the first payment method, make it default
    if (user.paymentMethods.length === 0) {
      req.body.isDefault = true;
    }
    
    // If new payment method is set as default, unset default for all other payment methods
    if (req.body.isDefault) {
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }
    
    user.paymentMethods.push(req.body);
    await user.save();
    
    res.status(201).json({ 
      message: 'Payment method added successfully',
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding payment method', error: error.message });
  }
});

// Get user orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get a specific order
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      user: req.user._id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

module.exports = router;
