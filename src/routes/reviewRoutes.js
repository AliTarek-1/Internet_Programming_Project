const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get reviews by product ID
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Create a new review (requires authentication)
router.post('/', protect, reviewController.createReview);

// Update a review (requires authentication)
router.put('/:id', protect, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
