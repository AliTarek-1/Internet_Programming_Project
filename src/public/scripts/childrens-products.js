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
        ${hasDiscount ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
        <span class="current-price">$${product.price.toFixed(2)}</span>
      </div>
      <button class="add-to-cart-btn" data-id="${product.id}">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Add event listener to Add to Cart button
  const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
  addToCartBtn.addEventListener('click', () => {
    const product = getProductById(addToCartBtn.dataset.id);
    if (product) {
      addProductToCart(product, 1, 'M', '');
      showNotification(`${product.name} added to cart!`);
      updateCartCount();
    }
  });
  
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
function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;
  
  const modal = document.querySelector('.quick-view-modal');
  const productName = document.getElementById('modal-product-name');
  const productCategory = document.getElementById('modal-product-category');
  const productPrice = document.getElementById('modal-product-price');
  
  if (modal && productName && productCategory && productPrice) {
    productName.textContent = product.name;
    productCategory.textContent = product.category;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    
    // Add event listener to Add to Cart button in modal
    const addToCartBtn = document.querySelector('.modal-add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.onclick = () => {
        const quantity = parseInt(document.querySelector('.quantity-controls input').value);
        const size = document.querySelector('.size-buttons button.active')?.textContent || 'M';
        
        addProductToCart(product, quantity, size, '');
        showNotification(`${product.name} added to cart!`);
        updateCartCount();
        modal.style.display = 'none';
      };
    }
    
    modal.style.display = 'block';
  }
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
  let products = getChildrensProducts();
  
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
function getProductById(productId) {
  const products = getAllProducts();
  return products.find(product => product.id === productId);
}

// Get all children's products
async function getChildrensProducts() {
  // Try to fetch from API first with broader category matching
  try {
    if (window.apiService) {
      // Try with a more inclusive search
      const products = await window.apiService.fetchProducts({
        search: "children boys girls baby kids"
      });
      if (products && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.warn('Error fetching children\'s products from API:', error);
  }
  
  // Fallback to local data with broader matching
  return getAllProducts().filter(product => 
    product.category.toLowerCase().includes("children") || 
    product.category.toLowerCase().includes("boys") || 
    product.category.toLowerCase().includes("girls") || 
    product.category.toLowerCase().includes("baby") ||
    product.category.toLowerCase().includes("kids") ||
    (product.tags && product.tags.some(tag => 
      tag.toLowerCase().includes("children") || 
      tag.toLowerCase().includes("kids") || 
      tag.toLowerCase().includes("boys") || 
      tag.toLowerCase().includes("girls") || 
      tag.toLowerCase().includes("baby")
    )) ||
    (product.description && (
      product.description.toLowerCase().includes("children") ||
      product.description.toLowerCase().includes("boys") ||
      product.description.toLowerCase().includes("girls") ||
      product.description.toLowerCase().includes("baby")
    ))
  );
}
// Mock product data (in a real application, this would come from an API)
function getAllProducts() {
  return [
    // Men's Products
    {
      id: 'm1',
      name: 'Classic Oxford Shirt',
      category: "Men's Collection",
      price: 49.99,
      oldPrice: null,
      description: 'A timeless oxford shirt perfect for any occasion. Made from premium cotton for comfort and durability.',
      sku: 'MS12345',
      rating: 4.5,
      reviews: 128,
      date: '2023-01-15'
    },
    {
      id: 'm2',
      name: 'Slim Fit Chinos',
      category: "Men's Collection",
      price: 59.99,
      oldPrice: 79.99,
      description: 'Modern slim fit chinos that offer both style and comfort. Perfect for casual and semi-formal occasions.',
      sku: 'MP67890',
      rating: 4.3,
      reviews: 95,
      date: '2023-02-10'
    },
    {
      id: 'm3',
      name: 'Wool Blend Blazer',
      category: "Men's Collection",
      price: 129.99,
      oldPrice: null,
      description: 'A sophisticated wool blend blazer that elevates any outfit. Features a modern cut and premium materials.',
      sku: 'MJ54321',
      rating: 4.7,
      reviews: 62,
      date: '2023-03-05'
    },
    {
      id: 'm4',
      name: 'Premium Denim Jeans',
      category: "Men's Collection",
      price: 69.99,
      oldPrice: 89.99,
      description: 'High-quality denim jeans with a perfect fit. Durable and comfortable for everyday wear.',
      sku: 'MJ98765',
      rating: 4.4,
      reviews: 107,
      date: '2023-04-20'
    },
    {
      id: 'm5',
      name: 'Casual Polo Shirt',
      category: "Men's Collection",
      price: 39.99,
      oldPrice: null,
      description: 'A versatile polo shirt made from soft cotton piqué. Perfect for casual outings and weekend wear.',
      sku: 'MS13579',
      rating: 4.2,
      reviews: 83,
      date: '2023-05-15'
    },
    {
      id: 'm6',
      name: 'Leather Derby Shoes',
      category: "Men's Collection",
      price: 119.99,
      oldPrice: 149.99,
      description: 'Classic leather derby shoes crafted with attention to detail. Comfortable and stylish for formal occasions.',
      sku: 'MS24680',
      rating: 4.6,
      reviews: 45,
      date: '2023-06-10'
    },
    
    // Women's Products
    {
      id: 'w1',
      name: 'Floral Print Dress',
      category: "Women's Collection",
      price: 79.99,
      oldPrice: 99.99,
      description: 'A beautiful floral print dress perfect for spring and summer. Made from lightweight, breathable fabric.',
      sku: 'WD12345',
      rating: 4.6,
      reviews: 112,
      date: '2023-01-20'
    },
    {
      id: 'w2',
      name: 'High-Waisted Jeans',
      category: "Women's Collection",
      price: 69.99,
      oldPrice: null,
      description: 'Flattering high-waisted jeans with a perfect fit. Versatile and comfortable for everyday wear.',
      sku: 'WP67890',
      rating: 4.4,
      reviews: 98,
      date: '2023-02-15'
    },
    {
      id: 'w3',
      name: 'Silk Blouse',
      category: "Women's Collection",
      price: 89.99,
      oldPrice: 109.99,
      description: 'Elegant silk blouse that transitions seamlessly from office to evening. Features a timeless design.',
      sku: 'WS54321',
      rating: 4.7,
      reviews: 76,
      date: '2023-03-10'
    },
    {
      id: 'w4',
      name: 'Tailored Blazer',
      category: "Women's Collection",
      price: 119.99,
      oldPrice: null,
      description: 'A sophisticated tailored blazer that adds polish to any outfit. Perfect for professional settings.',
      sku: 'WJ98765',
      rating: 4.5,
      reviews: 64,
      date: '2023-04-25'
    },
    {
      id: 'w5',
      name: 'Knit Sweater',
      category: "Women's Collection",
      price: 59.99,
      oldPrice: 79.99,
      description: 'Cozy knit sweater perfect for cooler weather. Made from soft, high-quality yarn for maximum comfort.',
      sku: 'WS13579',
      rating: 4.3,
      reviews: 87,
      date: '2023-05-20'
    },
    {
      id: 'w6',
      name: 'Leather Ankle Boots',
      category: "Women's Collection",
      price: 129.99,
      oldPrice: 159.99,
      description: 'Stylish leather ankle boots that complement any outfit. Features a comfortable heel and durable construction.',
      sku: 'WS24680',
      rating: 4.8,
      reviews: 53,
      date: '2023-06-15'
    },
    
    // Children's Products
    {
      id: 'c1',
      name: 'Dinosaur Print T-Shirt',
      category: "Children's Collection",
      price: 24.99,
      oldPrice: null,
      description: 'Fun dinosaur print t-shirt that kids will love. Made from soft, comfortable cotton.',
      sku: 'CS12345',
      rating: 4.7,
      reviews: 89,
      date: '2023-01-25'
    },
    {
      id: 'c2',
      name: 'Denim Overalls',
      category: "Children's Collection",
      price: 34.99,
      oldPrice: 44.99,
      description: 'Adorable and durable denim overalls perfect for playtime. Features adjustable straps for a perfect fit.',
      sku: 'CP67890',
      rating: 4.5,
      reviews: 72,
      date: '2023-02-20'
    },
    {
      id: 'c3',
      name: 'Colorful Sneakers',
      category: "Children's Collection",
      price: 29.99,
      oldPrice: null,
      description: 'Bright and colorful sneakers that are both stylish and comfortable. Perfect for active kids.',
      sku: 'CS54321',
      rating: 4.6,
      reviews: 65,
      date: '2023-03-15'
    },
    {
      id: 'c4',
      name: 'Hooded Sweatshirt',
      category: "Children's Collection",
      price: 27.99,
      oldPrice: 34.99,
      description: 'Cozy hooded sweatshirt perfect for cooler days. Made from soft, warm fabric for maximum comfort.',
      sku: 'CJ98765',
      rating: 4.4,
      reviews: 58,
      date: '2023-04-30'
    },
    {
      id: 'c5',
      name: 'Patterned Leggings',
      category: "Children's Collection",
      price: 19.99,
      oldPrice: null,
      description: 'Fun patterned leggings that are both comfortable and stylish. Perfect for everyday wear.',
      sku: 'CP13579',
      rating: 4.3,
      reviews: 47,
      date: '2023-05-25'
    },
    {
      id: 'c6',
      name: 'Cartoon Character Pajamas',
      category: "Children's Collection",
      price: 29.99,
      oldPrice: 39.99,
      description: 'Soft and cozy pajamas featuring popular cartoon characters. Perfect for a good night\'s sleep.',
      sku: 'CP24680',
      rating: 4.8,
      reviews: 37,
      date: '2023-06-20'
    }
  ];
}
