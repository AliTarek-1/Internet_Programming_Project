/**
 * Debug API Service
 * 
 * This script helps diagnose issues with API responses and data handling
 * It can be included in any HTML page to add debugging capabilities
 */

// Check if the script has already been loaded to prevent duplicate initialization
if (window.debugApiInitialized) {
  console.log('Debug API already initialized, skipping...');
} else {
  window.debugApiInitialized = true;

// Create a debug container to show API responses
function createDebugContainer() {
  const container = document.createElement('div');
  container.id = 'api-debug-container';
  container.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 400px;
    max-height: 300px;
    overflow: auto;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    z-index: 9999;
    border-top-left-radius: 5px;
  `;
  
  const header = document.createElement('div');
  header.innerHTML = '<h3 style="margin: 0; color: white;">API Debug Console</h3>';
  header.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 10px;';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'background: #333; color: white; border: none; padding: 2px 5px;';
  closeBtn.onclick = () => container.style.display = 'none';
  
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = 'background: #333; color: white; border: none; padding: 2px 5px; margin-right: 5px;';
  clearBtn.onclick = () => {
    const logContainer = document.getElementById('api-debug-log');
    if (logContainer) logContainer.innerHTML = '';
  };
  
  const buttonGroup = document.createElement('div');
  buttonGroup.appendChild(clearBtn);
  buttonGroup.appendChild(closeBtn);
  
  header.appendChild(buttonGroup);
  container.appendChild(header);
  
  const logContainer = document.createElement('div');
  logContainer.id = 'api-debug-log';
  container.appendChild(logContainer);
  
  document.body.appendChild(container);
  return logContainer;
}

// Log message to debug container
function logDebug(message, data) {
  let logContainer = document.getElementById('api-debug-log');
  if (!logContainer) {
    logContainer = createDebugContainer();
  }
  
  const entry = document.createElement('div');
  entry.style.borderBottom = '1px solid #333';
  entry.style.paddingBottom = '5px';
  entry.style.marginBottom = '5px';
  
  const timestamp = new Date().toLocaleTimeString();
  const msgElement = document.createElement('div');
  msgElement.innerHTML = `<span style="color: #aaa;">[${timestamp}]</span> ${message}`;
  entry.appendChild(msgElement);
  
  if (data !== undefined) {
    const dataElement = document.createElement('pre');
    dataElement.style.margin = '5px 0 0 10px';
    dataElement.style.whiteSpace = 'pre-wrap';
    dataElement.style.color = '#ffcc00';
    
    try {
      dataElement.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    } catch (e) {
      dataElement.textContent = 'Error stringifying data: ' + e.message;
    }
    
    entry.appendChild(dataElement);
  }
  
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Override fetch to log API calls
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
  // Skip debugging for non-API calls and static assets to reduce noise
  const isApiCall = url.includes('/api/');
  const isStaticAsset = /\.(jpg|jpeg|png|gif|svg|css|js)$/.test(url);
  
  if (isApiCall) {
    logDebug(`Fetch request to: ${url}`, options);
  }
  
  try {
    const response = await originalFetch(url, options);
    
    // Only log API responses, not static assets
    if (isApiCall && !isStaticAsset) {
      // Clone the response to log it without consuming it
      const clone = response.clone();
      
      // Check content type to determine how to read the body
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          const data = await clone.json();
          logDebug(`Response from: ${url}`, data);
        } catch (e) {
          logDebug(`Error parsing JSON from: ${url}`, e.message);
        }
      } else if (isApiCall) {
        // Only try to log text for API calls, not for other resources
        logDebug(`Response from: ${url} (not JSON)`, `Status: ${response.status} ${response.statusText}`);
      }
    }
    
    return response;
  } catch (error) {
    if (isApiCall) {
      logDebug(`Error fetching ${url}:`, error.message);
    }
    throw error;
  }
};

// Add debug button to page
function addDebugButton() {
  const button = document.createElement('button');
  button.textContent = 'Debug API';
  button.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 9998;
    background: #333;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  `;
  
  button.onclick = () => {
    const container = document.getElementById('api-debug-container');
    if (container) {
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    } else {
      createDebugContainer();
    }
  };
  
  document.body.appendChild(button);
}

// Initialize debugging
document.addEventListener('DOMContentLoaded', () => {
  addDebugButton();
  logDebug('API Debug initialized');
  
  // Test if apiService exists
  if (window.apiService) {
    logDebug('apiService found', Object.keys(window.apiService));
  } else {
    logDebug('apiService not found - will check again in 1 second');
    setTimeout(() => {
      if (window.apiService) {
        logDebug('apiService found after delay', Object.keys(window.apiService));
      } else {
        logDebug('apiService still not found - check if api.js is loaded');
      }
    }, 1000);
  }
});

// Export debug functions
window.apiDebug = {
  log: logDebug,
  showConsole: () => {
    const container = document.getElementById('api-debug-container');
    if (container) {
      container.style.display = 'block';
    } else {
      createDebugContainer();
    }
  }
};

// Close the if-else block that checks for initialization
}
