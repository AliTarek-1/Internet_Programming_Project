document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const errorMsg = document.getElementById("error-msg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMsg.textContent = "";

    if (!email || !password) {
      errorMsg.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const res = await fetch("/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        errorMsg.textContent = data.message || "Invalid email or password.";
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/admin-dashboard.html";
      } else {
        errorMsg.textContent = "Login failed. No token received.";
      }
    } catch (err) {
      console.error("Login Error:", err);
      errorMsg.textContent = "Server error. Please try again later.";
    }
  });
});
