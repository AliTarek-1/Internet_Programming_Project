document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderProducts();
  renderInventory();
  bindFormSubmit(); // Initial form submission handler
  fetchAndRenderOrders();
});

function bindFormSubmit(product = null) {
  const form = document.getElementById("add-product-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      productID: "PROD-" + Date.now(), // or any unique generator
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      oldPrice: 0, // optional
      category: document.getElementById("category").value.trim(), // must match enum
      type: "Shirts", // hardcoded or from a dropdown that matches enum
      image: document.getElementById("image").value.trim(), // not images[0]
      inventory: parseInt(document.getElementById("stock").value),
      sku: document.getElementById("sku").value.trim(), // <- new required input
      tags: [], // optional
      featured: false, // optional
    };

    const url = product ? `/api/products/${product._id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(`Product ${product ? "updated" : "added"} successfully!`);
      form.reset();
      fetchAndRenderProducts();
      renderInventory();
      const btn = document.querySelector("#add-product-form button");
      btn.textContent = "Add Product";
      btn.style.backgroundColor = "#007bff";
    } else {
      const error = await res.json();
      alert("Failed to save product: " + error.message);
    }
  });
}

async function fetchAndRenderProducts() {
  const res = await fetch("/api/products", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!res.ok) return alert("Failed to load products");

  const { products } = await res.json();
  const container = document.getElementById("product-list");
  container.innerHTML = "<h3>Existing Products</h3>";

  products.forEach((product) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <b>${product.name || "Unnamed Product"}</b> (${
      product.category || "No category"
    })<br>
      $${product.price ?? "N/A"} - Stock: ${product.stock ?? "?"}<br>
      ${product.description ? `<i>${product.description}</i><br>` : ""}
      ${
        product.images?.[0]
          ? `<img src="${product.images[0]}" width="100"><br>`
          : ""
      }
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteProduct(product._id));
    div.appendChild(deleteBtn);

    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.addEventListener("click", () => editProduct(product));
    div.appendChild(updateBtn);

    div.appendChild(document.createElement("hr"));
    container.appendChild(div);
  });
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (res.ok) {
    alert("Product deleted.");
    fetchAndRenderProducts();
    renderInventory();
  } else {
    alert("Failed to delete product.");
  }
}

function editProduct(product) {
  document.getElementById("name").value = product.name || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("image").value = product.images?.[0] || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("stock").value = product.stock || "";

  const button = document.querySelector("#add-product-form button");
  button.textContent = "Update Product";
  button.style.backgroundColor = "#ffa500";

  const form = document.getElementById("add-product-form");
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  bindFormSubmit(product);
}

async function renderInventory() {
  const res = await fetch("/api/inventory", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!res.ok) return alert("Failed to load inventory");

  const { data } = await res.json(); // ✅ Fix: not `products`, it's `data`
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td style="color: ${
        item.status === "Out of Stock"
          ? "red"
          : item.status === "Low Stock"
          ? "orange"
          : "green"
      }">${item.status}</td>
    `;

    tbody.appendChild(row);
  });
}

async function fetchAndRenderOrders() {
  const res = await fetch("/api/orders", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!res.ok) return alert("Failed to load orders");

  const { orders } = await res.json();
  const tbody = document.querySelector("#orders-table tbody");
  tbody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");

    // Order ID
    const idCell = document.createElement("td");
    idCell.textContent = order.orderId;
    row.appendChild(idCell);

    // Customer
    const customerCell = document.createElement("td");
    customerCell.textContent = order.customer?.fullName || "Unknown";
    row.appendChild(customerCell);

    // Status
    const statusCell = document.createElement("td");
    statusCell.textContent = order.status;
    row.appendChild(statusCell);

    // Actions
    const actionCell = document.createElement("td");

    const shipBtn = document.createElement("button");
    shipBtn.textContent = "Mark as Shipped";
    shipBtn.classList.add("btn", "btn-primary");
    shipBtn.addEventListener("click", () =>
      updateOrderStatus(order.orderId, "shipped")
    );
    actionCell.appendChild(shipBtn);

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Send Confirmation";
    confirmBtn.classList.add("btn", "btn-primary");
    confirmBtn.addEventListener("click", () =>
      sendOrderConfirmation(order.orderId)
    );
    actionCell.appendChild(confirmBtn);

    const refundBtn = document.createElement("button");
    refundBtn.textContent = "Refund";
    refundBtn.classList.add("btn", "btn-primary");
    refundBtn.addEventListener("click", () => issueRefund(order.orderId));
    actionCell.appendChild(refundBtn);

    row.appendChild(actionCell);
    tbody.appendChild(row);
  });
}

async function updateOrderStatus(orderId, status) {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ status }),
  });
  if (res.ok) {
    alert("Order status updated");
    fetchAndRenderOrders();
  } else {
    const error = await res.json();
    alert("Failed to update status: " + error.error);
  }
}

async function sendOrderConfirmation(orderId) {
  const res = await fetch(`/api/orders/${orderId}/confirm`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    alert("Confirmation email sent");
  } else {
    const error = await res.json();
    alert("Failed to send confirmation: " + error.error);
  }
}

async function issueRefund(orderId) {
  const res = await fetch(`/api/orders/${orderId}/refund`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  if (res.ok) {
    alert("Order refunded successfully");
    fetchAndRenderOrders();
  } else {
    const error = await res.json();
    alert("Failed to refund order: " + error.error);
  }
}
