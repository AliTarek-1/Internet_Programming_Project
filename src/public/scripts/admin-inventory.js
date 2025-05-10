// Authentication Check
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login-admin.html";

document.addEventListener("DOMContentLoaded", async () => {
  await verifyToken();
  renderInventory();
  setupModal();
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
    if (!admin || !["admin", "superadmin"].includes(admin.role))
      throw new Error("Not authorized");
    console.log("Admin verified:", admin.name);
  } catch (err) {
    console.error("Verification error:", err.message);
    localStorage.removeItem("token");
    window.location.href = "/login-admin.html";
  }
}

// Render Inventory Table
async function renderInventory() {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return showNotification("Failed to load inventory", "error");

    const { products } = await res.json();
    const tbody = document.querySelector("#inventory-table tbody");
    tbody.innerHTML = "";

    if (!products?.length) {
      tbody.innerHTML = '<tr><td colspan="5">No products found.</td></tr>';
      return;
    }

    products.forEach((product) => {
      const row = document.createElement("tr");
      const stockStatus =
        product.inventory <= 0
          ? "Out of Stock"
          : product.inventory < 10
          ? "Low Stock"
          : "In Stock";
      const statusClass =
        product.inventory <= 0
          ? "danger"
          : product.inventory < 10
          ? "warning"
          : "success";

      row.innerHTML = `
        <td>${product.name || "Unnamed"}</td>
        <td>${product.sku || "N/A"}</td>
        <td>${product.inventory ?? "?"}</td>
        <td><span class="${statusClass}">${stockStatus}</span></td>
        <td><button class="restock-btn" data-sku="${product.sku}" data-name="${
        product.name
      }">Restock</button></td>
      `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".restock-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openRestockModal(btn.dataset.sku, btn.dataset.name);
      });
    });
  } catch (err) {
    showNotification("Error loading inventory", "error");
  }
}

// Modal Controls
function setupModal() {
  const modal = document.getElementById("restock-modal");
  modal
    .querySelector(".close")
    .addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document
    .getElementById("restock-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const sku = document.getElementById("restock-sku").value;
      const qty = parseInt(document.getElementById("restock-quantity").value);
      if (!sku || isNaN(qty) || qty <= 0)
        return showNotification("Enter a valid quantity", "error");
      await restockItem(sku, qty);
      modal.style.display = "none";
    });
}

function openRestockModal(sku, productName) {
  const modal = document.getElementById("restock-modal");
  document.getElementById("restock-sku").value = sku;
  document.getElementById("restock-product-name").textContent =
    productName || "Product";
  document.getElementById("restock-quantity").value = "10";
  modal.style.display = "block";
}

// Restock Logic
async function restockItem(sku, quantity) {
  try {
    const res = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch products");

    const { products } = await res.json();
    const product = products.find((p) => p.sku === sku);
    if (!product) throw new Error("Product not found");

    const updateRes = await fetch(`/api/products/${product._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...product,
        inventory: (product.inventory || 0) + quantity,
      }),
    });

    if (!updateRes.ok) throw new Error("Failed to update inventory");

    showNotification(`Added ${quantity} items to inventory.`, "success");
    renderInventory();
  } catch (err) {
    showNotification(`Error restocking: ${err.message}`, "error");
  }
}

function showNotification(message, type = "info") {
  // Remove existing notification if present
  const oldNotification = document.querySelector(".notification");
  if (oldNotification) oldNotification.remove();

  // Create new notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`; // success, error, info, etc.
  notification.textContent = message;

  // Style the notification (optional, or you can keep this in CSS)
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.padding = "15px 25px";
  notification.style.color = "#fff";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "9999";
  notification.style.fontSize = "16px";
  notification.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  // Color based on type
  switch (type) {
    case "success":
      notification.style.backgroundColor = "#28a745";
      break;
    case "error":
      notification.style.backgroundColor = "#dc3545";
      break;
    case "warning":
      notification.style.backgroundColor = "#ffc107";
      notification.style.color = "#333";
      break;
    default:
      notification.style.backgroundColor = "#17a2b8";
  }

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
