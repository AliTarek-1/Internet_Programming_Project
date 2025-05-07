document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderProducts();

  document
    .getElementById("add-product-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const newProduct = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        images: [document.getElementById("image").value],
        category: document.getElementById("category").value,
        stock: parseInt(document.getElementById("stock").value),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        alert("Product added successfully!");
        document.getElementById("add-product-form").reset();
        fetchAndRenderProducts();
      } else {
        const error = await res.json();
        alert("Failed to add product: " + error.message);
      }
    });
});

async function fetchAndRenderProducts() {
  const res = await fetch("/api/products", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!res.ok) return alert("Failed to load products");

  const { data } = await res.json();
  const container = document.getElementById("product-list");
  container.innerHTML = "<h3>Existing Products</h3>";

  data.forEach((product) => {
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
      <button onclick="deleteProduct('${product._id}')">Delete</button>
      <button onclick='editProduct(${JSON.stringify(product)})'>Update</button>
      <hr>
    `;
    container.appendChild(div);
  });
}

async function deleteProduct(id) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (res.ok) {
    alert("Product deleted.");
    fetchAndRenderProducts();
  } else {
    alert("Failed to delete product.");
  }
}

function editProduct(product) {
  // Autofill the form
  document.getElementById("name").value = product.name || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("image").value = product.images?.[0] || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("stock").value = product.stock || "";

  // Change button to update mode
  const button = document.querySelector("#add-product-form button");
  button.textContent = "Update Product";
  button.style.backgroundColor = "#ffa500";

  // Replace the event listener
  const form = document.getElementById("add-product-form");
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedProduct = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      images: [document.getElementById("image").value],
      category: document.getElementById("category").value,
      stock: parseInt(document.getElementById("stock").value),
    };

    const res = await fetch(`/api/products/${product._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(updatedProduct),
    });

    if (res.ok) {
      alert("Product updated!");
      newForm.reset();
      fetchAndRenderProducts();

      // Restore the button
      const btn = document.querySelector("#add-product-form button");
      btn.textContent = "Add Product";
      btn.style.backgroundColor = "#007bff";
    } else {
      const error = await res.json();
      alert("Failed to update product: " + error.message);
    }
  });
}
