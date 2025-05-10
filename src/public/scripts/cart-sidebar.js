// Cart Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Load cart sidebar into all pages
  const body = document.body;
  
  // Create a container for the cart sidebar
  const cartSidebarContainer = document.createElement('div');
  cartSidebarContainer.id = 'cartSidebarContainer';
  
  // Load the cart sidebar component
  fetch('components/cart-sidebar.html')
    .then(response => response.text())
    .then(data => {
      cartSidebarContainer.innerHTML = data;
      body.appendChild(cartSidebarContainer);
      
      // Initialize cart sidebar functionality
      initCartSidebar();
    })
    .catch(error => console.error('Error loading cart sidebar:', error));
});

function initCartSidebar() {
  // Get DOM elements
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCart');
  const continueShopping = document.getElementById('continueShopping');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  const subtotalEl = document.getElementById('subtotal');
  const shippingEl = document.getElementById('shipping');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  const cartItemTemplate = document.getElementById('cartItemTemplate');
  
  // Get all cart icons/buttons
  const cartIcons = document.querySelectorAll('.cart-link, #cart-icon, [href="cart.html"]');
  
  // Add click event to all cart icons to open the sidebar
  cartIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      openCartSidebar();
    });
  });
  
  // Close cart sidebar when clicking the close button
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCartSidebar);
  }
  
  // Close cart sidebar when clicking the overlay
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartSidebar);
  }
  
  // Continue shopping button click event
  if (continueShopping) {
    continueShopping.addEventListener('click', closeCartSidebar);
  }
  
  if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', closeCartSidebar);
  }
  
  // Load cart items
  loadCartItems();
  
  // Function to open cart sidebar
  function openCartSidebar() {
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      
      // Refresh cart items when opening
      loadCartItems();
    }
  }
  
  // Function to close cart sidebar
  function closeCartSidebar() {
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  // Function to load cart items from localStorage
  function loadCartItems() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count in navbar
    updateCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    
    // Clear existing cart items
    while (cartItems.firstChild && cartItems.firstChild !== emptyCart) {
      cartItems.removeChild(cartItems.firstChild);
    }
    
    // Show/hide empty cart message
    if (cart.length === 0) {
      emptyCart.style.display = 'block';
      cartSummary.style.display = 'none';
    } else {
      emptyCart.style.display = 'none';
      cartSummary.style.display = 'block';
      
      // Add cart items to sidebar
      let subtotal = 0;
      
      cart.forEach((item, index) => {
        if (cartItemTemplate) {
          const cartItem = document.importNode(cartItemTemplate.content, true);
          
          // Set item details
          cartItem.querySelector('.cart-item-name').textContent = item.name;
          
          // Ensure price is a number before using toFixed()
          const price = parseFloat(item.price) || 0;
          cartItem.querySelector('.cart-item-price').textContent = `$${price.toFixed(2)}`;
          cartItem.querySelector('.quantity-input').value = item.quantity;
          
          // Calculate item total
          const itemTotal = price * item.quantity;
          subtotal += itemTotal;
          
          // Add event listeners to quantity buttons
          const decreaseBtn = cartItem.querySelector('.decrease');
          const increaseBtn = cartItem.querySelector('.increase');
          const quantityInput = cartItem.querySelector('.quantity-input');
          const removeBtn = cartItem.querySelector('.remove-item');
          
          decreaseBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
              item.quantity--;
              quantityInput.value = item.quantity;
              updateCart(cart);
              loadCartItems(); // Refresh cart
            }
          });
          
          increaseBtn.addEventListener('click', () => {
            if (item.quantity < 10) {
              item.quantity++;
              quantityInput.value = item.quantity;
              updateCart(cart);
              loadCartItems(); // Refresh cart
            }
          });
          
          quantityInput.addEventListener('change', () => {
            const newQuantity = parseInt(quantityInput.value);
            if (newQuantity >= 1 && newQuantity <= 10) {
              item.quantity = newQuantity;
            } else {
              quantityInput.value = item.quantity;
            }
            updateCart(cart);
            loadCartItems(); // Refresh cart
          });
          
          removeBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            updateCart(cart);
            loadCartItems(); // Refresh cart
          });
          
          // Add item to cart sidebar
          cartItems.insertBefore(cartItem, emptyCart);
        }
      });
      
      // Update summary
      const shipping = subtotal > 50 ? 0 : 10;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;
      
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      shippingEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
      taxEl.textContent = `$${tax.toFixed(2)}`;
      totalEl.textContent = `$${total.toFixed(2)}`;
    }
  }
  
  // Function to update cart in localStorage
  function updateCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount);
    
    // Update cart count in navbar
    updateCartCount(cartCount);
  }
  
  // Function to update cart count in navbar
  function updateCartCount(count) {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      element.textContent = count;
    });
  }
}

// Global function to open cart sidebar (can be called from other scripts)
function openCartSidebar() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

// Global function to close cart sidebar (can be called from other scripts)
function closeCartSidebar() {
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Restore scrolling
  }
}
