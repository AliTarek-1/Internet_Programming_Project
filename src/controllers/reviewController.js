const Review = require('../models/Review');

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get reviews by product ID
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const reviews = await Review.find({ productID: productId })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get Reviews By Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reviews for product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    // Add user ID to request body
    if (req.userId) {
      req.body.userID = req.userId;
    }
    
    // Create review
    const review = new Review(req.body);
    await review.save();
    
    // Update product average rating
    await Review.calculateAverageRating(review.productID);
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (req.userId && review.userID.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    // Update review
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Update product average rating
    await Review.calculateAverageRating(review.productID);
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update Review Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (req.userId && review.userID.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    // Store product ID before deleting review
    const productID = review.productID;
    
    // Delete review
    await Review.findByIdAndDelete(req.params.id);
    
    // Update product average rating
    await Review.calculateAverageRating(productID);
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
