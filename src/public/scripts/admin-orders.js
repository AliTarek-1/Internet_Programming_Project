// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verify token
  await verifyToken();
  
  // Load orders
  fetchAndRenderOrders();
  
  // Set up modals
  setupModals();
  
  // Set up status filter
  setupStatusFilter();
});

// Verify token with backend
async function verifyToken() {
  try {
    const res = await fetch("/api/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid token");
    }

    const data = await res.json();
    if (data.role !== "admin" && data.role !== "superadmin") {
      throw new Error("Not authorized");
    }
    
    return data;
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "/login-admin.html";
  }
}

// Orders Section
async function fetchAndRenderOrders(statusFilter = 'all') {
  try {
    const res = await fetch("/api/orders", {
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      showNotification("Failed to load orders", "error");
      return;
    }

    const data = await res.json();
    const orders = data.orders || [];
    
    const tbody = document.querySelector("#orders-table tbody");
    tbody.innerHTML = "";

    if (orders.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="6">No orders found</td>';
      tbody.appendChild(row);
      return;
    }

    // Filter orders by status if needed
    const filteredOrders = statusFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === statusFilter);
    
    if (filteredOrders.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6">No orders with status "${statusFilter}" found</td>`;
      tbody.appendChild(row);
      return;
    }

    filteredOrders.forEach((order) => {
      const row = document.createElement("tr");
      
      const date = new Date(order.date).toLocaleDateString();
      const total = order.total ? `$${order.total.toFixed(2)}` : 'N/A';
      
      row.innerHTML = `
        <td>${order.orderId || 'N/A'}</td>
        <td>${date}</td>
        <td>${order.customer?.name || 'N/A'}</td>
        <td>${total}</td>
        <td><span class="status-badge ${order.status || 'pending'}">${order.status || 'pending'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="view-details-btn" data-order-id="${order.orderId}">Details</button>
            <button class="update-status-btn" data-order-id="${order.orderId}">Update Status</button>
            ${order.status !== 'refunded' ? 
              `<button class="refund-btn" data-order-id="${order.orderId}">Refund</button>` : ''}
            ${order.status !== 'delivered' && order.status !== 'refunded' ? 
              `<button class="confirm-btn" data-order-id="${order.orderId}">Send Confirmation</button>` : ''}
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addOrderActionListeners();
    
  } catch (error) {
    showNotification("Error loading orders", "error");
  }
}

function setupStatusFilter() {
  const statusFilter = document.getElementById('order-status-filter');
  
  statusFilter.addEventListener('change', () => {
    fetchAndRenderOrders(statusFilter.value);
  });
}

function addOrderActionListeners() {
  // View details buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      viewOrderDetails(orderId);
    });
  });
  
  // Update status buttons
  document.querySelectorAll('.update-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      openUpdateStatusModal(orderId);
    });
  });
  
  // Refund buttons
  document.querySelectorAll('.refund-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      if (confirm('Are you sure you want to refund this order?')) {
        issueRefund(orderId);
      }
    });
  });
  
  // Confirmation buttons
  document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      sendOrderConfirmation(orderId);
    });
  });
}

function setupModals() {
  // Order details modal
  const detailsModal = document.getElementById('order-details-modal');
  const detailsClose = detailsModal.querySelector('.close');
  
  detailsClose.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });
  
  // Update status modal
  const statusModal = document.getElementById('update-status-modal');
  const statusClose = statusModal.querySelector('.close');
  const statusForm = document.getElementById('update-status-form');
  
  statusClose.addEventListener('click', () => {
    statusModal.style.display = 'none';
  });
  
  statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderId = document.getElementById('update-order-id').value;
    const status = document.getElementById('new-status').value;
    
    await updateOrderStatus(orderId, status);
    statusModal.style.display = 'none';
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
    if (event.target === statusModal) {
      statusModal.style.display = 'none';
    }
  });
}

async function viewOrderDetails(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    
    if (!res.ok) {
      showNotification("Failed to load order details", "error");
      return;
    }
    
    const data = await res.json();
    const order = data.order;
    
    if (!order) {
      showNotification("Order not found", "error");
      return;
    }
    
    const detailsContent = document.getElementById('order-details-content');
    
    // Format date
    const orderDate = new Date(order.date).toLocaleString();
    
    // Calculate total if not available
    let total = order.total;
    if (!total && order.items) {
      total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = `
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name || 'Unknown Product'}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price || 0).toFixed(2)}</td>
                <td>$${((item.price || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    let shippingHtml = '';
    if (order.shipping) {
      shippingHtml = `
        <h3>Shipping Information</h3>
        <p>
          <strong>Address:</strong><br>
          ${order.shipping.address?.street || ''}<br>
          ${order.shipping.address?.city || ''}, ${order.shipping.address?.state || ''} ${order.shipping.address?.zip || ''}<br>
          ${order.shipping.address?.country || ''}
        </p>
        <p><strong>Method:</strong> ${order.shipping.method || 'Standard'}</p>
      `;
    }
    
    let paymentHtml = '';
    if (order.payment) {
      paymentHtml = `
        <h3>Payment Information</h3>
        <p><strong>Method:</strong> ${order.payment.method || 'Unknown'}</p>
        <p><strong>Status:</strong> ${order.payment.status || 'Unknown'}</p>
      `;
    }
    
    detailsContent.innerHTML = `
      <div class="order-header">
        <h3>Order #${order.orderId}</h3>
        <span class="status-badge ${order.status}">${order.status || 'pending'}</span>
      </div>
      
      <div class="order-info">
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Customer:</strong> ${order.customer?.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
        <p><strong>Total:</strong> $${(total || 0).toFixed(2)}</p>
      </div>
      
      ${itemsHtml}
      ${shippingHtml}
      ${paymentHtml}
    `;
    
    // Show the modal
    document.getElementById('order-details-modal').style.display = 'block';
    
  } catch (error) {
    showNotification("Error loading order details", "error");
  }
}

function openUpdateStatusModal(orderId) {
  document.getElementById('update-order-id').value = orderId;
  document.getElementById('update-status-modal').style.display = 'block';
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      showNotification("Order status updated successfully", "success");
      fetchAndRenderOrders(document.getElementById('order-status-filter').value);
    } else {
      const error = await res.json();
      showNotification("Failed to update status: " + (error.error || "Unknown error"), "error");
    }
  } catch (error) {
    showNotification("Error updating order status", "error");
  }
}

async function sendOrderConfirmation(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}/confirm`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      showNotification("Confirmation email sent successfully", "success");
    } else {
      const error = await res.json();
      showNotification("Failed to send confirmation: " + (error.error || "Unknown error"), "error");
    }
  } catch (error) {
    showNotification("Error sending confirmation", "error");
  }
}

async function issueRefund(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}/refund`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      showNotification("Order refunded successfully", "success");
      fetchAndRenderOrders(document.getElementById('order-status-filter').value);
    } else {
      const error = await res.json();
      showNotification("Failed to refund order: " + (error.error || "Unknown error"), "error");
    }
  } catch (error) {
    showNotification("Error refunding order", "error");
  }
}

// Add styles for status badges
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("status-badge-styles")) {
    const style = document.createElement("style");
    style.id = "status-badge-styles";
    style.textContent = `
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        color: white;
      }
      
      .status-badge.pending {
        background-color: #f39c12;
      }
      
      .status-badge.processing {
        background-color: #3498db;
      }
      
      .status-badge.shipped {
        background-color: #2ecc71;
      }
      
      .status-badge.delivered {
        background-color: #27ae60;
      }
      
      .status-badge.cancelled {
        background-color: #e74c3c;
      }
      
      .status-badge.refunded {
        background-color: #95a5a6;
      }
    `;
    document.head.appendChild(style);
  }
});
