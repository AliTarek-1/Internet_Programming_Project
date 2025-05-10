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
  
  if (!productsGrid) {
    console.error('Products grid element not found');
    return;
  }
  
  // Show loading indicator
  productsGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>Loading products...</p></div>';
  
  // Get URL parameters for category filtering
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  // Get products from API
  let products = await getMensProducts();
  
  // Filter by category if specified in URL
  if (categoryParam) {
    const paramCategory = categoryParam.toLowerCase();
    products = products.filter(product => {
      // Check in multiple places where category info might be stored
      const productCategory = (product.category || '').toLowerCase();
      const productSubcategory = (product.subcategory || '').toLowerCase();
      const productTags = product.tags || [];
      const productName = (product.name || '').toLowerCase();
      const productType = (product.type || '').toLowerCase();
      
      return productCategory.includes(paramCategory) || 
             productSubcategory.includes(paramCategory) || 
             productName.includes(paramCategory) ||
             productType === paramCategory ||
             (Array.isArray(productTags) && productTags.some(tag => 
               tag.toLowerCase().includes(paramCategory)));
    });
    
    // Update the category filter dropdown to match URL parameter
    const categoryFilter = document.querySelector('.category-filter');
    if (categoryFilter) {
      Array.from(categoryFilter.options).forEach(option => {
        if (option.value.toLowerCase() === paramCategory) {
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
  
  // Clear loading indicator
  productsGrid.innerHTML = '';
  
  // Show message if no products found
  if (!products || products.length === 0) {
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
  if (!product || typeof product !== 'object') {
    console.error('Invalid product data');
    return document.createElement('div');
  }
  
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  productCard.setAttribute('data-id', product._id || product.productID || '');
  
  // Ensure we have valid image path
  let imagePath = product.image || '/images/products/product-placeholder.jpg';
  
  // Fix image paths that are returning 404
  if (imagePath.includes('/images/products/mens/')) {
    // Use a placeholder image instead
    imagePath = '/images/products/product-placeholder.jpg';
  }
  
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
  addToCartBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const productId = addToCartBtn.getAttribute('data-id');
    // Use await to get the product data
    const product = await getProductById(productId);
    
    if (product) {
      addProductToCart(product, 1, 'M', '');
      updateCartCount();
      showNotification(`${product.name} added to cart!`);
    } else {
      console.error('Could not retrieve product data for ID:', productId);
      showNotification('Error adding product to cart', 'error');
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
    modalAddToCartBtn.addEventListener('click', async () => {
      const productId = modalAddToCartBtn.getAttribute('data-id');
      // Use await to get the product data
      const product = await getProductById(productId);
      
      if (product) {
        addProductToCart(product, 1, 'M', '');
        showNotification(`${product.name} added to cart`);
        document.querySelector('.quick-view-modal').style.display = 'none';
      } else {
        console.error('Could not retrieve product data for ID:', productId);
        showNotification('Error adding product to cart', 'error');
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
    console.log(`[DEBUG] Filtering by category: ${categoryValue}`);
    
    products = products.filter(product => {
      // Check in multiple places where category info might be stored
      
      // 1. Check in tags array
      const hasTags = product.tags && Array.isArray(product.tags);
      if (hasTags && product.tags.some(tag => tag.toLowerCase() === categoryValue)) {
        console.log(`[DEBUG] Product ${product.name} matched by tags`);
        return true;
      }
      
      // 2. Check in category field
      if (product.category && product.category.toLowerCase().includes(categoryValue)) {
        console.log(`[DEBUG] Product ${product.name} matched by category field`);
        return true;
      }
      
      // 3. Check in subcategory field
      if (product.subcategory && product.subcategory.toLowerCase() === categoryValue) {
        console.log(`[DEBUG] Product ${product.name} matched by subcategory field`);
        return true;
      }
      
      // 4. Check in product name
      if (product.name && product.name.toLowerCase().includes(categoryValue)) {
        console.log(`[DEBUG] Product ${product.name} matched by name`);
        return true;
      }
      
      // 5. Check in product type
      if (product.type && product.type.toLowerCase() === categoryValue) {
        console.log(`[DEBUG] Product ${product.name} matched by type`);
        return true;
      }
      
      return false;
    });
    
    console.log(`[DEBUG] Found ${products.length} products matching category: ${categoryValue}`);
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
  // Debug product data
  console.log('Adding product to cart:', product);
  
  // Validate product data
  if (!product) {
    console.error('Cannot add undefined product to cart');
    return;
  }
  
  // Ensure product has all required properties
  const productToAdd = {
    id: product._id || product.id || generateProductId(product.name || 'Product'),
    name: product.name || 'Unknown Product',
    price: parseFloat(product.price) || 0,
    category: product.category || 'Uncategorized',
    image: product.image || '/images/product-placeholder.jpg',
    size: size || 'M',
    color: color || '',
    quantity: quantity || 1
  };
  
  // Get existing cart or initialize empty array
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already exists in cart
  const existingProductIndex = cart.findIndex(item => 
    item.id === productToAdd.id && item.size === productToAdd.size && item.color === productToAdd.color
  );
  
  if (existingProductIndex !== -1) {
    // Update quantity if product already in cart
    cart[existingProductIndex].quantity += productToAdd.quantity;
  } else {
    // Add new product to cart
    cart.push(productToAdd);
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  localStorage.setItem('cartCount', cartCount);
  
  console.log('Cart updated:', cart);
}

// Generate a unique product ID
function generateProductId(name) {
  // Create a slug from the name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Add a timestamp and random number for uniqueness
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return `${slug}-${timestamp}-${random}`;
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
function showNotification(message, type = 'success') {
  // Check if notification container exists
  let notificationContainer = document.querySelector('.notification-container');
  
  // Create notification container if it doesn't exist
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.bottom = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Set styles based on type
  notification.style.padding = '12px 20px';
  notification.style.margin = '10px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.transition = 'all 0.3s ease';
  
  // Set color based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
      <span>${message}</span>
    `;
  } else if (type === 'error') {
    notification.style.backgroundColor = '#F44336';
    notification.style.color = 'white';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
      <span>${message}</span>
    `;
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#FF9800';
    notification.style.color = 'white';
    notification.innerHTML = `
      <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
      <span>${message}</span>
    `;
  } else {
    notification.style.backgroundColor = '#2196F3';
    notification.style.color = 'white';
    notification.innerHTML = `
      <i class="fas fa-info-circle" style="margin-right: 10px;"></i>
      <span>${message}</span>
    `;
  }
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
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
  try {
    if (window.apiService) {
      const products = await window.apiService.fetchProductsByCategory("Men's Collection");
      
      if (products && products.length > 0) {
        return products;
      }
    } else {
      console.error('API service not found');
    }
  } catch (error) {
    console.error('Error fetching men\'s products from API:', error);
  }
  
  // Return empty array if API fails
  return [];
}
