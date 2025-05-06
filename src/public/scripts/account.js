/**
 * Account page functionality for BrandStore
 * Handles profile management, password changes, and authentication
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize account page
  initAccountPage();
  
  // Load navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        // Execute navbar script after loading
        const script = document.createElement('script');
        script.textContent = `initializeNavbar();`;
        document.body.appendChild(script);
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
});

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
 * Load user data from localStorage
 */
function loadUserData() {
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName') || 'User';
  
  // Update UI with user data
  const userNameElements = document.querySelectorAll('#user-name');
  const userEmailElements = document.querySelectorAll('#user-email, #profile-email');
  
  userNameElements.forEach(element => {
    element.textContent = userName;
  });
  
  userEmailElements.forEach(element => {
    if (element.tagName.toLowerCase() === 'input') {
      element.value = userEmail;
    } else {
      element.textContent = userEmail;
    }
  });
  
  // Load profile data if available
  const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
  if (profileData) {
    const fullNameInput = document.getElementById('full-name');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birth-date');
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    
    if (fullNameInput && profileData.fullName) {
      fullNameInput.value = profileData.fullName;
      // Also update the displayed name
      userNameElements.forEach(element => {
        element.textContent = profileData.fullName;
      });
    }
    
    if (phoneInput && profileData.phone) {
      phoneInput.value = profileData.phone;
    }
    
    if (birthDateInput && profileData.birthDate) {
      birthDateInput.value = profileData.birthDate;
    }
    
    if (profileData.gender) {
      genderInputs.forEach(input => {
        if (input.value === profileData.gender) {
          input.checked = true;
        }
      });
    }
  }
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
