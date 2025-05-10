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
    
    // Check if the response has data property (from getAdminProfile)
    const admin = data.data || data.admin || data;
    
    // Check if the user has admin privileges
    if (admin && (admin.role === "admin" || admin.role === "superadmin")) {
      // Valid admin user
      console.log("Admin verified:", admin.name);
      return admin;
    } else {
      throw new Error("Not authorized as admin");
    }
  } catch (err) {
    console.error("Token verification error:", err.message);
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
      // Get the total from the totals object and format it
      const total = order.totals?.total ? `$${order.totals.total.toFixed(2)}` : 'N/A';
      
      row.innerHTML = `
        <td>${order.orderId || 'N/A'}</td>
        <td>${date}</td>
        <td>${order.customer?.fullName || 'N/A'}</td>
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
        // Show loading state
        btn.disabled = true;
        btn.textContent = 'Processing...';
        
        // Process refund
        issueRefund(orderId)
          .then(() => {
            // Refresh the orders list
            fetchAndRenderOrders(document.getElementById('order-status-filter').value);
          })
          .catch(error => {
            console.error('Refund error:', error);
          })
          .finally(() => {
            // Reset button state
            btn.disabled = false;
            btn.textContent = 'Refund';
          });
      }
    });
  });
  
  // Send confirmation buttons
  document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id');
      
      // Show loading state
      btn.disabled = true;
      btn.textContent = 'Sending...';
      
      // Send confirmation
      sendOrderConfirmation(orderId)
        .then(() => {
          // Update button to show sent
          btn.textContent = 'Sent ✓';
          setTimeout(() => {
            // Refresh the orders list
            fetchAndRenderOrders(document.getElementById('order-status-filter').value);
          }, 1000);
        })
        .catch(error => {
          console.error('Confirmation error:', error);
          // Reset button state
          btn.disabled = false;
          btn.textContent = 'Send Confirmation';
        });
    });
  });
}

function setupModals() {
  // Get all modals
  const modals = document.querySelectorAll('.modal');
  
  // Get all close buttons
  const closeButtons = document.querySelectorAll('.close');
  
  // Add click event to close buttons
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Add event listener to update status form
  document.getElementById('update-status-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const orderId = document.getElementById('update-order-id').value;
    const status = document.getElementById('new-status').value;
    
    // Update the order status
    updateOrderStatus(orderId, status)
      .then(() => {
        // Close the modal
        document.getElementById('update-status-modal').style.display = 'none';
        
        // Refresh the orders list with the current filter
        fetchAndRenderOrders(document.getElementById('order-status-filter').value);
      })
      .catch(error => {
        showNotification("Error updating order status: " + error.message, "error");
      });
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
    let total = 0;
    if (order.totals && order.totals.total) {
      total = order.totals.total;
    } else if (order.items && order.items.length > 0) {
      // Fallback calculation if totals object is missing
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
        <p><strong>Customer:</strong> ${order.customer?.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.customer?.phone || 'N/A'}</p>
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

function updateOrderStatus(orderId, status) {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure there's no double slash in the URL
      const res = await fetch(`/api/orders/${orderId.trim()}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showNotification("Order status updated successfully", "success");
        resolve();
      } else {
        const error = await res.json();
        const errorMsg = error.error || "Unknown error";
        showNotification("Failed to update status: " + errorMsg, "error");
        reject(new Error(errorMsg));
      }
    } catch (error) {
      showNotification("Error updating order status", "error");
      reject(error);
    }
  });
}

function sendOrderConfirmation(orderId) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });

      if (res.ok) {
        showNotification("Confirmation email sent successfully", "success");
        resolve();
      } else {
        const error = await res.json();
        const errorMsg = error.error || "Unknown error";
        showNotification("Failed to send confirmation: " + errorMsg, "error");
        reject(new Error(errorMsg));
      }
    } catch (error) {
      showNotification("Error sending confirmation", "error");
      reject(error);
    }
  });
}

function issueRefund(orderId) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });

      if (res.ok) {
        showNotification("Order refunded successfully", "success");
        resolve();
      } else {
        const error = await res.json();
        const errorMsg = error.error || "Unknown error";
        showNotification("Failed to refund order: " + errorMsg, "error");
        reject(new Error(errorMsg));
      }
    } catch (error) {
      showNotification("Error refunding order", "error");
      reject(error);
    }
  });
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="close-notification">×</button>
    </div>
  `;
  
  // Add to container
  container.appendChild(notification);
  
  // Add close button functionality
  notification.querySelector('.close-notification').addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add styles for status badges and notifications
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("status-badge-styles")) {
    const style = document.createElement("style");
    style.id = "status-badge-styles";
    style.textContent = `
      /* Notification styles */
      #notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      }
      
      .notification {
        padding: 12px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slide-in 0.3s ease-out forwards;
        background-color: white;
        border-left: 4px solid #3498db;
      }
      
      .notification.success {
        border-left-color: #2ecc71;
      }
      
      .notification.error {
        border-left-color: #e74c3c;
      }
      
      .notification.warning {
        border-left-color: #f39c12;
      }
      
      .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .close-notification {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #7f8c8d;
        margin-left: 10px;
      }
      
      .notification.fade-out {
        opacity: 0;
        transform: translateX(40px);
        transition: opacity 0.3s, transform 0.3s;
      }
      
      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      /* Status badge styles */
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
