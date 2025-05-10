// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verify token and load dashboard data
  await verifyToken();
  
  // Load dashboard stats
  fetchDashboardStats();
  
  // Load recent orders
  fetchRecentOrders();
  
  // Load low stock alerts
  fetchLowStockAlerts();
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

// Fetch dashboard statistics
async function fetchDashboardStats() {
  try {
    // Fetch products count
    const productsRes = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      document.getElementById('total-products').textContent = 
        productsData.products ? productsData.products.length : 0;
    }
    
    // Fetch orders count
    const ordersRes = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json();
      document.getElementById('total-orders').textContent = 
        ordersData.orders ? ordersData.orders.length : 0;
    }
    
    // Fetch promotions count
    const promoRes = await fetch("/api/discount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (promoRes.ok) {
      const promoData = await promoRes.json();
      document.getElementById('active-promotions').textContent = 
        promoData.discount ? promoData.discount.length : 0;
    }
    
    // Count low stock items
    const inventoryRes = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (inventoryRes.ok) {
      const inventoryData = await inventoryRes.json();
      const lowStockItems = inventoryData.products ? 
        inventoryData.products.filter(product => product.inventory < 10).length : 0;
      document.getElementById('low-stock').textContent = lowStockItems;
    }
    
  } catch (error) {
    showNotification('Error loading dashboard statistics', 'error');
  }
}

// Fetch recent orders
async function fetchRecentOrders() {
  try {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const data = await res.json();
    const orders = data.orders || [];
    
    // Get the most recent 5 orders
    const recentOrders = orders.slice(0, 5);
    
    const tbody = document.querySelector('#recent-orders-table tbody');
    tbody.innerHTML = '';
    
    if (recentOrders.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6">No recent orders found</td>';
      tbody.appendChild(row);
      return;
    }
    
    recentOrders.forEach(order => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(order.date).toLocaleDateString();
      
      // Extract customer name from different possible locations in the order object
      let customerName = 'N/A';
      if (order.customer && order.customer.fullName) {
        customerName = order.customer.fullName;
      } else if (order.customer && order.customer.name) {
        customerName = order.customer.name;
      } else if (order.customerName) {
        customerName = order.customerName;
      }
      
      // Extract total from different possible locations in the order object
      let orderTotal = 'N/A';
      if (order.total) {
        orderTotal = `$${parseFloat(order.total).toFixed(2)}`;
      } else if (order.totals && order.totals.total) {
        orderTotal = `$${parseFloat(order.totals.total).toFixed(2)}`;
      } else if (order.totalAmount) {
        orderTotal = `$${parseFloat(order.totalAmount).toFixed(2)}`;
      }
      
      row.innerHTML = `
        <td>${order.orderId || 'N/A'}</td>
        <td>${date}</td>
        <td>${customerName}</td>
        <td>${orderTotal}</td>
        <td>${order.status || 'pending'}</td>
        <td>
          <div class="action-buttons">
            <a href="/admin-orders.html?id=${order._id || order.orderId}" class="button">View Details</a>
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Log for debugging
    console.log('Recent orders loaded:', recentOrders);
    
  } catch (error) {
    console.error('Error loading recent orders:', error);
    // Check if showNotification function exists
    if (typeof showNotification === 'function') {
      showNotification('Error loading recent orders', 'error');
    } else {
      console.error('Error loading recent orders');
    }
  }
}

// Fetch low stock alerts
async function fetchLowStockAlerts() {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await res.json();
    const products = data.products || [];
    
    // Filter products with low stock (less than 10)
    const lowStockProducts = products.filter(product => product.inventory < 10);
    
    const alertsContainer = document.getElementById('low-stock-alerts');
    alertsContainer.innerHTML = '';
    
    if (lowStockProducts.length === 0) {
      alertsContainer.innerHTML = '<p>No low stock items found</p>';
      return;
    }
    
    // Display up to 5 low stock alerts
    lowStockProducts.slice(0, 5).forEach(product => {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'low-stock-alert';
      
      alertDiv.innerHTML = `
        <p><strong>${product.name || 'Unnamed Product'}</strong></p>
        <p>SKU: ${product.sku || 'N/A'}</p>
        <p>Current Stock: <span class="stock-level">${product.inventory}</span></p>
        <a href="/admin-inventory.html" class="button">Manage Inventory</a>
      `;
      
      alertsContainer.appendChild(alertDiv);
    });
    
  } catch (error) {
    showNotification('Error loading low stock alerts', 'error');
  }
}
