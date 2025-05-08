/**
 * Seed script to populate the database with inventory data
 */

const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brandstore')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to seed the database
async function seedInventory() {
  try {
    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Get all products from the database
    const products = await Product.find({});
    console.log(`Found ${products.length} products to create inventory for`);

    if (products.length === 0) {
      console.log('No products found. Please run seedProducts.js first.');
      mongoose.connection.close();
      return;
    }

    // Create inventory entries for each product
    const inventoryEntries = products.map(product => ({
      SKU: product.sku,
      productName: product.name,
      quantity: product.inventory || Math.floor(Math.random() * 50) + 10, // Use product inventory or random value
      lowStockThreshold: 5,
      status: 'In Stock', // Will be automatically updated by pre-save hook
      restockHistory: [
        {
          date: new Date(),
          quantity: product.inventory || Math.floor(Math.random() * 50) + 10,
          notes: 'Initial stock',
          performedBy: null // No admin assigned for initial stock
        }
      ]
    }));

    // Insert inventory entries
    const result = await Inventory.insertMany(inventoryEntries);
    console.log(`Successfully added ${result.length} inventory entries to the database`);

    // Log inventory status breakdown
    const inStockCount = result.filter(i => i.status === 'In Stock').length;
    const lowStockCount = result.filter(i => i.status === 'Low Stock').length;
    const outOfStockCount = result.filter(i => i.status === 'Out of Stock').length;

    console.log(`In Stock: ${inStockCount} items`);
    console.log(`Low Stock: ${lowStockCount} items`);
    console.log(`Out of Stock: ${outOfStockCount} items`);

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding inventory:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedInventory();
