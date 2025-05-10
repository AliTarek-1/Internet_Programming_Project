/**
 * Checkout functionality for BrandStore
 * Handles shipping calculations, form validation, and order processing
 */

// Global variables
let cart = [];
let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout functionality
  initCheckout();
  
  // Load navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('components/navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        // Initialize navbar and update cart count
        if (typeof initNavbar === 'function') {
          initNavbar();
        }
        updateCartCount();
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
});

/**
 * Initialize checkout functionality
 */
function initCheckout() {
  // Load cart data
  loadCartData();
  
  // Check if user is logged in
  checkLoginStatus();
  
  // Prefill user information if available
  prefillUserInfo();
  
  // Set up event listeners
  setupEventListeners();
  
  // Update order summary
  updateOrderSummary();
}

/**
 * Check if user is logged in and redirect to login if not
 */
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('userEmail');
  
  if (!isLoggedIn) {
    // Redirect to login page with return URL
    window.location.href = `loginuser.html?redirect=${encodeURIComponent('checkout.html')}`;
  }
}

/**
 * Load cart data from localStorage
 */
function loadCartData() {
  try {
    const cartData = localStorage.getItem('cart');
    cart = cartData ? JSON.parse(cartData) : [];
    if (!Array.isArray(cart)) {
      console.error('Cart is not an array, resetting');
      cart = [];
    }
  } catch (error) {
    console.error('Error parsing cart data:', error);
    cart = [];
  }
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
  const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  
  // Update count in localStorage
  localStorage.setItem('cartCount', count.toString());
  
  // Update UI
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = count;
    element.style.display = count > 0 ? 'flex' : 'none';
  });
}

/**
 * Set up event listeners for checkout form
 */
function setupEventListeners() {
  // Navigation buttons
  const toPaymentBtn = document.getElementById('toPaymentBtn');
  const toReviewBtn = document.getElementById('toReviewBtn');
  const toShippingBtn = document.getElementById('toShippingBtn');
  const backToShippingBtn = document.getElementById('backToShippingBtn');
  const backToPaymentBtn = document.getElementById('backToPaymentBtn');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  
  // Edit buttons
  const editShippingBtn = document.getElementById('editShipping');
  const editPaymentBtn = document.getElementById('editPayment');
  
  if (editShippingBtn) {
    editShippingBtn.addEventListener('click', () => goToStep(1));
  }
  
  if (editPaymentBtn) {
    editPaymentBtn.addEventListener('click', () => goToStep(2));
  }
  
  // City selection
  const citySelect = document.getElementById('city');
  if (citySelect) {
    citySelect.addEventListener('change', () => {
      updateOrderSummary();
    });
  }
  
  // Payment method selection
  const paymentOptions = document.querySelectorAll('.payment-option');
  const creditCardDetails = document.getElementById('creditCardDetails');
  
  // Form inputs
  const cardNumber = document.getElementById('cardNumber');
  const expiryDate = document.getElementById('expiryDate');
  const cvv = document.getElementById('cvv');
  const promoCodeInput = document.getElementById('promoCode');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  
  // Step navigation
  if (toPaymentBtn) {
    toPaymentBtn.addEventListener('click', () => {
      if (validateShippingForm()) {
        goToStep(2);
      }
    });
  }
  
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', () => {
      if (validatePaymentForm()) {
        goToStep(3);
        updateOrderReview();
      }
    });
  }
  
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', () => goToStep(1));
  }
  
  if (backToPaymentBtn) {
    backToPaymentBtn.addEventListener('click', () => goToStep(2));
  }
  
  // Payment method selection
  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        // Remove active class from all options
        paymentOptions.forEach(opt => opt.classList.remove('active'));
        // Add active class to selected option
        option.classList.add('active');
        // Show/hide credit card details
        creditCardDetails.style.display = 
          radio.value === 'creditCard' ? 'block' : 'none';
      }
    });
  });
  
  // Input formatting
  if (cardNumber) {
    cardNumber.addEventListener('input', formatCardNumber);
  }
  
  if (expiryDate) {
    expiryDate.addEventListener('input', formatExpiryDate);
  }
  
  if (cvv) {
    cvv.addEventListener('input', formatCVV);
  }
  
  // Promo code
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoCodeInput.value.trim().toUpperCase();
      applyPromoCode(code);
    });
  }
  
  // Form submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleSubmit);
  }
}

/**
 * Format card number input with spaces
 */
function formatCardNumber(e) {
  let value = e.target.value.replace(/\D/g, '');
  value = value.replace(/(.{4})/g, '$1 ').trim();
  e.target.value = value;
}

/**
 * Format expiry date input (MM/YY)
 */
function formatExpiryDate(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  e.target.value = value;
}

/**
 * Format CVV input (3-4 digits)
 */
function formatCVV(e) {
  let value = e.target.value.replace(/\D/g, '');
  e.target.value = value.slice(0, 4);
}

/**
 * Validate shipping form
 */
function validateShippingForm() {
  const requiredFields = ['fullName', 'email', 'phone', 'streetAddress', 'city', 'postalCode'];
  let isValid = true;
  
  requiredFields.forEach(field => {
    const input = document.getElementById(field);
    if (!input.value.trim()) {
      showError(input, 'This field is required');
      isValid = false;
    } else {
      clearError(input);
    }
  });
  
  // Validate email format
  const email = document.getElementById('email');
  if (email.value.trim() && !isValidEmail(email.value)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  }
  
  // Validate phone format
  const phone = document.getElementById('phone');
  if (phone.value.trim() && !isValidPhone(phone.value)) {
    showError(phone, 'Please enter a valid phone number');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Validate payment form
 */
function validatePaymentForm() {
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
  
  if (!selectedPayment) {
    showError(document.querySelector('.payment-options'), 'Please select a payment method');
    return false;
  }
  
  if (selectedPayment.value === 'creditCard') {
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    let isValid = true;
    
    // Validate card name
    if (!cardName.value.trim()) {
      showError(cardName, 'Please enter the name on card');
      isValid = false;
    } else {
      clearError(cardName);
    }
    
    // Validate card number
    const cleanCardNumber = cardNumber.value.replace(/\s/g, '');
    if (!cleanCardNumber || !isValidCardNumber(cleanCardNumber)) {
      showError(cardNumber, 'Please enter a valid card number');
      isValid = false;
    } else {
      clearError(cardNumber);
    }
    
    // Validate expiry date
    if (!expiryDate.value || !isValidExpiryDate(expiryDate.value)) {
      showError(expiryDate, 'Please enter a valid expiry date');
      isValid = false;
    } else {
      clearError(expiryDate);
    }
    
    // Validate CVV
    if (!cvv.value || !isValidCVV(cvv.value)) {
      showError(cvv, 'Please enter a valid CVV');
      isValid = false;
    } else {
      clearError(cvv);
    }
    
    return isValid;
  }
  
  // Clear any previous errors for the payment section
  clearError(document.querySelector('.payment-options'));
  return true;
}

/**
 * Show error message for input
 */
function showError(element, message) {
  // If element is not a form group, find the closest parent that should show the error
  const formGroup = element.closest('.form-group') || element.closest('.payment-options') || element;
  const existingError = formGroup.querySelector('.error-message');
  
  if (element.classList) {
    element.classList.add('error');
  }
  
  if (!existingError) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
  } else {
    existingError.textContent = message;
  }
}

/**
 * Clear error message for input
 */
function clearError(element) {
  // If element is not a form group, find the closest parent that should show the error
  const formGroup = element.closest('.form-group') || element.closest('.payment-options') || element;
  const errorDiv = formGroup.querySelector('.error-message');
  
  if (element.classList) {
    element.classList.remove('error');
  }
  
  if (errorDiv) {
    errorDiv.remove();
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 */
function isValidPhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

/**
 * Validate card number using Luhn algorithm
 */
function isValidCardNumber(number) {
  if (!/^\d{16}$/.test(number)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate expiry date
 */
function isValidExpiryDate(date) {
  if (!/^\d{2}\/\d{2}$/.test(date)) return false;
  
  const [month, year] = date.split('/').map(num => parseInt(num));
  const now = new Date();
  const expiry = new Date(2000 + year, month - 1);
  
  return month >= 1 && month <= 12 && expiry > now;
}

/**
 * Validate CVV
 */
function isValidCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Apply promo code
 */
function applyPromoCode(code) {
  // Valid promo codes with discount percentages
  const promoCodes = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'SPECIAL30': 30,
    'FLAT50': 50  // Adding the FLAT50 code
  };
  
  // Normalize code to uppercase and trim whitespace
  code = code.toUpperCase().trim();
  
  if (promoCodes[code]) {
    const discount = promoCodes[code];
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('summaryDiscount');
    const subtotal = parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', ''));
    
    const discountValue = (subtotal * discount) / 100;
    discountAmount.textContent = `-$${discountValue.toFixed(2)}`;
    discountRow.style.display = 'flex';
    
    // Store the applied promo code in session
    sessionStorage.setItem('appliedPromoCode', code);
    sessionStorage.setItem('discountPercentage', discount);
    
    // Update the order summary with the new discount
    updateOrderSummary();
    
    // Show success notification instead of alert
    showNotification(`Promo code ${code} applied! You saved $${discountValue.toFixed(2)}`, 'success');
  } else {
    // Show error notification instead of alert
    showNotification(`Invalid promo code: ${code}`, 'error');
  }
}

/**
 * Calculate shipping rate based on selected city
 */
function calculateShippingRate(city) {
  const shippingRates = {
    'Cairo': 30,
    'Alexandria': 40,
    'Giza': 30,
    'Sharm El Sheikh': 60,
    'Luxor': 50,
    'Aswan': 50,
    'Hurghada': 55,
    'Port Said': 45,
    'Suez': 45,
    'Mansoura': 40
  };
  
  return shippingRates[city] || 50; // Default to 50 if city not found
}

/**
 * Update order summary
 */
function updateOrderSummary() {
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const taxEl = document.getElementById('summaryTax');
  const discountEl = document.getElementById('summaryDiscount');
  const discountRow = document.getElementById('discountRow');
  const totalEl = document.getElementById('summaryTotal');
  const itemsContainer = document.getElementById('summaryItems');
  
  // Clear existing items
  itemsContainer.innerHTML = '';
  
  // Calculate totals
  let subtotal = 0;
  
  // Add items to summary
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
      <div class="item-info">
        <span class="item-quantity">${item.quantity}x</span>
        <span class="item-name">${item.name}</span>
      </div>
      <span class="item-price">$${itemTotal.toFixed(2)}</span>
    `;
    itemsContainer.appendChild(itemDiv);
  });
  
  // Get selected city and calculate shipping
  const selectedCity = document.getElementById('city').value;
  const shipping = calculateShippingRate(selectedCity);
  const tax = subtotal * 0.1;
  
  // Calculate discount if a promo code has been applied
  let discount = 0;
  const appliedPromoCode = sessionStorage.getItem('appliedPromoCode');
  const discountPercentage = sessionStorage.getItem('discountPercentage');
  
  if (appliedPromoCode && discountPercentage) {
    discount = (subtotal * parseInt(discountPercentage)) / 100;
    discountEl.textContent = `-$${discount.toFixed(2)}`;
    discountRow.style.display = 'flex';
  } else if (discountEl.textContent) {
    // If there's already a discount showing in the UI but not in session storage
    discount = parseFloat(discountEl.textContent.replace(/[^0-9.-]/g, '')) || 0;
  }
  
  const total = subtotal + shipping + tax - discount;
  
  // Update summary values
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = `$${shipping.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

/**
 * Update order review
 */
function updateOrderReview() {
  const shippingInfo = document.getElementById('shippingInfo');
  const paymentInfo = document.getElementById('paymentInfo');
  
  // Update shipping info
  shippingInfo.innerHTML = `
    <p><strong>${document.getElementById('fullName').value}</strong></p>
    <p>${document.getElementById('email').value}</p>
    <p>${document.getElementById('phone').value}</p>
    <p>${document.getElementById('streetAddress').value}</p>
    <p>${document.getElementById('city').value}, ${document.getElementById('postalCode').value}</p>
  `;
  
  // Update payment info
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  if (paymentMethod === 'creditCard') {
    const cardNumber = document.getElementById('cardNumber').value;
    const lastFour = cardNumber.slice(-4);
    paymentInfo.innerHTML = `
      <p><strong>Credit Card</strong></p>
      <p>Card ending in ${lastFour}</p>
      <p>${document.getElementById('cardName').value}</p>
    `;
  } else {
    paymentInfo.innerHTML = `
      <p><strong>${paymentMethod === 'paypal' ? 'PayPal' : ''}</strong></p>
    `;
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  // Validate all forms before proceeding
  if (!validateShippingForm() || !validatePaymentForm()) {
    showNotification('Please complete all required fields correctly', 'error');
    return;
  }

  if (!document.getElementById('terms').checked) {
    showNotification('Please agree to the Terms and Conditions', 'error');
    return;
  }
  
  // Get the button reference and store its text before changing state
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const originalText = placeOrderBtn.textContent;
  
  try {
    // Show loading state
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing...';
    
    // Get selected payment method
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPayment) {
      throw new Error('Please select a payment method');
    }
    
    // Get payment details
    let paymentDetails = {
      method: selectedPayment.value
    };
    
    // If credit card is selected, add card details
    if (selectedPayment.value === 'creditCard') {
      const cardNumber = document.getElementById('cardNumber').value;
      const cardName = document.getElementById('cardName').value;
      
      paymentDetails = {
        ...paymentDetails,
        cardLast4: cardNumber.slice(-4),
        cardholderName: cardName
      };
    }
    
    // Fetch actual product data from database for each cart item
    const cartItems = await Promise.all(cart.map(async (item) => {
      try {
        // Try to fetch by ID first
        let response = await fetch(`/api/products/${item.id}`);
        let data;
        
        // If ID fetch fails, try to fetch by name
        if (!response.ok) {
          const encodedName = encodeURIComponent(item.name);
          response = await fetch(`/api/products?search=${encodedName}`);
          if (!response.ok) {
            throw new Error(`Failed to find product ${item.name}`);
          }
          data = await response.json();
          // Handle both response formats (data or products)
          const productsArray = data.products || data.data || [];
          console.log(`Search results for ${item.name}:`, productsArray);
          
          // Get the first product that matches the name exactly
          const matchingProduct = productsArray.find(p => p.name === item.name);
          if (!matchingProduct) {
            throw new Error(`Product ${item.name} not found in database`);
          }
          return {
            productId: matchingProduct._id,
            name: matchingProduct.name,
            price: matchingProduct.price,
            quantity: item.quantity
          };
        }
        
        // If ID fetch succeeded
        data = await response.json();
        // Handle both response formats (data or product)
        const product = data.product || data.data;
        console.log(`Product fetch result for ${item.name}:`, product);
        
        if (!product) {
          throw new Error(`Product ${item.name} not found in database`);
        }
        
        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        };
      } catch (error) {
        console.error(`Error processing product ${item.name}:`, error);
        throw new Error(`Product ${item.name} is no longer available`);
      }
    }));
    
    // Prepare order details
    const orderDetails = {
      orderId: generateOrderId(),
      date: new Date().toISOString(),
      customer: {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: {
          street: document.getElementById('streetAddress').value,
          city: document.getElementById('city').value,
          postalCode: document.getElementById('postalCode').value
        }
      },
      payment: paymentDetails,
      items: cartItems,
      totals: {
        subtotal: parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', '')),
        shipping: parseFloat(document.getElementById('summaryShipping').textContent.replace('$', '')) || 0,
        tax: parseFloat(document.getElementById('summaryTax').textContent.replace('$', '')),
        discount: parseFloat(document.getElementById('summaryDiscount')?.textContent.replace(/[^0-9.-]/g, '')) || 0,
        total: parseFloat(document.getElementById('summaryTotal').textContent.replace('$', ''))
      },
      status: 'pending'
    };

    // Send order to MongoDB through API
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place order');
    }

    const { order } = await response.json();
    
    // Show success notification
    showNotification('Order placed successfully!', 'success');
    
    // Clear cart
    localStorage.removeItem('cart');
    cart = [];
    updateCartCount();
    
    // Redirect to confirmation page
    window.location.href = `order-confirmation.html?orderId=${order.orderId}`;
  } catch (error) {
    console.error('Error processing order:', error);
    showNotification(error.message || 'There was an error processing your order. Please try again.', 'error');
    
    // Reset button state
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = originalText;
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

/**
 * Generate unique order ID
 */
function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

/**
 * Navigate between steps
 */
function goToStep(step) {
  currentStep = step;
  
  // Update steps
  document.querySelectorAll('.step').forEach((el, index) => {
    el.classList.toggle('active', index + 1 <= step);
  });
  
  // Update form steps
  document.querySelectorAll('.form-step').forEach((el, index) => {
    el.classList.toggle('active', index + 1 === step);
  });
  
  // Scroll to top of form
  document.querySelector('.checkout-form-container').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Prefill user information if available
 */
function prefillUserInfo() {
  const savedAddress = localStorage.getItem('savedAddress');
  if (savedAddress) {
    const address = JSON.parse(savedAddress);
    Object.keys(address).forEach(field => {
      const input = document.getElementById(field);
      if (input) {
        input.value = address[field];
      }
    });
  }
  
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = userEmail;
    }
  }
}
