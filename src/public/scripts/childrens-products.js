// Children's Products Page JavaScript
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
  
  // Get all children's products
  let products = await getChildrensProducts();
  
// Filter products by category if specified in URL
if (categoryParam) {
  products = products.filter(product => {
    // Convert both to lowercase for case-insensitive comparison
    const productCategory = product.category.toLowerCase();
    const paramCategory = categoryParam.toLowerCase();
    
    // Check if the product category contains the parameter category
    // Also check tags and other product attributes
    return productCategory.includes(paramCategory) || 
           (product.tags && product.tags.some(tag => tag.toLowerCase().includes(paramCategory))) ||
           (product.description && product.description.toLowerCase().includes(paramCategory));
  });
    
    // Update page title to reflect the category
    const categoryTitle = document.querySelector('.section-header h2');
    if (categoryTitle) {
      const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      categoryTitle.textContent = `Children's ${formattedCategory}`;
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
      <a href="childrens-products.html" class="btn">View All Children's Products</a>
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
  
  // Add event listener to Add to Cart button
  const addToCartBtn = productCard.querySelector('.add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
    const product = getProductById(addToCartBtn.dataset.id);
    if (product) {
      addProductToCart(product, 1, 'M', '');
      showNotification(`${product.name} added to cart!`);
      updateCartCount();
    }
  });
  }
  
  return productCard;
}

// Initialize quick view functionality
function initQuickView() {
  // Add event listeners to quick view buttons
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('quick-view-btn')) {
      const productId = e.target.dataset.id;
      openQuickView(productId);
    }
  });
  
  // Close modal when clicking the close button or outside the modal
  const modal = document.querySelector('.quick-view-modal');
  const closeBtn = document.querySelector('.close-modal');
  
  if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
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
  const ageFilter = document.querySelector('.age-filter');
  
  // Search filter
  searchInput.addEventListener('input', filterProducts);
  
  // Category filter
  categoryFilter.addEventListener('change', filterProducts);
  
  // Sort filter
  sortFilter.addEventListener('change', filterProducts);
  
  // Age filter
  if (ageFilter) {
    ageFilter.addEventListener('change', filterProducts);
  }
  
  // Initial filter to display products when page loads
  // This ensures products are shown immediately without requiring user interaction
  filterProducts();
}

// Filter and sort products
async function filterProducts() {
  const productsGrid = document.querySelector('.products-grid');
  const categoryFilter = document.querySelector('.category-filter');
  const sortFilter = document.querySelector('.sort-filter');
  const searchInput = document.querySelector('.search-box input');
  
  if (!productsGrid) return;
  
  // Get all products
  let products = await getChildrensProducts();
  
  // Apply category filter
  if (categoryFilter && categoryFilter.value) {
    const category = categoryFilter.value.toLowerCase();
    products = products.filter(product => 
      product.category.toLowerCase().includes(category)
    );
  }
  
  // Apply search filter
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    products = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  if (sortFilter) {
    const sortValue = sortFilter.value;
    
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
      // 'featured' is default, no sorting needed
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
      <button class="btn reset-filters">Reset Filters</button>
    `;
    productsGrid.appendChild(noProductsMessage);
    
    // Add event listener to reset filters button
    const resetBtn = noProductsMessage.querySelector('.reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (categoryFilter) categoryFilter.value = '';
        if (sortFilter) sortFilter.value = 'featured';
        if (searchInput) searchInput.value = '';
        loadProducts();
      });
    }
    
    return;
  }
  
  // Add products to grid
  products.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
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
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector('.notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <p>${message}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Add event listener to close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-remove notification after 3 seconds
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

// Get all children's products
async function getChildrensProducts() {
  try {
    if (window.apiService) {
      // First try to fetch by category
      const categoryProducts = await window.apiService.fetchProductsByCategory("Children's Collection");
      if (categoryProducts && categoryProducts.length > 0) {
        return categoryProducts;
      }
      
      // If no products found by category, try with a more inclusive search
      const products = await window.apiService.fetchProducts({
        search: "children boys girls baby kids"
      });
      if (products && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.error('Error fetching children\'s products from API:', error);
  }
  
  // Return empty array if API fails
  return [];
}
