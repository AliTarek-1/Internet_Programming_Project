const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verifyToken(req, res, next) {
    // const token = req.headers['x-access-token'];
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({
            auth: false,
            message: 'No se proporcionó el token de autenticación'
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
}

module.exports = verifyToken;