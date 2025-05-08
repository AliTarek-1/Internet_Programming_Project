function addToCart(productName, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if item already exists
  const existingItemIndex = cart.findIndex(
    (item) => item.productName === productName
  );

  if (existingItemIndex !== -1) {
    // If item exists, increase quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // If item doesn't exist, add new
    cart.push({ productName, price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${productName} added to cart!`);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalCount = 0;
  cart.forEach((item) => (totalCount += item.quantity));
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.innerText = totalCount;
  }
}
// Handle star rating clicks
function setupStars() {
  const starElements = document.querySelectorAll(".stars");

  starElements.forEach((starsContainer) => {
    const productName = starsContainer.getAttribute("data-product");
    const stars = starsContainer.querySelectorAll("span");

    // Load saved rating
    const savedRatings = JSON.parse(localStorage.getItem("ratings")) || {};
    const savedRating = savedRatings[productName];

    if (savedRating) {
      updateStarDisplay(stars, savedRating);
    }

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        const rating = index + 1; // Because index starts at 0
        let ratings = JSON.parse(localStorage.getItem("ratings")) || {};
        ratings[productName] = rating;
        localStorage.setItem("ratings", JSON.stringify(ratings));

        updateStarDisplay(stars, rating);
      });
    });
  });
}

function updateStarDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.innerText = "★";
    } else {
      star.innerText = "☆";
    }
  });
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupStars();
});

document.addEventListener('DOMContentLoaded', () => {
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");

  if (userIcon && userDropdown) {
    userIcon.addEventListener("click", () => {
      userDropdown.style.display =
        userDropdown.style.display === "flex" ? "none" : "flex";
    });
  }
});

// Optional: close dropdown if click outside
window.addEventListener("click", (e) => {
  if (!document.querySelector(".user-menu").contains(e.target)) {
    userDropdown.style.display = "none";
  }
});
