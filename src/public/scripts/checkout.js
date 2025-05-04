/**
 * Checkout functionality for BrandStore
 * Handles shipping calculations, form validation, and order processing
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout functionality
  initCheckout();
  
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

function initCheckout() {
  // DOM elements
  const checkoutForm = document.getElementById('checkoutForm');
  const citySelect = document.getElementById('city');
  const toPaymentBtn = document.getElementById('toPaymentBtn');
  const toReviewBtn = document.getElementById('toReviewBtn');
  const backToShippingBtn = document.getElementById('backToShippingBtn');
  const backToPaymentBtn = document.getElementById('backToPaymentBtn');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const steps = document.querySelectorAll('.step');
  const formSteps = document.querySelectorAll('.form-step');
  const shippingElement = document.getElementById('shipping');
  const subtotalElement = document.getElementById('subtotal');
  const taxElement = document.getElementById('tax');
  const totalElement = document.getElementById('total');
  const promoCodeInput = document.getElementById('promoCode');
  const applyPromoBtn = document.querySelector('.promo-code button');
  
  // Load cart data
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Pre-fill user information if logged in
  prefillUserInfo();
  
  // Calculate and display order summary
  updateOrderSummary();
  
  // Add event listeners
  if (citySelect) {
    citySelect.addEventListener('change', updateShippingCost);
  }
  
  // Navigation buttons
  if (toPaymentBtn) {
    toPaymentBtn.addEventListener('click', function() {
      if (validateShippingForm()) {
        switchToStep(1); // Go to payment step
      }
    });
  }
  
  if (toReviewBtn) {
    toReviewBtn.addEventListener('click', function() {
      if (validatePaymentForm()) {
        switchToStep(2); // Go to review step
        updateReviewSection();
      }
    });
  }
  
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', function() {
      switchToStep(0); // Back to shipping step
    });
  }
  
  if (backToPaymentBtn) {
    backToPaymentBtn.addEventListener('click', function() {
      switchToStep(1); // Back to payment step
    });
  }
  
  // Form submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
  
  // Promo code application
  if (applyPromoBtn && promoCodeInput) {
    applyPromoBtn.addEventListener('click', applyPromoCode);
  }
  
  // Initialize shipping cost based on default selection
  updateShippingCost();
  
  /**
   * Validates the shipping form
   * @returns {boolean} True if valid, false otherwise
   */
  function validateShippingForm() {
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate full name
    if (!fullName.value.trim()) {
      showError(fullName, 'Full name is required');
      isValid = false;
    } else if (fullName.value.trim().length < 3) {
      showError(fullName, 'Name must be at least 3 characters');
      isValid = false;
    }
    
    // Validate email
    if (!email.value.trim()) {
      showError(email, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate phone
    if (!phone.value.trim()) {
      showError(phone, 'Phone number is required');
      isValid = false;
    } else if (!isValidPhone(phone.value)) {
      showError(phone, 'Please enter a valid phone number');
      isValid = false;
    }
    
    // Validate address
    if (!address.value.trim()) {
      showError(address, 'Address is required');
      isValid = false;
    } else if (address.value.trim().length < 5) {
      showError(address, 'Please enter a complete address');
      isValid = false;
    }
    
    // Validate city
    if (!city.value) {
      showError(city, 'Please select a city/governorate');
      isValid = false;
    }
    
    return isValid;
  }
  
  /**
   * Validates the payment form
   * @returns {boolean} True if valid, false otherwise
   */
  function validatePaymentForm() {
    // For this demo, we'll assume payment is valid
    // In a real application, you would validate card details, etc.
    return true;
  }
  
  /**
   * Updates the review section with order details
   */
  function updateReviewSection() {
    // Get shipping information
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    
    // Update review section with shipping information
    document.getElementById('review-name').textContent = fullName;
    document.getElementById('review-email').textContent = email;
    document.getElementById('review-phone').textContent = phone;
    document.getElementById('review-address').textContent = address;
    document.getElementById('review-city').textContent = city;
    
    // Update payment method (assuming credit card is selected)
    document.getElementById('review-payment').textContent = 'Credit Card';
  }
  
  /**
   * Pre-fill user information if logged in
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
    const selectedCity = citySelect ? citySelect.value : '';
    let shippingCost = 0;
    
    // Shipping costs in EGP based on Egyptian governorates
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
          shippingCost = 95;
          break;
        case 'Marsa Matruh':
        case 'New Valley':
        case 'North Sinai':
        case 'South Sinai':
          shippingCost = 150; // Highest shipping cost
          break;
        default:
          shippingCost = 100; // Default shipping cost
      }
    }
    
    // Update shipping cost in the order summary
    if (shippingElement) {
      shippingElement.textContent = `EGP ${shippingCost.toFixed(2)}`;
    }
    
    // Update total
    updateTotal(shippingCost);
  }
  
  /**
   * Updates the order summary with subtotal, tax, shipping, and total
   */
  function updateOrderSummary() {
    // Calculate subtotal from cart items
    let subtotal = 0;
    
    if (cart && cart.length > 0) {
      subtotal = cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    } else {
      // For demo purposes, use a sample subtotal if cart is empty
      subtotal = 1299.99;
    }
    
    // Calculate tax (14% VAT for Egypt)
    const tax = subtotal * 0.14;
    
    // Update display
    if (subtotalElement) subtotalElement.textContent = `EGP ${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `EGP ${tax.toFixed(2)}`;
    
    // Update shipping cost based on selected city
    updateShippingCost();
  }
  
  /**
   * Updates the total price based on subtotal, shipping, and tax
   */
  function updateTotal(shippingCost = 0) {
    // Get current values
    const subtotal = parseFloat(subtotalElement.textContent.replace('EGP ', '')) || 0;
    const shipping = parseFloat(shippingElement.textContent.replace('EGP ', '')) || 0;
    const tax = parseFloat(taxElement.textContent.replace('EGP ', '')) || 0;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update total display
    if (totalElement) {
      totalElement.textContent = `EGP ${total.toFixed(2)}`;
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
      // Add payment validation logic here
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
    
    // Get form data
    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      // Add payment details if needed
    };
    
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
      // Add cart items and totals to order data
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
  }
}
