const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const { validatePassword, hashToken, sendVerificationEmail, sendResetEmail, generateRecoveryCodes } = require('../utils/auth-helpers');
const { setupTOTP, verifyTOTP } = require('../utils/mfa');
const { initRedis, storeRefreshToken: redisStoreToken, deleteRefreshToken: redisDeleteToken } = require('../utils/token-store');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

// In-memory stores (use Redis/database in production)
const refreshTokens = new Map();
const emailVerificationTokens = new Map();
const passwordResetTokens = new Map();

// Initialize Redis on module load
const redisReady = initRedis();
function useDatabase() {
    // Check if MongoDB is actually connected
    try {
        return mongoose.connection && mongoose.connection.readyState === 1;
    } catch (e) {
        return false;
    }
}

// Registration
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password required'
        });
    }
    
    const validation = validatePassword(password);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            message: 'Password too weak. Need: 12+ chars, mixed case, numbers, symbols'
        });
    }
    
    try {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        
        // Check existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const recoveryCodes = generateRecoveryCodes();
        
        const user = new User({
            email: email.toLowerCase(),
            password: passwordHash,
            name: name || '',
            role: role || 'EDITOR',
            emailVerified: false,
            recoveryCodes,
            refreshTokens: []
        });
        
        await user.save();
        
        // Store verification token
        emailVerificationTokens.set(hashToken(verificationToken), {
            email: email.toLowerCase(),
            expires: Date.now() + 24 * 60 * 60 * 1000
        });
        
        // Send verification email
        await sendVerificationEmail(email, verificationToken, name);
        
        res.status(201).json({
            success: true,
            message: 'Registration successful. Check email for verification.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Login (supports both email and legacy username)
router.post('/login', async (req, res) => {
    const { email, password, username, totpToken, backupCode } = req.body;
    const loginId = email || username;
    
    // Legacy single-admin mode (fallback when no database)
    if (!useDatabase()) {
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
        
        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password required'
            });
        }
        
        if (loginId !== ADMIN_USERNAME) {
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
            { username: ADMIN_USERNAME, role: 'ADMIN' },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        const refreshToken = jwt.sign(
            { username: ADMIN_USERNAME, role: 'ADMIN', tokenId: crypto.randomUUID() },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES }
        );
        
        refreshTokens.set(refreshToken, {
            username: ADMIN_USERNAME,
            createdAt: new Date()
        });
        
        return res.json({
            success: true,
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            user: { email: ADMIN_USERNAME, role: 'ADMIN' },
            mfaRequired: false
        });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        const user = await User.findOne({ email: loginId.toLowerCase() });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            return res.status(429).json({
                success: false,
                message: 'Account locked. Try again later.'
            });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // MFA check
        if (user.totpSecret) {
            if (!totpToken && !backupCode) {
                return res.json({
                    success: true,
                    mfaRequired: true,
                    message: 'MFA code required'
                });
            }
            
            // Verify TOTP or backup code
            let mfaValid = false;
            if (totpToken) {
                mfaValid = verifyTOTP(totpToken, user.totpSecret);
            } else if (backupCode && user.recoveryCodes) {
                mfaValid = user.recoveryCodes.includes(backupCode.toUpperCase());
                if (mfaValid) {
                    // Remove used backup code
                    user.recoveryCodes = user.recoveryCodes.filter(c => c !== backupCode.toUpperCase());
                }
            }
            
            if (!mfaValid) {
                user.failedLoginAttempts += 1;
                await user.save();
                return res.status(401).json({
                    success: false,
                    message: 'Invalid MFA code'
                });
            }
        }
        
        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockoutUntil = null;
        user.lastLogin = new Date();
        
        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        const refreshToken = jwt.sign(
            { userId: user._id, tokenId: crypto.randomUUID() },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES }
        );
        
        // Store refresh token hash
        user.refreshTokens.push({
            token: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get('User-Agent') || '',
            ip: req.ip
        });
        
        await user.save();
        
        // Also store in Redis if available
        if (redisReady) {
            redisStoreToken(refreshToken, user._id.toString()).catch(console.error);
        }
        
        refreshTokens.set(refreshToken, { userId: user._id.toString() });
        
        res.json({
            success: true,
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Email verification
router.get('/verify-email', async (req, res) => {
    const { token, signature } = req.query;
    
    if (!token || !signature) {
        return res.status(400).json({
            success: false,
            message: 'Invalid verification link'
        });
    }
    
    // Verify signature
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
        .update(token).digest('hex');
    
    if (signature !== expectedSig) {
        return res.status(400).json({
            success: false,
            message: 'Invalid verification signature'
        });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        const tokenHash = hashToken(token);
        const stored = emailVerificationTokens.get(tokenHash);
        
        if (!stored || stored.expires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Verification token expired'
            });
        }
        
        const user = await User.findOneAndUpdate(
            { email: stored.email },
            { emailVerified: true },
            { new: true }
        );
        
        emailVerificationTokens.delete(tokenHash);
        
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Verification failed'
        });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Refresh token required'
        });
    }
    
    // Legacy mode
    if (!useDatabase()) {
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
            
            return res.json({
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
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const User = require('../models/MongoModel').User;
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const tokenHash = hashToken(refreshToken);
        const storedToken = user.refreshTokens.find(t => t.token === tokenHash);
        
        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }
        
        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        res.json({
            success: true,
            accessToken: newAccessToken,
            expiresIn: 15 * 60
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email required'
        });
    }
    
    // Always return same response to prevent email enumeration
    res.json({
        success: true,
        message: 'If email exists, reset link sent'
    });
    
    try {
        const User = require('../models/MongoModel').User;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            passwordResetTokens.set(hashToken(resetToken), {
                email: user.email,
                expires: Date.now() + 60 * 60 * 1000
            });
            
            await sendResetEmail(email, resetToken, user.name);
        }
    } catch (error) {
        console.error('Password reset error:', error);
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token and new password required'
        });
    }
    
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            message: 'Password too weak'
        });
    }
    
    try {
        const stored = passwordResetTokens.get(hashToken(token));
        
        if (!stored || stored.expires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        const User = require('../models/MongoModel').User;
        const passwordHash = await bcrypt.hash(newPassword, 12);
        
        await User.findOneAndUpdate(
            { email: stored.email },
            {
                password: passwordHash,
                refreshTokens: [], // Invalidate all sessions
                failedLoginAttempts: 0,
                lockoutUntil: null
            }
        );
        
        passwordResetTokens.delete(hashToken(token));
        
        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Reset failed'
        });
    }
});

// Setup TOTP (requires authentication)
router.post('/setup-mfa', async (req, res) => {
    const { email, totpToken } = req.body;
    
    if (!useDatabase()) {
        return res.status(501).json({ success: false, message: 'MFA requires database' });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // If TOTP already set up, verify token to disable/regenerate
        if (user.totpSecret && totpToken) {
            if (!verifyTOTP(totpToken, user.totpSecret)) {
                return res.status(401).json({ success: false, message: 'Invalid TOTP token' });
            }
            // Clear MFA
            await User.findByIdAndUpdate(user._id, { totpSecret: null, recoveryCodes: [] });
            return res.json({ success: true, message: 'MFA disabled' });
        }
        
        // Generate new TOTP secret
        const { secret, qrCodeUrl } = await setupTOTP(email);
        
        // Temporarily store (user must verify to activate)
        res.json({
            success: true,
            secret,
            qrCodeUrl,
            message: 'Scan QR code and verify with /verify-mfa'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'MFA setup failed' });
    }
});

// Verify and activate TOTP
router.post('/verify-mfa', async (req, res) => {
    const { email, totpToken, secret } = req.body;
    
    if (!secret || !totpToken) {
        return res.status(400).json({ success: false, message: 'Secret and TOTP token required' });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        
        // Verify the token against the secret
        if (!verifyTOTP(totpToken, secret)) {
            return res.status(400).json({ success: false, message: 'Invalid TOTP token' });
        }
        
        // Activate MFA
        const recoveryCodes = generateRecoveryCodes();
        await User.findOneAndUpdate(
            { email },
            { totpSecret: secret, recoveryCodes }
        );
        
        res.json({
            success: true,
            recoveryCodes,
            message: 'MFA activated. Save these recovery codes!'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'MFA verification failed' });
    }
});

// Verify token
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

// Logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    
    refreshTokens.delete(refreshToken);
    
    // Cleanup database
    if (useDatabase() && refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
            const User = require('../models/MongoModel').User;
            
            await User.findByIdAndUpdate(decoded.userId, {
                $pull: { refreshTokens: { token: hashToken(refreshToken) } }
            });
        } catch (e) {
            // Token invalid or user not found
        }
    }
    
    // Cleanup Redis if available
    if (redisReady && refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
            redisDeleteToken(refreshToken, decoded.userId).catch(console.error);
        } catch (e) {}
    }
    
    res.json({ success: true, message: 'Logged out' });
});

module.exports = router;