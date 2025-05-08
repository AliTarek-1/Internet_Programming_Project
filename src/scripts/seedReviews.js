/**
 * Seed script to populate the database with product reviews
 */

const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brandstore')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample review comments
const reviewComments = [
  { title: 'Great product!', comment: 'I absolutely love this product. The quality is excellent and it exceeded my expectations.' },
  { title: 'Highly recommend', comment: 'This is one of the best purchases I\'ve made. Would definitely recommend to others.' },
  { title: 'Good value', comment: 'Good quality for the price. Arrived quickly and as described.' },
  { title: 'Decent quality', comment: 'The product is decent. Not amazing but definitely worth the price.' },
  { title: 'Nice addition', comment: 'This is a nice addition to my collection. The quality is good and it looks great.' },
  { title: 'Excellent purchase', comment: 'Very happy with my purchase. The product is well-made and looks exactly like the pictures.' },
  { title: 'Satisfied customer', comment: 'I\'m satisfied with this product. It meets all my needs and the price is reasonable.' },
  { title: 'Better than expected', comment: 'The product is even better than I expected. Very pleased with my purchase.' },
  { title: 'Perfect fit', comment: 'The size is perfect and the quality is excellent. Would buy again.' },
  { title: 'Great design', comment: 'Love the design and the quality is top-notch. Very happy with this purchase.' }
];

// Sample user data for reviews
const sampleUsers = [
  { userID: 'USER001', username: 'JohnSmith', email: 'john.smith@example.com', password: 'Password123!' },
  { userID: 'USER002', username: 'EmilyJohnson', email: 'emily.johnson@example.com', password: 'Password123!' },
  { userID: 'USER003', username: 'MichaelBrown', email: 'michael.brown@example.com', password: 'Password123!' },
  { userID: 'USER004', username: 'SarahDavis', email: 'sarah.davis@example.com', password: 'Password123!' },
  { userID: 'USER005', username: 'DavidWilson', email: 'david.wilson@example.com', password: 'Password123!' }
];

// Function to seed the database
async function seedReviews() {
  try {
    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    // Get all products from the database
    const products = await Product.find({});
    console.log(`Found ${products.length} products to create reviews for`);

    if (products.length === 0) {
      console.log('No products found. Please run seedProducts.js first.');
      mongoose.connection.close();
      return;
    }

    // Create or get users for reviews
    let users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found. Creating sample users for reviews...');
      users = await User.create(sampleUsers);
      console.log(`Created ${users.length} sample users`);
    }

    // Create reviews
    const reviews = [];
    const userProductMap = new Map(); // Track which products each user has reviewed
    
    // Assign each product to be reviewed by different users to avoid duplicate key errors
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Determine how many reviews for this product (1-3)
      const numReviews = Math.floor(Math.random() * 3) + 1;
      
      // Get a set of users who haven't reviewed this product yet
      const availableUserIndexes = [];
      for (let j = 0; j < users.length; j++) {
        const userKey = users[j]._id.toString();
        if (!userProductMap.has(userKey)) {
          userProductMap.set(userKey, new Set());
        }
        
        if (!userProductMap.get(userKey).has(product.productID)) {
          availableUserIndexes.push(j);
        }
      }
      
      // Shuffle available users
      availableUserIndexes.sort(() => Math.random() - 0.5);
      
      // Create reviews using available users
      for (let j = 0; j < Math.min(numReviews, availableUserIndexes.length); j++) {
        const userIndex = availableUserIndexes[j];
        const user = users[userIndex];
        
        // Mark this product as reviewed by this user
        userProductMap.get(user._id.toString()).add(product.productID);
        
        // Select a random comment
        const reviewText = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        
        // Generate a random rating (3-5 stars, weighted towards higher ratings)
        const ratings = [3, 4, 4, 5, 5, 5];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        
        // Create a review
        reviews.push({
          userID: user._id,
          username: user.username,
          productID: product.productID,
          productName: product.name,
          rating: rating,
          title: reviewText.title,
          comment: reviewText.comment,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    // Insert reviews
    const result = await Review.insertMany(reviews);
    console.log(`Successfully added ${result.length} reviews to the database`);

    // Log rating breakdown
    const fiveStarCount = result.filter(r => r.rating === 5).length;
    const fourStarCount = result.filter(r => r.rating === 4).length;
    const threeStarCount = result.filter(r => r.rating === 3).length;
    const twoStarCount = result.filter(r => r.rating === 2).length;
    const oneStarCount = result.filter(r => r.rating === 1).length;

    console.log(`5-star reviews: ${fiveStarCount}`);
    console.log(`4-star reviews: ${fourStarCount}`);
    console.log(`3-star reviews: ${threeStarCount}`);
    console.log(`2-star reviews: ${twoStarCount}`);
    console.log(`1-star reviews: ${oneStarCount}`);

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedReviews();
