const mongoose = require('mongoose');

// Schema for restock history
const restockHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity added is required'],
    min: [1, 'Quantity must be at least 1']
  },
  notes: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Main inventory schema
const inventorySchema = new mongoose.Schema({
  SKU: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [1, 'Low stock threshold must be at least 1']
  },
  restockHistory: [restockHistorySchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

// Update status based on quantity
inventorySchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  
  this.lastUpdated = new Date();
  next();
});

// Method to add stock
inventorySchema.methods.addStock = function(quantity, notes, adminId) {
  this.quantity += quantity;
  
  const restockEntry = {
    date: new Date(),
    quantity,
    notes: notes || 'Regular restock',
    performedBy: adminId
  };
  
  this.restockHistory.push(restockEntry);
  return this.save();
};

// Method to remove stock
inventorySchema.methods.removeStock = function(quantity) {
  if (this.quantity < quantity) {
    throw new Error('Not enough stock available');
  }
  
  this.quantity -= quantity;
  return this.save();
};

// Static method to check if product is in stock
inventorySchema.statics.isInStock = async function(sku, requiredQuantity = 1) {
  const inventory = await this.findOne({ SKU: sku });
  
  if (!inventory) {
    return false;
  }
  
  return inventory.quantity >= requiredQuantity;
};

module.exports = mongoose.model('Inventory', inventorySchema);
