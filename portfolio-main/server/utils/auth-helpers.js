const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const SALT_ROUNDS = 12;

// Generate secure random token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Hash token for storage
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Password validation using zxcvbn strength
function validatePassword(password) {
    const requirements = {
        minLength: password.length >= 12,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSymbol: /[^a-zA-Z0-9]/.test(password)
    };
    const score = Object.values(requirements).filter(Boolean).length;
    return { valid: score >= 4, requirements, score };
}

// Email transporter (configure for production)
let transporter = null;
function getEmailTransporter() {
    if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

// Send verification email
async function sendVerificationEmail(email, token, name = 'User') {
    const transporter = getEmailTransporter();
    if (!transporter) {
        console.warn('Email not configured - skipping verification email');
        return;
    }
    
    const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback')
        .update(token).digest('hex');
    
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/verify-email?token=${token}&signature=${signature}`;
    
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - Portfolio Admin',
        html: `
            <h2>Welcome to Portfolio Admin</h2>
            <p>Hi ${name}, please verify your email address:</p>
            <p><a href="${verifyUrl}">Verify Email</a></p>
            <p>This link expires in 24 hours.</p>
        `
    });
}

// Send password reset email
async function sendResetEmail(email, token, name = 'User') {
    const transporter = getEmailTransporter();
    if (!transporter) {
        console.warn('Email not configured - skipping reset email');
        return;
    }
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password?token=${token}`;
    
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - Portfolio Admin',
        html: `
            <h2>Password Reset Request</h2>
            <p>Hi ${name}, reset your password:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
            <p>This link expires in 1 hour.</p>
        `
    });
}

// Generate recovery codes
function generateRecoveryCodes(count = 10) {
    return Array.from({ length: count }, () => 
        crypto.randomBytes(6).toString('hex').toUpperCase().match(/.{1,4}/g).join('-')
    );
}

module.exports = {
    generateToken,
    hashToken,
    validatePassword,
    sendVerificationEmail,
    sendResetEmail,
    generateRecoveryCodes,
    SALT_ROUNDS
};