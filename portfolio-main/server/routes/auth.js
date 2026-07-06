const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = '15m';  // Short-lived for security
const REFRESH_EXPIRES = '7d';   // Long-lived for convenience

// In-memory refresh token store (use Redis in production)
const refreshTokens = new Map();

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
    
    const accessToken = jwt.sign(
        { username, role: 'ADMIN' },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );
    
    const refreshToken = jwt.sign(
        { username, role: 'ADMIN', tokenId: crypto.randomUUID() },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );
    
    refreshTokens.set(refreshToken, {
        username,
        createdAt: new Date()
    });
    
    res.json({
        success: true,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // seconds
        message: 'Login successful'
    });
});

router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Refresh token required'
        });
    }
    
    if (!refreshTokens.has(refreshToken)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const newAccessToken = jwt.sign(
            { username: decoded.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        res.json({
            success: true,
            accessToken: newAccessToken,
            expiresIn: 15 * 60
        });
    } catch (error) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
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

router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        refreshTokens.delete(refreshToken);
    }
    res.json({ success: true, message: 'Logged out' });
});

module.exports = router;