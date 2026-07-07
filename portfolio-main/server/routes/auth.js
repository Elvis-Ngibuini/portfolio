const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const { validatePassword, hashToken, sendVerificationEmail, sendResetEmail, generateRecoveryCodes } = require('../utils/auth-helpers');
const { setupTOTP, verifyTOTP } = require('../utils/mfa');
const { initRedis, storeRefreshToken: redisStoreToken, deleteRefreshToken: redisDeleteToken } = require('../utils/token-store');
const UserFile = require('../models/UserFile');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

const refreshTokens = new Map();
const emailVerificationTokens = new Map();
const passwordResetTokens = new Map();

initRedis();

function useDatabase() {
    try {
        return mongoose.connection && mongoose.connection.readyState === 1;
    } catch (e) {
        return false;
    }
}

async function findUser(email) {
    if (useDatabase()) {
        const User = mongoose.model('User');
        return await User.findOne({ email: email.toLowerCase() });
    } else {
        const users = UserFile.readUsers();
        return users.find(u => u.email === email.toLowerCase()) || null;
    }
}

async function saveUser(userData) {
    if (useDatabase()) {
        const User = mongoose.model('User');
        const user = new User(userData);
        return await user.save();
    } else {
        const users = UserFile.readUsers();
        const id = crypto.randomUUID();
        const user = { _id: id, ...userData, createdAt: new Date().toISOString() };
        users.push(user);
        UserFile.writeUsers(users);
        return user;
    }
}

async function updateUser(id, updates) {
    if (useDatabase()) {
        const User = mongoose.model('User');
        return await User.findByIdAndUpdate(id, updates, { new: true });
    } else {
        const users = UserFile.readUsers();
        const index = users.findIndex(u => u._id === id);
        if (index >= 0) {
            users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
            UserFile.writeUsers(users);
            return users[index];
        }
        return null;
    }
}

// Registration
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    const validation = validatePassword(password);
    if (!validation.valid) {
        return res.status(400).json({ success: false, message: 'Password too weak. Need: 12+ chars, mixed case, numbers, symbols' });
    }
    
    try {
        const existing = await findUser(email);
        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }
        
        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const recoveryCodes = generateRecoveryCodes();
        
        const user = await saveUser({
            email: email.toLowerCase(),
            password: passwordHash,
            name: name || '',
            role: role || 'EDITOR',
            emailVerified: false,
            recoveryCodes,
            refreshTokens: []
        });
        
        emailVerificationTokens.set(hashToken(verificationToken), {
            email: email.toLowerCase(),
            expires: Date.now() + 24 * 60 * 60 * 1000
        });
        
        await sendVerificationEmail(email, verificationToken, name);
        
        res.status(201).json({ success: true, message: 'Registration successful. Check email for verification.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password, username } = req.body;
    const loginId = email || username;
    
    // Try database/file storage first
    try {
        const user = await findUser(loginId);

        if (user) {
            if (useDatabase() && user.lockoutUntil && user.lockoutUntil > new Date()) {
                return res.status(429).json({ success: false, message: 'Account locked. Try again later.' });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            if (user.totpSecret) {
                return res.json({
                    success: true,
                    mfaRequired: true,
                    message: 'MFA code required',
                    email: user.email
                });
            }

            const accessToken = jwt.sign(
                { userId: user._id || user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: ACCESS_EXPIRES }
            );

            const refreshToken = jwt.sign(
                { userId: user._id || user.id, tokenId: crypto.randomUUID() },
                REFRESH_SECRET,
                { expiresIn: REFRESH_EXPIRES }
            );

            if (useDatabase()) {
                const User = mongoose.model('User');
                await User.findByIdAndUpdate(user._id, {
                    $push: { refreshTokens: {
                        token: hashToken(refreshToken),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        userAgent: req.get('User-Agent') || '',
                        ip: req.ip
                    }},
                    lastLogin: new Date()
                });
            } else {
                await updateUser(user._id || user.id, { lastLogin: new Date() });
            }

            redisStoreToken(refreshToken, user._id || user.id).catch(console.error);
            refreshTokens.set(refreshToken, { userId: user._id || user.id });

            return res.json({
                success: true,
                accessToken,
                refreshToken,
                expiresIn: 15 * 60,
                user: { email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified }
            });
        }
    } catch (error) {
        console.error('Login error:', error);
    }

    // Legacy single-admin mode (fallback)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    
    // In dev mode without ADMIN_USERNAME set, allow any login (for testing)
    if (!ADMIN_USERNAME && process.env.NODE_ENV !== 'production') {
        const accessToken = jwt.sign({ username: loginId || 'admin', role: 'ADMIN' }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
        const refreshToken = jwt.sign({ username: loginId || 'admin', role: 'ADMIN', tokenId: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
        
        return res.json({ success: true, accessToken, refreshToken, expiresIn: 15 * 60, user: { email: loginId || 'admin', role: 'ADMIN' } });
    }
    
    if (!ADMIN_USERNAME || loginId !== ADMIN_USERNAME) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (ADMIN_PASSWORD_HASH) {
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } else if (password !== adminPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const accessToken = jwt.sign({ username: ADMIN_USERNAME, role: 'ADMIN' }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
    const refreshToken = jwt.sign({ username: ADMIN_USERNAME, role: 'ADMIN', tokenId: crypto.randomUUID() }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
    
    return res.json({ success: true, accessToken, refreshToken, expiresIn: 15 * 60, user: { email: ADMIN_USERNAME, role: 'ADMIN' } });
});

// MFA verification during login
router.post('/verify-mfa', async (req, res) => {
    const { email, totpToken, backupCode } = req.body;
    
    try {
        const user = await findUser(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        let mfaValid = false;
        if (totpToken && user.totpSecret) {
            mfaValid = verifyTOTP(totpToken, user.totpSecret);
        } else if (backupCode && user.recoveryCodes) {
            mfaValid = user.recoveryCodes.includes(backupCode.toUpperCase());
        }
        
        if (!mfaValid) {
            return res.status(401).json({ success: false, message: 'Invalid MFA code' });
        }
        
        const accessToken = jwt.sign(
            { userId: user._id || user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        const refreshToken = jwt.sign(
            { userId: user._id || user.id, tokenId: crypto.randomUUID() },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES }
        );
        
        return res.json({
            success: true,
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            user: { email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'MFA verification failed' });
    }
});

// Email verification
router.get('/verify-email', async (req, res) => {
    const { token, signature } = req.query;
    
    if (!token || !signature) {
        return res.status(400).json({ success: false, message: 'Invalid verification link' });
    }
    
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(token).digest('hex');
    
    if (signature !== expectedSig) {
        return res.status(400).json({ success: false, message: 'Invalid verification signature' });
    }
    
    try {
        const stored = emailVerificationTokens.get(hashToken(token));
        
        if (!stored || stored.expires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Verification token expired' });
        }
        
        const user = await findUser(stored.email);
        if (user) {
            const updates = { emailVerified: true };
            await updateUser(user._id || user.id, updates);
        }
        
        emailVerificationTokens.delete(hashToken(token));
        return res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }
    
    if (!useDatabase()) {
        const stored = refreshTokens.get(refreshToken);
        if (!stored) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' });
        }
        
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
            const newAccessToken = jwt.sign({ username: decoded.username, role: 'admin' }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
            return res.json({ success: true, accessToken: newAccessToken, expiresIn: 15 * 60 });
        } catch (error) {
            refreshTokens.delete(refreshToken);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    }
    
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const User = mongoose.model('User');
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(403).json({ success: false, message: 'User not found' });
        }
        
        const tokenHash = hashToken(refreshToken);
        const storedToken = user.refreshTokens.find(t => t.token === tokenHash);
        
        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
        }
        
        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES }
        );
        
        return res.json({ success: true, accessToken: newAccessToken, expiresIn: 15 * 60 });
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    res.json({ success: true, message: 'If email exists, reset link sent' });
    
    try {
        const user = await findUser(email);
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
        return res.status(400).json({ success: false, message: 'Token and new password required' });
    }
    
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
        return res.status(400).json({ success: false, message: 'Password too weak' });
    }
    
    try {
        const stored = passwordResetTokens.get(hashToken(token));
        
        if (!stored || stored.expires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        
        const passwordHash = await bcrypt.hash(newPassword, 12);
        
        const user = await findUser(stored.email);
        if (user) {
            const updates = { password: passwordHash, refreshTokens: [], failedLoginAttempts: 0 };
            await updateUser(user._id || user.id, updates);
        }
        
        passwordResetTokens.delete(hashToken(token));
        return res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Reset failed' });
    }
});

// Setup TOTP
router.post('/setup-mfa', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await findUser(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const { secret, qrCodeUrl } = await setupTOTP(email);
        return res.json({ success: true, secret, qrCodeUrl, message: 'Scan QR code and verify with TOTP code' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'MFA setup failed' });
    }
});

// Verify and activate TOTP
router.post('/verify-totp', async (req, res) => {
    const { email, totpToken, secret } = req.body;
    
    if (!secret || !totpToken) {
        return res.status(400).json({ success: false, message: 'Secret and TOTP token required' });
    }
    
    try {
        if (!verifyTOTP(totpToken, secret)) {
            return res.status(400).json({ success: false, message: 'Invalid TOTP token' });
        }
        
        const recoveryCodes = generateRecoveryCodes();
        const user = await findUser(email);
        
        if (user) {
            const updates = { totpSecret: secret, recoveryCodes };
            await updateUser(user._id || user.id, updates);
        }
        
        return res.json({
            success: true,
            recoveryCodes,
            message: 'MFA activated. Save these recovery codes!'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'MFA verification failed' });
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
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    
    refreshTokens.delete(refreshToken);
    
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
            if (useDatabase()) {
                const User = mongoose.model('User');
                await User.findByIdAndUpdate(decoded.userId, {
                    $pull: { refreshTokens: { token: hashToken(refreshToken) } }
                });
            }
            await redisDeleteToken(refreshToken, decoded.userId);
        } catch (e) {}
    }
    
    res.json({ success: true, message: 'Logged out' });
});

module.exports = router;