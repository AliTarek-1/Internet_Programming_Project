// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verify token
  await verifyToken();
  
  // Load promotions
  fetchAndRenderPromotions();
  
  // Bind form submit event
  bindPromotionFormSubmit();
  
  // Set default dates
  setDefaultDates();
  
  // Setup promo type change handler
  setupPromoTypeHandler();
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

// Set default dates for promotion form
function setDefaultDates() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);
  
  // Format dates for input fields (YYYY-MM-DD)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  document.getElementById('promo-start').value = formatDate(today);
  document.getElementById('promo-end').value = formatDate(nextMonth);
}

// Setup promo type change handler to show/hide coupon settings
function setupPromoTypeHandler() {
  const promoTypeSelect = document.getElementById('promo-type');
  const couponSettings = document.getElementById('coupon-settings');
  const couponProductScope = document.getElementById('coupon-product-scope');
  const categorySelector = document.getElementById('category-selector');
  
  // Initial state
  toggleCouponSettings();
  
  // Add event listener for promo type change
  promoTypeSelect.addEventListener('change', toggleCouponSettings);
  
  // Add event listener for product scope change
  if (couponProductScope) {
    couponProductScope.addEventListener('change', function() {
      categorySelector.style.display = this.value === 'category' ? 'block' : 'none';
    });
  }
  
  // Toggle function
  function toggleCouponSettings() {
    if (promoTypeSelect.value === 'coupon') {
      couponSettings.style.display = 'block';
      document.getElementById('promo-code').required = true;
      document.getElementById('promo-code').placeholder = 'Coupon Code (Required)';
    } else {
      couponSettings.style.display = 'none';
      document.getElementById('promo-code').required = false;
      document.getElementById('promo-code').placeholder = 'Coupon Code (Optional)';
    }
  }
}

// Promotions Section
async function fetchAndRenderPromotions() {
  try {
    const res = await fetch("/api/discount");
    
    if (!res.ok) {
      showNotification("Failed to load promotions", "error");
      return;
    }
    
    const data = await res.json();
    const promotions = data.discount || [];
    
    const container = document.getElementById("promotion-list");
    container.innerHTML = "";
    
    if (promotions.length === 0) {
      container.innerHTML = "<p>No active promotions found. Create your first promotion using the form above.</p>";
      return;
    }
    
    // Create a table for promotions
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Value</th>
          <th>Code</th>
          <th>Valid Until</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector("tbody");
    
    promotions.forEach(promo => {
      const row = document.createElement("tr");
      
      const validUntil = new Date(promo.endDate).toLocaleDateString();
      const discountValue = promo.discountType === "percentage" ? 
        `${promo.value}%` : `$${promo.value.toFixed(2)}`;
      
      row.innerHTML = `
        <td>${promo.description || "Unnamed Promotion"}</td>
        <td>${promo.discountType || "N/A"}</td>
        <td>${discountValue}</td>
        <td>${promo.code || "No code required"}</td>
        <td>${validUntil}</td>
        <td>
          <button class="danger delete-promo-btn" data-id="${promo._id}">Delete</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    container.appendChild(table);
    
    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-promo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this promotion?")) {
          deletePromotion(id);
        }
      });
    });
    
  } catch (error) {
    showNotification("Error loading promotions", "error");
  }
}

function bindPromotionFormSubmit() {
  const form = document.getElementById("add-promotion-form");
  
  // Handle promo type change to toggle code field requirement
  const promoType = document.getElementById("promo-type");
  const promoCode = document.getElementById("promo-code");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    try {
      const title = document.getElementById("promo-title").value;
      const type = document.getElementById("promo-type").value;
      const value = parseFloat(document.getElementById("promo-value").value);
      const code = document.getElementById("promo-code").value;
      const startDate = document.getElementById("promo-start").value;
      const endDate = document.getElementById("promo-end").value;
      const usageLimit = parseInt(document.getElementById("promo-usage").value || "100");
      
      const formData = {
        description: title,
        discountType: type,
        value,
        code: code || null,
        startDate,
        endDate,
        usageLimit
      };
      
      // Add coupon-specific settings if type is coupon
      if (type === 'coupon') {
        const minPurchase = parseFloat(document.getElementById("min-purchase").value || "0");
        const limitPerUser = parseInt(document.getElementById("coupon-limit-per-user").value || "0");
        const productScope = document.getElementById("coupon-product-scope").value;
        
        formData.couponSettings = {
          minPurchase,
          limitPerUser,
          productScope
        };
        
        // Add category if specific category is selected
        if (productScope === 'category') {
          formData.couponSettings.category = document.getElementById("coupon-category").value;
        }
      }
      
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        showNotification("Promotion added successfully!", "success");
        form.reset();
        setDefaultDates();
        fetchAndRenderPromotions();
        // Reset coupon settings display
        document.getElementById('coupon-settings').style.display = 'none';
        document.getElementById('category-selector').style.display = 'none';
      } else {
        const error = await res.json();
        showNotification("Failed to add promotion: " + (error.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Error adding promotion", "error");
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

async function deletePromotion(id) {
  try {
    const res = await fetch(`/api/discount/${id}`, { 
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    
    if (res.ok) {
      showNotification("Promotion deleted successfully", "success");
      fetchAndRenderPromotions();
    } else {
      showNotification("Failed to delete promotion", "error");
    }
  } catch (error) {
    showNotification("Error deleting promotion", "error");
  }
}

// Add notification styles
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
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
    `;
    document.head.appendChild(style);
  }
});
