const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Create a new order and update inventory
 * POST /api/orders
 */
router.post('/', async (req, res) => {
  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('MongoDB connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth');
    
    const orderData = req.body;
    console.log('Received order data:', JSON.stringify(orderData, null, 2));
    
    // Validate all products exist and have sufficient inventory
    for (const item of orderData.items) {
      console.log('Checking product:', item.productId);
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for product: ${product.name}`);
      }
    }
    
    // Create the order
    console.log('Creating order...');
    const order = await Order.create(orderData);
    console.log('Order created:', order);
    
    // Update inventory for each item
    for (const item of orderData.items) {
      console.log('Updating inventory for product:', item.productId);
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { inventory: -item.quantity } }
      );
    }
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating order'
    });
  }
});

/**
 * Get order by orderId
 * GET /api/orders/:orderId
 */
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching order'
    });
  }
});

/**
 * Get all orders
 * GET /api/orders
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching orders'
    });
  }
});

/**
 * Update order status
 * PUT /api/orders/:orderId/status
 */
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    order.status = status;
    await order.save();
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating order status'
    });
  }
});

/**
 * Send order confirmation
 * POST /api/orders/:orderId/confirm
 */
router.post('/:orderId/confirm', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // In a real application, you would send an email here
    // For now, we'll just update a field on the order to simulate this
    order.confirmationSent = true;
    await order.save();
    
    res.json({
      success: true,
      message: 'Confirmation email sent'
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error sending confirmation'
    });
  }
});

/**
 * Issue refund for order
 * POST /api/orders/:orderId/refund
 */
router.post('/:orderId/refund', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // In a real application, you would process the refund through a payment gateway
    // For now, we'll just update the order status
    order.status = 'refunded';
    order.refundedAt = new Date();
    await order.save();
    
    res.json({
      success: true,
      message: 'Order refunded successfully',
      order
    });
  } catch (error) {
    console.error('Error refunding order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error refunding order'
    });
  }
});

module.exports = router; 
