const Product = require("../models/Product");

/**
 * @desc    Get all products with filtering, sorting and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    
    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Advanced filtering (for numeric ranges like price[gt]=100)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    
    // Start building the query
    let query = Product.find(JSON.parse(queryStr));
    
    // Search functionality
    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by newest
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // Exclude version key by default
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const products = await query;
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(JSON.parse(queryStr));
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + products.length < totalProducts) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      totalProducts,
      products: products // Changed from 'data' to 'products' to match frontend expectations
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product: product // Changed from 'data' to 'product' to match frontend expectations
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the provided ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
exports.createProduct = async (req, res) => {
  try {
    // Add user ID to request body as creator
    if (req.userId) {
      req.body.createdBy = req.userId;
    }
    
    // Create product
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product // Changed from 'data' to 'product' to match frontend expectations
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    
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
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
exports.updateProduct = async (req, res) => {
  try {
    // Find product to update
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated product
        runValidators: true // Run validators on update
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: product // Changed from 'data' to 'product' to match frontend expectations
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the provided ID'
      });
    }
    
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
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found with the provided ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    
    const products = await Product.find({ featured: true })
      .sort('-createdAt')
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products: products // Changed from 'data' to 'products' to match frontend expectations
    });
  } catch (error) {
    console.error('Get Featured Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100; // Increased limit to ensure we get all products
    const startIndex = (page - 1) * limit;
    const subcategory = req.query.subcategory;
    
    console.log(`[DEBUG] Getting products for category: ${category}, subcategory: ${subcategory || 'none'}`);
    
    // Validate category
    const validCategories = ["Men's Collection", "Women's Collection", "Children's Collection"];
    const categoryRegex = new RegExp(category, 'i');
    const matchedCategory = validCategories.find(c => categoryRegex.test(c));
    
    if (!matchedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        products: [] // Always include products property even when empty
      });
    }
    
    // Build query object
    let query = { category: matchedCategory };
    
    // Add subcategory filtering if provided
    if (subcategory) {
      // Check in multiple fields where subcategory info might be stored
      query.$or = [
        { type: { $regex: subcategory, $options: 'i' } },
        { tags: { $elemMatch: { $regex: subcategory, $options: 'i' } } },
        { name: { $regex: subcategory, $options: 'i' } },
        { description: { $regex: subcategory, $options: 'i' } }
      ];
    }
    
    console.log(`[DEBUG] Query:`, JSON.stringify(query));
    
    // Find products by category
    const products = await Product.find(query)
      .sort(req.query.sort || '-createdAt')
      .skip(startIndex)
      .limit(limit);
    
    console.log(`[DEBUG] Found ${products.length} products for ${matchedCategory}`);
    
    // Get total count
    const totalProducts = await Product.countDocuments(query);
    
    // Pagination
    const pagination = {};
    
    if (startIndex + products.length < totalProducts) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    // Always return data in the 'products' property to match frontend expectations
    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      totalProducts,
      products: products
    });
  } catch (error) {
    console.error('Get Products By Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      products: [] // Always include products property even when empty
    });
  }
};
