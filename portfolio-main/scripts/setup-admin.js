const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function setup() {
    console.log('Setting up admin authentication system...\n');
    
    // Connect to MongoDB
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');
    } catch (e) {
        console.log('⚠ MongoDB unavailable, creating JSON fallback...');
        createJSONFallback();
        return;
    }
    
    // Import User model
    const User = require('./server/models/MongoModel').User;
    
    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log(`⚠ Admin ${ADMIN_EMAIL} already exists`);
        console.log('  To reset password, run: node scripts/reset-admin.js');
        await mongoose.disconnect();
        return;
    }
    
    // Create admin
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = new User({
        email: ADMIN_EMAIL,
        password: passwordHash,
        name: ADMIN_NAME,
        role: 'SUPER_ADMIN',
        emailVerified: true
    });
    
    await admin.save();
    console.log(`✓ Created admin: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('  Role: SUPER_ADMIN');
    
    await mongoose.disconnect();
    console.log('\n✓ Setup complete! Use /admin.html to login.');
}

function createJSONFallback() {
    const storageDir = path.join(__dirname, 'server', 'storage');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    
    const adminData = [{
        email: ADMIN_EMAIL,
        password: bcrypt.hashSync(ADMIN_PASSWORD, 12),
        name: ADMIN_NAME,
        role: 'SUPER_ADMIN',
        emailVerified: true,
        createdAt: new Date().toISOString()
    }];
    
    fs.writeFileSync(
        path.join(storageDir, 'users.json'), 
        JSON.stringify(adminData, null, 2)
    );
    console.log(`✓ Created fallback admin in users.json: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
}

setup().catch(console.error);