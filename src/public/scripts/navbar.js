// Navbar functionality
document.addEventListener('DOMContentLoaded', function() {
  // Include navbar in all pages
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('components/navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        initializeNavbar();
      });
  } else {
    initializeNavbar();
  }
});

function initializeNavbar() {
  // Check if user is logged in
  const userToken = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  const isLoggedIn = !!userToken;
  
  // Update user dropdown based on authentication status
  updateUserMenu(isLoggedIn, userEmail);
  
  // Toggle user dropdown
  const userIcon = document.getElementById('userIcon');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userIcon && userDropdown) {
    userIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      userDropdown.classList.remove('active');
    });
  }
  
  // Update active link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // Update cart count on all pages
  updateCartCountDisplay();

  // Add scroll effect to navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
  
  // Add mobile menu toggle functionality
  addMobileMenuToggle();

  window.addEventListener('resize', () => {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768 && !mobileToggle) {
      addMobileMenuToggle();
    } else if (window.innerWidth > 768 && mobileToggle) {
      mobileToggle.remove(); // remove toggle if resizing to desktop
      document.querySelector('.nav-links')?.classList.remove('active');
    }
  });
  
}

// Function to update cart count display across all pages
function updateCartCountDisplay() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  if (cartCountElements.length > 0) {
    // Get cart count from localStorage or default to 0
    const count = localStorage.getItem('cartCount') || 0;
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
      element.textContent = count;
    });
  }
}

// Add mobile menu toggle functionality
function addMobileMenuToggle() {
  // Only add toggle for screens <= 768px
  if (window.innerWidth > 768) return;

  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');

  if (!navbar || !navLinks) return;

  let mobileToggle = document.querySelector('.mobile-menu-toggle');

  if (!mobileToggle) {
    mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');

    const logo = navbar.querySelector('.logo');
    if (logo) {
      logo.parentNode.insertBefore(mobileToggle, logo.nextSibling);
    } else {
      navbar.insertBefore(mobileToggle, navbar.firstChild);
    }
  }

  mobileToggle.addEventListener('click', function () {
    navLinks.classList.toggle('active');
    const icon = mobileToggle.querySelector('i');
    if (icon) {
      icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    }
  });

  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}


// Update user menu based on authentication status
function updateUserMenu(isLoggedIn, userEmail) {
  const userDropdown = document.getElementById('userDropdown');
  const userIcon = document.getElementById('userIcon');
  
  if (!userDropdown) return;
  
  // Clear existing dropdown items
  userDropdown.innerHTML = '';
  
  if (isLoggedIn) {
    // User is logged in - show account options
    if (userEmail) {
      const emailDisplay = document.createElement('div');
      emailDisplay.className = 'user-email';
      emailDisplay.textContent = userEmail;
      userDropdown.appendChild(emailDisplay);
    }
    
    const accountLink = document.createElement('a');
    accountLink.href = 'account.html';
    accountLink.textContent = 'My Account';
    userDropdown.appendChild(accountLink);
    
    const ordersLink = document.createElement('a');
    ordersLink.href = 'orders.html';
    ordersLink.textContent = 'My Orders';
    userDropdown.appendChild(ordersLink);
    
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Sign Out';
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Clear authentication data
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      
      // Redirect to home page
      window.location.href = 'HomePage.html';
    });
    userDropdown.appendChild(logoutLink);
    
    // Update user icon to show logged in state
    if (userIcon) {
      userIcon.classList.add('logged-in');
    }
  } else {
    // User is not logged in - show login/signup options
    const loginLink = document.createElement('a');
    loginLink.href = 'loginuser.html';
    loginLink.textContent = 'Login';
    userDropdown.appendChild(loginLink);
    
    const signupLink = document.createElement('a');
    signupLink.href = 'signup.html';
    signupLink.textContent = 'Sign Up';
    userDropdown.appendChild(signupLink);
    
    // Update user icon to show logged out state
    if (userIcon) {
      userIcon.classList.remove('logged-in');
    }
  }
}