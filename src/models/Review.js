const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  productID: {
    type: String,
    required: [true, 'Product ID is required'],
    ref: 'Product'
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
reviewSchema.index({ productID: 1, userID: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productID) {
  const result = await this.aggregate([
    { $match: { productID } },
    {
      $group: {
        _id: '$productID',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (result.length > 0) {
      await mongoose.model('Product').findOneAndUpdate(
        { productID },
        {
          averageRating: result[0].averageRating.toFixed(1),
          totalReviews: result[0].totalReviews
        }
      );
    } else {
      await mongoose.model('Product').findOneAndUpdate(
        { productID },
        {
          averageRating: 0,
          totalReviews: 0
        }
      );
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.productID);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.productID);
});

module.exports = mongoose.model('Review', reviewSchema);
