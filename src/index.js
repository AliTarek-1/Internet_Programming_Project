require("dotenv").config();
const app = require("./app");
const PORT = 8000; // Using port 8000 as specified

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
