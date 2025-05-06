/**
 * Product Import Script
 * 
 * This script imports all products from the mock data in the client-side JavaScript files
 * into the MongoDB database to ensure all products are available through the API.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jwt-auth';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for product import'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to extract product data from JavaScript files
const extractProductsFromFile = (filePath) => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Get the filename to determine product type
    const fileName = path.basename(filePath);
    let productType = 'Unknown';
    
    if (fileName.includes('mens')) {
      productType = "Men's Collection";
    } else if (fileName.includes('womens')) {
      productType = "Women's Collection";
    } else if (fileName.includes('childrens')) {
      productType = "Children's Collection";
    }
    
    // First try to extract using the getAllProducts function
    let productArrayMatch = fileContent.match(/function getAllProducts\(\) {\s*return\s*\[(([\s\S]*?))\]\s*;?\s*}/);
    
    // If that doesn't work, try to find any array of product objects
    if (!productArrayMatch || !productArrayMatch[1]) {
      productArrayMatch = fileContent.match(/\[\s*{\s*id:\s*['"](.*?)['"]([\s\S]*?)\}\s*\]/);
      
      if (!productArrayMatch) {
        console.log(`No product data found in ${filePath}`);
        return [];
      }
    }
    
    // Find all product objects in the file
    const productRegex = /{\s*id:\s*['"](.*?)['"]([\s\S]*?)(?=\s*},\s*{|\s*}\s*\])\s*}/g;
    const productMatches = fileContent.matchAll(productRegex);
    
    const products = [];
    for (const match of productMatches) {
      try {
        // Create a valid JavaScript object from the matched text
        const productText = match[0].replace(/'/g, '"')
          .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":') // Convert property names to quoted strings
          .replace(/:\s*([^\s"{}\[\],]+)/g, '":"$1"') // Quote string values
          .replace(/"(\d+(\.\d+)?)"(,|\})/g, '$1$3') // Convert numeric strings back to numbers
          .replace(/"(true|false)"(,|\})/g, '$1$2'); // Convert boolean strings back to booleans
        
        // Parse the product object
        const product = JSON.parse(productText);
        
        // Ensure product has a category based on the file name if not present
        if (!product.category) {
          product.category = productType;
        }
        
        products.push(product);
      } catch (parseError) {
        console.error(`Error parsing product object: ${parseError.message}`);
      }
    }
    
    console.log(`Extracted ${products.length} products from ${fileName} using regex approach`);
    
    // If no products found or parsing failed, try the eval approach as a fallback
    if (products.length === 0 && productArrayMatch && productArrayMatch[0]) {
      try {
        // Create a temporary JavaScript file with just the product array
        const tempJsContent = `module.exports = [${productArrayMatch[1] || productArrayMatch[0]}];`;
        const tempFilePath = path.join(__dirname, 'temp_products.js');
        fs.writeFileSync(tempFilePath, tempJsContent);
        
        // Import the temporary file to get the product array
        const tempProducts = require(tempFilePath);
        
        // Delete the temporary file
        fs.unlinkSync(tempFilePath);
        
        console.log(`Extracted ${tempProducts.length} products from ${fileName} using require approach`);
        return tempProducts;
      } catch (requireError) {
        console.error(`Error requiring product data: ${requireError.message}`);
      }
    }
    
    return products;
  } catch (error) {
    console.error(`Error extracting products from ${filePath}:`, error);
    return [];
  }
};

// Function to import products to the database
const importProducts = async (products) => {
  console.log(`Importing ${products.length} products to database...`);
  
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      // Skip products without required fields
      if (!product.name || !product.price) {
        console.warn(`Skipping product with missing required fields: ${JSON.stringify(product)}`);
        errorCount++;
        continue;
      }
      
      // Generate a SKU if not present
      if (!product.sku) {
        const category = product.category || 'Unknown';
        const categoryPrefix = category.includes("Men's") ? 'M' : 
                              category.includes("Women's") ? 'W' : 
                              category.includes("Children's") ? 'C' : 'X';
        product.sku = `${categoryPrefix}${Math.floor(Math.random() * 100000)}`;
      }
      
      // Check if product already exists by SKU or ID
      const existingProduct = await Product.findOne({ 
        $or: [
          { sku: product.sku },
          { name: product.name, price: product.price } // Fallback to name+price if SKU not unique
        ]
      });
      
      const productData = {
        name: product.name,
        description: product.description || 'No description available',
        price: product.price,
        oldPrice: product.oldPrice || null,
        category: product.category,
        sku: product.sku,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        featured: product.featured || false,
        stock: product.stock || 10,
        tags: Array.isArray(product.tags) ? product.tags : [],
        images: Array.isArray(product.images) ? product.images : [],
        createdAt: product.date ? new Date(product.date) : new Date(),
        updatedAt: new Date()
      };
      
      if (existingProduct) {
        // Update existing product
        await Product.findByIdAndUpdate(existingProduct._id, productData);
        updatedCount++;
      } else {
        // Create new product
        await Product.create(productData);
        importedCount++;
      }
    } catch (error) {
      console.error(`Error importing product ${product.name || 'unknown'}:`, error);
      errorCount++;
    }
  }
  
  console.log(`Import complete: ${importedCount} new products imported, ${updatedCount} products updated, ${errorCount} errors`);
};

// Main function to run the import process
const runImport = async () => {
  try {
    // Get product data from all product JavaScript files
    const publicScriptsDir = path.join(__dirname, '..', 'public', 'scripts');
    
    const productFiles = [
      path.join(publicScriptsDir, 'womens-products.js'),
      path.join(publicScriptsDir, 'mens-products.js'),
      path.join(publicScriptsDir, 'childrens-products.js')
    ];
    
    let allProducts = [];
    
    for (const filePath of productFiles) {
      if (fs.existsSync(filePath)) {
        const products = extractProductsFromFile(filePath);
        console.log(`Extracted ${products.length} products from ${path.basename(filePath)}`);
        allProducts = [...allProducts, ...products];
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
    
    // Remove duplicate products (based on SKU)
    const uniqueProducts = [];
    const skuSet = new Set();
    
    for (const product of allProducts) {
      if (product.sku && !skuSet.has(product.sku)) {
        skuSet.add(product.sku);
        uniqueProducts.push(product);
      }
    }
    
    console.log(`Found ${uniqueProducts.length} unique products across all files`);
    
    // Import products to database
    await importProducts(uniqueProducts);
    
    console.log('Product import process completed successfully');
  } catch (error) {
    console.error('Error in import process:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the import process
runImport();
