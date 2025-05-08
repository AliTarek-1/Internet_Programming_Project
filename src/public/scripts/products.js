// products.js

// Define product data for each category
const productsData = {
  // Men's Products
  men: [
    {
      id: "men-1",
      name: "Classic Oxford Shirt",
      category: "Men's Collection",
      price: 59.99,
      oldPrice: 75.00,
      rating: 4.5,
      description: "A timeless oxford shirt perfect for any occasion."
    },
    {
      id: "men-2",
      name: "Slim Fit Jeans",
      category: "Men's Collection",
      price: 89.99,
      rating: 4.8,
      description: "Modern slim fit jeans with comfortable stretch."
    },
    {
      id: "men-3",
      name: "Leather Bomber Jacket",
      category: "Men's Collection",
      price: 199.99,
      oldPrice: 250.00,
      rating: 4.9,
      description: "Premium leather jacket with quilted lining."
    },
    {
      id: "men-4",
      name: "Merino Wool Sweater",
      category: "Men's Collection",
      price: 79.99,
      rating: 4.7,
      description: "Soft and warm merino wool in a classic cut."
    },
    {
      id: "men-5",
      name: "Tailored Suit Pants",
      category: "Men's Collection",
      price: 110.00,
      rating: 4.6,
      description: "Professional tailored pants for the modern businessman."
    },
    {
      id: "men-6",
      name: "Casual Linen Shirt",
      category: "Men's Collection",
      price: 65.00,
      oldPrice: 85.00,
      rating: 4.3,
      description: "Breathable linen shirt perfect for warm weather."
    },
    {
      id: "men-7",
      name: "Classic Polo",
      category: "Men's Collection",
      price: 45.00,
      rating: 4.4,
      description: "Traditional polo shirt with modern fit."
    },
    {
      id: "men-8",
      name: "Cargo Pants",
      category: "Men's Collection",
      price: 75.00,
      rating: 4.2,
      description: "Durable cargo pants with multiple pockets."
    },
    {
      id: "men-9",
      name: "Waterproof Hiking Boots",
      category: "Men's Collection",
      price: 145.00,
      rating: 4.8,
      description: "All-terrain boots for the outdoor enthusiast."
    },
    {
      id: "men-10",
      name: "Graphic T-Shirt",
      category: "Men's Collection",
      price: 29.99,
      rating: 4.1,
      description: "Trendy graphic tee with premium cotton."
    },
    {
      id: "men-11",
      name: "Leather Belt",
      category: "Men's Collection",
      price: 49.99,
      rating: 4.5,
      description: "Genuine leather belt with classic buckle."
    },
    {
      id: "men-12",
      name: "Wool Peacoat",
      category: "Men's Collection",
      price: 189.99,
      oldPrice: 230.00,
      rating: 4.9,
      description: "Elegant peacoat for cold winter days."
    }
  ],
  
  // Women's Products
  women: [
    {
      id: "women-1",
      name: "Floral Maxi Dress",
      category: "Women's Collection",
      price: 89.99,
      rating: 4.7,
      description: "Beautiful floral pattern on a flowing maxi dress."
    },
    {
      id: "women-2",
      name: "Skinny High-Rise Jeans",
      category: "Women's Collection",
      price: 79.99,
      oldPrice: 95.00,
      rating: 4.6,
      description: "Form-fitting jeans with modern high-rise cut."
    },
    {
      id: "women-3",
      name: "Cashmere Blend Sweater",
      category: "Women's Collection",
      price: 120.00,
      rating: 4.8,
      description: "Luxury cashmere blend for exceptional softness."
    },
    {
      id: "women-4",
      name: "Tailored Blazer",
      category: "Women's Collection",
      price: 149.99,
      rating: 4.9,
      description: "Professional blazer with modern slim fit."
    },
    {
      id: "women-5",
      name: "Pleated Midi Skirt",
      category: "Women's Collection",
      price: 69.99,
      oldPrice: 85.00,
      rating: 4.5,
      description: "Elegant pleated skirt in versatile midi length."
    },
    {
      id: "women-6",
      name: "Silk Blouse",
      category: "Women's Collection",
      price: 110.00,
      rating: 4.7,
      description: "Premium silk blouse for timeless elegance."
    },
    {
      id: "women-7",
      name: "Leather Ankle Boots",
      category: "Women's Collection",
      price: 159.99,
      rating: 4.8,
      description: "Classic ankle boots with block heel."
    },
    {
      id: "women-8",
      name: "Summer Romper",
      category: "Women's Collection",
      price: 65.00,
      oldPrice: 80.00,
      rating: 4.4,
      description: "Lightweight and breezy summer romper."
    },
    {
      id: "women-9",
      name: "Yoga Leggings",
      category: "Women's Collection",
      price: 49.99,
      rating: 4.6,
      description: "High-performance leggings for yoga and fitness."
    },
    {
      id: "women-10",
      name: "Oversized Cardigan",
      category: "Women's Collection",
      price: 75.00,
      rating: 4.5,
      description: "Cozy oversized cardigan for casual comfort."
    },
    {
      id: "women-11",
      name: "Denim Jacket",
      category: "Women's Collection",
      price: 85.00,
      rating: 4.7,
      description: "Classic denim jacket with modern details."
    },
    {
      id: "women-12",
      name: "Satin Pajama Set",
      category: "Women's Collection",
      price: 69.99,
      oldPrice: 85.00,
      rating: 4.9,
      description: "Luxurious satin pajamas for ultimate comfort."
    }
  ],
  
  // Children's Products
  children: [
    {
      id: "child-1",
      name: "Dinosaur Print T-Shirt",
      category: "Children's Collection",
      price: 24.99,
      rating: 4.8,
      description: "Fun dinosaur print on soft cotton t-shirt."
    },
    {
      id: "child-2",
      name: "Elastic Waist Jeans",
      category: "Children's Collection",
      price: 39.99,
      rating: 4.7,
      description: "Comfortable jeans with elastic waist for active kids."
    },
    {
      id: "child-3",
      name: "Hooded Sweatshirt",
      category: "Children's Collection",
      price: 35.00,
      oldPrice: 45.00,
      rating: 4.6,
      description: "Cozy hoodie with kangaroo pocket."
    },
    {
      id: "child-4",
      name: "Floral Summer Dress",
      category: "Children's Collection",
      price: 45.00,
      rating: 4.9,
      description: "Pretty floral dress for special occasions."
    },
    {
      id: "child-5",
      name: "Character Backpack",
      category: "Children's Collection",
      price: 32.99,
      rating: 4.5,
      description: "Fun character design on durable backpack."
    },
    {
      id: "child-6",
      name: "Velcro Sneakers",
      category: "Children's Collection",
      price: 38.00,
      oldPrice: 45.00,
      rating: 4.7,
      description: "Easy velcro sneakers for little feet."
    },
    {
      id: "child-7",
      name: "Raincoat with Hood",
      category: "Children's Collection",
      price: 42.99,
      rating: 4.6,
      description: "Waterproof raincoat with fun pattern."
    },
    {
      id: "child-8",
      name: "Graphic Pajama Set",
      category: "Children's Collection",
      price: 29.99,
      rating: 4.8,
      description: "Soft pajamas with fun graphics."
    },
    {
      id: "child-9",
      name: "Winter Beanie",
      category: "Children's Collection",
      price: 18.99,
      oldPrice: 24.99,
      rating: 4.4,
      description: "Warm winter beanie with pom-pom."
    },
    {
      id: "child-10",
      name: "Cargo Shorts",
      category: "Children's Collection",
      price: 28.99,
      rating: 4.3,
      description: "Durable shorts with lots of pockets."
    },
    {
      id: "child-11",
      name: "Ballet Tutu",
      category: "Children's Collection",
      price: 34.99,
      rating: 4.9,
      description: "Beautiful tutu for little dancers."
    },
    {
      id: "child-12",
      name: "Superhero Cape",
      category: "Children's Collection",
      price: 22.99,
      oldPrice: 29.99,
      rating: 4.8,
      description: "Fun superhero cape for imaginative play."
    }
  ]
};

function addToCart(productName, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if item already exists
  const existingItemIndex = cart.findIndex(
    (item) => item.productName === productName
  );

  if (existingItemIndex !== -1) {
    // If item exists, increase quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // If item doesn't exist, add new
    cart.push({ productName, price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${productName} added to cart!`);
}

function updateCartCount() {
  let cart = [];
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

  const count = cart.reduce((total, item) => total + parseInt(item.quantity || 1), 0);

  // Update count in localStorage
  localStorage.setItem('cartCount', count.toString());

  // Update UI
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = count;
    element.style.display = count > 0 ? 'flex' : 'none';
  });

  console.log('Cart count updated:', count);
  return count;
}

// Handle star rating clicks
function setupStars() {
  const starElements = document.querySelectorAll(".stars");

  starElements.forEach((starsContainer) => {
    const productName = starsContainer.getAttribute("data-product");
    const stars = starsContainer.querySelectorAll("span");

    // Load saved rating
    const savedRatings = JSON.parse(localStorage.getItem("ratings")) || {};
    const savedRating = savedRatings[productName];

    if (savedRating) {
      updateStarDisplay(stars, savedRating);
    }

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        const rating = index + 1; // Because index starts at 0
        let ratings = JSON.parse(localStorage.getItem("ratings")) || {};
        ratings[productName] = rating;
        localStorage.setItem("ratings", JSON.stringify(ratings));

        updateStarDisplay(stars, rating);
      });
    });
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.innerText = "★";
    } else {
      star.innerText = "☆";
    }
  });
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupStars();
});

function scrollRow(button, direction) {
  const row = button.parentElement.querySelector(".product-row");
  const scrollAmount = 300;
  row.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
}

const userIcon = document.getElementById("userIcon");
const userDropdown = document.getElementById("userDropdown");

if (userIcon && userDropdown) {
  userIcon.addEventListener("click", () => {
    userDropdown.style.display =
      userDropdown.style.display === "flex" ? "none" : "flex";
  });

  // Optional: close dropdown if click outside
  window.addEventListener("click", (e) => {
    if (!document.querySelector(".user-menu").contains(e.target)) {
      userDropdown.style.display = "none";
    }
  });
}

// Optional: close dropdown if click outside
window.addEventListener("click", (e) => {
  const userMenu = document.querySelector(".user-menu");
  const userDropdown = document.getElementById("userDropdown");
  
  if (userMenu && userDropdown && !userMenu.contains(e.target)) {
    userDropdown.style.display = "none";
  }
});

// products.js - Handle product page functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initializeProducts();
  setupSearch();
  setupFilters();
  setupAddToCart();
  setupQuickView();
  
  // Load category-specific products if on a category page
  loadCategoryProducts();
});

// Initialize product-related functionality
function initializeProducts() {
  // Update displayed products based on URL parameters (if any)
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category) {
    // Select the corresponding category in the filter
    const categoryFilter = document.querySelector('.category-filter');
    if (categoryFilter) {
      categoryFilter.value = category;
      filterProductsByCategory(category);
    }
  }
}

// Set up search functionality
function setupSearch() {
  const searchInput = document.querySelector('.search-box input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
      // Show all products if search term is too short
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'block';
      });
      return;
    }
    
    // Filter products based on search term
    document.querySelectorAll('.product-card').forEach(card => {
      const productName = card.querySelector('h3').textContent.toLowerCase();
      const productCategory = card.querySelector('.category').textContent.toLowerCase();
      
      if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Set up category and sort filters
function setupFilters() {
  // Category filter
  const categoryFilter = document.querySelector('.category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      filterProductsByCategory(this.value);
    });
  }
  
  // Sort filter
  const sortFilter = document.querySelector('.sort-filter');
  if (sortFilter) {
    sortFilter.addEventListener('change', function() {
      sortProducts(this.value);
    });
  }
}

// Filter products by category
function filterProductsByCategory(category) {
  // Show/hide product sections based on selected category
  const productSections = document.querySelectorAll('.products-section');
  
  if (category === '') {
    // Show all sections
    productSections.forEach(section => {
      section.style.display = 'block';
    });
    return;
  }
  
  // Show only selected category
  productSections.forEach(section => {
    const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
    
    if (sectionTitle.includes(category.toLowerCase())) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
}

// Sort products by price, name, etc.
function sortProducts(sortType) {
  const productSections = document.querySelectorAll('.products-section');
  
  productSections.forEach(section => {
    const productGrid = section.querySelector('.products-grid');
    const products = Array.from(productGrid.querySelectorAll('.product-card'));
    
    // Sort products based on selected sort type
    switch (sortType) {
      case 'price-low':
        products.sort((a, b) => {
          const priceA = parseFloat(a.querySelector('.current').textContent.replace('$', ''));
          const priceB = parseFloat(b.querySelector('.current').textContent.replace('$', ''));
          return priceA - priceB;
        });
        break;
        
      case 'price-high':
        products.sort((a, b) => {
          const priceA = parseFloat(a.querySelector('.current').textContent.replace('$', ''));
          const priceB = parseFloat(b.querySelector('.current').textContent.replace('$', ''));
          return priceB - priceA;
        });
        break;
        
      case 'newest':
        // For demo purposes, we'll just reverse the current order
        products.reverse();
        break;
        
      default: // 'featured'
        // Reset to original order (based on HTML structure)
        break;
    }
    
    // Re-append sorted products to the grid
    products.forEach(product => {
      productGrid.appendChild(product);
    });
  });
}

// Set up "Add to Cart" functionality
function setupAddToCart() {
  console.log('Setting up Add to Cart functionality');
  // Select all add-to-cart buttons on the page
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  console.log('Found add-to-cart buttons:', addToCartButtons.length);
  
  if (!addToCartButtons.length) return;
  
  addToCartButtons.forEach(button => {
    // Remove any existing event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Add to cart button clicked');
      
      // Get product information from the card
      const productCard = this.closest('.product-card');
      if (!productCard) {
        console.error('Product card not found');
        return;
      }
      
      console.log('Product card found:', productCard);
      
      const productName = productCard.querySelector('h3').textContent;
      const priceElement = productCard.querySelector('.current');
      if (!priceElement) {
        console.error('Price element not found');
        return;
      }
      
      const productPrice = parseFloat(priceElement.textContent.replace('$', ''));
      const categoryElement = productCard.querySelector('.category');
      const productCategory = categoryElement ? categoryElement.textContent : 'General';
      const productId = productCard.dataset.productId || generateProductId(productName);
      
      console.log('Product details:', { productName, productPrice, productCategory, productId });
      
      // Create a product object
      const product = {
        id: productId,
        name: productName,
        price: productPrice.toFixed(2),
        category: productCategory,
        quantity: 1
      };
      
      // Add to cart
      addProductToCart(product);
      
      // Show notification
      showNotification(`${productName} added to cart!`);
      
      // Update cart count
      updateCartCount();
      
      console.log('Product added to cart:', product);
    });
  });
  
  // Also set up direct add to cart functionality for any buttons with class 'direct-add'
  document.querySelectorAll('.direct-add').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productName = this.dataset.name;
      const productPrice = parseFloat(this.dataset.price);
      const productCategory = this.dataset.category || 'General';
      const productId = this.dataset.id || generateProductId(productName);
      
      const product = {
        id: productId,
        name: productName,
        price: productPrice.toFixed(2),
        category: productCategory,
        quantity: 1
      };
      
      addProductToCart(product);
      showNotification(`${productName} added to cart!`);
      updateCartCount();
    });
  });
}

// Generate a simple product ID
function generateProductId(name) {
  return name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
}

// Improved addProductToCart function
function addProductToCart(product) {
  console.log('Adding to cart:', product);
  
  if (!product || !product.name || !product.price) {
    console.error('Invalid product data:', product);
    return;
  }
  
  // Get current cart from localStorage or initialize empty array
  let cart = [];
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
  
  // Check if product already exists in cart
  const existingProductIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingProductIndex !== -1) {
    // Increment quantity if product already in cart
    cart[existingProductIndex].quantity += 1;
    console.log('Updated quantity for existing product');
  } else {
    // Add new product to cart
    cart.push(product);
    console.log('Added new product to cart');
  }
  
  // Save updated cart to localStorage
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
  
  // Update cart count in localStorage for navbar.js
  const cartCount = cart.reduce((total, item) => total + parseInt(item.quantity || 1), 0);
  localStorage.setItem('cartCount', cartCount.toString());
  
  console.log('Current cart:', cart);
  console.log('Total items in cart:', cartCount);
  
  // Dispatch a custom event that other scripts can listen for
  document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart, count: cartCount } }));
}

// Update updateCartCount function
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((total, product) => total + parseInt(product.quantity), 0);

  // Try both ID and class selectors
  const cartCountEls = document.querySelectorAll("#cart-count, .cart-count");

  if (cartCountEls.length === 0) {
    // Silently return if no cart count element is found on this page
    return;
  }

  cartCountEls.forEach(el => {
    el.innerText = count;
    el.style.display = count > 0 ? "flex" : "none";
  });

  console.log("Cart count updated:", count);
}


// Add the enhanced modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to close modal
  const modal = document.querySelector('.quick-view-modal');
  if (modal) {
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Setup quantity controls in modal
    setupModalQuantityControls();
    
    // Setup size selection in modal
    setupModalSizeSelection();
    
    // Setup add to cart from modal
    setupModalAddToCart();
  }
});

// Setup quantity controls in the modal
function setupModalQuantityControls() {
  const modal = document.querySelector('.quick-view-modal');
  if (!modal) return;
  
  const decreaseBtn = modal.querySelector('.quantity-decrease');
  const increaseBtn = modal.querySelector('.quantity-increase');
  const quantityInput = modal.querySelector('.quantity-controls input');
  
  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
    
    increaseBtn.addEventListener('click', function() {
      const currentValue = parseInt(quantityInput.value);
      const maxValue = parseInt(quantityInput.getAttribute('max') || 10);
      if (currentValue < maxValue) {
        quantityInput.value = currentValue + 1;
      }
    });
    
    quantityInput.addEventListener('change', function() {
      const min = parseInt(this.getAttribute('min') || 1);
      const max = parseInt(this.getAttribute('max') || 10);
      let value = parseInt(this.value);
      
      if (isNaN(value) || value < min) {
        this.value = min;
      } else if (value > max) {
        this.value = max;
      }
    });
  }
}

// Setup size selection in the modal
function setupModalSizeSelection() {
  const modal = document.querySelector('.quick-view-modal');
  if (!modal) return;
  
  const sizeButtons = modal.querySelectorAll('.size-buttons button');
  
  sizeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      sizeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
    });
  });
}

// Setup add to cart from modal
function setupModalAddToCart() {
  const modal = document.querySelector('.quick-view-modal');
  if (!modal) return;
  
  const addToCartBtn = modal.querySelector('.modal-add-to-cart');
  
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      // Get product details from modal
      const productName = modal.querySelector('#modal-product-name').textContent;
      const productPrice = parseFloat(modal.querySelector('#modal-product-price').textContent.replace('$', ''));
      const productCategory = modal.querySelector('#modal-product-category').textContent;
      const productId = modal.dataset.productId || generateProductId(productName);
      
      // Get selected size
      const selectedSizeBtn = modal.querySelector('.size-buttons button.active');
      const selectedSize = selectedSizeBtn ? selectedSizeBtn.textContent : 'M'; // Default to M if none selected
      
      // Get quantity
      const quantityInput = modal.querySelector('.quantity-controls input');
      const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
      
      // Create product object
      const product = {
        id: productId + '-' + selectedSize.toLowerCase(), // Make size part of the ID for unique cart items
        name: productName,
        price: productPrice.toFixed(2),
        category: productCategory,
        size: selectedSize,
        quantity: quantity
      };
      
      // Add to cart
      addProductToCart(product);
      
      // Show notification
      showNotification(`${productName} (Size: ${selectedSize}) added to cart!`);
      
      // Update cart count
      updateCartCount();
      
      // Close modal
      modal.style.display = 'none';
      
      console.log('Product added to cart from modal:', product);
    });
  }
}


function showNotification(message) {
  let notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;

  // Style (you can move to CSS file)
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.background = '#27ae60';
  notification.style.color = '#fff';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  notification.style.zIndex = 9999;
  notification.style.fontSize = '16px';
  notification.style.opacity = 0;
  notification.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = 1;
  }, 10);

  // Auto remove after 3s
  setTimeout(() => {
    notification.style.opacity = 0;
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Set up Quick View functionality
function setupQuickView() {
  const quickViewButtons = document.querySelectorAll('.quick-view button');
  
  if (quickViewButtons.length === 0) return;
  
  quickViewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('h3').textContent;
      const productPrice = productCard.querySelector('.current').textContent;
      const productCategory = productCard.querySelector('.category').textContent;
      const productId = productCard.dataset.productId;
      
      // Show product modal with product data
      showQuickViewModal(productName, productPrice, productCategory, '', productId);
    });
  });
}

// Modified showQuickViewModal to properly display product details
function showQuickViewModal(name, price, category, description = '', productId = '') {
  // Get modal element
  let modal = document.querySelector('.quick-view-modal');
  
  if (!modal) {
    console.error('Quick view modal not found in the DOM');
    return;
  }
  
  // Set product details
  document.getElementById('modal-product-name').textContent = name;
  document.getElementById('modal-product-category').textContent = category;
  document.getElementById('modal-product-price').textContent = price;
  
  // Store product ID in dataset for later use
  modal.dataset.productId = productId || generateProductId(name);
  
  // Update description if available
  const descriptionElement = modal.querySelector('.product-description p');
  if (descriptionElement && description) {
    descriptionElement.textContent = description;
  }
  
  // Reset quantity input
  const quantityInput = modal.querySelector('.quantity-controls input');
  if (quantityInput) {
    quantityInput.value = 1;
  }
  
  // Reset size selection
  const sizeButtons = modal.querySelectorAll('.size-buttons button');
  if (sizeButtons.length > 0) {
    sizeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Set medium as default size
    const mediumButton = Array.from(sizeButtons).find(btn => btn.textContent === 'M');
    if (mediumButton) {
      mediumButton.classList.add('active');
    }
  }
  
  // Show modal
  modal.style.display = 'block';
}

// Load products for specific category pages
function loadCategoryProducts() {
  // Check which category page we're on
  const pageUrl = window.location.pathname;
  let category = '';
  
  if (pageUrl.includes('mens-products')) {
    category = 'men';
  } else if (pageUrl.includes('womens-products')) {
    category = 'women';
  } else if (pageUrl.includes('childrens-products')) {
    category = 'children';
  }
  
  // If we're on a category page, load those products
  if (category && productsData[category]) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // Clear any existing products
    productsGrid.innerHTML = '';
    
    // Add each product to the grid
    productsData[category].forEach(product => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  }
}

// Create a product card element
function createProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.dataset.productId = product.id;
  
  // Generate stars based on rating
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }
  
  // Prepare discount badge if there's an old price
  const discountBadge = product.oldPrice ? 
    `<div class="discount-badge">Sale</div>` : '';
  
  // Create HTML for product card
  productCard.innerHTML = `
    <div class="product-image">
      <div class="product-placeholder">
        <i class="fas fa-tshirt"></i>
      </div>
      ${discountBadge}
      <div class="quick-view">
        <button>Quick View</button>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="category">${product.category}</p>
      <div class="price">
        <span class="current">$${product.price.toFixed(2)}</span>
        ${product.oldPrice ? `<span class="old">$${product.oldPrice.toFixed(2)}</span>` : ''}
      </div>
      <div class="rating">
        ${starsHTML}
        <span>(${Math.floor(Math.random() * 50) + 10})</span>
      </div>
      <button class="add-to-cart">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Setup event listeners for this card
  setupProductCardListeners(productCard, product);
  
  return productCard;
}

// Setup event listeners for product card
function setupProductCardListeners(card, product) {
  // Quick view button
  const quickViewBtn = card.querySelector('.quick-view button');
  quickViewBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showQuickViewModal(product.name, `$${product.price.toFixed(2)}`, product.category, product.description, product.id);
  });
  
  // Add to cart button
  const addToCartBtn = card.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Create a product object
    const productObj = {
      id: generateProductId(product.name),
      name: product.name,
      price: product.price.toFixed(2),
      category: product.category,
      quantity: 1
    };
    
    // Add to cart
    addProductToCart(productObj);
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
    
    // Update cart count
    updateCartCount();
  });
}

// Initialize on page load
updateCartCount();
