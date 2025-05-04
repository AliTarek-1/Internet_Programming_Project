/**
 * Orders page functionality for BrandStore
 * Handles order history display and filtering
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize orders page
  initOrdersPage();
  
  // Load navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        // Execute navbar script after loading
        const script = document.createElement('script');
        script.textContent = `initNavbar();`;
        document.body.appendChild(script);
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
});

/**
 * Initialize orders page functionality
 */
function initOrdersPage() {
  // Check if user is logged in
  checkAuthentication();
  
  // Load user data
  loadUserData();
  
  // Load orders
  loadOrders();
  
  // Add event listeners
  addEventListeners();
}

/**
 * Check if user is authenticated, redirect to login if not
 */
function checkAuthentication() {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }
}

/**
 * Load user data from localStorage
 */
function loadUserData() {
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName') || 'User';
  
  // Update UI with user data
  const userNameElements = document.querySelectorAll('#user-name');
  const userEmailElements = document.querySelectorAll('#user-email');
  
  userNameElements.forEach(element => {
    element.textContent = userName;
  });
  
  userEmailElements.forEach(element => {
    element.textContent = userEmail;
  });
}

/**
 * Load orders from localStorage
 */
function loadOrders() {
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
  const ordersContainer = document.getElementById('orders-container');
  const noOrdersMessage = document.getElementById('no-orders-message');
  
  // Clear existing orders
  ordersContainer.innerHTML = '';
  
  // Check if there are any orders
  if (orderHistory.length === 0) {
    // Show no orders message
    ordersContainer.appendChild(noOrdersMessage);
    return;
  }
  
  // Hide no orders message
  if (noOrdersMessage) {
    noOrdersMessage.style.display = 'none';
  }
  
  // Sort orders by date (newest first)
  orderHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Create order elements
  orderHistory.forEach(order => {
    const orderElement = createOrderElement(order);
    ordersContainer.appendChild(orderElement);
  });
  
  // Update pagination
  updatePagination(orderHistory.length);
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
  const orderDate = new Date(order.date);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Determine order status (for demo purposes)
  const statuses = ['processing', 'shipped', 'delivered'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Create order header
  const orderHeader = document.createElement('div');
  orderHeader.className = 'order-header';
  orderHeader.innerHTML = `
    <div class="order-info">
      <h3>Order #${order.id}</h3>
      <p class="order-date">Placed on ${formattedDate}</p>
    </div>
    <div class="order-status">
      <span class="status-badge ${randomStatus}">${randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1)}</span>
    </div>
  `;
  
  // Create order details
  const orderDetails = document.createElement('div');
  orderDetails.className = 'order-details';
  
  // Create products list
  const productsContainer = document.createElement('div');
  productsContainer.className = 'order-products';
  
  // Add products
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div class="product-image">
          <img src="${item.image || 'images/products/placeholder.jpg'}" alt="${item.name}" />
        </div>
        <div class="product-info">
          <h4>${item.name || 'Product Name'}</h4>
          <p>${item.variant || ''}</p>
          <p>Quantity: ${item.quantity || 1}</p>
        </div>
        <div class="product-price">
          <p>EGP ${(item.price * (item.quantity || 1)).toFixed(2)}</p>
        </div>
      `;
      productsContainer.appendChild(productElement);
    });
  } else {
    // For demo purposes, add a sample product
    const productElement = document.createElement('div');
    productElement.className = 'product-item';
    productElement.innerHTML = `
      <div class="product-image">
        <img src="images/products/sample-product.jpg" alt="Product" />
      </div>
      <div class="product-info">
        <h4>Premium Cotton T-Shirt</h4>
        <p>Size: M | Color: Blue</p>
        <p>Quantity: 2</p>
      </div>
      <div class="product-price">
        <p>EGP ${order.subtotal ? order.subtotal.toFixed(2) : '599.98'}</p>
      </div>
    `;
    productsContainer.appendChild(productElement);
  }
  
  // Create order summary
  const orderSummary = document.createElement('div');
  orderSummary.className = 'order-summary';
  orderSummary.innerHTML = `
    <div class="summary-item">
      <span>Subtotal:</span>
      <span>EGP ${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}</span>
    </div>
    <div class="summary-item">
      <span>Shipping:</span>
      <span>EGP ${order.shipping ? order.shipping.toFixed(2) : '0.00'}</span>
    </div>
    <div class="summary-item">
      <span>Tax:</span>
      <span>EGP ${order.tax ? order.tax.toFixed(2) : '0.00'}</span>
    </div>
    <div class="summary-item total">
      <span>Total:</span>
      <span>EGP ${order.total ? order.total.toFixed(2) : '0.00'}</span>
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
    <button class="btn-outline">View Details</button>
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
    if (e.target.classList.contains('btn-secondary') || 
        e.target.classList.contains('btn-outline')) {
      // For demo purposes, just show an alert
      alert('This feature is not implemented in the demo.');
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
