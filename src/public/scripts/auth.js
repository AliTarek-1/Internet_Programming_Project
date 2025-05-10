document.addEventListener('DOMContentLoaded', function () {
  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    });
  });

  function isStrongPassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }

  function showError(input, message) {
    input.classList.add('error');
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const existingErrors = formGroup.querySelectorAll('.error-message');
    existingErrors.forEach(el => el.remove());

    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;

    formGroup.appendChild(errorEl);
  }

  function clearError(input) {
    input.classList.remove('error');
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    const errorEls = formGroup.querySelectorAll('.error-message');
    errorEls.forEach(el => el.remove());
  }

  document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const inputs = form.querySelectorAll('input[required]');
      const password = form.querySelector('#password');
      const confirmPassword = form.querySelector('#confirm-password');
      let isValid = true;

      const emailInput = form.querySelector('#email');
      const email = emailInput ? emailInput.value.trim() : '';
      const pwd = password ? password.value.trim() : '';
      const confirmPwd = confirmPassword ? confirmPassword.value.trim() : '';

      console.log("📥 Submitted Registration Form:");
      console.log("Email:", email);
      console.log("Password:", pwd);
      console.log("Confirm Password:", confirmPwd);

      inputs.forEach(input => {
        if (!input.value.trim()) {
          showError(input, 'This field is required.');
          isValid = false;
        } else {
          clearError(input);
        }
      });

      if (password && !isStrongPassword(password.value)) {
        showError(password, 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        isValid = false;
      }

      if (confirmPassword && password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match.');
        isValid = false;
      }

      if (isValid) {
        console.log("✅ Client-side validation passed. Sending to server...");
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Determine if this is a signup or login form
        const isSignupForm = !!confirmPassword;
        
        if (isSignupForm) {
          // This is a signup form - send data to server
          const username = email.split('@')[0]; // Extract username from email
          
          // Send registration data to server
          fetch('/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password: pwd }),
            credentials: 'include'
          })
          .then(response => {
            console.log(`📡 Server response status: ${response.status}`);
            return response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
          })
          .then(data => {
            console.log('📥 Server response:', data);
            
            if (data.success) {
              // Registration successful
              console.log("✅ Registration successful! Redirecting to homepage...");
              window.location.href = 'HomePage.html';
            } else {
              // Registration failed
              console.error("❌ Registration failed:", data.message);
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
              
              // Show error message
              const errorContainer = document.createElement('div');
              errorContainer.className = 'error-message-container';
              errorContainer.innerHTML = `<div class="error-message">${data.message || 'Registration failed. Please try again.'}</div>`;
              form.prepend(errorContainer);
            }
          })
          .catch(error => {
            console.error('Fetch error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
            
            // Show error message
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message-container';
            errorContainer.innerHTML = `<div class="error-message">An unexpected error occurred. Please try again.</div>`;
            form.prepend(errorContainer);
          });
        } else {
          // This is a login form - redirect to login page
          setTimeout(() => {
            console.log("🔁 Redirecting to login page...");
            window.location.href = 'loginuser.html';
          }, 1500);
        }
      } else {
        console.warn("❌ Client-side validation failed.");
      }
    });
  });

  // Facebook (placeholder)
  document.querySelectorAll('.social-btn.facebook').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      alert('Facebook login is not yet implemented.');
    });
  });

  // Error styling
  const style = document.createElement('style');
  style.textContent = `
    .error {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
    .error-message {
      color: #e74c3c;
      font-size: 0.85em;
      margin-top: 8px;
      background-color: #fde8e8;
      padding: 8px 12px;
      border-radius: 4px;
      display: block;
      clear: both;
    }
    .input-group {
      position: relative;
      margin-bottom: 5px;
    }
  `;
  document.head.appendChild(style);
});

// Google Sign-In Integration
document.addEventListener("DOMContentLoaded", function () {
  // Wait for Google script to load
  const checkGoogle = setInterval(() => {
    if (window.google && google.accounts && google.accounts.id) {
      clearInterval(checkGoogle);

      google.accounts.id.initialize({
        client_id: '663221054063-pqfssjf6ntm538qcutajqm7v6avfqf29.apps.googleusercontent.com',
        callback: handleGoogleResponse
      });

      const googleBtnContainer = document.getElementById("g_id_signin");
      if (googleBtnContainer) {
        google.accounts.id.renderButton(googleBtnContainer, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          logo_alignment: "left"
        });
      }
    }
  }, 100);
});

function handleGoogleResponse(response) {
  console.log("Google Sign-In response received");
  
  // Show loading indicator
  const loadingEl = document.createElement('div');
  loadingEl.style.position = 'fixed';
  loadingEl.style.top = '0';
  loadingEl.style.left = '0';
  loadingEl.style.width = '100%';
  loadingEl.style.height = '100%';
  loadingEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
  loadingEl.style.display = 'flex';
  loadingEl.style.justifyContent = 'center';
  loadingEl.style.alignItems = 'center';
  loadingEl.style.zIndex = '9999';
  loadingEl.innerHTML = `<div style="background: white; padding: 20px; border-radius: 5px; text-align: center;">
    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
    <p>Authenticating with Google...</p>
  </div>`;
  document.body.appendChild(loadingEl);
  
  // Send the Google credential to your server
  fetch('/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential: response.credential }),
    credentials: 'include'
  })
  .then(response => {
    console.log(`Server response status: ${response.status}`);
    return response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  })
  .then(data => {
    console.log('Server response:', data);
    
    if (data.success) {
      // Store token if provided
      if (data.token) {
        localStorage.setItem('userToken', data.token);
      }
      
      // Redirect to homepage
      window.location.href = 'HomePage.html';
    } else {
      // Show error
      loadingEl.remove();
      alert(`Google Sign-In failed: ${data.message || 'Unknown error'}`);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    loadingEl.remove();
    alert(`Error during Google authentication: ${error.message}`);
  });
}
