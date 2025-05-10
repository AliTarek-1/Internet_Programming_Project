const express = require("express");
const app = express();

const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
//const inventoryRoutes = require("./controllers/inventoryController");
// Load environment variables
dotenv.config();

// Connect to database
require("./database");

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdnjs.cloudflare.com",
          "https://accounts.google.com",
          "https://*.googleusercontent.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://accounts.google.com",
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://accounts.google.com",
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://accounts.google.com",
          "https://*.googleusercontent.com",
        ],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://accounts.google.com",
          "https://*.googleusercontent.com",
        ],
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://*.googleapis.com",
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://accounts.google.com",
          "https://*.googleusercontent.com",
        ],
        formAction: ["'self'", "https://accounts.google.com"],
        objectSrc: ["'none'"],
      },
    },
  })
); // Security headers with custom CSP
app.use(cors()); // Enable CORS
app.use(morgan("dev")); // HTTP request logger
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request body

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use(require("./controllers/authController"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/discount", require("./routes/discountRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

//app.use("/api/inventory", inventoryRoutes); // ✅ this is the key part

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "login-admin.html"));
});

app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "register-admin.html"));
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "HomePage.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contactus.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contactus.html"));
});

app.get("/loginuser.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loginuser.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/products.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "products.html"));
});

app.get("/faq.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "faq.html"));
});

app.get("/returns.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "returns.html"));
});

app.get("/track-order.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "track-order.html"));
});

app.get("/customer-service.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customer-service.html"));
});

app.get("/account.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

module.exports = app;
