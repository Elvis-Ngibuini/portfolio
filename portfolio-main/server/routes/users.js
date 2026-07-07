const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const router = express.Router();
const { validatePassword, hashToken } = require('../utils/auth-helpers');

// RBAC middleware
function requireRole(minLevel) {
    return (req, res, next) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
            
            const roleLevels = { VIEWER: 10, EDITOR: 25, ADMIN: 50, SUPER_ADMIN: 100 };
            const userLevel = roleLevels[decoded.role] || 0;
            
            if (userLevel < minLevel) {
                return res.status(403).json({ success: false, message: 'Insufficient permissions' });
            }
            
            req.user = decoded;
            next();
        } catch (e) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    };
}

// Helper to check database
function useDatabase() {
    try {
        return mongoose.connection && mongoose.connection.readyState === 1;
    } catch (e) {
        return false;
    }
}

// Get all users (SUPER_ADMIN only)
router.get('/', requireRole(100), async (req, res) => {
    if (!useDatabase()) {
        return res.status(501).json({ success: false, message: 'Database required for user management' });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        const users = await User.find({}, '-password -totpSecret -recoveryCodes').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Get single user
router.get('/:id', requireRole(50), async (req, res) => {
    if (!useDatabase()) {
        return res.status(501).json({ success: false, message: 'Database required for user management' });
    }
    
    try {
        const User = require('../models/MongoModel').User;
        const user = await User.findById(req.params.id, '-password -totpSecret -recoveryCodes');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

// Create user (ADMIN/SUPER_ADMIN)
router.post('/', requireRole(50), async (req, res) => {
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
        const User = require('../models/MongoModel').User;
        
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }
        
        const passwordHash = await bcrypt.hash(password, 12);
        
        const user = new User({
            email: email.toLowerCase(),
            password: passwordHash,
            name: name || '',
            role: ['VIEWER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'EDITOR'
        });
        
        await user.save();
        res.status(201).json({ success: true, message: 'User created' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Update user
router.put('/:id', requireRole(50), async (req, res) => {
    const { email, password, name, role } = req.body;
    const updates = { name };
    
    if (email) updates.email = email.toLowerCase();
    if (role && ['VIEWER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        updates.role = role;
    }
    
    if (password) {
        const validation = validatePassword(password);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: 'Password too weak' });
        }
        updates.password = await bcrypt.hash(password, 12);
    }
    
    try {
        const User = require('../models/MongoModel').User;
        await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json({ success: true, message: 'User updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Delete user
router.delete('/:id', requireRole(100), async (req, res) => {
    try {
        const User = require('../models/MongoModel').User;
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

module.exports = router;