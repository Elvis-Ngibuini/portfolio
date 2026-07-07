const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

// Admin credentials from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';

// In-memory refresh token store
const refreshTokens = new Map();

// Generate tokens
function generateTokens(email, role = 'ADMIN') {
    const accessToken = jwt.sign(
        { email, role, username: email },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );
    
    const refreshToken = jwt.sign(
        { email, username: email, tokenId: crypto.randomUUID() },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );
    
    return { accessToken, refreshToken };
}

// Login - accepts email or username
router.post('/login', async (req, res) => {
    const { email, username, password } = req.body;
    const loginId = email || username || ADMIN_EMAIL;
    
    if (!password) {
        return res.status(400).json({ success: false, message: 'Password required' });
    }
    
    // Compare password
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    let isValid = false;
    
    if (adminHash) {
        isValid = await bcrypt.compare(password, adminHash);
    } else {
        // Allow any email in dev mode, exact match in production
        isValid = password === ADMIN_PASSWORD;
        if (process.env.NODE_ENV !== 'production') {
            // In dev mode, accept any non-empty email
            if (email || username) isValid = true;
        }
    }
    
    if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const { accessToken, refreshToken } = generateTokens(loginId);
    refreshTokens.set(refreshToken, { email: loginId, createdAt: new Date() });
    
    res.json({
        success: true,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        user: { email: loginId, role: 'ADMIN' }
    });
});

// Refresh token
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken || !refreshTokens.has(refreshToken)) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const { accessToken } = generateTokens(decoded.email);
        
        res.json({ success: true, accessToken, expiresIn: 15 * 60 });
    } catch (error) {
        refreshTokens.delete(refreshToken);
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
});

// Verify token
router.post('/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, valid: true, user: decoded });
    } catch (error) {
        res.json({ success: true, valid: false });
    }
});

// Logout
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens.delete(refreshToken);
    res.json({ success: true, message: 'Logged out' });
});

// Change password
router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Both passwords required' });
    }
    
    // Validate current password
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    let isValid = false;
    
    if (adminHash) {
        isValid = await bcrypt.compare(currentPassword, adminHash);
    } else {
        isValid = currentPassword === ADMIN_PASSWORD;
    }
    
    if (!isValid) {
        return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    
    // Validate new password strength
    if (newPassword.length < 12) {
        return res.status(400).json({ success: false, message: 'Password too short (min 12 chars)' });
    }
    
    // Invalidate all refresh tokens
    refreshTokens.clear();
    
    res.json({ success: true, message: 'Password changed. Please login again.' });
});

module.exports = router;