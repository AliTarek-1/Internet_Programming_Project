// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verify token
  await verifyToken();
  
  // Load products
  fetchAndRenderProducts();
  
  // Bind form submit event
  bindFormSubmit();
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

// Product Form Handling
function bindFormSubmit(product = null) {
  const form = document.getElementById("add-product-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      productID: "PROD-" + Date.now(),
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      oldPrice: 0,
      category: document.getElementById("category").value.trim(),
      type: document.getElementById("type").value.trim(),
      image: document.getElementById("image").value.trim(),
      inventory: parseInt(document.getElementById("stock").value),
      sku: document.getElementById("sku").value.trim(),
      tags: [],
      featured: false,
    };

    const url = product ? `/api/products/${product._id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification(`Product ${product ? "updated" : "added"} successfully!`, "success");
        form.reset();
        fetchAndRenderProducts();
        
        if (product) {
          const btn = document.querySelector("#add-product-form button");
          btn.textContent = "Add Product";
        }
      } else {
        const error = await res.json();
        showNotification("Failed to save product: " + error.message, "error");
      }
    } catch (error) {
      showNotification("Error saving product. Please try again.", "error");
    }
  });
}

// Products Section
async function fetchAndRenderProducts() {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      showNotification("Failed to load products", "error");
      return;
    }

    const { products } = await res.json();
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (!products || products.length === 0) {
      container.innerHTML = "<p>No products found. Add your first product using the form above.</p>";
      return;
    }

    // Create a table for products
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector("tbody");

    products.forEach((product) => {
      const row = document.createElement("tr");
      
      // Image cell
      const imgCell = document.createElement("td");
      if (product.images && product.images[0]) {
        const img = document.createElement("img");
        img.src = product.images[0];
        img.alt = product.name;
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.objectFit = "cover";
        imgCell.appendChild(img);
      } else {
        imgCell.textContent = "No image";
      }
      
      // Create other cells
      const nameCell = document.createElement("td");
      nameCell.textContent = product.name || "Unnamed Product";
      
      const categoryCell = document.createElement("td");
      categoryCell.textContent = product.category || "No category";
      
      const priceCell = document.createElement("td");
      priceCell.textContent = product.price ? `$${product.price.toFixed(2)}` : "N/A";
      
      const stockCell = document.createElement("td");
      stockCell.textContent = product.inventory !== undefined ? product.inventory : "?";
      
      // Actions cell
      const actionsCell = document.createElement("td");
      actionsCell.className = "action-buttons";
      
      const updateBtn = document.createElement("button");
      updateBtn.textContent = "Edit";
      updateBtn.addEventListener("click", () => editProduct(product));
      
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "danger";
      deleteBtn.addEventListener("click", () => deleteProduct(product._id));
      
      actionsCell.appendChild(updateBtn);
      actionsCell.appendChild(deleteBtn);
      
      // Add all cells to the row
      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(categoryCell);
      row.appendChild(priceCell);
      row.appendChild(stockCell);
      row.appendChild(actionsCell);
      
      // Add row to table
      tbody.appendChild(row);
    });
    
    container.appendChild(table);
  } catch (error) {
    showNotification("Error loading products", "error");
  }
}

async function deleteProduct(id) {
  try {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      showNotification("Product deleted successfully", "success");
      fetchAndRenderProducts();
    } else {
      showNotification("Failed to delete product", "error");
    }
  } catch (error) {
    showNotification("Error deleting product", "error");
  }
}

function editProduct(product) {
  // Populate form with product data
  document.getElementById("name").value = product.name || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("image").value = product.images?.[0] || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("type").value = product.type || "";
  document.getElementById("stock").value = product.inventory || 0;
  document.getElementById("sku").value = product.sku || "";

  // Change button text and scroll to form
  const btn = document.querySelector("#add-product-form button");
  btn.textContent = "Update Product";
  
  // Scroll to form
  document.getElementById("add-product-form").scrollIntoView({ behavior: "smooth" });
  
  // Set up form for update
  bindFormSubmit(product);
}
