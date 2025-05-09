document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById("registerForm");
  
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const repeatPassword = document.getElementById("repeatpassword").value;
      const errorTextElement = document.querySelector("#text_error");
  
      errorTextElement.innerText = "";
  
      // Basic validation
      if (!username || !email || !password || !repeatPassword) {
        errorTextElement.innerText = "Please fill in all fields";
        return;
      }
  
      if (password !== repeatPassword) {
        errorTextElement.innerText = "Passwords do not match";
        return;
      }
  
      // Password strength validation
      if (password.length < 8) {
        errorTextElement.innerText = "Password must be at least 8 characters long";
        return;
      }
  
      try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Registering...';
  
        const res = await fetch("/api/admin/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name: username, 
            email, 
            password 
          }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          console.log("Admin registration successful:", data);
          
          // Store token in localStorage
          localStorage.setItem('adminToken', data.token);
          
          // Redirect to admin dashboard
          window.location.href = "/admin/dashboard.html";
        } else {
          errorTextElement.innerText = data.message || `Registration failed: ${res.status}`;
          console.error("Admin registration failed:", data);
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      } catch (error) {
        console.error("Network or Fetch Error during admin registration:", error);
        errorTextElement.innerText = "An unexpected error occurred. Please try again.";
        
        // Reset button
        const submitBtn = registerForm.querySelector('button');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Register';
      }
    });
  }
});
