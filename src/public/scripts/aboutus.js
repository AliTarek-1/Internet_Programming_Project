const userIcon = document.getElementById("userIcon");
const userDropdown = document.getElementById("userDropdown");

userIcon.addEventListener("click", () => {
  userDropdown.style.display =
    userDropdown.style.display === "flex" ? "none" : "flex";
});

// Optional: close dropdown if click outside
window.addEventListener("click", (e) => {
  if (!document.querySelector(".user-menu").contains(e.target)) {
    userDropdown.style.display = "none";
  }
});
