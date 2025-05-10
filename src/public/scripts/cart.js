// cart.js - Handle cart functionality

document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  setupEventListeners();
  loadRelatedProducts();
});

// Load cart items from localStorage
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.querySelector('.cart-items');
  const emptyCartMessage = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  
  // Debug cart data
  console.log('Loading cart items:', cart);
  
  // Clear previous items
  const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
  existingItems.forEach(item => item.remove());
  
  if (cart.length === 0) {
    // Show empty cart message and hide summary
    if (emptyCartMessage) emptyCartMessage.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }
  
  // Hide empty cart message and show summary
  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'block';
  
  // Get the template
  const template = document.getElementById('cartItemTemplate');
  
  // Add each item to the cart
  cart.forEach(product => {
    // Skip invalid products
    if (!product || !product.id) {
      console.warn('Skipping invalid product in cart:', product);
      return;
    }
    
    // Ensure product has valid data
    const name = product.name || 'Unknown Product';
    const category = product.category || 'Uncategorized';
    const price = parseFloat(product.price) || 0;
    const quantity = parseInt(product.quantity) || 1;
    
    try {
      const cartItem = document.importNode(template.content, true).querySelector('.cart-item');
      
      // Set product details
      cartItem.querySelector('.item-name').textContent = name;
      cartItem.querySelector('.item-category').textContent = category;
      cartItem.querySelector('.item-price').textContent = `$${price.toFixed(2)}`;
      cartItem.querySelector('.item-quantity input').value = quantity;
      
      // Calculate and set total
      const total = (price * quantity).toFixed(2);
      cartItem.querySelector('.item-total').textContent = `$${total}`;
      
      // Set data attribute for product ID
      cartItem.dataset.id = product.id;
      
      // Add product image if available
      const imageElement = cartItem.querySelector('.item-image img');
      if (imageElement && product.image) {
        imageElement.src = product.image;
        imageElement.alt = name;
      }
      
      // Add to container
      cartItemsContainer.insertBefore(cartItem, emptyCartMessage);
    } catch (error) {
      console.error('Error adding product to cart UI:', error, product);
    }
  });
  
  // Update summary
  updateCartSummary();
}

// Set up event listeners for cart interactions
function setupEventListeners() {
  // Use event delegation for dynamically added elements
  document.addEventListener('click', function(e) {
    // Quantity decrease button
    if (e.target.classList.contains('quantity-decrease')) {
      const input = e.target.nextElementSibling;
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateItemQuantity(e.target.closest('.cart-item'));
      }
    }
    
    // Quantity increase button
    if (e.target.classList.contains('quantity-increase')) {
      const input = e.target.previousElementSibling;
      const currentValue = parseInt(input.value);
      if (currentValue < 10) {
        input.value = currentValue + 1;
        updateItemQuantity(e.target.closest('.cart-item'));
      }
    }
    
    // Remove item button
    if (e.target.classList.contains('fa-trash') || e.target.classList.contains('remove-item')) {
      const cartItem = e.target.closest('.cart-item');
      removeItem(cartItem);
    }
  });
  
  // Listen for changes on quantity inputs
  document.addEventListener('change', function(e) {
    if (e.target.closest('.item-quantity') && e.target.tagName === 'INPUT') {
      // Ensure value is between 1 and 10
      const value = parseInt(e.target.value);
      if (isNaN(value) || value < 1) {
        e.target.value = 1;
      } else if (value > 10) {
        e.target.value = 10;
      }
      
      updateItemQuantity(e.target.closest('.cart-item'));
    }
  });
  
  // Apply coupon button
  const couponButton = document.querySelector('.coupon-code button');
  if (couponButton) {
    couponButton.addEventListener('click', applyCoupon);
  }
}

// Update item quantity in localStorage and UI
function updateItemQuantity(cartItem) {
  const productId = cartItem.dataset.id;
  const newQuantity = parseInt(cartItem.querySelector('.item-quantity input').value);
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find product in cart
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex !== -1) {
    // Update quantity
    cart[productIndex].quantity = newQuantity;
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount(cart);
    
    // Update item total price
    const price = parseFloat(cart[productIndex].price);
    const total = (price * newQuantity).toFixed(2);
    cartItem.querySelector('.item-total').textContent = `$${total}`;
    
    // Update summary
    updateCartSummary();
  }
}

// Remove item from cart
function removeItem(cartItem) {
  const productId = cartItem.dataset.id;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Filter out the product
  cart = cart.filter(item => item.id !== productId);
  
  // Update localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount(cart);
  
  // Remove from UI with animation
  cartItem.style.opacity = '0';
  cartItem.style.transform = 'translateX(20px)';
  
  setTimeout(() => {
    cartItem.remove();
    
    // Check if cart is empty
    if (cart.length === 0) {
      const emptyCartMessage = document.getElementById('emptyCart');
      const cartSummary = document.getElementById('cartSummary');
      
      if (emptyCartMessage) emptyCartMessage.style.display = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
    } else {
      // Update summary
      updateCartSummary();
    }
  }, 300);
}

// Update cart count in navbar
function updateCartCount(cart) {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  localStorage.setItem('cartCount', count);
  
  // Update displayed count if navbar is loaded
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

// Update cart summary calculation
function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) return;
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);
  
  // Calculate tax (10%)
  const tax = subtotal * 0.1;
  
  // For shipping, we'll display a message that it will be calculated at checkout
  // But for total calculation, we'll use a default value of 0
  const shipping = 0;
  
  // Calculate total (subtotal + tax, shipping will be added at checkout)
  const total = subtotal + tax;
  
  // Update UI
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = 'Calculated at checkout';
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Apply coupon code
function applyCoupon() {
  const couponInput = document.querySelector('.coupon-code input');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  // Sample coupon codes
  const validCoupons = {
    'SAVE10': 0.1,
    'SAVE20': 0.2,
    'FREESHIP': 'freeshipping'
  };
  
  if (!couponCode) {
    showNotification('Please enter a coupon code', 'error');
    return;
  }
  
  if (validCoupons[couponCode]) {
    const discount = validCoupons[couponCode];
    
    if (discount === 'freeshipping') {
      showNotification('Free shipping applied!', 'success');
      document.getElementById('shipping').textContent = 'Free';
      
      // Recalculate total
      const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', ''));
      const tax = parseFloat(document.getElementById('tax').textContent.replace('$', ''));
      const total = subtotal + tax;
      document.getElementById('total').textContent = `$${total.toFixed(2)}`;
      
    } else {
      // Calculate discount
      const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', ''));
      const discountAmount = subtotal * discount;
      
      // Show discount in summary
      const summaryContainer = document.querySelector('.summary-row.total').parentNode;
      
      // Check if discount row already exists
      let discountRow = document.getElementById('discount-row');
      if (!discountRow) {
        discountRow = document.createElement('div');
        discountRow.id = 'discount-row';
        discountRow.className = 'summary-row';
        discountRow.innerHTML = `
          <span>Discount (${discount * 100}%)</span>
          <span id="discount">-$${discountAmount.toFixed(2)}</span>
        `;
        summaryContainer.insertBefore(discountRow, document.querySelector('.summary-row.total'));
      } else {
        discountRow.innerHTML = `
          <span>Discount (${discount * 100}%)</span>
          <span id="discount">-$${discountAmount.toFixed(2)}</span>
        `;
      }
      
      // Recalculate total
      const shipping = document.getElementById('shipping').textContent === 'Free' ? 0 : 
                      parseFloat(document.getElementById('shipping').textContent.replace('$', ''));
      const tax = parseFloat(document.getElementById('tax').textContent.replace('$', ''));
      const total = subtotal + shipping + tax - discountAmount;
      
      document.getElementById('total').textContent = `$${total.toFixed(2)}`;
      showNotification(`${discount * 100}% discount applied!`, 'success');
    }
    
    // Disable the coupon input and button
    couponInput.disabled = true;
    document.querySelector('.coupon-code button').disabled = true;
    
  } else {
    showNotification('Invalid coupon code', 'error');
  }
}

// Load related products
function loadRelatedProducts() {
  const relatedProductsContainer = document.querySelector('.related-products .products-grid');
  if (!relatedProductsContainer) return;
  
  // Get current cart items to suggest related items
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // If cart is empty, show some default products
  if (cart.length === 0) {
    // We'll load these from a sample array for now
    // In a real app, this would be fetched from an API
    const sampleProducts = [
      { 
        name: 'Casual T-Shirt',
        category: "Men's Collection",
        price: 35.00,
        rating: 4.5
      },
      { 
        name: 'Summer Dress',
        category: "Women's Collection",
        price: 85.00,
        rating: 4.8
      },
      { 
        name: 'Kids Jeans',
        category: "Children's Collection",
        price: 45.00,
        rating: 4.2
      },
      { 
        name: 'Leather Jacket',
        category: "Men's Collection",
        price: 150.00,
        rating: 4.7
      }
    ];
    
    sampleProducts.forEach(product => {
      addRelatedProductToUI(product);
    });
    
    return;
  }
  
  // Get categories from cart items
  const categories = new Set(cart.map(item => item.category));
  
  // For each category, add a related product (from same category but not in cart)
  // In a real app, these would come from an API
  // For now, we'll use dummy products based on categories
  categories.forEach(category => {
    const relatedProduct = {
      name: `New ${category.split(' ')[0]} Item`,
      category: category,
      price: Math.floor(Math.random() * 100) + 30,
      rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
    };
    
    addRelatedProductToUI(relatedProduct);
  });
}

// Add a related product to the UI
function addRelatedProductToUI(product) {
  const relatedProductsContainer = document.querySelector('.related-products .products-grid');
  
  // Create product card
  const productCard = document.createElement('div');
  productCard.className = 'product-card';
  
  // Generate stars HTML based on rating
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
  
  // Set product card HTML
  productCard.innerHTML = `
    <div class="product-image">
      <div class="product-placeholder">
        <i class="fas fa-tshirt"></i>
      </div>
      <div class="quick-view">
        <button>Quick View</button>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="category">${product.category}</p>
      <div class="price">
        <span class="current">$${product.price.toFixed(2)}</span>
      </div>
      <div class="rating">
        ${starsHTML}
        <span>(${Math.floor(Math.random() * 30) + 5})</span>
      </div>
      <button class="add-to-cart">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  `;
  
  // Add event listener to add to cart button
  const addButton = productCard.querySelector('.add-to-cart');
  addButton.addEventListener('click', function() {
    const productObj = {
      id: generateProductId(product.name),
      name: product.name,
      price: product.price.toFixed(2),
      category: product.category,
      quantity: 1
    };
    
    addProductToCart(productObj);
    showNotification(`${product.name} added to cart!`, 'success');
  });
  
  // Add product card to container
  relatedProductsContainer.appendChild(productCard);
}

// Generate a product ID
function generateProductId(name) {
  return name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
}

// Add product to cart
function addProductToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already exists
  const existingProductIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingProductIndex !== -1) {
    // Increment quantity if product already exists
    cart[existingProductIndex].quantity += 1;
  } else {
    // Add new product
    cart.push(product);
  }
  
  // Update localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount(cart);
  
  // Reload cart contents
  loadCart();
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'all 0.3s ease';
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
  }
  
  // Set color based on type
  if (type === 'success') {
    notification.style.backgroundColor = 'var(--success-color)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'var(--accent-color)';
  } else {
    notification.style.backgroundColor = 'var(--secondary-color)';
  }
  
  // Update message and show notification
  notification.textContent = message;
  notification.style.transform = 'translateY(0)';
  notification.style.opacity = '1';
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
  }, 3000);
}
