// Retrieve the token from local storage
const token = localStorage.getItem("accessToken");

async function loadDashboard() {
  // If no token is found in local storage, redirect to the login page
  if (!token) {
    console.log("No access token found, redirecting to login.");
    window.location.href = "/login";
    return; // Stop function execution
  }

  try {
    // Fetch authenticated user data from the protected /me endpoint
    const res = await fetch("/me", {
      // <-- Fetching from /me now
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Send the token in the Authorization header
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      // Parse the JSON response containing user data
      const data = await res.json();
      // Assuming the response includes a 'username' property from the /me endpoint
      const usernameElement = document.querySelector("#username");
      if (usernameElement) {
        usernameElement.textContent = data.username || "User"; // Display username or default to "User"
      } else {
        console.warn("Element with id 'username' not found on dashboard page.");
      }
      // You would typically update other parts of the dashboard with 'data' here
      console.log("User data loaded successfully for dashboard:", data);
    } else if (res.status === 401 || res.status === 403) {
      // If server returns unauthorized or forbidden, token is invalid or expired
      console.log("Token invalid or expired, redirecting to login.");
      // Clear the invalid token from local storage
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } else {
      // Handle other unsuccessful HTTP responses from the /me endpoint
      const errorResponse = await res.text(); // Or res.json() if server sends JSON error
      console.error(
        "Failed to load user data for dashboard:",
        res.status,
        errorResponse
      );
      // Optionally display a message to the user on the dashboard itself
      // document.getElementById("dashboard-error-message").innerText = "Failed to load data.";
      alert(
        `Error loading dashboard data: Server returned status ${res.status}`
      ); // Generic alert
    }
  } catch (error) {
    // Handle network errors or issues with the fetch operation
    console.error("Network or Fetch Error loading dashboard data:", error);
    alert("An unexpected error occurred while loading dashboard data."); // User-friendly alert
  }
}

// Load the dashboard data when the page loads
loadDashboard();

// The getCookie function is not needed as we are using localStorage.
