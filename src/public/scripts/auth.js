document.addEventListener('DOMContentLoaded', function() {
  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Form validation
  const forms = document.querySelectorAll('.auth-form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic form validation
      const inputs = form.querySelectorAll('input[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      });

      // Password confirmation validation
      const password = form.querySelector('#password');
      const confirmPassword = form.querySelector('#confirm-password');
      
      if (confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        confirmPassword.classList.add('error');
        alert('Passwords do not match!');
      }

      if (isValid) {
        // Here you would typically send the form data to your server
        console.log('Form is valid, ready to submit');
        
        // Simulate form submission
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
          // Redirect to home page after successful login/signup
          window.location.href = 'HomePage.html';
        }, 1500);
      }
    });
  });

  // Social login buttons
  const socialButtons = document.querySelectorAll('.social-btn');
  socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const platform = this.classList.contains('google') ? 'Google' : 'Facebook';
      alert(`Redirecting to ${platform} login...`);
      // Here you would implement the actual social login functionality
    });
  });

  // Add error class styling
  const style = document.createElement('style');
  style.textContent = `
    .error {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
  `;
  document.head.appendChild(style);
}); 