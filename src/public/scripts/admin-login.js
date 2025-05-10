document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const errorMsg = document.getElementById("error-msg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Invalid email or password.";
        return;
      }

      // Save JWT token for authenticated requests
      localStorage.setItem("token", data.token);
      
      // Check if showNotification function exists
      if (typeof showNotification === 'function') {
        showNotification("Login successful! Redirecting...", "success");
        // Delay redirect to show notification
        setTimeout(() => {
          window.location.href = "/admin-dashboard.html";
        }, 1000);
      } else {
        // Fallback to redirect immediately
        window.location.href = "/admin-dashboard.html";
      }
    } catch (err) {
      errorMsg.textContent = "Login error. Try again later.";
    }
  });
});
