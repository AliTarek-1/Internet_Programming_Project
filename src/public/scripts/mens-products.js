// Men's Products Page JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  // Load API script first if not already loaded
  if (!window.apiService) {
    await loadScript('/scripts/api.js');
  }
  
  // Load products
  await loadProducts();
  
  // Initialize quick view functionality
  initQuickView();
  
  // Initialize filter functionality
  initFilters();
});

// Helper function to load scripts dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Load products into the products grid
async function loadProducts() {
  const productsGrid = document.querySelector('.products-grid');
  
  // Show loading indicator
  productsGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>Loading products...</p></div>';
  
  // Get URL parameters for category filtering
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  // Get all men's products
  let products = await getMensProducts();
  
  // Filter products by category if specified in URL
  if (categoryParam) {
    products = products.filter(product => {
      // Convert parameter to lowercase for case-insensitive comparison
      const paramCategory = categoryParam.toLowerCase();
      
      // Check if any of the product tags match the parameter category
      return product.tags && product.tags.some(tag => tag.toLowerCase() === paramCategory);
    });
    
    // Update the category filter dropdown to match URL parameter
    const categoryFilter = document.querySelector('.category-filter');
    if (categoryFilter) {
      Array.from(categoryFilter.options).forEach(option => {
        if (option.value.toLowerCase() === categoryParam.toLowerCase()) {
          option.selected = true;
        }
      });
    }
    
    // Update page title to reflect the category
    const categoryTitle = document.querySelector('.section-header h2');
    if (categoryTitle) {
      const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      categoryTitle.textContent = `Men's ${formattedCategory}`;
    }
  }
  
  // Clear existing products
  productsGrid.innerHTML = '';
  
  // Show message if no products found
  if (products.length === 0) {
    const noProductsMessage = document.createElement('div');
    noProductsMessage.className = 'no-products-message';
    noProductsMessage.innerHTML = `
      <i class="fas fa-search"></i>
      <h3>No products found</h3>
      <p>We couldn't find any products matching your criteria.</p>
      <a href="mens-products.html" class="btn">View All Men's Products</a>
    `;
    productsGrid.appendChild(noProductsMessage);
    return;
  }
  
  // Add products to grid
  products.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Create product card element
function createProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  
  productCard.innerHTML = `
    <div class="product-image">
      <div class="product-placeholder">
        <i class="fas fa-tshirt"></i>
      </div>
      ${hasDiscount ? '<span class="discount-badge">Sale</span>' : ''}
      <div class="quick-view">
        <button class="quick-view-btn" data-id="${product.id}">Quick View</button>
        <a href="product-details.html?id=${product.id}" class="view-details-btn">View Details</a>
      </div>
    </div>
    <div class="product-info">
      <h3><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
      <p class="category">${product.category}</p>
      <div class="price">
        <span class="current">$${product.price.toFixed(2)}</span>
        ${hasDiscount ? `<span class="old">$${product.oldPrice.toFixed(2)}</span>` : ''}
      </div>
      <div class="rating">
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="${product.rating >= 4.5 ? 'fas' : 'far'} fa-star"></i>
        <span>(${product.reviews})</span>
      </div>
      <button class="add-to-cart" data-id="${product.id}">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Add event listener to "Add to Cart" button
  const addToCartBtn = productCard.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const productId = addToCartBtn.getAttribute('data-id');
    const product = getProductById(productId);
    
    if (product) {
      addProductToCart(product, 1, 'M', '');
      updateCartCount();
      showNotification('Product added to cart!');
    }
  });
  
  // Add event listener to Quick View button
  const quickViewBtn = productCard.querySelector('.quick-view-btn');
  quickViewBtn.addEventListener('click', () => {
    const productId = quickViewBtn.getAttribute('data-id');
    openQuickView(productId);
  });
  
  return productCard;
}

// Initialize quick view functionality
function initQuickView() {
  const quickViewBtns = document.querySelectorAll('.quick-view-btn');
  
  // Add click event to all quick view buttons
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.id;
      openQuickView(productId);
    });
  });
  
  const modal = document.querySelector('.quick-view-modal');
  const closeBtn = document.querySelector('.close-modal');
  
  // Only add event listeners if elements exist
  if (modal && closeBtn) {
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Add to cart from modal
  const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      const productId = modalAddToCartBtn.getAttribute('data-id');
      const product = getProductById(productId);
      
      if (product) {
        addProductToCart(product, 1, 'M', '');
        showNotification(`${product.name} added to cart`);
        document.querySelector('.quick-view-modal').style.display = 'none';
      }
    });
  }
}

// Open quick view modal for a product
function openQuickView(productId) {
  const product = getProductById(productId);
  
  if (!product) return;
  
  // Update modal content with product details
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-category').textContent = product.category;
  
  const priceElement = document.getElementById('modal-product-price');
  if (product.oldPrice) {
    priceElement.innerHTML = `<span class="current">$${product.price.toFixed(2)}</span> <span class="old">$${product.oldPrice.toFixed(2)}</span>`;
  } else {
    priceElement.innerHTML = `<span class="current">$${product.price.toFixed(2)}</span>`;
  }
  
  document.getElementById('modal-product-description').textContent = product.description;
  
  // Update "Add to Cart" button with product ID
  const addToCartBtn = document.querySelector('.modal-add-to-cart');
  addToCartBtn.setAttribute('data-id', productId);
  
  // Update "View Details" button with product ID
  const viewDetailsBtn = document.querySelector('.modal-view-details');
  viewDetailsBtn.href = `product-details.html?id=${productId}`;
  
  // Show modal
  document.querySelector('.quick-view-modal').style.display = 'flex';
}

// Initialize filter functionality
function initFilters() {
  const searchInput = document.querySelector('.search-box input');
  const categoryFilter = document.querySelector('.category-filter');
  const sortFilter = document.querySelector('.sort-filter');
  
  // Search filter
  searchInput.addEventListener('input', filterProducts);
  
  // Category filter
  categoryFilter.addEventListener('change', filterProducts);
  
  // Sort filter
  sortFilter.addEventListener('change', filterProducts);
}

// Filter and sort products
async function filterProducts() {
  const searchInput = document.querySelector('.search-box input');
  const categoryFilter = document.querySelector('.category-filter');
  const sortFilter = document.querySelector('.sort-filter');
  
  // Get filter values
  const searchTerm = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value.toLowerCase();
  const sortValue = sortFilter.value;
  
  // Get all products
  let products = getMensProducts();
  
  // Filter by search term
  if (searchTerm) {
    products = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by category
  if (categoryValue) {
    products = products.filter(product => {
      // For 'shirts', 'pants', 'jackets', etc. - check the tags array
      return product.tags && product.tags.some(tag => tag.toLowerCase() === categoryValue);
    });
  }
  
  // Sort products
  switch (sortValue) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      products.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    default: // 'featured'
      products.sort((a, b) => b.featured - a.featured);
      break;
  }
  
  // Update products grid
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = '';
  
  if (products.length === 0) {
    // Show no results message
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <i class="fas fa-search"></i>
      <h3>No products found</h3>
      <p>Try adjusting your search or filter criteria</p>
    `;
    productsGrid.appendChild(noResults);
  } else {
    // Add filtered products to grid
    products.forEach(product => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  }
}

// Add product to cart in localStorage
function addProductToCart(product, quantity, size, color) {
  // Get existing cart or initialize empty array
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already exists in cart
  const existingProductIndex = cart.findIndex(item => 
    item.id === product.id && item.size === size && item.color === color
  );
  
  if (existingProductIndex !== -1) {
    // Update quantity if product already in cart
    cart[existingProductIndex].quantity += quantity;
  } else {
    // Add new product to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price), // Ensure price is stored as a number
      category: product.category,
      size: size,
      color: color,
      quantity: quantity
    });
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  localStorage.setItem('cartCount', cartCount);
}

// Update cart count in navbar
function updateCartCount() {
  // Use the global updateCartCountDisplay function if available
  if (typeof updateCartCountDisplay === 'function') {
    updateCartCountDisplay();
  } else {
    // Fallback to updating just the current page's cart count
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      const count = localStorage.getItem('cartCount') || 0;
      element.textContent = count;
    });
  }
}

// Show notification
function showNotification(message) {
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
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
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

// Get product by ID
function getProductById(productId) {
  const products = getAllProducts();
  return products.find(product => product.id === productId);
}

// Get all men's products
async function getMensProducts() {
  // Try to fetch from API first
  try {
    if (window.apiService) {
      const products = await window.apiService.fetchProductsByCategory("Men's Collection");
      if (products && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.warn('Error fetching men\'s products from API, falling back to local data:', error);
  }
  
  // Fallback to local data if API fails or returns empty
  return getAllProducts().filter(product => product.category.includes("Men's"));
}

// Mock product data (in a real application, this would come from an API)
function getAllProducts() {
  return [
    // Men's Collection
    {
      id: '5',
      name: 'Classic White Shirt',
      category: "Men's Collection",
      price: 65.00,
      description: 'Timeless white shirt made from premium cotton. A wardrobe essential for every man.',
      sku: 'MS12345',
      rating: 4.8,
      reviews: 42,
      featured: 1,
      date: '2025-01-15',
      tags: ['shirts', 'formal']
    },
    {
      id: '6',
      name: 'Navy Blue Blazer',
      category: "Men's Collection",
      price: 175.00,
      oldPrice: 220.00,
      description: 'Sophisticated navy blue blazer perfect for formal occasions. Tailored fit with premium details.',
      sku: 'MB67890',
      rating: 4.7,
      reviews: 28,
      featured: 1,
      date: '2025-02-10',
      tags: ['jackets', 'formal']
    },
    {
      id: '7',
      name: 'Slim Fit Chinos',
      category: "Men's Collection",
      price: 85.00,
      description: 'Versatile slim fit chinos that transition seamlessly from casual to smart casual occasions.',
      sku: 'MC54321',
      rating: 4.5,
      reviews: 36,
      featured: 0,
      date: '2025-01-20',
      tags: ['pants', 'casual']
    },
    {
      id: '8',
      name: 'Wool Sweater',
      category: "Men's Collection",
      price: 95.00,
      oldPrice: 120.00,
      description: 'Warm and comfortable wool sweater, perfect for colder days. Features a classic design.',
      sku: 'MS98765',
      rating: 4.3,
      reviews: 22,
      featured: 0,
      date: '2025-02-05',
      tags: ['sweaters', 'casual']
    },
    {
      id: '15',
      name: 'Casual Polo Shirt',
      category: "Men's Collection",
      price: 40.00,
      description: 'Classic polo shirt with a modern fit. Perfect for casual occasions and everyday wear.',
      sku: 'MP13579',
      rating: 4.4,
      reviews: 31,
      featured: 0,
      date: '2025-03-01',
      tags: ['shirts', 'casual']
    },
    {
      id: '16',
      name: 'Leather Belt',
      category: "Men's Collection",
      price: 35.00,
      oldPrice: 45.00,
      description: 'Premium leather belt with a classic buckle. A timeless accessory for any outfit.',
      sku: 'MB24680',
      rating: 4.7,
      reviews: 26,
      featured: 0,
      date: '2025-02-15',
      tags: ['accessories']
    },
    {
      id: '19',
      name: 'Denim Jacket',
      category: "Men's Collection",
      price: 110.00,
      description: 'Classic denim jacket with a modern fit. Perfect for layering in any season.',
      sku: 'MJ12345',
      rating: 4.6,
      reviews: 33,
      featured: 1,
      date: '2025-03-10',
      tags: ['jackets', 'casual']
    },
    {
      id: '20',
      name: 'Graphic T-Shirt',
      category: "Men's Collection",
      price: 30.00,
      oldPrice: 40.00,
      description: 'Comfortable cotton t-shirt featuring a unique graphic design. Great for casual everyday wear.',
      sku: 'MT67890',
      rating: 4.2,
      reviews: 45,
      featured: 0,
      date: '2025-04-01',
      tags: ['shirts', 'casual']
    },
    {
      id: '21',
      name: 'Slim Fit Jeans',
      category: "Men's Collection",
      price: 75.00,
      description: 'Classic slim fit jeans made from premium denim. Versatile and comfortable for everyday wear.',
      sku: 'MJ54321',
      rating: 4.5,
      reviews: 38,
      featured: 1,
      date: '2025-03-15',
      tags: ['pants', 'casual']
    },
    {
      id: '22',
      name: 'Formal Dress Shoes',
      category: "Men's Collection",
      price: 120.00,
      oldPrice: 150.00,
      description: 'Elegant leather dress shoes perfect for formal occasions. Features a classic design with modern comfort.',
      sku: 'MS98765',
      rating: 4.8,
      reviews: 29,
      featured: 0,
      date: '2025-02-20',
      tags: ['shoes', 'formal']
    },
    {
      id: '23',
      name: 'Patterned Socks',
      category: "Men's Collection",
      price: 15.00,
      description: 'Colorful patterned socks made from comfortable cotton blend. Add a touch of personality to any outfit.',
      sku: 'MS13579',
      rating: 4.3,
      reviews: 52,
      featured: 0,
      date: '2025-04-05',
      tags: ['accessories']
    },
    {
      id: '24',
      name: 'Leather Wallet',
      category: "Men's Collection",
      price: 45.00,
      oldPrice: 60.00,
      description: 'Premium leather wallet with multiple card slots and a sleek design. Perfect for everyday use.',
      sku: 'MW24680',
      rating: 4.7,
      reviews: 41,
      featured: 0,
      date: '2025-03-25',
      tags: ['accessories']
    }
  ];
}
