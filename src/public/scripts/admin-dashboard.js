// Check if user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login-admin.html";
}

// Handle logout
document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "/login-admin.html";
});

// Verify token with backend
async function verifyToken() {
  try {
    const res = await fetch("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid token");
    }

    const data = await res.json();
    if (data.role !== "admin") {
      throw new Error("Not authorized");
    }
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "/login-admin.html";
  }
}

// Verify token on page load
verifyToken();
