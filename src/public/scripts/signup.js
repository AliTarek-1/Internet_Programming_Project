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
            submitBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Creating account...</span>';

            // Extract username from email for better user experience
            const username = email.split('@')[0];
            
            // Create a debug element to display the request payload
            const debugElement = document.createElement('div');
            debugElement.style.position = 'fixed';
            debugElement.style.top = '10px';
            debugElement.style.right = '10px';
            debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            debugElement.style.color = 'white';
            debugElement.style.padding = '10px';
            debugElement.style.borderRadius = '5px';
            debugElement.style.zIndex = '9999';
            debugElement.style.maxWidth = '400px';
            debugElement.style.maxHeight = '80vh';
            debugElement.style.overflow = 'auto';
            debugElement.style.fontFamily = 'monospace';
            debugElement.style.fontSize = '12px';
            
            // Debug: Log the data being sent to the server
            const requestPayload = { username, email, password: '***' };
            console.log('📤 Signup data being sent:', requestPayload);
            debugElement.innerHTML = `<h3>Request Payload:</h3><pre>${JSON.stringify(requestPayload, null, 2)}</pre>`;
            document.body.appendChild(debugElement);
            
            // Add a 5-second delay to see the debug information
            console.log('⏱️ Waiting 5 seconds before sending request...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            // Send data to the server
            console.log('🚀 Now sending request to /signup endpoint...');
            
            // Log the complete request details
            const requestBody = { username, email, password };
            console.log('Complete request details:', {
                url: '/signup',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody
            });
            
            // Try both /signup and /api/signup endpoints
            let response;
            try {
                response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    credentials: 'include' // Include cookies in the request
                });
                
                if (response.status === 404) {
                    console.log('Endpoint /signup not found, trying /api/signup...');
                    response = await fetch('/api/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                        credentials: 'include' // Include cookies in the request
                    });
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                throw fetchError;
            }
            
            // Debug: Log the response status
            console.log(`📡 Server response status: ${response.status}`);
            
            // Handle the response from the server
            let data;
            try {
                data = await response.json();
                console.log('📥 Server response data:', data);
                debugElement.innerHTML += `<h3>Response Status:</h3><pre>${response.status}</pre><h3>Response Data:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
            } catch (e) {
                console.error('Error parsing response:', e);
                debugElement.innerHTML += `<h3>Response Status:</h3><pre>${response.status}</pre><h3>Error parsing response:</h3><pre>${e.message}</pre>`;
                data = { success: false, message: 'Error parsing server response' };
            }
            
            if (!response.ok) {
                // Show error message from server
                showError(data.message || 'An error occurred during signup');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
                return;
            }

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
                    text: 'signup_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 250
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
