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
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
});

/**
 * Initialize checkout functionality
 */
function initCheckout() {
  // Check if user is logged in
  checkLoginStatus();
  
  // Load cart data
  loadCartData();
  
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
  const cartData = localStorage.getItem('cart');
  
  if (cartData) {
    try {
      cart = JSON.parse(cartData);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      cart = [];
    }
  }
}

/**
 * Set up event listeners for checkout form
 */
function setupEventListeners() {
  // Get form elements
  const toPaymentBtn = document.getElementById('toPaymentBtn');
  const toReviewBtn = document.getElementById('toReviewBtn');
  const backToShippingBtn = document.getElementById('backToShippingBtn');
  const backToPaymentBtn = document.getElementById('backToPaymentBtn');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const citySelect = document.getElementById('city');
  
  // Add event listeners if elements exist
  if (toPaymentBtn) {
    toPaymentBtn.addEventListener('click', function() {
      if (validateShippingForm()) {
        goToStep(2);
      }
    });
  }
  
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', function() {
      if (validatePaymentForm()) {
        goToStep(3);
        updateOrderReview();
      }
    });
  }
  
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', function() {
      goToStep(1);
    });
  }
  
  if (backToPaymentBtn) {
    backToPaymentBtn.addEventListener('click', function() {
      goToStep(2);
    });
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      processOrder();
    });
  }
  
  if (citySelect) {
    citySelect.addEventListener('change', function() {
      updateShippingCost();
    });
  }
}

/**
 * Navigate to a specific step in the checkout process
 */
function goToStep(step) {
  // Update current step
  currentStep = step;
  
  // Get all step elements
  const steps = document.querySelectorAll('.step');
  const formSteps = document.querySelectorAll('.form-step');
  
  // Remove active class from all steps
  steps.forEach(step => step.classList.remove('active'));
  formSteps.forEach(formStep => formStep.classList.remove('active'));
  
  // Add active class to current step
  if (steps[step - 1]) steps[step - 1].classList.add('active');
  if (formSteps[step - 1]) formSteps[step - 1].classList.add('active');
}

/**
 * Validate shipping form fields
 */
function validateShippingForm() {
  // Get form elements
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const city = document.getElementById('city');
  const postalCode = document.getElementById('postalCode');
  
  // Reset error messages
  clearErrorMessages();
  
  // Validate required fields
  let isValid = true;
  
  if (!fullName || !fullName.value.trim()) {
    displayError(fullName, 'Full name is required');
    isValid = false;
  }
  
  if (!email || !email.value.trim()) {
    displayError(email, 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    displayError(email, 'Please enter a valid email address');
    isValid = false;
  }
  
  if (!phone || !phone.value.trim()) {
    displayError(phone, 'Phone number is required');
    isValid = false;
  }
  
  if (!address || !address.value.trim()) {
    displayError(address, 'Address is required');
    isValid = false;
  }
  
  if (!city || !city.value) {
    displayError(city, 'Please select a city');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Validate payment form fields
 */
function validatePaymentForm() {
  // Get form elements
  const cardName = document.getElementById('cardName');
  const cardNumber = document.getElementById('cardNumber');
  const expDate = document.getElementById('expDate');
  const cvv = document.getElementById('cvv');
  
  // Reset error messages
  clearErrorMessages();
  
  // Validate required fields
  let isValid = true;
  
  if (!cardName || !cardName.value.trim()) {
    displayError(cardName, 'Name on card is required');
    isValid = false;
  }
  
  if (!cardNumber || !cardNumber.value.trim()) {
    displayError(cardNumber, 'Card number is required');
    isValid = false;
  } else if (!isValidCreditCard(cardNumber.value)) {
    displayError(cardNumber, 'Please enter a valid card number');
    isValid = false;
  }
  
  if (!expDate || !expDate.value.trim()) {
    displayError(expDate, 'Expiration date is required');
    isValid = false;
  } else if (!isValidExpiryDate(expDate.value)) {
    displayError(expDate, 'Please enter a valid expiration date (MM/YY)');
    isValid = false;
  }
  
  if (!cvv || !cvv.value.trim()) {
    displayError(cvv, 'CVV is required');
    isValid = false;
  } else if (!isValidCVV(cvv.value)) {
    displayError(cvv, 'Please enter a valid CVV (3-4 digits)');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Display error message for a form field
 */
function displayError(element, message) {
  if (!element) return;
  
  const formGroup = element.closest('.form-group');
  
  if (formGroup) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
    element.classList.add('error');
  }
}

/**
 * Clear all error messages
 */
function clearErrorMessages() {
  // Remove error messages
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(error => error.remove());
  
  // Remove error class from inputs
  const errorInputs = document.querySelectorAll('.error');
  errorInputs.forEach(input => input.classList.remove('error'));
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate credit card number using Luhn algorithm
 */
function isValidCreditCard(cardNumber) {
  // Remove spaces and dashes
  const sanitizedNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it contains only digits and has valid length
  if (!/^\d{13,19}$/.test(sanitizedNumber)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
}

/**
 * Validate expiry date format (MM/YY)
 */
function isValidExpiryDate(expiry) {
  // Check format
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }
  
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
  
  // Convert to numbers
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);
  
  // Check if month is valid
  if (expMonth < 1 || expMonth > 12) {
    return false;
  }
  
  // Check if card is expired
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }
  
  return true;
}

/**
 * Validate CVV format
 */
function isValidCVV(cvv) {
  // CVV should be 3-4 digits
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Prefill user information from localStorage
 */
function prefillUserInfo() {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = userEmail;
    }
  }
}

/**
 * Updates shipping cost based on selected city/governorate
 */
function updateShippingCost() {
  // Get shipping element by ID
  const shippingElement = document.getElementById('summaryShipping');
  // Get city select element
  const citySelect = document.getElementById('city');
  
  // Check if required elements exist
  if (!shippingElement) {
    console.warn('Shipping element not found in the DOM');
    return;
  }
  
  let shippingCost = 0;
  
  if (citySelect) {
    const selectedCity = citySelect.value;
    
    // Shipping costs based on city/governorate
    if (selectedCity) {
      switch(selectedCity) {
        case 'Cairo':
          shippingCost = 50; // Lowest shipping cost
          break;
        case 'Giza':
          shippingCost = 60;
          break;
        case 'Alexandria':
          shippingCost = 80;
          break;
        case 'Luxor':
        case 'Aswan':
          shippingCost = 120;
          break;
        case 'Hurghada':
        case 'Sharm El Sheikh':
          shippingCost = 130;
          break;
        case 'Mansoura':
        case 'Tanta':
        case 'Zagazig':
        case 'Ismailia':
        case 'Port Said':
        case 'Suez':
          shippingCost = 90;
          break;
        case 'Asyut':
        case 'Minya':
        case 'Qena':
        case 'Sohag':
        case 'Beni Suef':
        case 'Faiyum':
          shippingCost = 100;
          break;
        case 'Kafr El Sheikh':
        case 'Damietta':
        case 'Beheira':
        case 'Monufia':
        case 'Qalyubia':
        case 'Gharbia':
        case 'Dakahlia':
        case 'Sharqia':
          shippingCost = 70;
          break;
        default:
          shippingCost = 100; // Default shipping cost
          break;
      }
    }
  }
  
  // Update shipping cost display
  if (shippingElement) {
    shippingElement.textContent = `$${shippingCost.toFixed(2)}`;
  }
  
  // Update total
  updateTotal(shippingCost);
}

/**
 * Updates the order summary with subtotal, tax, shipping, and total
 */
function updateOrderSummary() {
  // Get elements by their correct IDs
  const subtotalElement = document.getElementById('summarySubtotal');
  const shippingElement = document.getElementById('summaryShipping');
  const taxElement = document.getElementById('summaryTax');
  const totalElement = document.getElementById('summaryTotal');
  
  // Check if required elements exist
  if (!subtotalElement) {
    console.warn('Subtotal element not found in the DOM');
    return;
  }
  
  // Calculate subtotal from cart items
  let subtotal = 0;
  
  if (cart && cart.length > 0) {
    subtotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  } else {
    // For demo purposes, use a sample subtotal if cart is empty
    subtotal = 129.99;
  }
  
  // Calculate tax (10% consistent with cart page)
  const tax = subtotal * 0.1;
  
  // Update display
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
  
  // Update shipping cost based on selected city
  updateShippingCost();
}

/**
 * Updates the total price based on subtotal, shipping, and tax
 */
function updateTotal(shippingCost = 0) {
  // Get elements by their correct IDs
  const subtotalElement = document.getElementById('summarySubtotal');
  const shippingElement = document.getElementById('summaryShipping');
  const taxElement = document.getElementById('summaryTax');
  const totalElement = document.getElementById('summaryTotal');
  
  // Check if elements exist
  if (!subtotalElement || !shippingElement || !taxElement || !totalElement) {
    console.warn('One or more price elements not found in the DOM');
    return;
  }
  
  // Get current values (handle both $ and EGP currency formats)
  const subtotal = parseFloat(subtotalElement.textContent.replace(/[^0-9.]/g, '')) || 0;
  const shipping = parseFloat(shippingElement.textContent.replace(/[^0-9.]/g, '')) || 0;
  const tax = parseFloat(taxElement.textContent.replace(/[^0-9.]/g, '')) || 0;
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  // Update total display
  totalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Update the order review section with shipping and payment details
 */
function updateOrderReview() {
  // Get shipping information
  const fullName = document.getElementById('fullName')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const address = document.getElementById('address')?.value || '';
  const city = document.getElementById('city')?.value || '';
  const postalCode = document.getElementById('postalCode')?.value || '';
  
  // Get payment information
  const cardName = document.getElementById('cardName')?.value || '';
  const cardNumber = document.getElementById('cardNumber')?.value || '';
  
  // Update shipping review
  const shippingReview = document.getElementById('shippingReview');
  if (shippingReview) {
    shippingReview.innerHTML = `
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Postal Code:</strong> ${postalCode}</p>
    `;
  }
  
  // Update payment review
  const paymentReview = document.getElementById('paymentReview');
  if (paymentReview) {
    // Mask card number for security
    const maskedCardNumber = cardNumber.replace(/[\s-]/g, '').replace(/^(\d{4})(\d+)(\d{4})$/, '$1 **** **** $3');
    
    paymentReview.innerHTML = `
      <p><strong>Name on Card:</strong> ${cardName}</p>
      <p><strong>Card Number:</strong> ${maskedCardNumber}</p>
    `;
  }
}

/**
 * Process the order and redirect to confirmation page
 */
function processOrder() {
  // Get order details
  const orderDetails = {
    customer: {
      fullName: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || ''
    },
    payment: {
      cardName: document.getElementById('cardName')?.value || '',
      // Don't store full card details for security reasons
      cardLast4: (document.getElementById('cardNumber')?.value || '').slice(-4)
    },
    items: cart,
    totals: {
      subtotal: parseFloat(document.getElementById('summarySubtotal')?.textContent.replace(/[^0-9.]/g, '')) || 0,
      shipping: parseFloat(document.getElementById('summaryShipping')?.textContent.replace(/[^0-9.]/g, '')) || 0,
      tax: parseFloat(document.getElementById('summaryTax')?.textContent.replace(/[^0-9.]/g, '')) || 0,
      total: parseFloat(document.getElementById('summaryTotal')?.textContent.replace(/[^0-9.]/g, '')) || 0
    },
    orderDate: new Date().toISOString(),
    orderNumber: generateOrderNumber()
  };
  
  // Save order to localStorage
  localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
  
  // Clear cart
  localStorage.removeItem('cart');
  
  // Redirect to confirmation page
  window.location.href = 'order-confirmation.html';
}

/**
 * Generate a random order number
 */
function generateOrderNumber() {
  const timestamp = new Date().getTime().toString().slice(-8);
    
    if (discount === 'free-shipping') {
      // Apply free shipping
      if (shippingElement) {
        shippingElement.textContent = 'EGP 0.00';
        alert('Free shipping applied!');
      }
    } else {
      // Apply percentage discount
      const subtotal = parseFloat(subtotalElement.textContent.replace('EGP ', ''));
      const discountAmount = subtotal * discount;
      const newSubtotal = subtotal - discountAmount;
      
      if (subtotalElement) {
        subtotalElement.textContent = `EGP ${newSubtotal.toFixed(2)}`;
        alert(`${discount * 100}% discount applied!`);
      }
    }
    
    // Update total
    updateTotal(shippingCost);
  
  
  /**
   * Updates the order summary with subtotal, tax, shipping, and total
   */
  function updateOrderSummary() {
    // Get elements by their correct IDs
    const subtotalElement = document.getElementById('summarySubtotal');
    const shippingElement = document.getElementById('summaryShipping');
    const taxElement = document.getElementById('summaryTax');
    const totalElement = document.getElementById('summaryTotal');
    
    // Check if required elements exist
    if (!subtotalElement) {
      console.warn('Subtotal element not found in the DOM');
      return;
    }
    
    // Calculate subtotal from cart items
    let subtotal = 0;
    
    if (cart && cart.length > 0) {
      subtotal = cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    } else {
      // For demo purposes, use a sample subtotal if cart is empty
      subtotal = 129.99;
    }
    
    // Calculate tax (14% VAT for Egypt)
    const tax = subtotal * 0.14;
    
    // Update display
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    
    // Update shipping cost based on selected city
    updateShippingCost();
  }
  
  /**
   * Updates the total price based on subtotal, shipping, and tax
   */
  function updateTotal(shippingCost = 0) {
    // Get elements by their correct IDs
    const subtotalElement = document.getElementById('summarySubtotal');
    const shippingElement = document.getElementById('summaryShipping');
    const taxElement = document.getElementById('summaryTax');
    const totalElement = document.getElementById('summaryTotal');
    
    // Check if elements exist
    if (!subtotalElement || !shippingElement || !taxElement) {
      console.warn('One or more price elements not found in the DOM');
      return;
    }
    
    // Get current values (handle both $ and EGP currency formats)
    const subtotal = parseFloat(subtotalElement.textContent.replace(/[^0-9.]/g, '')) || 0;
    const shipping = parseFloat(shippingElement.textContent.replace(/[^0-9.]/g, '')) || 0;
    const tax = parseFloat(taxElement.textContent.replace(/[^0-9.]/g, '')) || 0;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update total display
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
  }
  
  /**
   * Applies a promo code discount
   */
  function applyPromoCode() {
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    // Sample promo codes
    const promoCodes = {
      'WELCOME10': 0.10, // 10% off
      'SUMMER20': 0.20,  // 20% off
      'FREESHIP': 'free-shipping' // Free shipping
    };
    
    if (promoCodes[promoCode]) {
      const discount = promoCodes[promoCode];
      
      if (discount === 'free-shipping') {
        // Apply free shipping
        if (shippingElement) {
          shippingElement.textContent = 'EGP 0.00';
          alert('Free shipping applied!');
        }
      } else {
        // Apply percentage discount
        const subtotal = parseFloat(subtotalElement.textContent.replace('EGP ', ''));
        const discountAmount = subtotal * discount;
        const newSubtotal = subtotal - discountAmount;
        
        if (subtotalElement) {
          subtotalElement.textContent = `EGP ${newSubtotal.toFixed(2)}`;
          alert(`${discount * 100}% discount applied!`);
        }
      }
      
      // Update total
      updateTotal();
      
      // Disable promo code input
      promoCodeInput.disabled = true;
      applyPromoBtn.disabled = true;
    } else {
      alert('Invalid promo code');
    }
  }
  
  /**
   * Handles navigation to the next checkout step
   */
  function goToNextStep(e) {
    e.preventDefault();
    
    const activeStep = document.querySelector('.step.active');
    const activeFormStep = document.querySelector('.form-step.active');
    
    if (activeStep && activeFormStep) {
      // Validate current step before proceeding
      if (validateStep(activeFormStep)) {
        const nextStepIndex = Array.from(steps).indexOf(activeStep) + 1;
        
        if (nextStepIndex < steps.length) {
          // Update steps
          activeStep.classList.remove('active');
          steps[nextStepIndex].classList.add('active');
          
          // Update form steps
          activeFormStep.classList.remove('active');
          formSteps[nextStepIndex].classList.add('active');
          
          // Scroll to top of form
          checkoutForm.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }
  
  /**
   * Handles navigation to the previous checkout step
   */
  function goToPrevStep(e) {
    e.preventDefault();
    
    const activeStep = document.querySelector('.step.active');
    const activeFormStep = document.querySelector('.form-step.active');
    
    if (activeStep && activeFormStep) {
      const prevStepIndex = Array.from(steps).indexOf(activeStep) - 1;
      
      if (prevStepIndex >= 0) {
        // Update steps
        activeStep.classList.remove('active');
        steps[prevStepIndex].classList.add('active');
        
        // Update form steps
        activeFormStep.classList.remove('active');
        formSteps[prevStepIndex].classList.add('active');
        
        // Scroll to top of form
        checkoutForm.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  /**
   * Validates the current checkout step
   */
  function validateStep(step) {
    const stepId = step.id;
    let isValid = true;
    
    // Shipping step validation
    if (stepId === 'shipping-step') {
      const requiredFields = step.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          
          // Add error message if it doesn't exist
          let errorMsg = field.parentElement.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            field.parentElement.appendChild(errorMsg);
          }
        } else {
          field.classList.remove('error');
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });
      
      // Special validation for city - must select a city for shipping calculation
      if (citySelect && citySelect.value === '') {
        isValid = false;
        citySelect.classList.add('error');
        
        // Add error message if it doesn't exist
        let errorMsg = citySelect.parentElement.querySelector('.error-message');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'Please select your city/governorate for accurate shipping costs';
          citySelect.parentElement.appendChild(errorMsg);
        }
      }
    }
    
    // Payment step validation
    else if (stepId === 'payment-step') {
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
      if (!paymentMethod) {
        isValid = false;
        const paymentMethodsContainer = document.querySelector('.payment-methods');
        
        // Add error message if it doesn't exist
        let errorMsg = paymentMethodsContainer.querySelector('.error-message');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'Please select a payment method';
          paymentMethodsContainer.appendChild(errorMsg);
        }
      } else {
        // Remove any existing error message
        const paymentMethodsContainer = document.querySelector('.payment-methods');
        const errorMsg = paymentMethodsContainer.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
        
        // Credit card validation
        if (paymentMethod.value === 'credit-card') {
          const cardFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
          
          cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
              isValid = false;
              field.classList.add('error');
              
              // Add error message if it doesn't exist
              let errorMsg = field.parentElement.querySelector('.error-message');
              if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                field.parentElement.appendChild(errorMsg);
              }
            } else {
              // Specific validation for card number
              if (fieldId === 'cardNumber' && !validateCardNumber(field.value)) {
                isValid = false;
                field.classList.add('error');
                
                // Add error message if it doesn't exist
                let errorMsg = field.parentElement.querySelector('.error-message');
                if (!errorMsg) {
                  errorMsg = document.createElement('div');
                  errorMsg.className = 'error-message';
                  errorMsg.textContent = 'Please enter a valid card number';
                  field.parentElement.appendChild(errorMsg);
                }
              } else {
                field.classList.remove('error');
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) {
                  errorMsg.remove();
                }
              }
            }
          });
        }
      }
    }
    
    return isValid;
  }
  
  /**
   * Handles checkout form submission
   * @param {Event} e - Form submission event
   */
  function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateShippingForm()) {
      // Switch to shipping step if there are errors
      switchToStep(0);
      return;
    }
    
    if (!validatePaymentForm()) {
      // Switch to payment step if there are errors
      switchToStep(1);
      return;
    }
    
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      // Redirect to login page if not logged in
      alert('Please log in to complete your purchase');
      window.location.href = 'loginuser.html?redirect=checkout.html';
      return;
    }
    
    // Get form data
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
    
    // Add payment details if credit card is selected
    if (formData.paymentMethod === 'credit-card') {
      formData.cardDetails = {
        cardNumber: document.getElementById('cardNumber').value.replace(/\D/g, ''),
        cardName: document.getElementById('cardName').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
      };
    }
    
    // Save order details to localStorage for order history
    const orderDetails = {
      id: generateOrderId(),
      date: new Date().toISOString(),
      items: cart,
      shipping: parseFloat(shippingElement.textContent.replace('EGP ', '')),
      subtotal: parseFloat(subtotalElement.textContent.replace('EGP ', '')),
      tax: parseFloat(taxElement.textContent.replace('EGP ', '')),
      total: parseFloat(totalElement.textContent.replace('EGP ', '')),
      customer: formData
    };
    
    // Save to order history
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push(orderDetails);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show success message
    alert('Order submitted successfully!');
    
    // Redirect to confirmation page
    window.location.href = 'HomePage.html';
  }
  
  /**
   * Generates a unique order ID
   * @returns {string} Order ID
   */
  function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  /**
   * Validates a credit card number using Luhn algorithm
   * @param {string} cardNumber - Credit card number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function validateCardNumber(cardNumber) {
    // Remove spaces and non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    // Check if card number has valid length
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    
    // Luhn algorithm implementation
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through digits from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }
  
  /**
   * Shows error message for an input field
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  function showError(input, message) {
    input.classList.add('error');
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    // Remove any existing error messages
    const existingErrors = formGroup.querySelectorAll('.error-message');
    existingErrors.forEach(el => el.remove());
    
    // Create and append error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  }
  
  /**
   * Clears all error messages
   */
  function clearErrors() {
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
  }
  
  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validates phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function isValidPhone(phone) {
    // Basic phone validation - can be customized for specific formats
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * Validates shipping form
   * @returns {boolean} True if valid, false otherwise
   */
  function validateShippingForm() {
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    
    let isValid = true;
    
    if (!fullNameInput.value.trim()) {
      showError(fullNameInput, 'Please enter your full name');
      isValid = false;
    }
    
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!phoneInput.value.trim() || !isValidPhone(phoneInput.value)) {
      showError(phoneInput, 'Please enter a valid phone number');
      isValid = false;
    }
    
    if (!addressInput.value.trim()) {
      showError(addressInput, 'Please enter your address');
      isValid = false;
    }
    
    if (!cityInput.value.trim()) {
      showError(cityInput, 'Please select your city/governorate');
      isValid = false;
    }
    
    return isValid;
  }
  
  /**
   * Updates the order summary section
   */
  function updateOrderSummary() {
    // Check if required elements exist
    if (!subtotalElement) {
      console.warn('Subtotal element not found in the DOM');
      return;
    }
    
    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.order-items');
    
    // Clear existing items
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
    }
    
    // Add cart items and totals to order data
    orderData.items = cart;
    orderData.subtotal = parseFloat(subtotalElement.textContent.replace('EGP ', ''));
    orderData.shipping = parseFloat(shippingElement.textContent.replace('EGP ', ''));
    orderData.tax = parseFloat(taxElement.textContent.replace('EGP ', ''));
    orderData.total = parseFloat(totalElement.textContent.replace('EGP ', ''));
    
    // Save order to localStorage (in a real app, this would be sent to a server)
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
  }
  
  /**
   * Switches to a specific checkout step
   * @param {number} stepIndex - Index of the step to switch to
   */
  function switchToStep(stepIndex) {
    const activeStep = document.querySelector('.step.active');
    const activeFormStep = document.querySelector('.form-step.active');
    
    if (activeStep && activeFormStep) {
      activeStep.classList.remove('active');
      steps[stepIndex].classList.add('active');
      
      activeFormStep.classList.remove('active');
      formSteps[stepIndex].classList.add('active');
      
      // Scroll to top of form
      orderData.items = cart;
      orderData.subtotal = parseFloat(subtotalElement.textContent.replace('EGP ', ''));
      orderData.shipping = parseFloat(shippingElement.textContent.replace('EGP ', ''));
      orderData.tax = parseFloat(taxElement.textContent.replace('EGP ', ''));
      orderData.total = parseFloat(totalElement.textContent.replace('EGP ', ''));
      
      // Save order to localStorage (in a real app, this would be sent to a server)
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      
      // Show success message or redirect to confirmation page
      alert('Order placed successfully! Thank you for your purchase.');
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Redirect to confirmation page
      window.location.href = 'order-confirmation.html';
    } else {
      // Show error message
      alert('Please complete all required fields before placing your order.');
    }
  }}
