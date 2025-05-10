document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-register-form");
  const errorMsg = document.getElementById("error-msg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const adminID = document.getElementById("adminID").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, adminID, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Registration failed.";
        return;
      }
      
      // Check if showNotification function exists
      if (typeof showNotification === 'function') {
        showNotification("Admin registered successfully. Redirecting...", "success");
        // Delay redirect to show notification
        setTimeout(() => {
          window.location.href = "/login-admin.html";
        }, 1000);
      } else {
        // Fallback to redirect immediately
        window.location.href = "/login-admin.html";
      }
    } catch (err) {
      errorMsg.textContent = "Registration error. Try again.";
    }
  });
});
