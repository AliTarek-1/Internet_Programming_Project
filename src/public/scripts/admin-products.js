// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  await verifyToken();
  fetchAndRenderProducts();
  bindFormSubmit();
});

// Verify Admin Token
async function verifyToken() {
  try {
    const res = await fetch("/api/admin/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Invalid token");

    const data = await res.json();
    const admin = data.data || data.admin || data;

    if (!admin || !["admin", "superadmin"].includes(admin.role)) {
      throw new Error("Not authorized");
    }

    console.log("Admin verified:", admin.name);
  } catch (err) {
    console.error("Token verification error:", err.message);
    localStorage.removeItem("token");
    window.location.href = "/login-admin.html";
  }
}

// Global variable to track if we're in edit mode
let editingProduct = null;

function bindFormSubmit() {
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

    const url = editingProduct
      ? `/api/products/${editingProduct._id}`
      : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification(
          `Product ${editingProduct ? "updated" : "added"} successfully!`,
          "success"
        );
        form.reset();
        fetchAndRenderProducts();

        const btn = document.querySelector("#add-product-form button");
        btn.textContent = "Add Product";

        // Clear edit mode after success
        editingProduct = null;
      } else {
        const error = await res.json();
        showNotification("Failed to save product: " + error.message, "error");
      }
    } catch (err) {
      showNotification("Error saving product. Please try again.", "error");
    }
  });
}
// Fetch and Render Products List
async function fetchAndRenderProducts() {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      showNotification("Failed to load products", "error");
      return;
    }

    const { products } = await res.json();
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (!products || products.length === 0) {
      container.innerHTML =
        "<p>No products found. Add your first product using the form above.</p>";
      return;
    }

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

      const nameCell = document.createElement("td");
      nameCell.textContent = product.name || "Unnamed Product";

      const categoryCell = document.createElement("td");
      categoryCell.textContent = product.category || "No category";

      const priceCell = document.createElement("td");
      priceCell.textContent = product.price
        ? `$${product.price.toFixed(2)}`
        : "N/A";

      const stockCell = document.createElement("td");
      stockCell.textContent =
        product.inventory !== undefined ? product.inventory : "?";

      const actionsCell = document.createElement("td");

      const updateBtn = document.createElement("button");
      updateBtn.textContent = "Edit";
      updateBtn.addEventListener("click", () => editProduct(product));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "danger";
      deleteBtn.addEventListener("click", () => deleteProduct(product._id));

      actionsCell.appendChild(updateBtn);
      actionsCell.appendChild(deleteBtn);

      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(categoryCell);
      row.appendChild(priceCell);
      row.appendChild(stockCell);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    container.appendChild(table);
  } catch (err) {
    showNotification("Error loading products", "error");
  }
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      showNotification("Product deleted successfully", "success");
      fetchAndRenderProducts();
    } else {
      showNotification("Failed to delete product", "error");
    }
  } catch (err) {
    showNotification("Error deleting product", "error");
  }
}

// When editing, set editingProduct and update the button text
function editProduct(product) {
  editingProduct = product;

  document.getElementById("name").value = product.name || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("image").value = product.images?.[0] || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("type").value = product.type || "";
  document.getElementById("stock").value = product.inventory || 0;
  document.getElementById("sku").value = product.sku || "";

  const btn = document.querySelector("#add-product-form button");
  btn.textContent = "Update Product";

  document
    .getElementById("add-product-form")
    .scrollIntoView({ behavior: "smooth" });
}

function showNotification(message, type = "success") {
  const existing = document.querySelector(".custom-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `custom-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Notification CSS (Add to your CSS or dynamically inject if needed)
const style = document.createElement("style");
style.textContent = `
  .custom-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    color: white;
    border-radius: 4px;
    z-index: 9999;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .custom-notification.success { background-color: #28a745; }
  .custom-notification.error { background-color: #dc3545; }
`;
document.head.appendChild(style);
