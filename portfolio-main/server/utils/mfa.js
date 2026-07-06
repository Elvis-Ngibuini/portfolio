const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { hashToken, generateRecoveryCodes } = require('./auth-helpers');

// TOTP setup - generate secret and QR code
async function setupTOTP(email) {
    const secret = speakeasy.generateSecret({
        name: `Portfolio Admin: ${email}`,
        issuer: 'Portfolio Admin',
        length: 32
    });
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    return { secret: secret.base32, qrCodeUrl };
}

// Verify TOTP token
function verifyTOTP(token, secret) {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
        time: Math.floor(Date.now() / 1000)
    });
}

// Generate backup codes
function generateBackupCodes(count = 10) {
    return generateRecoveryCodes(count);
}

module.exports = {
    setupTOTP,
    verifyTOTP,
    generateBackupCodes
};