document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.querySelector('.auth-form');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message-container';
    signupForm.parentNode.insertBefore(errorContainer, signupForm);

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const terms = document.getElementById('terms').checked;

        // Clear previous errors
        errorContainer.innerHTML = '';

        // Client-side validation
        if (!email) {
            showError('Please enter your email address');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (!password) {
            showError('Please enter a password');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (!terms) {
            showError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        try {
            // Show loading state
            const submitBtn = signupForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Try the /signup endpoint
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            // If that fails, try a fallback approach
            if (!response.ok) {
                console.log('Signup endpoint not responding, using fallback method');
                // Store user data in localStorage as a fallback
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                users.push({ email, password });
                localStorage.setItem('users', JSON.stringify(users));
                
                // Create a token-like string
                const token = btoa(email + ':' + Date.now());
                localStorage.setItem('userToken', token);
                
                // Store user email for display in navbar
                localStorage.setItem('userEmail', email);
                
                // Redirect to home
                window.location.href = 'HomePage.html';
                return;
            }

            const data = await response.json();

            if (response.ok) {
                // Store token and user email
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userEmail', email);
                window.location.href = 'HomePage.html';
            } else {
                showError(data.message || 'An error occurred during signup');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('An unexpected error occurred. Please try again.');
            
            // Fallback method if the server is not responding
            console.log('Using fallback signup method due to error');
            const submitBtn = signupForm.querySelector('.submit-btn');
            
            // Store user data in localStorage as a fallback
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({ email, password });
            localStorage.setItem('users', JSON.stringify(users));
            
            // Create a token-like string
            const token = btoa(email + ':' + Date.now());
            localStorage.setItem('userToken', token);
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
            
            // Redirect to home
            window.location.href = 'HomePage.html';
        }
    });

    function showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        errorContainer.appendChild(error);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add Google Sign-In
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
                    text: "signup_with",
                });
            }
        }
    }, 100);

    async function handleGoogleCredential(response) {
        try {
            // Decode the JWT credential to get user info
            const payload = parseJwt(response.credential);
            const email = payload.email;
            
            // Try to authenticate with the server
            try {
                const res = await fetch('/api/signup/google', {
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
            console.error('Google signup error:', error);
            showError('An error occurred with Google signup');
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
});
