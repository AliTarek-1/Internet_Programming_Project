const express = require("express");
const app = express();

const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require("./controllers/authController"));
app.use(express.static(path.join(__dirname, "public")));

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

module.exports = app;
