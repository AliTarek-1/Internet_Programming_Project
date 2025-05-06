document.addEventListener('DOMContentLoaded', function() {
  // Load navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('components/navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        
        // Initialize navbar functionality after loading
        if (typeof initNavbar === 'function') {
          initNavbar();
        }
        
        // Update cart count after navbar is loaded
        if (typeof updateCartCountDisplay === 'function') {
          updateCartCountDisplay();
        }
      })
      .catch(error => console.error('Error loading navbar:', error));
  }
  
  // Load footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('components/footer.html')
      .then(response => response.text())
      .then(data => {
        footerPlaceholder.innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  }
  
  // Initialize FAQ accordion functionality
  initFaqAccordion();
  
  // Initialize search functionality
  initSearch();
  
  // Initialize category filter
  initCategoryFilter();
});

// Initialize FAQ accordion functionality
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    // Set initial state for answers (closed)
    if (answer) {
      answer.style.maxHeight = '0';
      answer.style.padding = '0 1.25rem';
    }
    
    // Add click event to questions
    if (question) {
      question.addEventListener('click', () => {
        // Toggle active class
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) {
              otherAnswer.style.maxHeight = '0';
              otherAnswer.style.padding = '0 1.25rem';
            }
          }
        });
        
        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = '0';
          answer.style.padding = '0 1.25rem';
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.padding = '1.25rem';
        }
      });
    }
  });
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('faq-search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', filterFaqs);
}

// Filter FAQs based on search input
function filterFaqs() {
  const searchInput = document.getElementById('faq-search');
  const searchTerm = searchInput.value.toLowerCase().trim();
  const faqItems = document.querySelectorAll('.faq-item');
  const faqCategories = document.querySelectorAll('.faq-category');
  const noResults = document.querySelector('.no-results');
  
  let hasResults = false;
  
  // Reset category visibility
  faqCategories.forEach(category => {
    category.style.display = 'block';
  });
  
  // Filter items based on search term
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question').textContent.toLowerCase();
    const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
    
    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      item.style.display = 'block';
      hasResults = true;
      
      // Highlight the parent category
      const parentCategory = item.closest('.faq-category') || 
                             item.previousElementSibling;
      if (parentCategory && parentCategory.classList.contains('faq-category')) {
        parentCategory.style.display = 'block';
      }
    } else {
      item.style.display = 'none';
    }
  });
  
  // Hide empty categories
  faqCategories.forEach(category => {
    const nextSibling = category.nextElementSibling;
    let hasVisibleItems = false;
    
    let currentElement = nextSibling;
    while (currentElement && !currentElement.classList.contains('faq-category')) {
      if (currentElement.classList.contains('faq-item') && 
          currentElement.style.display !== 'none') {
        hasVisibleItems = true;
        break;
      }
      currentElement = currentElement.nextElementSibling;
    }
    
    if (!hasVisibleItems) {
      category.style.display = 'none';
    }
  });
  
  // Show/hide no results message
  if (noResults) {
    noResults.style.display = hasResults ? 'none' : 'block';
  }
}

// Initialize category filter
function initCategoryFilter() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (!categoryButtons.length) return;
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      const category = button.dataset.category;
      filterByCategory(category);
    });
  });
}

// Filter FAQs by category
function filterByCategory(category) {
  const faqCategories = document.querySelectorAll('.faq-category');
  const noResults = document.querySelector('.no-results');
  
  if (category === 'all') {
    // Show all categories
    faqCategories.forEach(cat => {
      cat.style.display = 'block';
      
      // Show all items in this category
      let currentElement = cat.nextElementSibling;
      while (currentElement && !currentElement.classList.contains('faq-category')) {
        if (currentElement.classList.contains('faq-item')) {
          currentElement.style.display = 'block';
        }
        currentElement = currentElement.nextElementSibling;
      }
    });
    
    if (noResults) {
      noResults.style.display = 'none';
    }
  } else {
    let hasResults = false;
    
    // Hide all categories first
    faqCategories.forEach(cat => {
      cat.style.display = 'none';
      
      // Hide all items in this category
      let currentElement = cat.nextElementSibling;
      while (currentElement && !currentElement.classList.contains('faq-category')) {
        if (currentElement.classList.contains('faq-item')) {
          currentElement.style.display = 'none';
        }
        currentElement = currentElement.nextElementSibling;
      }
    });
    
    // Show only the selected category
    faqCategories.forEach(cat => {
      if (cat.querySelector('h2').textContent.toLowerCase() === category.toLowerCase()) {
        cat.style.display = 'block';
        hasResults = true;
        
        // Show all items in this category
        let currentElement = cat.nextElementSibling;
        while (currentElement && !currentElement.classList.contains('faq-category')) {
          if (currentElement.classList.contains('faq-item')) {
            currentElement.style.display = 'block';
          }
          currentElement = currentElement.nextElementSibling;
        }
      }
    });
    
    if (noResults) {
      noResults.style.display = hasResults ? 'none' : 'block';
    }
  }
}

// Load cart sidebar functionality
document.addEventListener('click', function(e) {
  if (e.target.closest('.cart-icon') || e.target.closest('.cart-count')) {
    toggleCart();
  }
  
  if (e.target.closest('.close-cart')) {
    closeCart();
  }
  
  if (!e.target.closest('.cart-sidebar') && !e.target.closest('.cart-icon') && !e.target.closest('.cart-count')) {
    const cartSidebar = document.querySelector('.cart-sidebar');
    if (cartSidebar && cartSidebar.classList.contains('open')) {
      closeCart();
    }
  }
});

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.toggle('open');
    
    if (cartSidebar.classList.contains('open')) {
      // Load cart items when opening
      if (typeof loadCartItems === 'function') {
        loadCartItems();
      }
    }
  }
}

// Close cart sidebar
function closeCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.remove('open');
  }
}
