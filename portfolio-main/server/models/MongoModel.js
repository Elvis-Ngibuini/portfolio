const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['web', 'dsa', 'cloud', 'other'], default: 'web' },
    technologies: [String],
    featured: { type: Boolean, default: false },
    github: String,
    demo: String,
    images: [String],
    date: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const skillSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: Number, min: 0, max: 100 }
});

const challengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    url: String,
    date: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const contributionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    repo: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    start: String,
    end: String,
    description: String,
    technologies: [String],
    createdAt: { type: Date, default: Date.now }
});

const designSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    date: String,
    tools: [String],
    featured: { type: Boolean, default: false },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    whatsapp: String
});

const homeSchema = new mongoose.Schema({
    name: String,
    title: String,
    description: String,
    image: String
});

// User schema for admin accounts
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, default: '' },
    role: { 
        type: String, 
        enum: ['VIEWER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'], 
        default: 'EDITOR' 
    },
    emailVerified: { type: Boolean, default: false },
    totpSecret: String,
    recoveryCodes: [String],
    refreshTokens: [{
        token: String,
        expiresAt: Date,
        userAgent: String,
        ip: String
    }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'refreshTokens.token': 1 });

module.exports = {
    Project: mongoose.model('Project', projectSchema),
    Skill: mongoose.model('Skill', skillSchema),
    Challenge: mongoose.model('Challenge', challengeSchema),
    Contribution: mongoose.model('Contribution', contributionSchema),
    Experience: mongoose.model('Experience', experienceSchema),
    Design: mongoose.model('Design', designSchema),
    Contact: mongoose.model('Contact', contactSchema),
    Home: mongoose.model('Home', homeSchema),
    User: mongoose.model('User', userSchema)
};