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
    console.log(`[DEBUG] URL parameter category: ${categoryParam}`);
    
    // Use the more detailed filterProducts function with the category parameter
    products = await filterProducts(products, {
      category: categoryParam,
      search: '',
      price: '',
      sort: 'default'
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
  
  // Initial filter to display products when page loads
  // This ensures products are shown immediately without requiring user interaction
  filterProducts();
}

// Filter and sort products
async function filterProducts(productsToFilter, filterOptions) {
  // Handle both UI filtering and programmatic filtering
  let searchTerm = '';
  let categoryValue = '';
  let sortValue = 'default';
  let priceRange = '';
  
  // If filterOptions is provided, use those values
  if (filterOptions) {
    searchTerm = filterOptions.search || '';
    categoryValue = filterOptions.category || '';
    sortValue = filterOptions.sort || 'default';
    priceRange = filterOptions.price || '';
  } else {
    // Otherwise get values from UI elements
    const searchInput = document.querySelector('.search-box input');
    const categoryFilter = document.querySelector('.category-filter');
    const sortFilter = document.querySelector('.sort-filter');
    
    searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    categoryValue = categoryFilter ? categoryFilter.value : '';
    sortValue = sortFilter ? sortFilter.value : 'default';
  }
  
  // Use provided products or fetch them if not provided
  let filteredProducts = productsToFilter || await getWomensProducts();
  
  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      (product.name && product.name.toLowerCase().includes(searchTerm)) || 
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by category
  if (categoryValue) {
    console.log(`[DEBUG] Filtering by category: ${categoryValue}`);
    
    // Define comprehensive category mapping to standardize filtering
    const categoryMapping = {
      'dresses': ['dress', 'gown', 'frock', 'wrap dress'],
      'tops': ['top', 'blouse', 'shirt', 'tee', 't-shirt', 'sweater', 'blazer', 'jacket'],
      'bottoms': ['pants', 'jeans', 'skirts', 'skirt', 'trousers', 'leggings', 'shorts'],
      'pants': ['pants', 'jeans', 'trousers', 'leggings', 'shorts'],
      'skirts': ['skirt', 'skirts'],
      'shoes': ['shoes', 'boots', 'sandals', 'heels', 'flats', 'sneakers', 'footwear'],
      'accessories': ['accessories', 'jewelry', 'necklace', 'bracelet', 'earrings', 'handbag', 'purse', 'bag', 'scarf']
    };
    
    // Get the normalized category value and related keywords
    const normalizedCategory = categoryValue.toLowerCase();
    const categoryKeywords = categoryMapping[normalizedCategory] || [normalizedCategory];
    
    console.log(`[DEBUG] Using category keywords:`, categoryKeywords);
    
    // Filter products that match the category keywords
    filteredProducts = filteredProducts.filter(product => {
      // First, ensure the product is from the women's collection
      const isWomensProduct = product.category && 
        product.category.toLowerCase().includes("women");
      
      if (!isWomensProduct) {
        console.log(`[DEBUG] Skipping non-women's product: ${product.name}`);
        return false;
      }
      
      // Check if product subcategory matches any of our keywords
      if (product.subcategory) {
        const matchesSubcategory = categoryKeywords.some(keyword => 
          product.subcategory.toLowerCase().includes(keyword)
        );
        
        if (matchesSubcategory) {
          console.log(`[DEBUG] Product matched by subcategory: ${product.name} (${product.subcategory})`);
          return true;
        }
      }
      
      // Check product name, type, and tags
      const name = (product.name || '').toLowerCase();
      const type = (product.type || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      
      // Check if any of the keywords match the product properties
      const matchesKeywords = categoryKeywords.some(keyword => 
        name.includes(keyword) || 
        type.includes(keyword) || 
        desc.includes(keyword) ||
        (product.tags && Array.isArray(product.tags) && 
         product.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(keyword)))
      );
      
      if (matchesKeywords) {
        console.log(`[DEBUG] Product matched by keywords: ${product.name}`);
        return true;
      }
      
      // If we have a 'pants' category, also check for 'bottoms' as a fallback
      if (normalizedCategory === 'pants' && product.subcategory === 'bottoms') {
        console.log(`[DEBUG] Pants category matched bottoms subcategory: ${product.name}`);
        return true;
      }
      
      return false;
    });
    
    console.log(`[DEBUG] Filtered products count: ${filteredProducts.length}`);
  }

  // Sort products
  switch (sortValue) {
    case 'price-low':
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts = filteredProducts.sort((a, b) => b.averageRating - a.averageRating);
      break;
    default: // 'featured'
      filteredProducts = filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  // If this is a UI-triggered filter, update the products grid
  if (!productsToFilter) {
    updateProductsGrid(filteredProducts);
  }
  
  // Return the filtered products array
  return filteredProducts;
}

// Update products grid with filtered products
function updateProductsGrid(products) {
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

// Get all women's products
async function getWomensProducts() {
  try {
    if (window.apiService) {
      console.log('[DEBUG] Fetching women\'s products');
      const products = await window.apiService.fetchProductsByCategory("Women's Collection");
      console.log('[DEBUG] Fetched products:', products);
      
      if (products && Array.isArray(products) && products.length > 0) {
        // Add debug-api.js to help diagnose API issues
        if (!window.debugApiLoaded && !document.querySelector('script[src="/scripts/debug-api.js"]')) {
          console.log('[DEBUG] Adding debug-api.js script');
          const debugScript = document.createElement('script');
          debugScript.src = '/scripts/debug-api.js';
          document.head.appendChild(debugScript);
          window.debugApiLoaded = true;
        }
        
        // Add subcategory property for easier filtering
        return products.map(product => {
          // Ensure we have a valid product object
          if (!product || typeof product !== 'object') {
            console.error('[DEBUG] Invalid product data:', product);
            return null;
          }
          
          const p = {...product};
          
          // Make sure this is a women's product
          if (!p.category || !p.category.toLowerCase().includes('women')) {
            console.log(`[DEBUG] Skipping non-women's product: ${p.name || 'Unknown'}`);
            p.category = "Women's Collection"; // Force correct category
          }
          
          // Extract subcategory from product type or tags
          if (product.type) {
            p.subcategory = product.type.toLowerCase();
          } else if (product.tags && Array.isArray(product.tags) && product.tags.length > 0) {
            // Get the first tag that matches one of our subcategories
            const subcategories = ['dress', 'tops', 'pants', 'skirts', 'shoes', 'accessories'];
            const matchingTag = product.tags.find(tag => 
              subcategories.some(subcat => tag.toLowerCase().includes(subcat))
            );
            
            if (matchingTag) {
              p.subcategory = matchingTag.toLowerCase();
            } else {
              p.subcategory = product.tags[0].toLowerCase();
            }
          } else {
            // Try to extract subcategory from the product name or description
            const name = (product.name || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            
            // Define subcategory mapping with keywords
            const subcategoryMap = {
              'dress': ['dress', 'gown', 'frock', 'wrap dress', 'maxi', 'mini dress'],
              'tops': ['top', 'blouse', 'shirt', 'tee', 't-shirt', 'sweater', 'blazer', 'jacket', 'cardigan', 'hoodie'],
              'pants': ['pants', 'jeans', 'trousers', 'leggings', 'shorts', 'joggers', 'sweatpants', 'slacks'],
              'skirts': ['skirt', 'midi', 'mini skirt', 'maxi skirt', 'pleated'],
              'shoes': ['shoes', 'boots', 'sandals', 'heels', 'flats', 'sneakers', 'footwear', 'pumps', 'loafers'],
              'accessories': ['accessories', 'jewelry', 'necklace', 'bracelet', 'earrings', 'handbag', 'purse', 'bag', 'scarf', 'hat', 'belt', 'watch']
            };
            
            // Check each subcategory's keywords against the product name and description
            let foundSubcategory = 'other';
            
            for (const [subcategory, keywords] of Object.entries(subcategoryMap)) {
              if (keywords.some(keyword => name.includes(keyword) || desc.includes(keyword))) {
                foundSubcategory = subcategory;
                break;
              }
            }
            
            p.subcategory = foundSubcategory;
            console.log(`[DEBUG] Assigned subcategory for ${product.name}: ${p.subcategory}`);
          }
          
          return p;
        }).filter(p => p !== null); // Remove any null products
      }
    }
  } catch (error) {
    console.error('Error fetching women\'s products from API:', error);
  }
  
  // Return empty array if API fails
  return [];
}
