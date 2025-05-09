/**
 * Orders page functionality for BrandStore
 * Handles order history display and filtering
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load API script first if not already loaded
  loadScript('/scripts/api.js')
    .then(() => {
      // Initialize orders page
      initOrdersPage();
      
      // Load navbar
      const navbarPlaceholder = document.getElementById('navbar-placeholder');
      if (navbarPlaceholder) {
        fetch('components/navbar.html')
          .then(response => response.text())
          .then(data => {
            navbarPlaceholder.innerHTML = data;
            // Initialize navbar after loading
            if (typeof initializeNavbar === 'function') {
              initializeNavbar();
            } else {
              console.log('Loading navbar.js script');
              const navbarScript = document.createElement('script');
              navbarScript.src = 'scripts/navbar.js';
              navbarScript.onload = function() {
                if (typeof initializeNavbar === 'function') {
                  initializeNavbar();
                } else {
                  console.error('initializeNavbar function not found');
                }
              };
              document.head.appendChild(navbarScript);
            }
          })
          .catch(error => console.error('Error loading navbar:', error));
      }
    })
    .catch(error => console.error('Error loading API script:', error));
});

/**
 * Initialize orders page functionality
 */
function initOrdersPage() {
  // Check if user is logged in
  if (!checkAuthentication()) {
    return; // Stop initialization if not authenticated
  }
  
  // Initialize loading indicator
  initLoadingIndicator();
  
  // Load user data
  loadUserData();
  
  // Load orders
  loadOrders();
  
  // Add event listeners
  addEventListeners();
}

/**
 * Check if user is authenticated, redirect to login if not
 * @returns {boolean} True if authenticated, false otherwise
 */
function checkAuthentication() {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) {
    console.warn('No authentication token found, redirecting to login page');
    // User is not logged in, redirect to login page
    window.location.href = 'loginuser.html';
    return false;
  }
  
  // Check if token is expired by decoding it
  try {
    const tokenParts = userToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('JWT payload:', payload);
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    
    if (Date.now() >= expirationTime) {
      console.warn('Token expired, redirecting to login page');
      localStorage.removeItem('userToken');
      window.location.href = 'loginuser.html';
      return false;
    }
    
    // Store user ID for later use
    window.currentUserId = payload.id || payload.userId || payload._id;
    
    // Store user email in localStorage if available in the token
    if (payload.email && !localStorage.getItem('userEmail')) {
      console.log('Setting user email from JWT token:', payload.email);
      localStorage.setItem('userEmail', payload.email);
    }
    
    // Ensure we have a user email for order filtering
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      console.warn('No user email found in localStorage, attempting to fetch from profile');
      // We'll try to fetch the user profile to get the email
      fetchUserProfile().then(profile => {
        if (profile && profile.email) {
          console.log('Setting user email from profile:', profile.email);
          localStorage.setItem('userEmail', profile.email);
        }
      }).catch(err => {
        console.error('Failed to fetch user profile for email:', err);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    localStorage.removeItem('userToken');
    window.location.href = 'loginuser.html';
    return false;
  }
}

/**
 * Load user data from API with fallback to localStorage
 */
async function loadUserData() {
  try {
    // Try to fetch user profile from API
    const user = await fetchUserProfile();
    
    // Update UI with user data
    const userNameElements = document.querySelectorAll('#user-name');
    const userEmailElements = document.querySelectorAll('#user-email');
    
    userNameElements.forEach(element => {
      element.textContent = user.username || 'User';
    });
    
    userEmailElements.forEach(element => {
      element.textContent = user.email || '';
    });
    
  } catch (error) {
    console.error('Error loading user data:', error);
    
    // Fallback to localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || 'User';
    
    // Update UI with user data from localStorage
    const userNameElements = document.querySelectorAll('#user-name');
    const userEmailElements = document.querySelectorAll('#user-email');
    
    userNameElements.forEach(element => {
      element.textContent = userName;
    });
    
    userEmailElements.forEach(element => {
      element.textContent = userEmail;
    });
  }
}

/**
 * Debug function to log order details
 * @param {Array} orders - Array of orders
 */
function debugOrderDetails(orders) {
  if (!orders || orders.length === 0) {
    console.log('No orders to debug');
    return;
  }
  
  // Log the first order in detail
  const sampleOrder = orders[0];
  console.log('Sample order structure:', sampleOrder);
  
  // Check for common fields that we use for filtering
  console.log('Order filtering fields:');
  console.log('- order.customer?.email:', sampleOrder.customer?.email);
  console.log('- order.user:', sampleOrder.user);
  console.log('- order.userId:', sampleOrder.userId);
  console.log('- order._id:', sampleOrder._id);
  console.log('- order.orderId:', sampleOrder.orderId);
  
  // Log all emails in the orders for comparison
  const emails = orders.map(order => order.customer?.email).filter(Boolean);
  console.log('All customer emails in orders:', [...new Set(emails)]);
  
  // Compare with current user email
  const userEmail = localStorage.getItem('userEmail');
  console.log('Current user email from localStorage:', userEmail);
}

/**
 * Load orders from API with fallback to mock data if needed
 */
async function loadOrders() {
  const ordersContainer = document.getElementById('orders-container');
  const noOrdersMessage = document.getElementById('no-orders-message');
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Clear existing orders
  ordersContainer.innerHTML = '';
  
  try {
    // Try to fetch orders from API
    let orders = await fetchOrdersFromAPI();
    
    // If no orders were found, use mock data only in development
    if (!orders || orders.length === 0) {
      console.log('No orders found, using mock data');
      orders = getMockOrders();
    }
    
    // If still no orders, show no orders message
    if (!orders || orders.length === 0) {
      if (noOrdersMessage) {
        ordersContainer.appendChild(noOrdersMessage);
      }
      return;
    }
    
    // Debug order details to understand the structure
    debugOrderDetails(orders);
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });
    
    // Log the orders for debugging
    console.log('Orders to display:', orders);
    
    // Store orders in window variable for modal access
    window.loadedOrders = orders;
    
    // Create order elements
    orders.forEach(order => {
      const orderElement = createOrderElement(order);
      ordersContainer.appendChild(orderElement);
    });
    
    // Update pagination
    updatePagination(orders.length);
    
  } catch (error) {
    console.error('Error loading orders:', error);
    
    // Show no orders message
    if (noOrdersMessage) {
      ordersContainer.appendChild(noOrdersMessage);
    }
  } finally {
    // Hide loading indicator
    hideLoadingIndicator();
  }
}

/**
 * Create an order element
 * @param {Object} order - Order data
 * @returns {HTMLElement} Order element
 */
function createOrderElement(order) {
  // Create order element
  const orderElement = document.createElement('div');
  orderElement.className = 'order-item';
  
  // Format date
  const orderDate = new Date(order.date || order.createdAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get order ID - handle different formats
  const orderId = order.orderId || order.id || order._id || 'undefined';
  
  // Default status is 'processing' for new orders
  const status = 'processing';
  
  // Create order header
  const orderHeader = document.createElement('div');
  orderHeader.className = 'order-header';
  orderHeader.innerHTML = `
    <div class="order-info">
      <h3>Order #${orderId}</h3>
      <p class="order-date">Placed on ${formattedDate}</p>
    </div>
    <div class="order-status">
      <span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  `;
  
  // Create order details
  const orderDetails = document.createElement('div');
  orderDetails.className = 'order-details';
  
  // Create products list
  const productsContainer = document.createElement('div');
  productsContainer.className = 'order-products';
  
  // Calculate totals
  let subtotal = 0;
  let shipping = 0;
  let tax = 0;
  let total = 0;
  
  // Add products
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      // Calculate item price
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      // Add to subtotal
      subtotal += itemTotal;
      
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div class="product-image">
          <img src="${item.image || 'images/products/placeholder.jpg'}" alt="${item.name || 'Product'}" />
        </div>
        <div class="product-info">
          <h4>${item.name || 'Product Name'}</h4>
          <p>${item.variant || ''}</p>
          <p>Quantity: ${itemQuantity}</p>
        </div>
        <div class="product-price">
          <p>EGP ${itemTotal.toFixed(2)}</p>
        </div>
      `;
      productsContainer.appendChild(productElement);
    });
  } else if (order.products && order.products.length > 0) {
    // Alternative format for products
    order.products.forEach(product => {
      const itemPrice = product.price || 0;
      const itemQuantity = product.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      // Add to subtotal
      subtotal += itemTotal;
      
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div class="product-image">
          <img src="${product.image || 'images/products/placeholder.jpg'}" alt="${product.name || 'Product'}" />
        </div>
        <div class="product-info">
          <h4>${product.name || 'Product Name'}</h4>
          <p>${product.variant || ''}</p>
          <p>Quantity: ${itemQuantity}</p>
        </div>
        <div class="product-price">
          <p>EGP ${itemTotal.toFixed(2)}</p>
        </div>
      `;
      productsContainer.appendChild(productElement);
    });
  } else {
    // If no products found, try to extract from order object
    const productName = order.productName || order.name || 'Product';
    const productPrice = order.price || 199.99;
    const productQuantity = order.quantity || 1;
    const productTotal = productPrice * productQuantity;
    
    // Add to subtotal
    subtotal = productTotal;
    
    const productElement = document.createElement('div');
    productElement.className = 'product-item';
    productElement.innerHTML = `
      <div class="product-image">
        <img src="images/products/placeholder.jpg" alt="${productName}" />
      </div>
      <div class="product-info">
        <h4>${productName}</h4>
        <p>Quantity: ${productQuantity}</p>
      </div>
      <div class="product-price">
        <p>EGP ${productTotal.toFixed(2)}</p>
      </div>
    `;
    productsContainer.appendChild(productElement);
  }
  
  // Calculate shipping, tax, and total if not provided
  if (order.totals) {
    // Use provided totals if available
    subtotal = order.totals.subtotal || subtotal;
    shipping = order.totals.shipping || 50.00; // Default shipping
    tax = order.totals.tax || subtotal * 0.14; // Default tax rate 14%
    total = order.totals.total || (subtotal + shipping + tax);
  } else {
    // Calculate if not provided
    shipping = order.shipping || 50.00; // Default shipping
    tax = order.tax || subtotal * 0.14; // Default tax rate 14%
    total = order.total || (subtotal + shipping + tax);
  }
  
  // Create order summary
  const orderSummary = document.createElement('div');
  orderSummary.className = 'order-summary';
  orderSummary.innerHTML = `
    <div class="summary-item">
      <span>Subtotal:</span>
      <span>EGP ${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span>Shipping:</span>
      <span>EGP ${shipping.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span>Tax:</span>
      <span>EGP ${tax.toFixed(2)}</span>
    </div>
    <div class="summary-item total">
      <span>Total:</span>
      <span>EGP ${total.toFixed(2)}</span>
    </div>
  `;
  
  // Add products and summary to order details
  orderDetails.appendChild(productsContainer);
  orderDetails.appendChild(orderSummary);
  
  // Create order actions
  const orderActions = document.createElement('div');
  orderActions.className = 'order-actions';
  orderActions.innerHTML = `
    <button class="btn-secondary">Track Order</button>
    <button class="btn-outline view-details" data-order-id="${order.orderId || order._id}">View Details</button>
  `;
  
  // Add all elements to order
  orderElement.appendChild(orderHeader);
  orderElement.appendChild(orderDetails);
  orderElement.appendChild(orderActions);
  
  return orderElement;
}

/**
 * Update pagination
 * @param {number} totalOrders - Total number of orders
 */
function updatePagination(totalOrders) {
  const paginationInfo = document.querySelector('.pagination-info');
  if (paginationInfo) {
    const totalPages = Math.ceil(totalOrders / 5); // Assuming 5 orders per page
    paginationInfo.textContent = `Page 1 of ${totalPages}`;
  }
}

/**
 * Add event listeners
 */
function addEventListeners() {
  // Order filter
  const orderFilter = document.getElementById('order-filter');
  if (orderFilter) {
    orderFilter.addEventListener('change', handleOrderFilter);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Order action buttons
  document.addEventListener('click', function(e) {
    // Track Order button
    if (e.target.classList.contains('btn-secondary')) {
      alert('Tracking functionality will be implemented in a future update.');
    }
    
    // View Details button
    if (e.target.classList.contains('view-details')) {
      const orderId = e.target.getAttribute('data-order-id');
      showOrderDetailsModal(orderId);
    }
  });
}

/**
 * Handle order filter change
 * @param {Event} e - Change event
 */
function handleOrderFilter(e) {
  const filterValue = e.target.value;
  const orderItems = document.querySelectorAll('.order-item');
  
  orderItems.forEach(item => {
    const statusBadge = item.querySelector('.status-badge');
    const status = statusBadge ? statusBadge.textContent.toLowerCase() : '';
    
    if (filterValue === 'all' || status === filterValue) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
  
  // Update visible count for pagination
  const visibleOrders = document.querySelectorAll('.order-item[style="display: block"]').length;
  updatePagination(visibleOrders);
}

/**
 * Show order details modal
 * @param {string} orderId - Order ID
 */
function showOrderDetailsModal(orderId) {
  console.log('Showing details for order:', orderId);
  
  // Find the order in the loaded orders
  const orders = window.loadedOrders || [];
  const order = orders.find(o => (o.orderId || o._id) === orderId);
  
  if (!order) {
    console.error('Order not found:', orderId);
    alert('Order details not available.');
    return;
  }
  
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('order-details-modal');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'order-details-modal';
    modalContainer.className = 'modal';
    document.body.appendChild(modalContainer);
    
    // Add modal styles if not already in document
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow-y: auto;
        }
        
        .modal.active {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 50px 20px;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 800px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          text-align: right;
        }
        
        .close-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        
        .close-modal:hover {
          color: #333;
        }
        
        .order-detail-section {
          margin-bottom: 20px;
        }
        
        .order-detail-section h3 {
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .detail-item {
          margin-bottom: 10px;
        }
        
        .detail-label {
          font-weight: bold;
          color: #666;
          display: block;
          margin-bottom: 3px;
        }
        
        .detail-value {
          color: #333;
        }
        
        .product-list {
          margin-top: 15px;
        }
        
        .product-item-detail {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .product-item-detail:last-child {
          border-bottom: none;
        }
        
        .product-image-small {
          width: 60px;
          height: 60px;
          object-fit: cover;
          margin-right: 15px;
        }
        
        .product-info-detail {
          flex-grow: 1;
        }
        
        .product-price-detail {
          text-align: right;
          min-width: 100px;
        }
        
        .order-summary-detail {
          margin-top: 20px;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .summary-row.total {
          font-weight: bold;
          font-size: 1.1em;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          margin-top: 10px;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Format date
  const orderDate = new Date(order.date || order.createdAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get order status
  const status = order.status || 'processing';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Order #${order.orderId || order._id}</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="order-detail-section">
          <h3>Order Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Order Date</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value">${order.payment?.method || 'Not specified'}</span>
            </div>
          </div>
        </div>
        
        <div class="order-detail-section">
          <h3>Customer Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Name</span>
              <span class="detail-value">${order.customer?.fullName || 'Not specified'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">${order.customer?.email || 'Not specified'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">${order.customer?.phone || 'Not specified'}</span>
            </div>
          </div>
        </div>
        
        <div class="order-detail-section">
          <h3>Shipping Address</h3>
          <div class="detail-item">
            <span class="detail-value">
              ${order.customer?.address?.street || 'No address specified'}<br>
              ${order.customer?.address?.city ? order.customer.address.city : ''}
              ${order.customer?.address?.postalCode ? order.customer.address.postalCode : ''}
            </span>
          </div>
        </div>
        
        <div class="order-detail-section">
          <h3>Order Items</h3>
          <div class="product-list">
            ${getOrderItemsHTML(order)}
          </div>
          
          <div class="order-summary-detail">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>EGP ${(order.totals?.subtotal || calculateSubtotal(order)).toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>EGP ${(order.totals?.shipping || order.shipping || 50.00).toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>EGP ${(order.totals?.tax || order.tax || ((order.totals?.subtotal || calculateSubtotal(order)) * 0.14)).toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>EGP ${(order.totals?.total || order.total || calculateTotal(order)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary print-order">Print Order</button>
        <button class="btn-outline close-modal-btn">Close</button>
      </div>
    </div>
  `;
  
  // Show modal
  modalContainer.classList.add('active');
  
  // Add event listeners for close buttons
  const closeButtons = modalContainer.querySelectorAll('.close-modal, .close-modal-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalContainer.classList.remove('active');
    });
  });
  
  // Add event listener for print button
  const printButton = modalContainer.querySelector('.print-order');
  if (printButton) {
    printButton.addEventListener('click', () => {
      window.print();
    });
  }
  
  // Close modal when clicking outside
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      modalContainer.classList.remove('active');
    }
  });
}

/**
 * Calculate subtotal from order items
 * @param {Object} order - Order object
 * @returns {number} Subtotal
 */
function calculateSubtotal(order) {
  let subtotal = 0;
  
  // Check if order has items
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      subtotal += (item.price || 0) * (item.quantity || 1);
    });
  } 
  // Check if order has products
  else if (order.products && order.products.length > 0) {
    order.products.forEach(product => {
      subtotal += (product.price || 0) * (product.quantity || 1);
    });
  }
  // Use order subtotal if available
  else if (order.subtotal) {
    subtotal = order.subtotal;
  }
  
  return subtotal;
}

/**
 * Calculate total from order
 * @param {Object} order - Order object
 * @returns {number} Total
 */
function calculateTotal(order) {
  const subtotal = order.totals?.subtotal || order.subtotal || calculateSubtotal(order);
  const shipping = order.totals?.shipping || order.shipping || 50.00;
  const tax = order.totals?.tax || order.tax || (subtotal * 0.14);
  const discount = order.totals?.discount || order.discount || 0;
  
  return subtotal + shipping + tax - discount;
}

/**
 * Generate HTML for order items
 * @param {Object} order - Order object
 * @returns {string} HTML for order items
 */
function getOrderItemsHTML(order) {
  let html = '';
  
  // Check if order has items
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      html += `
        <div class="product-item-detail">
          <img src="${item.image || 'images/products/placeholder.jpg'}" alt="${item.name || 'Product'}" class="product-image-small" />
          <div class="product-info-detail">
            <h4>${item.name || 'Product Name'}</h4>
            <p>${item.variant || ''}</p>
            <p>Quantity: ${item.quantity || 1}</p>
          </div>
          <div class="product-price-detail">
            <p>EGP ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
          </div>
        </div>
      `;
    });
  } 
  // Check if order has products
  else if (order.products && order.products.length > 0) {
    order.products.forEach(product => {
      html += `
        <div class="product-item-detail">
          <img src="${product.image || 'images/products/placeholder.jpg'}" alt="${product.name || 'Product'}" class="product-image-small" />
          <div class="product-info-detail">
            <h4>${product.name || 'Product Name'}</h4>
            <p>${product.variant || ''}</p>
            <p>Quantity: ${product.quantity || 1}</p>
          </div>
          <div class="product-price-detail">
            <p>EGP ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}</p>
          </div>
        </div>
      `;
    });
  }
  // If no items or products, show a message
  else {
    html = '<p>No items found in this order.</p>';
  }
  
  return html;
}

/**
 * Handle logout button click
 * @param {Event} e - Click event
 */
function handleLogout(e) {
  e.preventDefault();
  
  // Clear authentication data
  localStorage.removeItem('userToken');
  localStorage.removeItem('userEmail');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

/**
 * Helper function to load scripts dynamically
 * @param {string} src - Script source URL
 * @returns {Promise} - Promise that resolves when script is loaded
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error(`Script load error for ${src}: ${e}`));
    document.head.appendChild(script);
  });
}

/**
 * Initialize loading indicator
 */
function initLoadingIndicator() {
  // Create loading indicator if it doesn't exist
  if (!document.getElementById('loading-indicator')) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <p>Loading...</p>
    `;
    document.body.appendChild(loadingIndicator);
    
    // Add CSS for loading indicator if not already in document
    if (!document.getElementById('loading-indicator-style')) {
      const style = document.createElement('style');
      style.id = 'loading-indicator-style';
      style.textContent = `
        .loading-indicator {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 9999;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
        .loading-indicator.active {
          display: flex;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.classList.add('active');
  }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.classList.remove('active');
  }
}

/**
 * Fetch user profile from API
 * @returns {Promise<Object>} User profile data
 */
async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.warn('No authentication token found, returning default profile');
      return getDefaultUserProfile();
    }
    
    const response = await fetch('/api/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If 404, return a default user object with empty values
      if (response.status === 404) {
        console.warn('User profile not found, returning default profile');
        return getDefaultUserProfile();
      }
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return a default user object in case of any error
    return getDefaultUserProfile();
  }
}

/**
 * Get default user profile when API fails
 * @returns {Object} Default user profile
 */
function getDefaultUserProfile() {
  return {
    username: localStorage.getItem('userName') || 'Guest User',
    email: localStorage.getItem('userEmail') || '',
    phone: '',
    birthDate: '',
    gender: ''
  };
}

/**
 * Get orders when API fails
 * @returns {Array} Empty orders array
 */
function getMockOrders() {
  // Return an empty array instead of mock orders
  // This will trigger the 'no orders' message to be displayed
  return [];
}

/**
 * Fetch orders from API
 * @returns {Promise<Array>} Orders data
 */
async function fetchOrdersFromAPI() {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.warn('No authentication token found, returning empty orders array');
      return [];
    }
    
    // Ensure we have the current user ID
    if (!window.currentUserId) {
      console.warn('No user ID found, cannot fetch orders');
      return [];
    }
    
    // Log the request for debugging
    console.log('Fetching orders for user:', window.currentUserId);
    
    // Try the user-specific orders endpoint first (preferred)
    let response = await fetch(`/api/users/${window.currentUserId}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If that fails, try the user orders endpoint
    if (!response.ok && (response.status === 404 || response.status === 500)) {
      console.warn(`User-specific orders endpoint failed with ${response.status}, trying user orders endpoint`);
      
      response = await fetch('/api/users/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // If that also fails, try the general orders endpoint as a last resort
    if (!response.ok && (response.status === 404 || response.status === 500)) {
      console.warn(`User orders endpoint failed with ${response.status}, trying general orders endpoint`);
      
      response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    if (!response.ok) {
      console.error(`Orders API returned ${response.status}`);
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Orders API response:', data);
    
    // Check which property contains the orders
    let orders = [];
    if (data.orders && Array.isArray(data.orders)) {
      orders = data.orders;
    } else if (data.data && Array.isArray(data.data)) {
      orders = data.data;
    } else if (Array.isArray(data)) {
      orders = data;
    }
    
    // Get the current user's email from localStorage
    const userEmail = localStorage.getItem('userEmail');
    console.log('Filtering orders for email:', userEmail);
    
    if (!userEmail) {
      console.warn('No user email found in localStorage, cannot filter orders');
      return [];
    }
    
    // Log all emails in orders for debugging
    const allEmails = orders.map(order => order.customer?.email).filter(Boolean);
    console.log('All emails in orders:', [...new Set(allEmails)]);
    
    // Normalize the user email for case-insensitive comparison
    const normalizedUserEmail = userEmail.toLowerCase().trim();
    
    // Count total orders before filtering
    const totalOrders = orders.length;
    console.log(`Total orders before filtering: ${totalOrders}`);
    
    // ALWAYS filter orders to only include those for the current user
    // Since the Order model doesn't have a user field, we'll primarily use customer.email
    orders = orders.filter(order => {
      // Check if the order belongs to the current user based on email (case-insensitive)
      const orderEmail = order.customer?.email;
      
      // Skip orders without customer email
      if (!orderEmail) {
        return false;
      }
      
      // Normalize the order email for case-insensitive comparison
      const normalizedOrderEmail = orderEmail.toLowerCase().trim();
      
      // Check for a match
      const emailMatch = normalizedOrderEmail === normalizedUserEmail;
      
      if (emailMatch) {
        console.log(`✓ Order ${order.orderId || order._id} matches user email`);
      }
      
      return emailMatch;
    });
    
    // Log filtering results
    console.log(`Filtered ${totalOrders} orders down to ${orders.length} for user email: ${userEmail}`);
    
    // If no orders matched, log a warning
    if (orders.length === 0 && totalOrders > 0) {
      console.warn(`No orders matched user email ${userEmail} out of ${totalOrders} total orders`);
      console.warn('This suggests the orders in the database have different email formats or capitalization');
    }
    
    if (orders.length > 0) {
      console.log(`Found ${orders.length} orders for the user`);
      return orders;
    } else {
      console.warn('No orders found for the current user');
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}
