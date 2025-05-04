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
    if (!formGroup) return; // Prevent breaking if form-group doesn't exist
  
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
    if (!formGroup) return; // ✅ Prevents the crash
  
    const errorEls = formGroup.querySelectorAll('.error-message');
    errorEls.forEach(el => el.remove());
  }
  
  // Form validation
  document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const inputs = form.querySelectorAll('input[required]');
      const password = form.querySelector('#password');
      const confirmPassword = form.querySelector('#confirm-password');
      let isValid = true;

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
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        setTimeout(() => {
          window.location.href = 'HomePage.html';
        }, 1500);
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

  // Add enhanced error styling
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
