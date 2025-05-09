document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  const errorMsg = document.getElementById("error-msg");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Invalid email or password.";
        return;
      }

      // ✅ Save JWT token to localStorage
      localStorage.setItem("token", data.token);

      alert("Login successful. Redirecting to dashboard...");
      window.location.href = "/admin-dashboard.html"; // ✅ Correct redirection
    } catch (err) {
      errorMsg.textContent = "Login error. Try again.";
    }
  });
});
