const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number']
  },
  oldPrice: {
    type: Number,
    min: [0, 'Old price must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ["Men's Collection", "Women's Collection", "Children's Collection"],
      message: 'Please select a valid category'
    }
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 10 // Default to 10 items in stock
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional to allow importing products without a user reference
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = model('Product', productSchema);
