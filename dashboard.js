function approveProduct(btn) {
  const li = btn.parentElement;
  li.innerHTML += " ✅";
  btn.remove();
}

function markShipped(btn) {
  const row = btn.closest("tr");
  row.cells[2].innerText = "Shipped";
  btn.innerText = "Shipped";
  btn.disabled = true;
}
// DOM Elements
const ordersTable = document.querySelector('#orders tbody');

// Fetch and display orders
async function fetchAndDisplayOrders() {
  try {
    const response = await fetch('/api/orders');
    const data = await response.json();
    
    if (data.success) {
      renderOrders(data.orders);
    } else {
      console.error('Error fetching orders:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Render orders to the table
function renderOrders(orders) {
  ordersTable.innerHTML = ''; // Clear existing rows
  
  orders.forEach(order => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.customer.fullName}</td>
      <td class="status-cell">${order.status}</td>
      <td class="action-cell">
        ${getActionButtons(order)}
      </td>
    `;
    
    ordersTable.appendChild(row);
  });
}

// Determine which action buttons to show based on order status
function getActionButtons(order) {
  switch (order.status) {
    case 'pending':
      return `<button class="process-btn" data-order-id="${order.orderId}">Process</button>`;
    case 'processing':
      return `<button class="ship-btn" data-order-id="${order.orderId}">Ship</button>`;
    case 'shipped':
      return `<button class="deliver-btn" data-order-id="${order.orderId}">Mark Delivered</button>`;
    case 'delivered':
      return `<button disabled>Completed</button>`;
    case 'cancelled':
      return `<button disabled>Cancelled</button>`;
    default:
      return '';
  }
}

// Handle order status updates
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    const data = await response.json();
    
    if (data.success) {
      fetchAndDisplayOrders(); // Refresh the orders list
      
      // Here you could add notification logic
      alert(`Order ${orderId} status updated to ${newStatus}`);
    } else {
      console.error('Error updating order:', data.error);
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error - please try again');
  }
}

// Handle refunds
async function issueRefund(orderId) {
  if (!confirm(`Are you sure you want to issue a refund for order ${orderId}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/orders/${orderId}/refund`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      fetchAndDisplayOrders(); // Refresh the orders list
      alert(`Refund processed for order ${orderId}`);
    } else {
      console.error('Error processing refund:', data.error);
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error - please try again');
  }
}

// Event delegation for dynamic buttons
ordersTable.addEventListener('click', (e) => {
  const orderId = e.target.getAttribute('data-order-id');
  
  if (e.target.classList.contains('process-btn')) {
    updateOrderStatus(orderId, 'processing');
  } else if (e.target.classList.contains('ship-btn')) {
    updateOrderStatus(orderId, 'shipped');
  } else if (e.target.classList.contains('deliver-btn')) {
    updateOrderStatus(orderId, 'delivered');
  } else if (e.target.classList.contains('refund-btn')) {
    issueRefund(orderId);
  }
});

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayOrders();
  
  // Optional: Refresh orders every 30 seconds
  setInterval(fetchAndDisplayOrders, 30000);
});
