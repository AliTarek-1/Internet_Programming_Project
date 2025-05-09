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
      let errorEl = input.nextElementSibling;
      if (!errorEl || !errorEl.classList.contains('error-message')) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        input.insertAdjacentElement('afterend', errorEl);
      }
      errorEl.textContent = message;
    }
  
    function clearError(input) {
      input.classList.remove('error');
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('error-message')) {
        errorEl.remove();
      }
    }
  
    // Form validation
    document.querySelectorAll('.auth-form').forEach(form => {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const inputs = form.querySelectorAll('input[required]');
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirm-password');
        const email = form.querySelector('#email');
        let isValid = true;

        // Reset all errors
        inputs.forEach(input => clearError(input));

        // Validate email
        if (!email.value.trim()) {
          showError(email, 'Email is required.');
          isValid = false;
        } else if (!isValidEmail(email.value)) {
          showError(email, 'Please enter a valid email address.');
          isValid = false;
        }

        // Validate password
        if (!password.value.trim()) {
          showError(password, 'Password is required.');
          isValid = false;
        } else if (!isStrongPassword(password.value)) {
          showError(password, 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
          isValid = false;
        }

        if (isValid) {
          const submitBtn = form.querySelector('.submit-btn');
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

          try {
            const response = await fetch('/api/admin/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email.value,
                password: password.value
              })
            });

            const data = await response.json();

            if (response.ok) {
              // Store token in localStorage
              localStorage.setItem('adminToken', data.token);
              console.log('Admin login successful:', data.admin);
              // Redirect to dashboard
              window.location.href = '/admin/dashboard.html';
            } else {
              showError(email, data.message || 'Invalid credentials');
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Login';
            }
          } catch (error) {
            console.error('Login error:', error);
            showError(email, 'An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
          }
        }
      });
    });

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    // Facebook (placeholder)
    document.querySelectorAll('.social-btn.facebook').forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        alert('Facebook login is not yet implemented.');
      });
    });
  
    // Add error styling
    const style = document.createElement('style');
    style.textContent = `
      .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
      }
      .error-message {
        color: #dc3545;
        font-size: 0.85em;
        margin-top: 4px;
        padding: 4px 8px;
        background-color: #f8d7da;
        border-radius: 4px;
      }
      .submit-btn {
        background-color: #007bff;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        width: 100%;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .submit-btn:hover {
        background-color: #0056b3;
      }
      .submit-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      .form-control:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
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
          client_id: '663221054063-tklrb4in2o677lkgn00qgohkte6oqd7e.apps.googleusercontent.com',
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
    console.log("Google JWT:", response.credential);
    alert('Logged in with Google!');
    window.location.href = 'HomePage.html';
  }
  