const token = localStorage.getItem("accessToken");

async function loadDashboard() {
  if (!token) {
    console.log("No access token found, redirecting to login.");
    window.location.href = "/login";
    return;
  }

  try {
    const res = await fetch("/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const usernameElement = document.querySelector("#username");
      if (usernameElement) {
        usernameElement.textContent = data.username || "User";
      } else {
        console.warn("Element with id 'username' not found on dashboard page.");
      }
      console.log("Dashboard data loaded successfully:", data);
    } else if (res.status === 401 || res.status === 403) {
      console.log("Token invalid or expired, redirecting to login.");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } else {
      const errorResponse = await res.text();
      console.error(
        "Failed to load dashboard data:",
        res.status,
        errorResponse
      );

      alert(`Error loading dashboard: Server returned status ${res.status}`);
    }
  } catch (error) {
    console.error("Network or Fetch Error loading dashboard:", error);
    alert("An unexpected error occurred while loading the dashboard.");
  }
}

loadDashboard();
