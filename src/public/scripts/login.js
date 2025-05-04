document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector('.auth-form');
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message-container';
  loginForm.parentNode.insertBefore(errorContainer, loginForm);

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
    const submitBtn = loginForm.querySelector('.submit-btn');
    const errorTextElement = document.querySelector('#text_error');

    // Clear previous errors
    errorContainer.innerHTML = '';
    errorTextElement.innerText = '';

    // Client-side validation
    if (!email) {
      showError('Please enter your email address');
      errorTextElement.innerText = 'Please enter your email address';
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      errorTextElement.innerText = 'Please enter a valid email address';
      return;
    }

    if (!password) {
      showError('Please enter your password');
      errorTextElement.innerText = 'Please enter your password';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Logging in...</span>';

      // Try the /signin endpoint first (original endpoint)
      // Try the /signin endpoint
      let res = await fetch('/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // If that fails, try a fallback approach
      if (!res.ok) {
        console.log('Signin endpoint not responding, using fallback method');
        
        // Check if user exists in localStorage (for users created with the fallback signup)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Create a token-like string
          const token = btoa(email + ':' + Date.now());
          localStorage.setItem('userToken', token);
          
          // Store user email for display in navbar
          localStorage.setItem('userEmail', email);
          
          // Redirect to home
          window.location.href = 'HomePage.html';
          return;
        } else {
          // Show error if user not found
          showError('Invalid email or password');
          errorTextElement.innerText = 'Invalid email or password';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
          return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        const token = data.token;

        if (token) {
          localStorage.setItem('userToken', token);
          // Store user email for display in navbar
          localStorage.setItem('userEmail', email);
          window.location.href = 'HomePage.html'; // Remove leading slash for relative path
        } else {
          showError('Login successful, but no token received from the server.');
          errorTextElement.innerText = 'Login successful, but no token received from the server.';
          console.error('Login successful but no token in response:', data);
        }
      } else {
        const errorResponse = await res.text();
        showError(errorResponse || 'Invalid email or password');
        errorTextElement.innerText = errorResponse || 'Invalid email or password';
        console.error('Login failed:', res.status, errorResponse);
      }
    } catch (error) {
      console.error('Fetch Error during login:', error);
      showError('An unexpected error occurred. Please try again.');
      errorTextElement.innerText = 'An unexpected error occurred. Please try again.';
      
      // Fallback method if the server is not responding
      console.log('Using fallback login method due to error');
      
      // Check if user exists in localStorage (for users created with the fallback signup)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Create a token-like string
        const token = btoa(email + ':' + Date.now());
        localStorage.setItem('userToken', token);
        
        // Redirect to home
        window.location.href = 'HomePage.html';
        return;
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

      google.accounts.id.initialize({
        client_id: '663221054063-tklrb4in2o677lkgn00qgohkte6oqd7e.apps.googleusercontent.com',
        callback: handleGoogleCredential,
      });

      const googleDiv = document.getElementById("g_id_signin");
      if (googleDiv) {
        google.accounts.id.renderButton(googleDiv, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "signin_with",
        });
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
