const { Router } = require("express");
const router = Router();

const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");
const path = require("path");
const User = require("../models/User");

router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = new User({
    username,
    email,
    password,
  });

  user.password = await user.encryptPassword(user.password);
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24,
  });
  res.json({ auth: true, token });
});

router.get("/dashboard", verifyToken, (req, res, next) => {
  // cookie
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect("/login");
  }
  // res.json('dashboard');

  // header
  // const token = req.headers['x-access-token'];
  // res.set('x-access-token', token);
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  // res.json({ auth: true, token: token });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("no user exists with this email");
  }

  const validPassword = await user.validatePassword(password);
  if (!validPassword) {
    return res
      .status(401)
      .json({ auth: false, token: null, error: "password is incorrect" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24,
  });
  // cookie
  res.cookie("accessToken", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.redirect("/dashboard");

  // header
  // res.status(200).json({ auth: true, token });
});

router.get("/me", verifyToken, async (req, res, next) => {
  const user = await User.findById(req.userId, { password: 0 });
  if (!user) {
    return res.status(404).send("No user found....!!!");
  }

  res.json(user);
});

module.exports = router;
