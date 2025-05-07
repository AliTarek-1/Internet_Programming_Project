const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for women\'s products import'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Women's products data
const womensProducts = [
  {
    name: 'Floral Maxi Dress',
    category: "Women's Collection",
    price: 89.99,
    description: 'Beautiful floral pattern on a flowing maxi dress.',
    sku: 'WD1001',
    rating: 4.7,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/maxi-dress.jpg'
  },
  {
    name: 'Skinny High-Rise Jeans',
    category: "Women's Collection",
    price: 79.99,
    oldPrice: 95.00,
    description: 'Form-fitting jeans with modern high-rise cut.',
    sku: 'WJ1002',
    rating: 4.6,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/skinny-jeans.jpg'
  },
  {
    name: 'Cashmere Blend Sweater',
    category: "Women's Collection",
    price: 120.00,
    description: 'Luxury cashmere blend for exceptional softness.',
    sku: 'WS1003',
    rating: 4.8,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/cashmere-sweater.jpg'
  },
  {
    name: 'Tailored Blazer',
    category: "Women's Collection",
    price: 149.99,
    description: 'Professional blazer with modern slim fit.',
    sku: 'WB1004',
    rating: 4.9,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/blazer.jpg'
  },
  {
    name: 'Pleated Midi Skirt',
    category: "Women's Collection",
    price: 69.99,
    oldPrice: 85.00,
    description: 'Elegant pleated skirt in versatile midi length.',
    sku: 'WS1005',
    rating: 4.5,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/midi-skirt.jpg'
  },
  {
    name: 'Silk Blouse',
    category: "Women's Collection",
    price: 110.00,
    description: 'Premium silk blouse for timeless elegance.',
    sku: 'WB1006',
    rating: 4.7,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/silk-blouse.jpg'
  },
  {
    name: 'Leather Ankle Boots',
    category: "Women's Collection",
    price: 159.99,
    description: 'Classic ankle boots with block heel.',
    sku: 'WB1007',
    rating: 4.8,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/ankle-boots.jpg'
  },
  {
    name: 'Summer Romper',
    category: "Women's Collection",
    price: 65.00,
    oldPrice: 80.00,
    description: 'Lightweight and breezy summer romper.',
    sku: 'WR1008',
    rating: 4.4,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/romper.jpg'
  },
  {
    name: 'Yoga Leggings',
    category: "Women's Collection",
    price: 49.99,
    description: 'High-performance leggings for yoga and fitness.',
    sku: 'WL1009',
    rating: 4.6,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/yoga-leggings.jpg'
  },
  {
    name: 'Oversized Cardigan',
    category: "Women's Collection",
    price: 75.00,
    description: 'Cozy oversized cardigan for casual comfort.',
    sku: 'WC1010',
    rating: 4.5,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/cardigan.jpg'
  },
  {
    name: 'Denim Jacket',
    category: "Women's Collection",
    price: 85.00,
    description: 'Classic denim jacket with modern details.',
    sku: 'WJ1011',
    rating: 4.7,
    reviews: 0,
    featured: true,
    inventory: 20,
    image: '/images/products/womens/denim-jacket.jpg'
  },
  {
    name: 'Satin Pajama Set',
    category: "Women's Collection",
    price: 69.99,
    oldPrice: 85.00,
    description: 'Luxurious satin pajamas for ultimate comfort.',
    sku: 'WP1012',
    rating: 4.9,
    reviews: 0,
    featured: false,
    inventory: 20,
    image: '/images/products/womens/pajama-set.jpg'
  }
];

// Function to import products
async function importWomensProducts() {
  try {
    console.log('Starting women\'s products import...');
    
    // Clear existing women's products
    await Product.deleteMany({ category: "Women's Collection" });
    console.log('Cleared existing women\'s products');
    
    // Insert new products
    const insertedProducts = await Product.insertMany(womensProducts);
    console.log(`Successfully imported ${insertedProducts.length} women's products`);
    
    // Log each product that was inserted
    insertedProducts.forEach(product => {
      console.log(`Imported: ${product.name} (SKU: ${product.sku})`);
    });
    
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing products:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the import
importWomensProducts(); 