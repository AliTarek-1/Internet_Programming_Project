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

  // Update cart count
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    // Get cart count from localStorage or default to 0
    const count = localStorage.getItem('cartCount') || 0;
    cartCount.textContent = count;
  }

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
} 