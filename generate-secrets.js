#!/usr/bin/env node

const crypto = require('crypto');

console.log('# Production Secrets (save to .env)\n');

const secrets = {
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
    ADMIN_API_KEY: crypto.randomBytes(16).toString('hex'),
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex')
};

console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
console.log(`REFRESH_SECRET=${secrets.REFRESH_SECRET}`);
console.log(`ADMIN_API_KEY=${secrets.ADMIN_API_KEY}`);
console.log(`ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}`);

console.log('\n# Copy these to your .env file');
console.log('# NEVER commit .env to version control');