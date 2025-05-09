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
  
  // If API fails, show error message
  if (!product) {
    console.error('Failed to load product data');
    document.querySelector('.product-details').innerHTML = `
      <div class="error-message">
        <h3>Product Not Found</h3>
        <p>We couldn't find the product you're looking for. Please try again later or contact customer support.</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
    return;
  }
  
  if (product) {
    // Update page with product details
    // Parse query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const name = product.name;
    const price = product.price;
    const oldPrice = product.oldPrice;
    const category = product.category;
    const desc = product.description;

    // Inject data into HTML
    if (name) {
      document.getElementById("productTitle").textContent = name;
      document.getElementById("product-name").textContent = name;
    }

    if (category) {
      document.getElementById("product-category").textContent = category;
      // Update breadcrumbs based on category
      updateBreadcrumbs(category);
    }

    if (price) {
      document.getElementById("currentPrice").textContent = `$${price.toFixed(2)}`;
    }

    if (oldPrice) {
      document.getElementById("oldPrice").textContent = `$${oldPrice.toFixed(2)}`;
    }

    if (desc) {
      document.getElementById("productDescription").textContent = desc;
    }

    if (id) {
      document.getElementById("productSKU").textContent = `PRD${id}`;
    }
    
    // Load product reviews
    await loadProductReviews(product.productID || id);
    
    // Load related products
    loadRelatedProducts(product.category);
  }
} // Load product details from API or fallback to mock data

// Load product reviews from the database
async function loadProductReviews(productId) {
  if (!productId) {
    console.error('No product ID provided for reviews');
    return;
  }
  
  console.log(`Loading reviews for product ID: ${productId}`);
  const reviewsContainer = document.getElementById('reviews-container');
  const loadingElement = document.getElementById('reviews-loading');
  const noReviewsElement = document.getElementById('no-reviews');
  
  if (!reviewsContainer) {
    console.error('Reviews container not found');
    return;
  }
  
  try {
    // Show loading state
    if (loadingElement) loadingElement.style.display = 'block';
    if (noReviewsElement) noReviewsElement.style.display = 'none';
    
    // Clear any existing reviews (except the loading and no-reviews elements)
    const existingReviews = reviewsContainer.querySelectorAll('.review');
    existingReviews.forEach(review => review.remove());
    
    // Fetch reviews from API
    let reviews = [];
    try {
      if (window.apiService) {
        console.log(`Attempting to fetch reviews for product ${productId}`);
        const response = await fetch(`/api/reviews/product/${productId}`);
        
        if (response.ok) {
          const data = await response.json();
          reviews = data.reviews || [];
          console.log(`Fetched ${reviews.length} reviews for product ${productId}:`, reviews);
        } else {
          console.warn(`Reviews API returned status ${response.status}. This may be normal if the API is not fully set up yet.`);
        }
      }
    } catch (error) {
      console.warn('Error fetching reviews, continuing without reviews:', error);
    }
    
    // Hide loading state
    if (loadingElement) loadingElement.style.display = 'none';
    
    // If no reviews, show the no-reviews message
    if (reviews.length === 0) {
      if (noReviewsElement) noReviewsElement.style.display = 'block';
      return;
    }
    
    // Generate HTML for each review and add to container
    reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review';
      
      // Format date
      const reviewDate = new Date(review.createdAt);
      const formattedDate = reviewDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Generate star rating HTML
      const rating = review.rating || 0;
      const starsHtml = generateStarRating(rating);
      
      reviewElement.innerHTML = `
        <div class="review-header">
          <div class="reviewer-info">
            <h4>${review.username || 'Anonymous'}</h4>
            <span class="review-date">${formattedDate}</span>
          </div>
          <div class="review-rating">
            ${starsHtml}
          </div>
        </div>
        <h5>${review.title || 'Review'}</h5>
        <p>${review.comment || 'No comment provided.'}</p>
      `;
      
      reviewsContainer.appendChild(reviewElement);
    });
    
    // Update review summary statistics if available
    updateReviewSummary(reviews);
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    if (loadingElement) loadingElement.style.display = 'none';
    if (noReviewsElement) {
      noReviewsElement.style.display = 'block';
      noReviewsElement.innerHTML = `<p>Error loading reviews. Please try again later.</p>`;
    }
  }
}

// Generate HTML for star rating
function generateStarRating(rating) {
  let starsHtml = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  return starsHtml;
}

// Update review summary statistics
function updateReviewSummary(reviews) {
  if (!reviews || reviews.length === 0) return;
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = totalRating / reviews.length;
  
  // Count ratings by star level
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
  reviews.forEach(review => {
    const rating = Math.floor(review.rating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  });
  
  // Update average rating display
  const ratingNumberElement = document.querySelector('.average-rating .rating-number');
  if (ratingNumberElement) {
    ratingNumberElement.textContent = averageRating.toFixed(1);
  }
  
  // Update star display
  const starsElement = document.querySelector('.average-rating .stars');
  if (starsElement) {
    starsElement.innerHTML = generateStarRating(averageRating);
  }
  
  // Update review count
  const reviewCountElement = document.querySelector('.average-rating span:last-child');
  if (reviewCountElement) {
    reviewCountElement.textContent = `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
  }
  
  // Update rating bars
  for (let i = 0; i < 5; i++) {
    const barElement = document.querySelector(`.rating-bar:nth-child(${5-i}) .bar`);
    const countElement = document.querySelector(`.rating-bar:nth-child(${5-i}) span:last-child`);
    
    if (barElement) {
      const percentage = reviews.length > 0 ? (ratingCounts[i] / reviews.length) * 100 : 0;
      barElement.style.width = `${percentage}%`;
    }
    
    if (countElement) {
      countElement.textContent = ratingCounts[i];
    }
  }
}

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
  if (!addToCartBtn) return;
  
  addToCartBtn.addEventListener('click', async function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
      console.error('No product ID found');
      return;
    }
    
    // Get quantity
    const quantity = parseInt(document.getElementById('quantityInput')?.value || 1);
    
    // Get product data
    let product = null;
    
    try {
      if (window.apiService) {
        product = await window.apiService.fetchProductById(productId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
    
    if (product) {
      // Add to cart
      addProductToCart(product, quantity, 'One Size', '');
      
      // Update cart count in navbar
      updateCartCountDisplay();
      
      // Show success message
      
      // Open cart sidebar and ensure cart items are loaded
      if (typeof window.openCartSidebar === 'function') {
        // First update the cart items in the sidebar
        if (typeof window.initCartSidebar === 'function' && 
            typeof window.initCartSidebar.loadCartItems === 'function') {
          window.initCartSidebar.loadCartItems();
        }
        
        // Then open the cart sidebar
        window.openCartSidebar();
      }
    } else {
      alert('Could not add product to cart. Please try again.');
    }
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
function updateCartCountDisplay() {
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    const count = localStorage.getItem('cartCount') || 0;
    cartCountElement.textContent = count;
  }
}

// Initialize review form
function initReviewForm() {
  const ratingStars = document.querySelectorAll(".rating-selector i");
  const reviewForm = document.querySelector(".review-form");
  const reviewsContainer = document.querySelector(".customer-reviews");
  const ratingCount = document.getElementById("ratingCount");
  const ratingNumber = document.querySelector(".rating-number");
  const ratingStarsDisplay = document.querySelector(".average-rating .stars");

  let selectedRating = 0;
  let totalReviews = 24;
  let totalRating = 4.5 * totalReviews;

  ratingStars.forEach((star, index) => {
    star.addEventListener("mouseover", () => highlightStars(index));
    star.addEventListener("mouseout", () => highlightStars(selectedRating - 1));
    star.addEventListener("click", () => {
      selectedRating = index + 1;
      highlightStars(index);
    });
  });

  function highlightStars(index) {
    ratingStars.forEach((star, i) => {
      star.className = i <= index ? "fas fa-star" : "far fa-star";
    });
  }

  function getCurrentFormattedDate() {
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("review-title").value.trim();
    const content = document.getElementById("review-content").value.trim();

    if (selectedRating === 0) return alert("Please select a star rating.");
    if (!title || !content) return alert("Please fill out both fields.");

    const reviewHTML = `
      <div class="review">
        <div class="review-header">
          <div class="reviewer-info">
            <h4>You</h4>
            <span class="review-date">${getCurrentFormattedDate()}</span>
          </div>
          <div class="review-rating">
            ${'<i class="fas fa-star"></i>'.repeat(selectedRating)}
            ${'<i class="far fa-star"></i>'.repeat(5 - selectedRating)}
          </div>
        </div>
        <h5>${title}</h5>
        <p>${content}</p>
      </div>
    `;
    reviewsContainer.insertAdjacentHTML("afterbegin", reviewHTML);

    totalReviews++;
    totalRating += selectedRating;
    const newAverage = (totalRating / totalReviews).toFixed(1);
    ratingNumber.textContent = newAverage;
    ratingCount.textContent = `(${totalReviews} reviews)`;
    updateStarDisplay(newAverage);

    reviewForm.reset();
    highlightStars(-1);
    selectedRating = 0;
  });

  function updateStarDisplay(average) {
    ratingStarsDisplay.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(average)) {
        ratingStarsDisplay.innerHTML += '<i class="fas fa-star"></i>';
      } else if (i - average < 1) {
        ratingStarsDisplay.innerHTML += '<i class="fas fa-star-half-alt"></i>';
      } else {
        ratingStarsDisplay.innerHTML += '<i class="far fa-star"></i>';
      }
    }
  }
}
// Create product card element
function createProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  
  // Handle different product ID formats (id, _id, or productID)
  const productId = product.id || product._id || product.productID;
  
  // Check if product has a discount
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  
  // Handle product image
  let productImage = '';
  if (product.image) {
    productImage = `<img src="${product.image}" alt="${product.name}" />`;
  } else {
    productImage = `<div class="product-placeholder"><i class="fas fa-tshirt"></i></div>`;
  }
  
  // Generate star rating based on product rating
  const rating = product.rating || 4;
  const reviewCount = product.reviews || 0;
  let starsHtml = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else if (i - rating < 1) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHtml += '<i class="far fa-star"></i>';
    }
  }
  
  productCard.innerHTML = `
    <div class="product-image">
      ${productImage}
      <div class="quick-view">
        <a href="product-details.html?id=${productId}">View Details</a>
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
        ${starsHtml}
        <span>(${reviewCount})</span>
      </div>
      <button class="add-to-cart" data-id="${productId}">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Add event listener to "Add to Cart" button
  const addToCartBtn = productCard.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const productId = addToCartBtn.getAttribute('data-id');
    let product = null;
    
    try {
      if (window.apiService) {
        product = await window.apiService.fetchProductById(productId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
    
    if (product) {
      addProductToCart(product, 1, 'M', '');
      updateCartCountDisplay();
    } else {
      alert('Could not add product to cart. Please try again.');
    }
  });
  
  return productCard;
}





// Load related products based on category
async function loadRelatedProducts(category) {
  let relatedProducts = [];
  
  try {
    if (window.apiService) {
      // Fetch products by category and limit to 4
      relatedProducts = await window.apiService.fetchProductsByCategory(category, { limit: 4 });
    }
  } catch (error) {
    console.error('Error fetching related products:', error);
  }
  
  const productsGrid = document.querySelector('.related-products .products-grid');
  if (!productsGrid) return;
  
  // Clear existing products
  productsGrid.innerHTML = '';
  
  if (relatedProducts.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">No related products found.</p>';
    return;
  }
  
  // Add related products to grid
  relatedProducts.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}


