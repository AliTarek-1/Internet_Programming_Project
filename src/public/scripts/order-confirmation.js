/**
 * Order confirmation functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('components/navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
        // Initialize navbar
        if (typeof initNavbar === 'function') {
          initNavbar();
        }
      })
      .catch(error => console.error('Error loading navbar:', error));
  }

  // Get order ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');

  if (orderId) {
    displayOrderDetails(orderId);
  } else {
    // Redirect to home if no order ID
    window.location.href = 'HomePage.html';
  }
});

/**
 * Display order details
 */
async function displayOrderDetails(orderId) {
  try {
    // Fetch order details from API
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    
    const { order } = await response.json();
    
    if (!order) {
      // Order not found
      window.location.href = 'HomePage.html';
      return;
    }
    
    // Display order ID and date
    document.getElementById('orderId').textContent = order.orderId;
    document.getElementById('orderDate').textContent = formatDate(order.date);
    
    // Display shipping information
    const shippingInfo = document.getElementById('shippingInfo');
    shippingInfo.innerHTML = `
      <p><strong>${order.customer.fullName}</strong></p>
      <p>${order.customer.email}</p>
      <p>${order.customer.phone}</p>
      <p>${order.customer.address.street}</p>
      <p>${order.customer.address.city}, ${order.customer.address.postalCode}</p>
    `;
    
    // Display payment information
    const paymentInfo = document.getElementById('paymentInfo');
    if (order.payment.method === 'creditCard') {
      paymentInfo.innerHTML = `
        <p><strong>Credit Card</strong></p>
        <p>Card ending in ${order.payment.cardLast4}</p>
      `;
    } else {
      paymentInfo.innerHTML = `
        <p><strong>${order.payment.method === 'paypal' ? 'PayPal' : 'Apple Pay'}</strong></p>
      `;
    }
    
    // Display order items
    const orderItems = document.getElementById('orderItems');
    order.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'order-item';
      itemDiv.innerHTML = `
        <div class="item-info">
          <span class="item-quantity">${item.quantity}x</span>
          <span class="item-name">${item.name}</span>
        </div>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      orderItems.appendChild(itemDiv);
    });
    
    // Display totals
    document.getElementById('subtotal').textContent = `$${order.totals.subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = order.totals.shipping === 0 ? 'Free' : `$${order.totals.shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${order.totals.tax.toFixed(2)}`;
    
    // Display discount if any
    if (order.totals.discount > 0) {
      document.getElementById('discountRow').style.display = 'flex';
      document.getElementById('discount').textContent = `-$${order.totals.discount.toFixed(2)}`;
    }
    
    document.getElementById('total').textContent = `$${order.totals.total.toFixed(2)}`;
    
    // Show success notification
    showNotification('Order confirmed! Thank you for your purchase.', 'success');
  } catch (error) {
    console.error('Error fetching order details:', error);
    showNotification('Failed to load order details', 'error');
  }
}

/**
 * Format date to local string
 */
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Print order details
 */
function printOrder() {
  window.print();
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
} 