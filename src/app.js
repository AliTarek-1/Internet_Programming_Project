const express = require('express');
const app = express();

const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(require('./controllers/authController'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
})


app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
})



module.exports = app;