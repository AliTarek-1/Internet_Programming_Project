// Product Details Page JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  // Load API script first if not already loaded
  if (!window.apiService) {
    await loadScript('/scripts/api.js');
  }
  
  // Get product ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (productId) {
    // Load product details based on ID
    await loadProductDetails(productId);
  } else {
    // If no product ID is provided, show error or redirect
    console.error('No product ID provided');
    // Optionally redirect to products page
    // window.location.href = 'products.html';
  }
  
  // Initialize tab functionality
  initTabs();
  
  // Initialize quantity selector
  initQuantitySelector();
  
  // Initialize option buttons
  initOptionButtons();
  
  // Initialize add to cart button
  initAddToCart();
  
  // Initialize review form
  initReviewForm();
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

async function loadProductDetails(productId) {
  let product = null;
  
  // Try to fetch from API first
  try {
    if (window.apiService) {
      product = await window.apiService.fetchProductById(productId);
    }
  } catch (error) {
    console.warn('Error fetching product from API, falling back to local data:', error);
  }
  
  // Fallback to mock data if API fails
  if (!product) {
    product = getMockProductById(productId);
  }
  
  if (product) {
    // Update page with product details...
  }
}// Load product details from API or fallback to mock data

// Update breadcrumb links based on product category
function updateBreadcrumbs(category) {
  const categoryLink = document.querySelector('.breadcrumbs a:nth-child(3)');
  const categorySpan = document.getElementById('product-category');
  
  // Check if elements exist before updating them
  if (!categoryLink || !categorySpan) return;
  
  if (category.toLowerCase().includes('men')) {
    categoryLink.href = 'mens-products.html';
    categorySpan.textContent = "Men's Collection";
  } else if (category.toLowerCase().includes('women')) {
    categoryLink.href = 'womens-products.html';
    categorySpan.textContent = "Women's Collection";
  } else if (category.toLowerCase().includes('children')) {
    categoryLink.href = 'childrens-products.html';
    categorySpan.textContent = "Children's Collection";
  } else {
    categoryLink.href = 'products.html';
    categorySpan.textContent = category;
  }
}

// Initialize tab functionality
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  if (!tabButtons.length || !tabPanels.length) return;
  
  // Make sure all tab panels exist
  tabButtons.forEach(button => {
    const tabId = button.getAttribute('data-tab');
    const panel = document.getElementById(`${tabId}-panel`);
    
    // If panel doesn't exist, create it
    if (!panel && tabId) {
      const newPanel = document.createElement('div');
      newPanel.id = `${tabId}-panel`;
      newPanel.className = 'tab-panel';
      newPanel.innerHTML = `<h3>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h3><p>Content for ${tabId} tab.</p>`;
      document.querySelector('.tab-content').appendChild(newPanel);
    }
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all buttons and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding panel
      const targetPanel = document.getElementById(`${tabId}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

// Initialize quantity selector
function initQuantitySelector() {
  const minusBtn = document.querySelector('.quantity-btn.minus');
  const plusBtn = document.querySelector('.quantity-btn.plus');
  const quantityInput = document.getElementById('quantityInput');
  
  minusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  plusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1;
  });
  
  quantityInput.addEventListener('change', () => {
    if (quantityInput.value < 1) {
      quantityInput.value = 1;
    }
  });
}

// Initialize option buttons (size, color)
function initOptionButtons() {
  // Size options
  const sizeButtons = document.querySelectorAll('.size-options .option-btn');
  if (sizeButtons && sizeButtons.length > 0) {
    // Store the selected size
    let selectedSize = '';
    
    sizeButtons.forEach(button => {
      // Check if this button is already active
      if (button.classList.contains('active')) {
        selectedSize = button.textContent.trim();
      }
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all size buttons
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        // Update selected size
        selectedSize = button.textContent.trim();
        console.log('Selected size:', selectedSize);
      });
    });
  }
  
  // Color options
  const colorButtons = document.querySelectorAll('.color-options .color-btn');
  if (colorButtons && colorButtons.length > 0) {
    // Store the selected color
    let selectedColor = '';
    
    colorButtons.forEach(button => {
      // Check if this button is already active
      if (button.classList.contains('active')) {
        selectedColor = button.getAttribute('data-color') || button.title || '';
      }
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all color buttons
        colorButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        // Update selected color
        selectedColor = button.getAttribute('data-color') || button.title || '';
        console.log('Selected color:', selectedColor);
      });
    });
  }
}

// Initialize add to cart button
function initAddToCart() {
  const addToCartBtn = document.getElementById('addToCartBtn');
  
  addToCartBtn.addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    let product = null;
    
    // Try to fetch from API first
    try {
      if (window.apiService) {
        product = await window.apiService.fetchProductById(productId);
      }
    } catch (error) {
      console.warn('Error fetching product from API, falling back to local data:', error);
    }
    
    // Fallback to mock data if API fails
    if (!product) {
      product = getMockProductById(productId);
    }
    
    if (!product) return;
    
    const quantity = parseInt(document.getElementById('quantityInput').value);
    const size = document.querySelector('.size-options .option-btn.active')?.textContent || 'M';
    const colorElement = document.querySelector('.color-options .color-btn.active');
    const color = colorElement ? colorElement.style.backgroundColor : '';
    
    // Add to cart (in localStorage)
    addProductToCart(product, quantity, size, color);
    
    // Open cart sidebar instead of showing alert
    if (typeof openCartSidebar === 'function') {
      openCartSidebar();
    }
    
    // Update cart count in navbar
    updateCartCountDisplay();
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

// Initialize review form
function initReviewForm() {
  const reviewForm = document.querySelector('.review-form');
  const ratingStars = document.querySelectorAll('.rating-selector i');
  
  // Handle star rating selection
  ratingStars.forEach((star, index) => {
    star.addEventListener('click', () => {
      // Reset all stars
      ratingStars.forEach(s => {
        s.className = 'far fa-star';
      });
      
      // Fill stars up to selected index
      for (let i = 0; i <= index; i++) {
        ratingStars[i].className = 'fas fa-star';
      }
    });
    
    star.addEventListener('mouseover', () => {
      // Reset all stars
      ratingStars.forEach(s => {
        s.className = 'far fa-star';
      });
      
      // Fill stars up to hovered index
      for (let i = 0; i <= index; i++) {
        ratingStars[i].className = 'fas fa-star';
      }
    });
  });
  
  // Reset stars when mouse leaves rating selector
  document.querySelector('.rating-selector').addEventListener('mouseleave', () => {
    // Get number of active stars
    const activeStars = document.querySelectorAll('.rating-selector i.fas').length;
    
    // Reset all stars
    ratingStars.forEach(s => {
      s.className = 'far fa-star';
    });
    
    // Fill active stars
    for (let i = 0; i < activeStars; i++) {
      ratingStars[i].className = 'fas fa-star';
    }
  });
  
  // Handle form submission
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const rating = document.querySelectorAll('.rating-selector i.fas').length;
    const title = document.getElementById('review-title').value;
    const content = document.getElementById('review-content').value;
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    // In a real application, this would send the review to a server
    console.log('Review submitted:', { rating, title, content });
    
    // Reset form
    reviewForm.reset();
    ratingStars.forEach(s => {
      s.className = 'far fa-star';
    });
    
    // Show success message
    alert('Thank you for your review!');
  const productsGrid = document.querySelector('.related-products .products-grid');
  
  // Clear existing products
  productsGrid.innerHTML = '';
  
  // Add related products to grid
  relatedProducts.forEach(product => {
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
      <div class="quick-view">
        <a href="product-details.html?id=${product.id}">View Details</a>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
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
    const product = getMockProductById(productId);
    
    if (product) {
      addProductToCart(product, 1, 'M', '');
      updateCartCount();
      alert('Product added to cart!');
    }
  });
  
  return productCard;
}

// Mock product data (in a real application, this would come from an API)
function getMockProducts() {
  return [
    {
      id: '1',
      name: 'Blue Denim Jeans',
      category: "Women's Collection",
      price: 125.00,
      oldPrice: 150.00,
      description: 'Premium quality denim jeans with a modern slim fit design. Perfect for casual everyday wear.',
      sku: 'WJ12345',
      rating: 4.5,
      reviews: 24
    },
    {
      id: '2',
      name: 'Floral Shirt',
      category: "Women's Collection",
      price: 55.00,
      description: 'Lightweight floral print shirt made from breathable cotton. Ideal for summer days.',
      sku: 'WS67890',
      rating: 4.0,
      reviews: 18
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
      reviews: 32
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
      reviews: 15
    },
    {
      id: '5',
      name: 'Classic White Shirt',
      category: "Men's Collection",
      price: 65.00,
      description: 'Timeless white shirt made from premium cotton. A wardrobe essential for every man.',
      sku: 'MS12345',
      rating: 4.8,
      reviews: 42
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
      reviews: 28
    },
    {
      id: '7',
      name: 'Slim Fit Chinos',
      category: "Men's Collection",
      price: 85.00,
      description: 'Versatile slim fit chinos that transition seamlessly from casual to smart casual occasions.',
      sku: 'MC54321',
      rating: 4.5,
      reviews: 36
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
      reviews: 22
    },
    {
      id: '9',
      name: 'Dinosaur T-Shirt',
      category: "Children's Collection",
      price: 25.00,
      description: 'Fun dinosaur print t-shirt made from soft cotton. Perfect for active kids.',
      sku: 'CT12345',
      rating: 4.9,
      reviews: 48
    },
    {
      id: '10',
      name: 'Colorful Sneakers',
      category: "Children's Collection",
      price: 45.00,
      oldPrice: 60.00,
      description: 'Comfortable and colorful sneakers designed for growing feet. Durable and easy to clean.',
      sku: 'CS67890',
      rating: 4.7,
      reviews: 33
    },
    {
      id: '11',
      name: 'Denim Overalls',
      category: "Children's Collection",
      price: 55.00,
      description: 'Cute and practical denim overalls. Perfect for playtime and everyday wear.',
      sku: 'CD54321',
      rating: 4.6,
      reviews: 27
    },
    {
      id: '12',
      name: 'Hooded Jacket',
      category: "Children's Collection",
      price: 65.00,
      oldPrice: 80.00,
      description: 'Warm hooded jacket with fun details. Water-resistant and perfect for outdoor adventures.',
      sku: 'CJ98765',
      rating: 4.8,
      reviews: 39
    },
    // Additional Women's Collection products
    {
      id: '13',
      name: 'Striped Blouse',
      category: "Women's Collection",
      price: 45.00,
      description: 'Elegant striped blouse with a modern cut. Perfect for office or casual wear.',
      sku: 'WB13579',
      rating: 4.2,
      reviews: 19
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
      reviews: 23
    },
    // Additional Men's Collection products
    {
      id: '15',
      name: 'Casual Polo Shirt',
      category: "Men's Collection",
      price: 40.00,
      description: 'Classic polo shirt with a modern fit. Perfect for casual occasions and everyday wear.',
      sku: 'MP13579',
      rating: 4.4,
      reviews: 31
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
      reviews: 26
    },
    // Additional Children's Collection products
    {
      id: '17',
      name: 'Patterned Leggings',
      category: "Children's Collection",
      price: 20.00,
      description: 'Comfortable patterned leggings for active kids. Stretchy and durable for everyday play.',
      sku: 'CL13579',
      rating: 4.5,
      reviews: 29
    },
    {
      id: '18',
      name: 'Cartoon Character Pajamas',
      category: "Children's Collection",
      price: 30.00,
      oldPrice: 40.00,
      description: 'Soft and cozy pajamas featuring popular cartoon characters. Perfect for a good night\'s sleep.',
      sku: 'CP24680',
      rating: 4.9,
      reviews: 37
    }
  ];
}

// Get mock product by ID
function getMockProductById(productId) {
  const products = getMockProducts();
  return products.find(product => product.id === productId);
}
