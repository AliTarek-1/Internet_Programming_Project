/**
 * API Service
 * 
 * This file contains functions for interacting with the backend API
 * to fetch products and other data.
 */

// Base API URL
const API_BASE_URL = '/api';

/**
 * Fetch all products from the API
 * @param {Object} params - Query parameters for filtering, sorting, etc.
 * @returns {Promise<Array>} - Array of product objects
 */
async function fetchProducts(params = {}) {
  try {
    // Build query string from params object
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array in case of error to prevent UI breaking
    return [];
  }
}

/**
 * Fetch products by category
 * @param {string} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Array>} - Array of product objects
 */
async function fetchProductsByCategory(category, params = {}) {
  try {
    // Build query string from params object
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${API_BASE_URL}/products/category/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Error fetching ${category} products:`, error);
    // Return empty array in case of error to prevent UI breaking
    return [];
  }
}

/**
 * Fetch featured products
 * @param {number} limit - Maximum number of products to fetch
 * @returns {Promise<Array>} - Array of featured product objects
 */
async function fetchFeaturedProducts(limit = 8) {
  try {
    const url = `${API_BASE_URL}/products/featured?limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Return empty array in case of error to prevent UI breaking
    return [];
  }
}

/**
 * Fetch a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product object
 */
async function fetchProductById(productId) {
  try {
    const url = `${API_BASE_URL}/products/${productId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    // Return null in case of error
    return null;
  }
}

// Export all functions
window.apiService = {
  fetchProducts,
  fetchProductsByCategory,
  fetchFeaturedProducts,
  fetchProductById
};
