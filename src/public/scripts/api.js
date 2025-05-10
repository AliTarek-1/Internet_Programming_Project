/**
 * API Service
 * 
 * This file contains functions for interacting with the backend API
 * to fetch products and other data.
 */

// Base API URL - use window object to prevent redeclaration errors
window.API_BASE_URL = window.API_BASE_URL || '/api';

// Use the global API_BASE_URL without redeclaring it
var API_BASE_URL = window.API_BASE_URL;

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
    
    console.log(`[DEBUG] Fetching products from URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`[DEBUG] Response status:`, response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[DEBUG] API response data:`, data);
    
    // Check what property contains the products
    if (data.products && Array.isArray(data.products)) {
      console.log(`[DEBUG] Found ${data.products.length} products in 'products' property`);
      return data.products;
    } else if (data.data && Array.isArray(data.data)) {
      console.log(`[DEBUG] Found ${data.data.length} products in 'data' property`);
      return data.data;
    } else {
      console.warn(`[DEBUG] No products found in response. Response keys:`, Object.keys(data));
      return [];
    }
  } catch (error) {
    console.error(`[DEBUG] Error fetching ${category} products:`, error);
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
    // Handle different response formats - backend might return data.product or data.data
    if (data.product) {
      return data.product;
    } else if (data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    // Return null in case of error
    return null;
  }
}

/**
 * Fetch all orders for the current user
 * @returns {Promise<Array>} - Array of order objects
 */
async function fetchOrders() {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('No authentication token found');
      return [];
    }
    
    const url = `${API_BASE_URL}/orders`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check which property contains the orders
    let orders = [];
    if (data.orders && Array.isArray(data.orders)) {
      orders = data.orders;
    } else if (data.data && Array.isArray(data.data)) {
      orders = data.data;
    } else if (Array.isArray(data)) {
      orders = data;
    }
    
    // Filter orders by user email
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      orders = orders.filter(order => {
        const orderEmail = order.customer?.email;
        if (!orderEmail) return false;
        return orderEmail.toLowerCase().trim() === normalizedUserEmail;
      });
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Fetch user profile
 * @returns {Promise<Object>} - User profile object
 */
async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }
    
    // Try to extract user info from JWT token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.email) {
          localStorage.setItem('userEmail', payload.email);
          
          // Return a profile with the email from the token
          return {
            username: payload.name || 'User',
            email: payload.email,
            phone: '',
            birthDate: '',
            gender: ''
          };
        }
      }
    } catch (tokenError) {
      console.warn('Error parsing JWT token:', tokenError);
    }
    
    // If we couldn't get the profile from the token, try the API
    const url = `${API_BASE_URL}/users/profile`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.user || data.data || data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Export all functions
window.apiService = {
  fetchProducts,
  fetchProductsByCategory,
  fetchFeaturedProducts,
  fetchProductById,
  fetchOrders,
  fetchUserProfile
};
