document
  .getElementById("admin-register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminID = document.getElementById("adminID").value.trim();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    // Basic validation
    if (password.length < 8) {
      errorMsg.textContent = "Password must be at least 8 characters long.";
      return;
    }

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminID, name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Registration failed.";
        return;
      }

      // Save token and redirect to admin dashboard
      localStorage.setItem("token", data.token);
      window.location.href = "/admin-dashboard.html";
    } catch (err) {
      errorMsg.textContent = "Error during registration. Please try again.";
    }
  });
