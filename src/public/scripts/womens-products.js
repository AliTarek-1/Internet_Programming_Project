// Women's Products Page JavaScript
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
  
  // Get all women's products
  let products = await getWomensProducts();
  
  // Filter products by category if specified in URL
  if (categoryParam) {
    products = products.filter(product => {
      // Convert both to lowercase for case-insensitive comparison
      const productCategory = product.category.toLowerCase();
      const paramCategory = categoryParam.toLowerCase();
      
      // Check if the product category contains the parameter category
      return productCategory.includes(paramCategory);
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
      categoryTitle.textContent = `Women's ${formattedCategory}`;
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
      <a href="womens-products.html" class="btn">View All Women's Products</a>
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
        updateCartCount();
        showNotification('Product added to cart!');
        if (modal) {
          modal.style.display = 'none';
        }
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
  
  // Initial filter to display products when page loads
  // This ensures products are shown immediately without requiring user interaction
  filterProducts();
}

// Filter and sort products
async function filterProducts() {
  const searchInput = document.querySelector('.search-box input');
  const categoryFilter = document.querySelector('.category-filter');
  const sortFilter = document.querySelector('.sort-filter');
  
  const searchTerm = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value;
  const sortValue = sortFilter.value;
  
  // Get all women's products
  let filteredProducts = await getWomensProducts();
  
  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by category
  if (categoryValue) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase().includes(categoryValue) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(categoryValue)))
    );
  }
  
  // Sort products
  switch (sortValue) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      filteredProducts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      break;
    default: // 'featured'
      filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }
  
  // Update products grid
  const productsGrid = document.querySelector('.products-grid');
  productsGrid.innerHTML = '';
  
  if (filteredProducts.length === 0) {
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
    filteredProducts.forEach(product => {
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
      price: product.price,
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
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    const count = localStorage.getItem('cartCount') || 0;
    cartCountElement.textContent = count;
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

// Get all women's products
async function getWomensProducts() {
  // Try to fetch from API first
  try {
    if (window.apiService) {
      const products = await window.apiService.fetchProductsByCategory("Women's Collection");
      if (products && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.warn('Error fetching women\'s products from API, falling back to local data:', error);
  }
  
  // Fallback to local data if API fails or returns empty
  return getAllProducts().filter(product => product.category.includes("Women's"));
}

// Mock product data (in a real application, this would come from an API)
function getAllProducts() {
  return [
    // Women's Collection
    {
      id: '1',
      name: 'Blue Denim Jeans',
      category: "Women's Collection",
      price: 125.00,
      oldPrice: 150.00,
      description: 'Premium quality denim jeans with a modern slim fit design. Perfect for casual everyday wear.',
      sku: 'WJ12345',
      rating: 4.5,
      reviews: 24,
      featured: 1,
      date: '2025-01-15',
      tags: ['pants', 'casual']
    },
    {
      id: '2',
      name: 'Floral Shirt',
      category: "Women's Collection",
      price: 55.00,
      description: 'Lightweight floral print shirt made from breathable cotton. Ideal for summer days.',
      sku: 'WS67890',
      rating: 4.0,
      reviews: 18,
      featured: 0,
      date: '2025-02-10',
      tags: ['shirts', 'casual']
    },
    {
      id: '3',
      name: 'Summer Dress',
      category: "Women's Collection",
      price: 89.00,
      oldPrice: 120.00,
      description: 'Elegant summer dress with a floral pattern. Made from lightweight fabric for maximum comfort.',
      sku: 'WD54321',
      rating: 5.0,
      reviews: 32,
      featured: 1,
      date: '2025-01-20',
      tags: ['dresses', 'casual']
    },
    {
      id: '4',
      name: 'Leather Jacket',
      category: "Women's Collection",
      price: 199.00,
      oldPrice: 250.00,
      description: 'Classic leather jacket with a modern twist. Perfect for adding an edge to any outfit.',
      sku: 'WJ98765',
      rating: 4.5,
      reviews: 15,
      featured: 1,
      date: '2025-02-05',
      tags: ['jackets', 'casual']
    },
    {
      id: '13',
      name: 'Striped Blouse',
      category: "Women's Collection",
      price: 45.00,
      description: 'Elegant striped blouse with a modern cut. Perfect for office or casual wear.',
      sku: 'WB13579',
      rating: 4.2,
      reviews: 19,
      featured: 0,
      date: '2025-03-01',
      tags: ['shirts', 'formal']
    },
    {
      id: '14',
      name: 'High-Waisted Skirt',
      category: "Women's Collection",
      price: 75.00,
      oldPrice: 90.00,
      description: 'Stylish high-waisted skirt that flatters any figure. Made from quality fabric with a comfortable fit.',
      sku: 'WS24680',
      rating: 4.6,
      reviews: 23,
      featured: 0,
      date: '2025-02-15',
      tags: ['skirts', 'formal']
    },
    {
      id: '25',
      name: 'Maxi Dress',
      category: "Women's Collection",
      price: 95.00,
      description: 'Elegant maxi dress perfect for summer evenings. Features a flowing design with a flattering silhouette.',
      sku: 'WD12345',
      rating: 4.7,
      reviews: 36,
      featured: 1,
      date: '2025-03-10',
      tags: ['dresses', 'casual']
    },
    {
      id: '26',
      name: 'Knit Cardigan',
      category: "Women's Collection",
      price: 65.00,
      oldPrice: 80.00,
      description: 'Cozy knit cardigan perfect for layering. Features a relaxed fit and soft fabric for maximum comfort.',
      sku: 'WC67890',
      rating: 4.4,
      reviews: 28,
      featured: 0,
      date: '2025-04-01',
      tags: ['sweaters', 'casual']
    },
    {
      id: '27',
      name: 'Tailored Blazer',
      category: "Women's Collection",
      price: 120.00,
      description: 'Professional tailored blazer perfect for the office. Features a modern cut with classic details.',
      sku: 'WB54321',
      rating: 4.8,
      reviews: 31,
      featured: 1,
      date: '2025-03-15',
      tags: ['jackets', 'formal']
    },
    {
      id: '28',
      name: 'Ankle Boots',
      category: "Women's Collection",
      price: 150.00,
      oldPrice: 180.00,
      description: 'Stylish ankle boots made from premium leather. Features a comfortable heel and durable construction.',
      sku: 'WA98765',
      rating: 4.6,
      reviews: 22,
      featured: 0,
      date: '2025-02-20',
      tags: ['shoes', 'casual']
    },
    {
      id: '29',
      name: 'Statement Necklace',
      category: "Women's Collection",
      price: 40.00,
      description: 'Eye-catching statement necklace that elevates any outfit. Features a unique design with quality materials.',
      sku: 'WN13579',
      rating: 4.3,
      reviews: 17,
      featured: 0,
      date: '2025-04-05',
      tags: ['accessories']
    },
    {
      id: '30',
      name: 'Crossbody Bag',
      category: "Women's Collection",
      price: 85.00,
      oldPrice: 100.00,
      description: 'Versatile crossbody bag perfect for everyday use. Features multiple compartments and a stylish design.',
      sku: 'WB24680',
      rating: 4.5,
      reviews: 29,
      featured: 0,
      date: '2025-03-25',
      tags: ['accessories']
    }
  ];
}
