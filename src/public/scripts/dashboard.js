document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderProducts();
  renderInventory();
  bindFormSubmit(); // Initial form submission handler
});

function bindFormSubmit(product = null) {
  const form = document.getElementById("add-product-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      images: [document.getElementById("image").value],
      category: document.getElementById("category").value,
      stock: parseInt(document.getElementById("stock").value),
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

  const { products } = await res.json();
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    const status =
      product.stock === 0
        ? "Out of Stock"
        : product.stock <= 10
        ? "Low Stock"
        : "In Stock";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name || "Unnamed"}</td>
      <td>${product.stock ?? "N/A"}</td>
      <td style="color: ${
        status === "Out of Stock"
          ? "red"
          : status === "Low Stock"
          ? "orange"
          : "green"
      }">${status}</td>
    `;
    tbody.appendChild(row);
  });
}
