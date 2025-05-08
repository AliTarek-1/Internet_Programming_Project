document
  .getElementById("admin-login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error-msg");

    try {
      const res = await fetch("/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Login failed.";
        return;
      }

      // Save token and go to admin dashboard
      localStorage.setItem("token", data.token);
      window.location.href = "/admin-dashboard.html";
    } catch (err) {
      errorMsg.textContent = "Error logging in. Please try again.";
    }
  });
