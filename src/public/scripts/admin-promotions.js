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
      
      const validUntil = new Date(promo.end_date).toLocaleDateString();
      const discountValue = promo.discount_type === "percentage" ? 
        `${promo.value}%` : `$${promo.value.toFixed(2)}`;
      
      row.innerHTML = `
        <td>${promo.title || "Unnamed Promotion"}</td>
        <td>${promo.discount_type || "N/A"}</td>
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
  
  promoType.addEventListener("change", () => {
    if (promoType.value === "coupon") {
      promoCode.setAttribute("required", "required");
      promoCode.setAttribute("placeholder", "Coupon Code (Required)");
    } else {
      promoCode.removeAttribute("required");
      promoCode.setAttribute("placeholder", "Coupon Code (Optional)");
    }
  });
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById("promo-title").value.trim(),
      discount_type: document.getElementById("promo-type").value,
      value: parseFloat(document.getElementById("promo-value").value),
      code: document.getElementById("promo-code").value.trim() || undefined,
      start_date: document.getElementById("promo-start").value,
      end_date: document.getElementById("promo-end").value,
      usage_limit: parseInt(document.getElementById("promo-usage").value) || 100,
      status: "active",
    };
    
    try {
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
      } else {
        const error = await res.json();
        showNotification("Failed to add promotion: " + (error.message || "Unknown error"), "error");
      }
    } catch (error) {
      showNotification("Error adding promotion", "error");
    }
  });
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
