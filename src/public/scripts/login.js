document.addEventListener("DOMContentLoaded", () => {
  // Check for redirect parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');
  
  const loginForm = document.querySelector('.auth-form');
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message-container';
  loginForm.parentNode.insertBefore(errorContainer, loginForm);
  
  // Check for saved credentials and auto-fill if available
  const savedEmail = localStorage.getItem('rememberedEmail');
  const savedPassword = localStorage.getItem('rememberedPassword');
  const rememberCheckbox = document.getElementById('remember');
  
  if (savedEmail && savedPassword) {
    document.getElementById('email').value = savedEmail;
    document.getElementById('password').value = savedPassword;
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }

  function showError(message) {
    // Clear any existing errors first
    errorContainer.innerHTML = '';
    
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    errorContainer.appendChild(error);
  }

  // Handle forgot password link
  const forgotPasswordLink = document.querySelector('.forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      
      // Create modal for password reset
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.style.position = 'fixed';
      modalOverlay.style.top = '0';
      modalOverlay.style.left = '0';
      modalOverlay.style.width = '100%';
      modalOverlay.style.height = '100%';
      modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modalOverlay.style.display = 'flex';
      modalOverlay.style.justifyContent = 'center';
      modalOverlay.style.alignItems = 'center';
      modalOverlay.style.zIndex = '1000';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.backgroundColor = 'white';
      modalContent.style.padding = '2rem';
      modalContent.style.borderRadius = '8px';
      modalContent.style.maxWidth = '400px';
      modalContent.style.width = '90%';
      
      modalContent.innerHTML = `
        <h3 style="margin-top: 0;">Reset Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        <div style="margin-bottom: 1rem;">
          <input type="email" id="reset-email" placeholder="Enter your email" value="${email}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="display: flex; justify-content: space-between;">
          <button id="cancel-reset" style="padding: 10px 15px; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="submit-reset" style="padding: 10px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Send Reset Link</button>
        </div>
      `;
      
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
      
      // Focus on email input
      const resetEmailInput = document.getElementById('reset-email');
      resetEmailInput.focus();
      
      // Handle cancel button
      document.getElementById('cancel-reset').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
      });
      
      // Handle submit button
      document.getElementById('submit-reset').addEventListener('click', async () => {
        const resetEmail = resetEmailInput.value.trim();
        if (!resetEmail || !isValidEmail(resetEmail)) {
          alert('Please enter a valid email address');
          return;
        }
        
        // Here you would normally send a request to the server
        // For now, we'll just simulate a successful password reset email
        document.body.removeChild(modalOverlay);
        
        // Show success message
        showSuccess('Password reset link sent to your email. Please check your inbox.');
      });
    });
  }

  function showSuccess(message) {
    // Clear any existing errors first
    errorContainer.innerHTML = '';
    
    const success = document.createElement('div');
    success.className = 'success-message';
    success.style.backgroundColor = '#d4edda';
    success.style.color = '#155724';
    success.style.padding = '10px';
    success.style.marginBottom = '15px';
    success.style.borderRadius = '4px';
    success.textContent = message;
    errorContainer.appendChild(success);
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('remember')?.checked;
    const submitBtn = loginForm.querySelector('.submit-btn');
    const errorTextElement = document.querySelector('#text_error');
  
    errorContainer.innerHTML = '';
    errorTextElement.innerText = '';
  
    if (!email || !password) {
      showError('Email and password are required.');
      return;
    }
  
    console.log("🔐 Attempting login with:", { email, password });
  
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Logging in...</span>';
  
      const res = await fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      console.log(`📡 Server responded with status: ${res.status}`);
  
      const contentType = res.headers.get("Content-Type");
      let data;
      try {
        data = contentType.includes("application/json") ? await res.json() : await res.text();
      } catch (e) {
        console.warn("⚠️ Could not parse server response:", e);
        data = null;
      }
  
      console.log("📨 Server response content:", data);
  
      if (res.ok && data?.token) {
        console.log("✅ Login successful. Token received.");
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userEmail', email);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }
        window.location.href = redirectUrl || 'HomePage.html';
        return;
      }
  
      console.warn("❌ Login failed:", res.status, data);
      throw new Error(data?.message || 'Login failed');
  
    } catch (err) {
      console.warn("⚠️ Login fetch error or fallback triggered:", err.message);
  
      console.log("📦 Checking localStorage users:");
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log("localStorage users:", users);
  
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        console.log("✅ Found fallback user, logging in via localStorage.");
        const token = btoa(email + ':' + Date.now());
        localStorage.setItem('userToken', token);
        localStorage.setItem('userEmail', email);
        window.location.href = 'HomePage.html';
        return;
      } else {
        console.error("❌ No matching user found in localStorage.");
        showError('Invalid email or password.');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
    }
  });
  

  // === Load Google Sign-In Button ===
  const waitForGoogle = setInterval(() => {
    if (window.google && google.accounts && google.accounts.id) {
      clearInterval(waitForGoogle);

      // Configure Google Sign-In
      google.accounts.id.initialize({
        // This client ID is configured for localhost and common development environments
        client_id: '663221054063-tklrb4in2o677lkgn00qgohkte6oqd7e.apps.googleusercontent.com',
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the Google Sign-In button
      const googleDiv = document.getElementById("g_id_signin");
      if (googleDiv) {
        google.accounts.id.renderButton(googleDiv, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 250
        });

        // Also display One-Tap UI
        google.accounts.id.prompt();
      }
    }
  }, 100);
});

// === Handle Google Sign-In Credential ===
async function handleGoogleCredential(response) {
  try {
    // Decode the JWT credential to get user info
    const payload = parseJwt(response.credential);
    const email = payload.email;
    
    // Try to authenticate with the server
    try {
      const res = await fetch('/api/signin/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userEmail', email);
        window.location.href = 'HomePage.html'; // Removed leading slash for consistency
        return;
      }
    } catch (serverError) {
      console.log('Server authentication failed, using fallback method');
    }
    
    // Fallback: Store authentication locally
    const token = btoa(email + ':' + Date.now());
    localStorage.setItem('userToken', token);
    localStorage.setItem('userEmail', email);
    
    // Check if user exists in localStorage, if not add them
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.some(u => u.email === email)) {
      users.push({ email, password: 'google-auth' }); // Mark as Google auth
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    window.location.href = 'HomePage.html';
  } catch (error) {
    console.error('Google login error:', error);
    showError('An error occurred with Google login');
  }
}

// Helper function to parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return {};
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
