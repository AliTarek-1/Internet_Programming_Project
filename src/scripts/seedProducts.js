/**
 * Seed script to populate the database with dummy products
 * This script adds 10 products for each category (Men's, Women's, Children's)
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brandstore')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample product data
const products = [
  // Men's Collection - 10 products
  {
    productID: 'M001',
    name: 'Classic Oxford Shirt',
    description: 'A timeless oxford shirt perfect for any occasion. Made from premium cotton for comfort and durability.',
    price: 49.99,
    oldPrice: 59.99,
    category: "Men's Collection",
    type: 'Shirts',
    image: '/images/products/mens/oxford-shirt.jpg',
    inventory: 25,
    sku: 'MS12345',
    averageRating: 4.5,
    totalReviews: 120,
    featured: true,
    tags: ['formal', 'business', 'cotton', 'classic']
  },
  {
    productID: 'M002',
    name: 'Slim Fit Chinos',
    description: 'Versatile slim fit chinos that transition seamlessly from casual to smart casual occasions.',
    price: 59.99,
    oldPrice: 69.99,
    category: "Men's Collection",
    type: 'Pants',
    image: '/images/products/mens/slim-chinos.jpg',
    inventory: 30,
    sku: 'MP67890',
    averageRating: 4.3,
    totalReviews: 95,
    featured: false,
    tags: ['casual', 'slim fit', 'versatile']
  },
  {
    productID: 'M003',
    name: 'Wool Blend Sweater',
    description: 'Warm and comfortable wool blend sweater, perfect for colder days. Features a classic design.',
    price: 79.99,
    oldPrice: null,
    category: "Men's Collection",
    type: 'Sweaters',
    image: '/images/products/mens/wool-sweater.jpg',
    inventory: 20,
    sku: 'MS54321',
    averageRating: 4.4,
    totalReviews: 87,
    featured: false,
    tags: ['winter', 'wool', 'warm', 'casual']
  },
  {
    productID: 'M004',
    name: 'Leather Jacket',
    description: 'Classic leather jacket with a modern twist. Perfect for adding an edge to any outfit.',
    price: 199.99,
    oldPrice: 249.99,
    category: "Men's Collection",
    type: 'Jackets',
    image: '/images/products/mens/leather-jacket.jpg',
    inventory: 15,
    sku: 'MJ98765',
    averageRating: 4.7,
    totalReviews: 65,
    featured: true,
    tags: ['leather', 'outerwear', 'stylish', 'premium']
  },
  {
    productID: 'M005',
    name: 'Casual Denim Shirt',
    description: 'Versatile denim shirt that can be dressed up or down. Perfect for a casual weekend look.',
    price: 45.99,
    oldPrice: null,
    category: "Men's Collection",
    type: 'Shirts',
    image: '/images/products/mens/denim-shirt.jpg',
    inventory: 35,
    sku: 'MS13579',
    averageRating: 4.2,
    totalReviews: 83,
    featured: false,
    tags: ['casual', 'denim', 'versatile']
  },
  {
    productID: 'M006',
    name: 'Leather Derby Shoes',
    description: 'Classic leather derby shoes crafted with attention to detail. Comfortable and stylish for formal occasions.',
    price: 119.99,
    oldPrice: 149.99,
    category: "Men's Collection",
    type: 'Shoes',
    image: '/images/products/mens/derby-shoes.jpg',
    inventory: 18,
    sku: 'MS24680',
    averageRating: 4.6,
    totalReviews: 45,
    featured: false,
    tags: ['formal', 'leather', 'shoes', 'business']
  },
  {
    productID: 'M007',
    name: 'Premium Denim Jeans',
    description: 'High-quality denim jeans with a perfect fit. Durable and comfortable for everyday wear.',
    price: 69.99,
    oldPrice: 89.99,
    category: "Men's Collection",
    type: 'Jeans',
    image: '/images/products/mens/premium-jeans.jpg',
    inventory: 40,
    sku: 'MJ13579',
    averageRating: 4.4,
    totalReviews: 107,
    featured: true,
    tags: ['denim', 'casual', 'everyday', 'comfortable']
  },
  {
    productID: 'M008',
    name: 'Casual Polo Shirt',
    description: 'A versatile polo shirt made from soft cotton piqué. Perfect for casual outings and weekend wear.',
    price: 39.99,
    oldPrice: null,
    category: "Men's Collection",
    type: 'T-shirts',
    image: '/images/products/mens/polo-shirt.jpg',
    inventory: 50,
    sku: 'MT24680',
    averageRating: 4.2,
    totalReviews: 83,
    featured: false,
    tags: ['casual', 'cotton', 'polo', 'everyday']
  },
  {
    productID: 'M009',
    name: 'Winter Parka Jacket',
    description: 'Insulated winter parka with water-resistant exterior. Designed to keep you warm in cold weather.',
    price: 159.99,
    oldPrice: 189.99,
    category: "Men's Collection",
    type: 'Jackets',
    image: '/images/products/mens/winter-parka.jpg',
    inventory: 25,
    sku: 'MJ97531',
    averageRating: 4.8,
    totalReviews: 92,
    featured: true,
    tags: ['winter', 'outerwear', 'warm', 'waterproof']
  },
  {
    productID: 'M010',
    name: 'Leather Belt',
    description: 'Premium leather belt with classic buckle. A versatile accessory for any outfit.',
    price: 34.99,
    oldPrice: null,
    category: "Men's Collection",
    type: 'Accessories',
    image: '/images/products/mens/leather-belt.jpg',
    inventory: 60,
    sku: 'MA86420',
    averageRating: 4.5,
    totalReviews: 78,
    featured: false,
    tags: ['accessories', 'leather', 'formal', 'casual']
  },

  // Women's Collection - 10 products
  {
    productID: 'W001',
    name: 'Floral Print Dress',
    description: 'A beautiful floral print dress perfect for spring and summer. Made from lightweight, breathable fabric.',
    price: 79.99,
    oldPrice: 99.99,
    category: "Women's Collection",
    type: 'Dresses',
    image: '/images/products/womens/floral-dress.jpg',
    inventory: 30,
    sku: 'WD12345',
    averageRating: 4.6,
    totalReviews: 112,
    featured: true,
    tags: ['summer', 'floral', 'casual', 'elegant']
  },
  {
    productID: 'W002',
    name: 'High-Waisted Jeans',
    description: 'Flattering high-waisted jeans with a perfect fit. Versatile and comfortable for everyday wear.',
    price: 69.99,
    oldPrice: null,
    category: "Women's Collection",
    type: 'Jeans',
    image: '/images/products/womens/high-waisted-jeans.jpg',
    inventory: 45,
    sku: 'WP67890',
    averageRating: 4.4,
    totalReviews: 98,
    featured: false,
    tags: ['denim', 'casual', 'everyday', 'comfortable']
  },
  {
    productID: 'W003',
    name: 'Silk Blouse',
    description: 'Elegant silk blouse that transitions seamlessly from office to evening. Features a timeless design.',
    price: 89.99,
    oldPrice: 109.99,
    category: "Women's Collection",
    type: 'Shirts',
    image: '/images/products/womens/silk-blouse.jpg',
    inventory: 25,
    sku: 'WS54321',
    averageRating: 4.7,
    totalReviews: 76,
    featured: true,
    tags: ['formal', 'silk', 'elegant', 'business']
  },
  {
    productID: 'W004',
    name: 'Knit Cardigan',
    description: 'Cozy knit cardigan perfect for layering. Features a relaxed fit and soft fabric for maximum comfort.',
    price: 59.99,
    oldPrice: null,
    category: "Women's Collection",
    type: 'Sweaters',
    image: '/images/products/womens/knit-cardigan.jpg',
    inventory: 35,
    sku: 'WS98765',
    averageRating: 4.5,
    totalReviews: 85,
    featured: false,
    tags: ['knitwear', 'casual', 'comfortable', 'layering']
  },
  {
    productID: 'W005',
    name: 'Ankle Boots',
    description: 'Stylish ankle boots made from premium materials. Features a comfortable heel and durable construction.',
    price: 129.99,
    oldPrice: 159.99,
    category: "Women's Collection",
    type: 'Shoes',
    image: '/images/products/womens/ankle-boots.jpg',
    inventory: 20,
    sku: 'WS13579',
    averageRating: 4.8,
    totalReviews: 63,
    featured: true,
    tags: ['footwear', 'leather', 'stylish', 'autumn']
  },
  {
    productID: 'W006',
    name: 'Pleated Skirt',
    description: 'Elegant pleated skirt that flatters any figure. Versatile and perfect for both casual and formal occasions.',
    price: 49.99,
    oldPrice: 59.99,
    category: "Women's Collection",
    type: 'Skirts',
    image: '/images/products/womens/pleated-skirt.jpg',
    inventory: 30,
    sku: 'WS24680',
    averageRating: 4.7,
    totalReviews: 89,
    featured: false,
    tags: ['elegant', 'versatile', 'formal', 'casual']
  },
  {
    productID: 'W007',
    name: 'Tailored Blazer',
    description: 'A sophisticated tailored blazer that adds polish to any outfit. Perfect for professional settings.',
    price: 119.99,
    oldPrice: null,
    category: "Women's Collection",
    type: 'Jackets',
    image: '/images/products/womens/tailored-blazer.jpg',
    inventory: 25,
    sku: 'WJ13579',
    averageRating: 4.5,
    totalReviews: 64,
    featured: true,
    tags: ['formal', 'business', 'professional', 'tailored']
  },
  {
    productID: 'W008',
    name: 'Statement Necklace',
    description: 'Eye-catching statement necklace that elevates any outfit. Perfect for special occasions.',
    price: 39.99,
    oldPrice: 49.99,
    category: "Women's Collection",
    type: 'Accessories',
    image: '/images/products/womens/statement-necklace.jpg',
    inventory: 40,
    sku: 'WA24680',
    averageRating: 4.6,
    totalReviews: 52,
    featured: false,
    tags: ['accessories', 'jewelry', 'elegant', 'statement']
  },
  {
    productID: 'W009',
    name: 'Wrap Dress',
    description: 'Flattering wrap dress that suits all body types. Made from comfortable, stretchy fabric.',
    price: 69.99,
    oldPrice: 89.99,
    category: "Women's Collection",
    type: 'Dresses',
    image: '/images/products/womens/wrap-dress.jpg',
    inventory: 30,
    sku: 'WD97531',
    averageRating: 4.8,
    totalReviews: 107,
    featured: true,
    tags: ['elegant', 'versatile', 'comfortable', 'flattering']
  },
  {
    productID: 'W010',
    name: 'Leather Tote Bag',
    description: 'Spacious leather tote bag perfect for work or everyday use. Features multiple compartments for organization.',
    price: 119.99,
    oldPrice: null,
    category: "Women's Collection",
    type: 'Accessories',
    image: '/images/products/womens/leather-tote.jpg',
    inventory: 20,
    sku: 'WA86420',
    averageRating: 4.7,
    totalReviews: 78,
    featured: false,
    tags: ['accessories', 'leather', 'practical', 'everyday']
  },

  // Children's Collection - 10 products
  {
    productID: 'C001',
    name: 'Dinosaur Print T-Shirt',
    description: 'Fun dinosaur print t-shirt made from soft cotton. Perfect for active kids who love adventure.',
    price: 19.99,
    oldPrice: null,
    category: "Children's Collection",
    type: 'T-shirts',
    image: '/images/products/childrens/dino-tshirt.jpg',
    inventory: 50,
    sku: 'CT12345',
    averageRating: 4.7,
    totalReviews: 89,
    featured: true,
    tags: ['casual', 'cotton', 'fun', 'dinosaur']
  },
  {
    productID: 'C002',
    name: 'Denim Overalls',
    description: 'Adorable and durable denim overalls perfect for playtime. Features adjustable straps for a perfect fit.',
    price: 34.99,
    oldPrice: 44.99,
    category: "Children's Collection",
    type: 'Pants',
    image: '/images/products/childrens/denim-overalls.jpg',
    inventory: 35,
    sku: 'CP67890',
    averageRating: 4.5,
    totalReviews: 72,
    featured: false,
    tags: ['denim', 'casual', 'durable', 'adjustable']
  },
  {
    productID: 'C003',
    name: 'Colorful Sneakers',
    description: 'Bright and colorful sneakers that are both stylish and comfortable. Perfect for active kids.',
    price: 29.99,
    oldPrice: null,
    category: "Children's Collection",
    type: 'Shoes',
    image: '/images/products/childrens/colorful-sneakers.jpg',
    inventory: 40,
    sku: 'CS54321',
    averageRating: 4.6,
    totalReviews: 65,
    featured: true,
    tags: ['footwear', 'colorful', 'comfortable', 'active']
  },
  {
    productID: 'C004',
    name: 'Hooded Sweatshirt',
    description: 'Cozy hooded sweatshirt perfect for cooler days. Made from soft, warm fabric for maximum comfort.',
    price: 27.99,
    oldPrice: 34.99,
    category: "Children's Collection",
    type: 'Sweaters',
    image: '/images/products/childrens/hooded-sweatshirt.jpg',
    inventory: 45,
    sku: 'CJ98765',
    averageRating: 4.4,
    totalReviews: 58,
    featured: false,
    tags: ['casual', 'warm', 'comfortable', 'hoodie']
  },
  {
    productID: 'C005',
    name: 'Patterned Leggings',
    description: 'Fun patterned leggings that are both comfortable and stylish. Perfect for everyday wear.',
    price: 19.99,
    oldPrice: null,
    category: "Children's Collection",
    type: 'Pants',
    image: '/images/products/childrens/patterned-leggings.jpg',
    inventory: 55,
    sku: 'CP13579',
    averageRating: 4.3,
    totalReviews: 47,
    featured: false,
    tags: ['comfortable', 'patterned', 'everyday', 'stretchy']
  },
  {
    productID: 'C006',
    name: 'Character Pajamas',
    description: 'Adorable character pajamas that kids will love. Made from soft, cozy fabric for a good night\'s sleep.',
    price: 24.99,
    oldPrice: 29.99,
    category: "Children's Collection",
    type: 'Pants',
    image: '/images/products/childrens/character-pajamas.jpg',
    inventory: 40,
    sku: 'CP24680',
    averageRating: 4.8,
    totalReviews: 92,
    featured: true,
    tags: ['sleepwear', 'comfortable', 'character', 'soft']
  },
  {
    productID: 'C007',
    name: 'Denim Jacket',
    description: 'Stylish denim jacket for kids. Perfect for layering in spring and fall weather.',
    price: 39.99,
    oldPrice: 49.99,
    category: "Children's Collection",
    type: 'Jackets',
    image: '/images/products/childrens/denim-jacket.jpg',
    inventory: 30,
    sku: 'CJ13579',
    averageRating: 4.5,
    totalReviews: 63,
    featured: false,
    tags: ['denim', 'casual', 'layering', 'stylish']
  },
  {
    productID: 'C008',
    name: 'Printed Dress',
    description: 'Adorable printed dress for special occasions. Features a comfortable fit and cute design.',
    price: 32.99,
    oldPrice: null,
    category: "Children's Collection",
    type: 'Dresses',
    image: '/images/products/childrens/printed-dress.jpg',
    inventory: 35,
    sku: 'CD24680',
    averageRating: 4.7,
    totalReviews: 81,
    featured: true,
    tags: ['dress', 'special occasion', 'cute', 'comfortable']
  },
  {
    productID: 'C009',
    name: 'Winter Beanie',
    description: 'Warm winter beanie with fun design. Perfect for keeping little heads warm in cold weather.',
    price: 14.99,
    oldPrice: 19.99,
    category: "Children's Collection",
    type: 'Accessories',
    image: '/images/products/childrens/winter-beanie.jpg',
    inventory: 60,
    sku: 'CA97531',
    averageRating: 4.6,
    totalReviews: 54,
    featured: false,
    tags: ['winter', 'accessories', 'warm', 'cute']
  },
  {
    productID: 'C010',
    name: 'Raincoat',
    description: 'Waterproof raincoat with fun pattern. Keeps kids dry while looking stylish on rainy days.',
    price: 34.99,
    oldPrice: null,
    category: "Children's Collection",
    type: 'Jackets',
    image: '/images/products/childrens/raincoat.jpg',
    inventory: 25,
    sku: 'CJ86420',
    averageRating: 4.8,
    totalReviews: 67,
    featured: true,
    tags: ['waterproof', 'rain', 'practical', 'colorful']
  }
];

// Function to seed the database
async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`Successfully added ${result.length} products to the database`);

    // Log the breakdown by category
    const menCount = result.filter(p => p.category === "Men's Collection").length;
    const womenCount = result.filter(p => p.category === "Women's Collection").length;
    const childrenCount = result.filter(p => p.category === "Children's Collection").length;

    console.log(`Men's Collection: ${menCount} products`);
    console.log(`Women's Collection: ${womenCount} products`);
    console.log(`Children's Collection: ${childrenCount} products`);

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedProducts();
