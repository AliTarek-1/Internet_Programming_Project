const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorTextElement = document.querySelector("#text_error");

  errorTextElement.innerText = "";

  if (!email || !password) {
    errorTextElement.innerText = "Please fill in all fields :)";
    return;
  }

  try {
    const res = await fetch("/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      const token = data.token;

      if (token) {
        localStorage.setItem("accessToken", token);

        window.location.href = "/dashboard";
      } else {
        errorTextElement.innerText =
          "Login successful, but no token received from the server.";
        console.error("Login successful but no token in response:", data);
      }
    } else {
      const errorResponse = await res.text();
      errorTextElement.innerText =
        errorResponse || `Login failed: Server returned status ${res.status}`;
      console.error("Login failed:", res.status, errorResponse);
    }
  } catch (error) {
    console.error("Network or Fetch Error during login:", error);
    errorTextElement.innerText =
      "An unexpected error occurred. Please try again.";
    alert("An error occurred while trying to log in. Please try again.");
  }
});
