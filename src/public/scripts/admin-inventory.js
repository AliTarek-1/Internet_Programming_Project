// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verify token
  await verifyToken();
  
  // Load inventory
  renderInventory();
  
  // Set up modal functionality
  setupModal();
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

// Inventory Section with Low Stock Alerts and Restock
async function renderInventory() {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      showNotification("Failed to load inventory", "error");
      return;
    }

    const { products } = await res.json();
    
    // Render low stock alerts
    renderLowStockAlerts(products);
    
    // Render inventory table
    const tbody = document.querySelector("#inventory-table tbody");
    tbody.innerHTML = "";

    if (!products || products.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="5">No products found in inventory</td>';
      tbody.appendChild(row);
      return;
    }

    products.forEach((product) => {
      const row = document.createElement("tr");
      
      // Determine stock status
      let stockStatus = "In Stock";
      let statusClass = "success";
      
      if (product.inventory <= 0) {
        stockStatus = "Out of Stock";
        statusClass = "danger";
      } else if (product.inventory < 10) {
        stockStatus = "Low Stock";
        statusClass = "warning";
      }
      
      row.innerHTML = `
        <td>${product.name || "Unnamed Product"}</td>
        <td>${product.sku || "N/A"}</td>
        <td>${product.inventory !== undefined ? product.inventory : "?"}</td>
        <td><span class="${statusClass}">${stockStatus}</span></td>
        <td>
          <button class="restock-btn" data-sku="${product.sku}" data-name="${product.name}">
            Restock
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Add event listeners to restock buttons
    document.querySelectorAll(".restock-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const sku = btn.getAttribute("data-sku");
        const name = btn.getAttribute("data-name");
        openRestockModal(sku, name);
      });
    });
    
  } catch (error) {
    showNotification("Error loading inventory data", "error");
  }
}

function renderLowStockAlerts(products) {
  const alertsContainer = document.getElementById("low-stock-alerts");
  alertsContainer.innerHTML = "";
  
  if (!products || products.length === 0) {
    alertsContainer.innerHTML = "<p>No products found in inventory</p>";
    return;
  }
  
  // Filter products with low stock (less than 10)
  const lowStockProducts = products.filter(product => product.inventory < 10);
  
  if (lowStockProducts.length === 0) {
    alertsContainer.innerHTML = "<p>No low stock items found. Inventory levels are healthy!</p>";
    return;
  }
  
  // Create alert cards for each low stock product
  lowStockProducts.forEach(product => {
    const alertCard = document.createElement("div");
    alertCard.className = "low-stock-card";
    
    // Determine severity class based on inventory level
    let severityClass = "warning";
    if (product.inventory <= 0) {
      severityClass = "danger";
    }
    
    alertCard.innerHTML = `
      <div class="alert-header ${severityClass}">
        <h3>${product.name || "Unnamed Product"}</h3>
        <span class="stock-level">${product.inventory}</span>
      </div>
      <div class="alert-body">
        <p><strong>SKU:</strong> ${product.sku || "N/A"}</p>
        <p><strong>Category:</strong> ${product.category || "N/A"}</p>
        <button class="restock-btn" data-sku="${product.sku}" data-name="${product.name}">
          Restock Now
        </button>
      </div>
    `;
    
    alertsContainer.appendChild(alertCard);
  });
  
  // Add event listeners to restock buttons in alerts
  alertsContainer.querySelectorAll(".restock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sku = btn.getAttribute("data-sku");
      const name = btn.getAttribute("data-name");
      openRestockModal(sku, name);
    });
  });
}

function setupModal() {
  const modal = document.getElementById("restock-modal");
  const closeBtn = modal.querySelector(".close");
  const form = document.getElementById("restock-form");
  
  // Close modal when clicking the X
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  // Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  
  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const sku = document.getElementById("restock-sku").value;
    const quantity = parseInt(document.getElementById("restock-quantity").value);
    
    if (!sku || isNaN(quantity) || quantity <= 0) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }
    
    await restockItem(sku, quantity);
    modal.style.display = "none";
  });
}

function openRestockModal(sku, productName) {
  const modal = document.getElementById("restock-modal");
  document.getElementById("restock-sku").value = sku;
  document.getElementById("restock-product-name").textContent = productName || "Product";
  document.getElementById("restock-quantity").value = "10";
  modal.style.display = "block";
}

async function restockItem(sku, quantity) {
  try {
    // Find the product by SKU
    const productsRes = await fetch("/api/products", {
      headers: { Authorization: "Bearer " + token },
    });
    
    if (!productsRes.ok) {
      throw new Error("Failed to fetch products");
    }
    
    const { products } = await productsRes.json();
    const product = products.find(p => p.sku === sku);
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Update inventory
    const updateRes = await fetch(`/api/products/${product._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        ...product,
        inventory: (product.inventory || 0) + quantity,
      }),
    });
    
    if (!updateRes.ok) {
      throw new Error("Failed to update inventory");
    }
    
    showNotification(`Successfully added ${quantity} items to inventory`, "success");
    renderInventory();
    
  } catch (error) {
    showNotification(`Error restocking item: ${error.message}`, "error");
  }
}

// Add modal styles if not already in CSS
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("modal-styles")) {
    const style = document.createElement("style");
    style.id = "modal-styles";
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        background-color: white;
        margin: 15% auto;
        padding: 20px;
        border-radius: 5px;
        width: 50%;
        max-width: 500px;
      }
      
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .close:hover {
        color: black;
      }
      
      .low-stock-card {
        margin-bottom: 15px;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        color: white;
      }
      
      .alert-header.warning {
        background-color: #f39c12;
      }
      
      .alert-header.danger {
        background-color: #e74c3c;
      }
      
      .alert-header h3 {
        margin: 0;
      }
      
      .stock-level {
        font-weight: bold;
        background: rgba(255, 255, 255, 0.2);
        padding: 3px 8px;
        border-radius: 10px;
      }
      
      .alert-body {
        padding: 15px;
        background-color: white;
      }
    `;
    document.head.appendChild(style);
  }
});
