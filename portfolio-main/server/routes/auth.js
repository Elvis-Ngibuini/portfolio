const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '8h';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password required'
        });
    }
    
    if (username !== ADMIN_USERNAME) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (ADMIN_PASSWORD_HASH) {
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } else if (password !== adminPassword) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    }
    
    const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
        success: true,
        token,
        message: 'Login successful'
    });
});

router.post('/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token required'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.json({
            success: true,
            valid: false
        });
    }
});

module.exports = router;