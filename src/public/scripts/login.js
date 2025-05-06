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
