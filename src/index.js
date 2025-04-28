require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
const { mongoose } = require("./database");

async function init() {
  try {
    await mongoose.connection.once("open", () => {
      console.log("Connected to MongoDB");
    });

    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

init();
