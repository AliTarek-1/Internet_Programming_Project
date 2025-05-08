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
  console.log('[DEBUG] Starting to load products');
  const productsGrid = document.querySelector('.products-grid');
  
  if (!productsGrid) {
    console.error('[DEBUG] Products grid element not found');
    return;
  }
  
  // Show loading indicator
  productsGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>Loading products...</p></div>';
  
  // Get URL parameters for category filtering
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  console.log(`[DEBUG] Category parameter from URL: ${categoryParam || 'none'}`);
  
  // Get all men's products
  console.log('[DEBUG] Calling getMensProducts()');
  let products = await getMensProducts();
  console.log(`[DEBUG] Received ${products ? products.length : 0} products from getMensProducts()`);
  console.log('[DEBUG] First few products:', products.slice(0, 2));
  
  // Filter products by category if specified in URL
  if (categoryParam) {
    console.log(`[DEBUG] Filtering products by category: ${categoryParam}`);
    const originalCount = products.length;
    
    products = products.filter(product => {
      // Convert parameter to lowercase for case-insensitive comparison
      const paramCategory = categoryParam.toLowerCase();
      
      // Check if any of the product tags match the parameter category
      const hasTags = product.tags && Array.isArray(product.tags);
      console.log(`[DEBUG] Product ${product.name} has tags: ${hasTags ? 'yes' : 'no'}`);
      
      if (hasTags) {
        return product.tags.some(tag => tag.toLowerCase() === paramCategory);
      }
      return false;
    });
    
    console.log(`[DEBUG] After filtering: ${products.length} products (from ${originalCount})`);
    
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
  if (!products || products.length === 0) {
    console.log('[DEBUG] No products found, showing message');
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
  console.log(`[DEBUG] Adding ${products.length} products to grid`);
  products.forEach((product, index) => {
    console.log(`[DEBUG] Creating product card for product ${index + 1}: ${product.name}`);
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
  console.log('[DEBUG] Finished adding products to grid');
}

// Generate star rating HTML based on rating value
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let starsHtml = '';
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  
  // Add half star if needed
  if (halfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  return starsHtml;
}

// Create product card element
function createProductCard(product) {
  console.log(`[DEBUG] Creating product card for:`, product);
  
  if (!product || typeof product !== 'object') {
    console.error('[DEBUG] Invalid product data:', product);
    return document.createElement('div');
  }
  
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.setAttribute('data-id', product._id || product.productID || '');
  
  // Ensure we have valid image path
  let imagePath = product.image || '/images/product-placeholder.jpg';
  
  // If the image path doesn't start with '/', add the base path
  if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    imagePath = '/images/product-placeholder.jpg';
  }
  
  // Handle discount calculation
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  
  // Create the product card structure
  productCard.innerHTML = `
    <div class="product-image">
      ${imagePath ? `<img src="${imagePath}" alt="${product.name}" class="product-img">` : `
      <div class="product-placeholder">
        <i class="fas fa-tshirt"></i>
      </div>
      `}
      ${hasDiscount ? '<span class="discount-badge">Sale</span>' : ''}
      <div class="quick-view">
        <button class="quick-view-btn" data-id="${product._id || product.productID}">Quick View</button>
        <a href="product-details.html?id=${product._id || product.productID}" class="view-details-btn">View Details</a>
      </div>
    </div>
    <div class="product-info">
      <h3><a href="product-details.html?id=${product._id || product.productID}">${product.name}</a></h3>
      <p class="category">${product.category}</p>
      <div class="price">
        <span class="current">$${product.price.toFixed(2)}</span>
        ${hasDiscount ? `<span class="old">$${product.oldPrice.toFixed(2)}</span>` : ''}
      </div>
      <div class="rating">
        ${generateStarRating(product.averageRating || product.rating || 0)}
        <span class="review-count">(${product.totalReviews || product.reviews || 0})</span>
      </div>
      <button class="add-to-cart" data-id="${product._id || product.productID}">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Add error handler for the image
  const productImg = productCard.querySelector('.product-img');
  if (productImg) {
    productImg.addEventListener('error', function() {
      this.src = '/images/product-placeholder.jpg';
      this.parentElement.classList.add('image-error');
    });
  }
  
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
async function openQuickView(productId) {
  const product = await getProductById(productId);
  
  if (!product) {
    console.error('Product not found');
    return;
  }
  
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
  let products = await getMensProducts();
  
  // Ensure products is an array before filtering and sorting
  if (!Array.isArray(products)) {
    console.error('[DEBUG] Products is not an array:', products);
    products = [];
  }
  
  console.log(`[DEBUG] Got ${products.length} products for filtering`);
  
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
  
  console.log(`[DEBUG] After filtering: ${products.length} products, sorting by: ${sortValue}`);
  
  // Sort products
  if (products.length > 0) {
    switch (sortValue) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        break;
      default: // 'featured'
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
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
async function getProductById(productId) {
  try {
    if (window.apiService) {
      return await window.apiService.fetchProductById(productId);
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
  }
  return null;
}

// Get all men's products
async function getMensProducts() {
  console.log('[DEBUG] getMensProducts() called');
  try {
    if (window.apiService) {
      console.log('[DEBUG] apiService exists, calling fetchProductsByCategory');
      const products = await window.apiService.fetchProductsByCategory("Men's Collection");
      console.log(`[DEBUG] fetchProductsByCategory returned:`, products);
      
      if (products && products.length > 0) {
        console.log(`[DEBUG] Returning ${products.length} products`);
        return products;
      } else {
        console.log('[DEBUG] No products returned from API');
      }
    } else {
      console.error('[DEBUG] apiService not found');
    }
  } catch (error) {
    console.error('[DEBUG] Error fetching men\'s products from API:', error);
  }
  
  // Return empty array if API fails
  console.log('[DEBUG] Returning empty array');
  return [];
}
