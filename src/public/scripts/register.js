const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const repeatPassword = document.getElementById("repeatpassword").value;
  const errorTextElement = document.querySelector("#text_error");

  errorTextElement.innerText = "";

  if (!username || !email || !password || !repeatPassword) {
    errorTextElement.innerText = "Please fill in all fields :)";
    return;
  }

  if (password !== repeatPassword) {
    errorTextElement.innerText = "Passwords do not match.";
    return;
  }

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Registration successful:", data);
      window.location.href = "/login";
    } else {
      const errorResponse = await res.text();
      errorTextElement.innerText =
        errorResponse ||
        `Registration failed: Server returned status ${res.status}`;
      console.error("Registration failed:", res.status, errorResponse);
    }
  } catch (error) {
    console.error("Network or Fetch Error during registration:", error);
    errorTextElement.innerText =
      "An unexpected error occurred during registration. Please try again.";
  }
});
