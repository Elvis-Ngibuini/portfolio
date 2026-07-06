const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    if (!hash) return password === process.env.ADMIN_PASSWORD;
    return bcrypt.compare(password, hash);
};

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }
    authenticateJWT(req, res, next);
};

module.exports = { hashPassword, comparePassword, authenticateJWT, requireAdmin };