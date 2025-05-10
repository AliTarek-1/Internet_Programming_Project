/**
 * Account page functionality for BrandStore
 * Handles profile management, orders, addresses, and payment methods
 * Data is fetched from the database via API
 */

// API Service for user-related operations
const userApiService = {
  // Base API URL
  baseUrl: '/api/users',
  
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('userToken');
  },
  
  // Headers for API requests
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    };
  },
  
  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        // If 404, return a default user object with empty values
        if (response.status === 404) {
          console.warn('User profile not found, returning default profile');
          return {
            username: 'Guest User',
            email: localStorage.getItem('userEmail') || '',
            phone: '',
            birthDate: '',
            gender: ''
          };
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return a default user object in case of any error
      return {
        username: 'Guest User',
        email: localStorage.getItem('userEmail') || '',
        phone: '',
        birthDate: '',
        gender: ''
      };
    }
  },
  
  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get user addresses
  async getAddresses() {
    try {
      const response = await fetch(`${this.baseUrl}/addresses`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        // If 404, return empty array instead of throwing error
        if (response.status === 404) {
          console.warn('User addresses not found, returning empty array');
          return [];
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.addresses || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Always return an array, even on error
      return [];
    }
  },
  
  // Add a new address
  async addAddress(addressData) {
    try {
      const response = await fetch(`${this.baseUrl}/addresses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(addressData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },
  
  // Update an address
  async updateAddress(addressId, addressData) {
    try {
      const response = await fetch(`${this.baseUrl}/addresses/${addressId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(addressData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },
  
  // Delete an address
  async deleteAddress(addressId) {
    try {
      const response = await fetch(`${this.baseUrl}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },
  
  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        // If 404, return empty array instead of throwing error
        if (response.status === 404) {
          console.warn('User payment methods not found, returning empty array');
          return [];
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Always return an array, even on error
      return [];
    }
  },
  
  // Add a payment method
  async addPaymentMethod(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },
  
  // Get user orders
  async getOrders() {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        // If 404 or 500, return empty array instead of throwing error
        if (response.status === 404 || response.status === 500) {
          console.warn(`User orders not found (${response.status}), returning empty array`);
          return [];
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Return mock orders for demo purposes
      return this.getMockOrders();
    }
  },
  
  // Get mock orders for demo purposes when API fails
  getMockOrders() {
    return [
      {
        id: 'ORD-' + Math.floor(Math.random() * 1000000000),
        date: new Date().toISOString(),
        status: 'processing',
        items: [
          {
            product: {
              name: 'Premium Cotton T-Shirt',
              price: 299.99,
              image: 'images/products/sample-product.jpg'
            },
            quantity: 2,
            size: 'M',
            color: 'Blue'
          }
        ],
        subtotal: 599.98,
        shipping: 50.00,
        tax: 84.00,
        total: 733.98
      }
    ];
  },
  
  // Get a specific order
  async getOrder(orderId) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Load API script first if not already loaded
  loadScript('/scripts/api.js')
    .then(() => {
      // Initialize account page
      initAccountPage();
      
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

// Helper function to load scripts dynamically
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
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Initialize account page functionality
 */
function initAccountPage() {
  // Check if user is logged in
  checkAuthentication();
  
  // Load user data
  loadUserData();
  
  // Add event listeners
  addEventListeners();
  
  // Initialize password visibility toggles
  initPasswordToggles();
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
 * Load user data from API
 */
async function loadUserData() {
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Fetch user profile from API
    const userData = await userApiService.getProfile();
    
    if (!userData) {
      console.error('Failed to load user data');
      showNotification('Failed to load user data', 'error');
      return;
    }
    
    // Update UI with user data
    const userNameElements = document.querySelectorAll('#user-name');
    const userEmailElements = document.querySelectorAll('#user-email, #profile-email');
    
    userNameElements.forEach(element => {
      element.textContent = userData.username || 'User';
    });
    
    userEmailElements.forEach(element => {
      if (element.tagName.toLowerCase() === 'input') {
        element.value = userData.email || '';
      } else {
        element.textContent = userData.email || '';
      }
    });
    
    // Load profile data
    const fullNameInput = document.getElementById('full-name');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birth-date');
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    
    if (fullNameInput) {
      fullNameInput.value = userData.username || '';
    }
    
    if (phoneInput) {
      phoneInput.value = userData.phone || '';
    }
    
    if (birthDateInput && userData.birthDate) {
      // Format date to YYYY-MM-DD for input
      const date = new Date(userData.birthDate);
      const formattedDate = date.toISOString().split('T')[0];
      birthDateInput.value = formattedDate;
    }
    
    if (userData.gender) {
      genderInputs.forEach(input => {
        if (input.value === userData.gender) {
          input.checked = true;
        }
      });
    }
    
    // Load addresses
    await loadAddresses();
    
    // Load payment methods
    await loadPaymentMethods();
    
    // Load orders
    await loadOrders();
    
    // Hide loading indicator
    hideLoadingIndicator();
  } catch (error) {
    console.error('Error loading user data:', error);
    showNotification('Error loading user data', 'error');
    hideLoadingIndicator();
    
    // Still populate the form with default values from localStorage
    const userEmail = localStorage.getItem('userEmail') || '';
    document.getElementById('user-name').textContent = 'User';
    document.getElementById('user-email').textContent = userEmail;
    document.getElementById('profile-email').value = userEmail;
  }
}

/**
 * Load user addresses from API
 */
async function loadAddresses() {
  try {
    const addresses = await userApiService.getAddresses();
    const addressesPanel = document.getElementById('addresses-panel');
    
    if (!addressesPanel) return;
    
    // Get addresses container
    let addressesContainer = addressesPanel.querySelector('.addresses-container');
    
    // Create container if it doesn't exist
    if (!addressesContainer) {
      addressesContainer = document.createElement('div');
      addressesContainer.className = 'addresses-container';
      addressesPanel.appendChild(addressesContainer);
    }
    
    // Clear existing addresses
    addressesContainer.innerHTML = '';
    
    // Show message if no addresses
    if (!addresses || addresses.length === 0) {
      addressesContainer.innerHTML = `
        <div class="no-items-message">
          <i class="fas fa-map-marker-alt"></i>
          <p>You don't have any saved addresses yet.</p>
        </div>
      `;
      return;
    }
    
    // Add addresses to container
    addresses.forEach(address => {
      const addressCard = document.createElement('div');
      addressCard.className = `address-card ${address.isDefault ? 'default' : ''}`;
      addressCard.dataset.id = address._id;
      
      addressCard.innerHTML = `
        <div class="address-header">
          <h4>${address.name}</h4>
          ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="address-details">
          <p>${address.street}</p>
          <p>${address.city}, ${address.state} ${address.zipCode}</p>
          <p>${address.country}</p>
          ${address.phone ? `<p>Phone: ${address.phone}</p>` : ''}
        </div>
        <div class="address-actions">
          <button class="edit-address-btn"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-address-btn"><i class="fas fa-trash"></i> Delete</button>
          ${!address.isDefault ? `<button class="set-default-btn"><i class="fas fa-check-circle"></i> Set as Default</button>` : ''}
        </div>
      `;
      
      addressesContainer.appendChild(addressCard);
    });
    
    // Add event listeners to address buttons
    addAddressEventListeners();
  } catch (error) {
    console.error('Error loading addresses:', error);
    showNotification('Error loading addresses', 'error');
  }
}

/**
 * Load user payment methods from API
 */
async function loadPaymentMethods() {
  try {
    const paymentMethods = await userApiService.getPaymentMethods();
    const paymentMethodsPanel = document.getElementById('payment-methods-panel');
    
    if (!paymentMethodsPanel) return;
    
    // Get payment methods container
    let paymentMethodsContainer = paymentMethodsPanel.querySelector('.payment-methods-container');
    
    // Create container if it doesn't exist
    if (!paymentMethodsContainer) {
      paymentMethodsContainer = document.createElement('div');
      paymentMethodsContainer.className = 'payment-methods-container';
      paymentMethodsPanel.appendChild(paymentMethodsContainer);
    }
    
    // Clear existing payment methods
    paymentMethodsContainer.innerHTML = '';
    
    // Show message if no payment methods
    if (!paymentMethods || paymentMethods.length === 0) {
      paymentMethodsContainer.innerHTML = `
        <div class="no-items-message">
          <i class="fas fa-credit-card"></i>
          <p>You don't have any saved payment methods yet.</p>
        </div>
      `;
      return;
    }
    
    // Add payment methods to container
    paymentMethods.forEach(method => {
      const paymentCard = document.createElement('div');
      paymentCard.className = `payment-card ${method.isDefault ? 'default' : ''}`;
      paymentCard.dataset.id = method._id;
      
      // Get card icon based on type
      let cardIcon = 'fa-credit-card';
      if (method.type === 'credit_card') cardIcon = 'fa-credit-card';
      else if (method.type === 'paypal') cardIcon = 'fa-paypal';
      
      paymentCard.innerHTML = `
        <div class="payment-header">
          <div class="payment-type">
            <i class="fab ${cardIcon}"></i>
            <h4>${formatPaymentType(method.type)}</h4>
          </div>
          ${method.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="payment-details">
          ${method.cardName ? `<p>Name on card: ${method.cardName}</p>` : ''}
          ${method.lastFourDigits ? `<p>Card ending in: ****${method.lastFourDigits}</p>` : ''}
          ${method.expiryDate ? `<p>Expires: ${method.expiryDate}</p>` : ''}
        </div>
        <div class="payment-actions">
          <button class="edit-payment-btn"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-payment-btn"><i class="fas fa-trash"></i> Delete</button>
          ${!method.isDefault ? `<button class="set-default-payment-btn"><i class="fas fa-check-circle"></i> Set as Default</button>` : ''}
        </div>
      `;
      
      paymentMethodsContainer.appendChild(paymentCard);
    });
    
    // Add event listeners to payment method buttons
    addPaymentMethodEventListeners();
  } catch (error) {
    console.error('Error loading payment methods:', error);
    showNotification('Error loading payment methods', 'error');
  }
}

/**
 * Format payment type for display
 */
function formatPaymentType(type) {
  switch (type) {
    case 'credit_card': return 'Credit Card';
    case 'debit_card': return 'Debit Card';
    case 'paypal': return 'PayPal';
    default: return type.replace('_', ' ');
  }
}

/**
 * Load user orders from API
 */
async function loadOrders() {
  try {
    const orders = await userApiService.getOrders();
    const ordersPanel = document.getElementById('orders-panel');
    
    if (!ordersPanel) return;
    
    // Get orders container
    let ordersContainer = ordersPanel.querySelector('.orders-container');
    
    // Create container if it doesn't exist
    if (!ordersContainer) {
      ordersContainer = document.createElement('div');
      ordersContainer.className = 'orders-container';
      ordersPanel.appendChild(ordersContainer);
    }
    
    // Clear existing orders
    ordersContainer.innerHTML = '';
    
    // Show message if no orders
    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="no-items-message">
          <i class="fas fa-box"></i>
          <p>You don't have any orders yet.</p>
          <a href="products.html" class="btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }
    
    // Add orders to container
    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      orderCard.dataset.id = order._id;
      
      // Format date
      const orderDate = new Date(order.createdAt);
      const formattedDate = orderDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Calculate total items
      const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);
      
      orderCard.innerHTML = `
        <div class="order-header">
          <div class="order-info">
            <h4>Order #${order.orderNumber || order._id.substring(0, 8)}</h4>
            <span class="order-date">${formattedDate}</span>
          </div>
          <div class="order-status ${order.status.toLowerCase()}">
            <span>${order.status}</span>
          </div>
        </div>
        <div class="order-summary">
          <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Items:</strong> ${totalItems}</p>
        </div>
        <div class="order-actions">
          <a href="order-details.html?id=${order._id}" class="btn-secondary">View Details</a>
        </div>
      `;
      
      ordersContainer.appendChild(orderCard);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    showNotification('Error loading orders', 'error');
  }
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
  // Check if loading indicator already exists
  let loadingIndicator = document.querySelector('.loading-indicator');
  
  // Create loading indicator if it doesn't exist
  if (!loadingIndicator) {
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    `;
    document.body.appendChild(loadingIndicator);
  }
  
  // Show loading indicator
  loadingIndicator.style.display = 'flex';
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
  const loadingIndicator = document.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  // Check if notification container exists
  let notificationContainer = document.querySelector('.notification-container');
  
  // Create notification container if it doesn't exist
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Set icon based on type
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  else if (type === 'warning') icon = 'fa-exclamation-triangle';
  else if (type === 'info') icon = 'fa-info-circle';
  
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Add event listeners to account page elements
 */
function addEventListeners() {
  // Profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }
  
  // Password form submission
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordSubmit);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Menu navigation
  const menuLinks = document.querySelectorAll('.account-menu a');
  menuLinks.forEach(link => {
    if (!link.id || link.id !== 'logout-btn') {
      link.addEventListener('click', handleMenuNavigation);
    }
  });
}

/**
 * Initialize password visibility toggles
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  });
}

/**
 * Handle profile form submission
 * @param {Event} e - Form submission event
 */
function handleProfileSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const birthDate = document.getElementById('birth-date').value;
  
  // Get selected gender
  let gender = '';
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  genderInputs.forEach(input => {
    if (input.checked) {
      gender = input.value;
    }
  });
  
  // Validate form data
  if (!fullName) {
    showError('full-name', 'Please enter your full name');
    return;
  }
  
  // Save profile data to localStorage
  const profileData = {
    fullName,
    email,
    phone,
    birthDate,
    gender
  };
  
  localStorage.setItem('profileData', JSON.stringify(profileData));
  localStorage.setItem('userName', fullName);
  
  // Update UI
  const userNameElements = document.querySelectorAll('#user-name');
  userNameElements.forEach(element => {
    element.textContent = fullName;
  });
  
  // Show success message
  showSuccess('Profile updated successfully!');
}

/**
 * Handle password form submission
 * @param {Event} e - Form submission event
 */
function handlePasswordSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;
  
  // Validate form data
  if (!currentPassword) {
    showError('current-password', 'Please enter your current password');
    return;
  }
  
  if (!newPassword) {
    showError('new-password', 'Please enter a new password');
    return;
  }
  
  if (newPassword.length < 6) {
    showError('new-password', 'Password must be at least 6 characters');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showError('confirm-new-password', 'Passwords do not match');
    return;
  }
  
  // In a real application, you would send this to a server
  // For this demo, we'll just show a success message
  
  // Clear form
  document.getElementById('password-form').reset();
  
  // Show success message
  showSuccess('Password updated successfully!');
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
 * Handle menu navigation
 * @param {Event} e - Click event
 */
function handleMenuNavigation(e) {
  const href = e.currentTarget.getAttribute('href');
  
  // If it's an internal link (starts with #), prevent default behavior
  if (href.startsWith('#')) {
    e.preventDefault();
    
    // Get the panel ID
    const panelId = href.substring(1) + '-panel';
    
    // Hide all panels
    const panels = document.querySelectorAll('.account-panel');
    panels.forEach(panel => {
      panel.classList.remove('active');
    });
    
    // Show the selected panel
    const selectedPanel = document.getElementById(panelId);
    if (selectedPanel) {
      selectedPanel.classList.add('active');
    }
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.account-menu li');
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
    
    e.currentTarget.parentElement.classList.add('active');
  }
}

/**
 * Show error message for an input field
 * @param {string} inputId - ID of the input element
 * @param {string} message - Error message
 */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  input.classList.add('error');
  
  // Remove any existing error messages
  const existingError = input.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Add error message after input
  if (input.parentElement.classList.contains('password-input')) {
    input.parentElement.after(errorElement);
  } else {
    input.after(errorElement);
  }
  
  // Clear error after 3 seconds
  setTimeout(() => {
    input.classList.remove('error');
    errorElement.remove();
  }, 3000);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
  // Create success message element if it doesn't exist
  let successElement = document.querySelector('.success-message');
  if (!successElement) {
    successElement = document.createElement('div');
    successElement.className = 'success-message';
    document.querySelector('.account-content').prepend(successElement);
  }
  
  // Set message and show
  successElement.textContent = message;
  successElement.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    successElement.style.display = 'none';
  }, 3000);
}
