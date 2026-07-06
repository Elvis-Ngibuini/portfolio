const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const { authenticateJWT } = require('./middleware/auth');
const { checkPermission } = require('./middleware/rbac');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3001;
const STORAGE_DIR = path.join(__dirname, 'storage');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// In-memory cache with 5min TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const cacheMiddleware = (key, ttl = CACHE_TTL) => {
    return (req, res, next) => {
        const cacheKey = `${key}:${JSON.stringify(req.query)}`;
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return res.json(cached.data);
        }
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(cacheKey, { data, expires: Date.now() + ttl });
            return originalJson(data);
        };
        next();
    };
};

// Security logging with Winston
const logSecurityEvent = (event, req, details = {}) => {
    const logEntry = {
        event,
        ip: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get?.('User-Agent'),
        path: req?.path,
        method: req?.method,
        ...details
    };
    logger.info('security_event', logEntry);
};

// MongoDB Connection
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('🍃 MongoDB connected'))
        .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

// Ensure directories exist
[STORAGE_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// JSON storage helpers
const readJSON = (file) => {
    const filePath = path.join(STORAGE_DIR, file);
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return [];
    }
};

const writeJSON = (file, data) => {
    fs.writeFileSync(path.join(STORAGE_DIR, file), JSON.stringify(data, null, 2));
};

// Security logging middleware (Winston)
app.use('/api', (req, res, next) => {
    if (req.method !== 'GET') {
        logger.info('api_request', {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
    }
    next();
});

// Request sanitization
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (key.toLowerCase().includes('prototype')) delete req.body[key];
        });
    }
    next();
};

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${sanitized}`);
    }
});

// File type whitelist
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Security headers middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use('/api', sanitizeInput);

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'].filter(Boolean)
    : [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin?.startsWith(o))) {
            callback(null, true);
        } else {
            logSecurityEvent('CORS_BLOCKED', null, { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security audit logging middleware
app.use('/api', (req, res, next) => {
    if (req.method !== 'GET') {
        logSecurityEvent('API_REQUEST', req);
    }
    next();
});

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { success: false, message: 'Too many requests' } });
app.use(limiter);

// Import routes
const projectsRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

// Register API routes
app.use('/api/auth', authRoutes);

// Protected routes - only for write operations (handled in route files)
// Public routes (read-only)
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

// Home endpoints
app.get('/api/home', cacheMiddleware('home'), (req, res) => {
    const home = readJSON('home.json')[0] || { name: 'Your Name', title: 'Your Title', description: 'Your description' };
    res.json({ success: true, data: home });
});
app.put('/api/home', authenticateJWT, checkPermission('home:write'), upload.single('image'), (req, res) => {
    const home = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        image: req.file ? `/uploads/${req.file.filename}` : (readJSON('home.json')[0]?.image || '')
    };
    writeJSON('home.json', [home]);
    res.json({ success: true, data: home });
});

// Contact info endpoints
app.get('/api/contact-info', cacheMiddleware('contact-info'), (req, res) => {
    const contact = readJSON('contact-info.json')[0] || { email: '', phone: '', linkedin: '', github: '', whatsapp: '' };
    res.json({ success: true, data: contact });
});
app.put('/api/contact-info', authenticateJWT, checkPermission('contact:write'), (req, res) => {
    const contact = req.body;
    writeJSON('contact-info.json', [contact]);
    res.json({ success: true, data: contact });
});

// Graphic Design endpoints
app.get('/api/graphic-design', cacheMiddleware('graphic-design'), (req, res) => {
    const designs = readJSON('graphic-design.json');
    res.json({ success: true, designs });
});
app.get('/api/graphic-design/:id', (req, res) => {
    const designs = readJSON('graphic-design.json');
    const design = designs.find(d => d._id === req.params.id);
    if (design) res.json({ success: true, design });
    else res.status(404).json({ success: false, message: 'Design not found' });
});
app.post('/api/graphic-design', authenticateJWT, checkPermission('graphic-design:write'), upload.array('images', 10), (req, res) => {
    const designs = readJSON('graphic-design.json');
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const newDesign = {
        _id: Date.now().toString(),
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        date: req.body.date,
        tools: (req.body.tools || '').split(',').map(t => t.trim()).filter(t => t),
        featured: req.body.featured === 'true' || req.body.featured === true,
        images,
        createdAt: new Date().toISOString()
    };
    designs.push(newDesign);
    writeJSON('graphic-design.json', designs);
    res.json({ success: true, design: newDesign });
});
app.put('/api/graphic-design/:id', authenticateJWT, checkPermission('graphic-design:write'), upload.array('images', 10), (req, res) => {
    let designs = readJSON('graphic-design.json');
    const index = designs.findIndex(d => d._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Design not found' });
    const existingImages = designs[index].images || [];
    const newImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    designs[index] = {
        ...designs[index],
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        date: req.body.date,
        tools: (req.body.tools || '').split(',').map(t => t.trim()).filter(t => t),
        featured: req.body.featured === 'true' || req.body.featured === true,
        images: newImages.length ? newImages : existingImages
    };
    writeJSON('graphic-design.json', designs);
    res.json({ success: true, design: designs[index] });
});
app.delete('/api/graphic-design/:id', authenticateJWT, checkPermission('graphic-design:delete'), (req, res) => {
    let designs = readJSON('graphic-design.json');
    designs = designs.filter(d => d._id !== req.params.id);
    writeJSON('graphic-design.json', designs);
    res.json({ success: true });
});

// Skills endpoints
app.get('/api/skills', cacheMiddleware('skills'), (req, res) => {
    const skills = readJSON('skills.json');
    res.json({ success: true, skills });
});
app.get('/api/skills/:id', (req, res) => {
    const skills = readJSON('skills.json');
    const skill = skills.find(s => s._id === req.params.id);
    if (skill) res.json({ success: true, skill });
    else res.status(404).json({ success: false, message: 'Skill not found' });
});
app.post('/api/skills', authenticateJWT, checkPermission('skills:write'), (req, res) => {
    const skills = readJSON('skills.json');
    const newSkill = {
        _id: Date.now().toString(),
        category: req.body.category,
        name: req.body.name,
        level: req.body.level
    };
    skills.push(newSkill);
    writeJSON('skills.json', skills);
    res.json({ success: true, skill: newSkill });
});
app.put('/api/skills/:id', authenticateJWT, checkPermission('skills:write'), (req, res) => {
    let skills = readJSON('skills.json');
    const index = skills.findIndex(s => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Skill not found' });
    skills[index] = {
        ...skills[index],
        category: req.body.category,
        name: req.body.name,
        level: req.body.level
    };
    writeJSON('skills.json', skills);
    res.json({ success: true, skill: skills[index] });
});
app.delete('/api/skills/:id', authenticateJWT, checkPermission('skills:delete'), (req, res) => {
    let skills = readJSON('skills.json');
    skills = skills.filter(s => s._id !== req.params.id);
    writeJSON('skills.json', skills);
    res.json({ success: true });
});

// Challenges endpoints
app.get('/api/challenges', cacheMiddleware('challenges'), (req, res) => {
    const challenges = readJSON('challenges.json');
    res.json({ success: true, challenges });
});
app.get('/api/challenges/:id', (req, res) => {
    const challenges = readJSON('challenges.json');
    const challenge = challenges.find(c => c._id === req.params.id);
    if (challenge) res.json({ success: true, challenge });
    else res.status(404).json({ success: false, message: 'Challenge not found' });
});
app.post('/api/challenges', authenticateJWT, checkPermission('challenges:write'), upload.single('image'), (req, res) => {
    const challenges = readJSON('challenges.json');
    const newChallenge = {
        _id: Date.now().toString(),
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        date: req.body.date,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        createdAt: new Date().toISOString()
    };
    challenges.push(newChallenge);
    writeJSON('challenges.json', challenges);
    res.json({ success: true, challenge: newChallenge });
});
app.put('/api/challenges/:id', authenticateJWT, checkPermission('challenges:write'), upload.single('image'), (req, res) => {
    let challenges = readJSON('challenges.json');
    const index = challenges.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Challenge not found' });
    challenges[index] = {
        ...challenges[index],
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        date: req.body.date,
        image: req.file ? `/uploads/${req.file.filename}` : (challenges[index].image || '')
    };
    writeJSON('challenges.json', challenges);
    res.json({ success: true, challenge: challenges[index] });
});
app.delete('/api/challenges/:id', authenticateJWT, checkPermission('challenges:delete'), (req, res) => {
    let challenges = readJSON('challenges.json');
    challenges = challenges.filter(c => c._id !== req.params.id);
    writeJSON('challenges.json', challenges);
    res.json({ success: true });
});

// Contributions endpoints
app.get('/api/contributions', cacheMiddleware('contributions'), (req, res) => {
    const contributions = readJSON('contributions.json');
    res.json({ success: true, contributions });
});
app.get('/api/contributions/:id', (req, res) => {
    const contributions = readJSON('contributions.json');
    const contribution = contributions.find(c => c._id === req.params.id);
    if (contribution) res.json({ success: true, contribution });
    else res.status(404).json({ success: false, message: 'Contribution not found' });
});
app.post('/api/contributions', authenticateJWT, checkPermission('contributions:write'), (req, res) => {
    const contributions = readJSON('contributions.json');
    const newContribution = {
        _id: Date.now().toString(),
        title: req.body.title,
        description: req.body.description,
        repo: req.body.repo,
        date: req.body.date,
        createdAt: new Date().toISOString()
    };
    contributions.push(newContribution);
    writeJSON('contributions.json', contributions);
    res.json({ success: true, contribution: newContribution });
});
app.put('/api/contributions/:id', authenticateJWT, checkPermission('contributions:write'), (req, res) => {
    let contributions = readJSON('contributions.json');
    const index = contributions.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Contribution not found' });
    contributions[index] = {
        ...contributions[index],
        title: req.body.title,
        description: req.body.description,
        repo: req.body.repo,
        date: req.body.date
    };
    writeJSON('contributions.json', contributions);
    res.json({ success: true, contribution: contributions[index] });
});
app.delete('/api/contributions/:id', authenticateJWT, checkPermission('contributions:delete'), (req, res) => {
    let contributions = readJSON('contributions.json');
    contributions = contributions.filter(c => c._id !== req.params.id);
    writeJSON('contributions.json', contributions);
    res.json({ success: true });
});

// Experience endpoints
app.get('/api/experience', cacheMiddleware('experience'), (req, res) => {
    const experience = readJSON('experience.json');
    res.json({ success: true, experience });
});
app.get('/api/experience/:id', (req, res) => {
    const experience = readJSON('experience.json');
    const exp = experience.find(e => e._id === req.params.id);
    if (exp) res.json({ success: true, experience: exp });
    else res.status(404).json({ success: false, message: 'Experience not found' });
});
app.post('/api/experience', authenticateJWT, checkPermission('experience:write'), (req, res) => {
    const experience = readJSON('experience.json');
    const newExp = {
        _id: Date.now().toString(),
        company: req.body.company,
        role: req.body.role,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        technologies: (req.body.technologies || '').split(',').map(t => t.trim()).filter(t => t),
        createdAt: new Date().toISOString()
    };
    experience.push(newExp);
    writeJSON('experience.json', experience);
    res.json({ success: true, experience: newExp });
});
app.put('/api/experience/:id', authenticateJWT, checkPermission('experience:write'), (req, res) => {
    let experience = readJSON('experience.json');
    const index = experience.findIndex(e => e._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Experience not found' });
    experience[index] = {
        ...experience[index],
        company: req.body.company,
        role: req.body.role,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        technologies: (req.body.technologies || '').split(',').map(t => t.trim()).filter(t => t)
    };
    writeJSON('experience.json', experience);
    res.json({ success: true, experience: experience[index] });
});
app.delete('/api/experience/:id', authenticateJWT, checkPermission('experience:delete'), (req, res) => {
    let experience = readJSON('experience.json');
    experience = experience.filter(e => e._id !== req.params.id);
    writeJSON('experience.json', experience);
    res.json({ success: true });
});

// Bulk endpoint for performance
app.get('/api/bulk', cacheMiddleware('bulk'), (req, res) => {
    const [home] = readJSON('home.json') || [];
    const projects = readJSON('projects.json') || [];
    const designs = readJSON('graphic-design.json') || [];
    const skills = readJSON('skills.json') || [];
    const challenges = readJSON('challenges.json') || [];
    const contributions = readJSON('contributions.json') || [];
    const experience = readJSON('experience.json') || [];
    const [contact] = readJSON('contact-info.json') || [];
    
    res.json({ 
        success: true, 
        data: {
            home: home || { name: 'Your Name', title: 'Your Title', description: 'Your description' },
            projects,
            designs,
            skills,
            challenges,
            contributions,
            experience,
            contact: contact || { email: '', phone: '', linkedin: '', github: '', whatsapp: '' }
        }
    });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    logger.error('server_error', { 
        error: err.message, 
        stack: err.stack,
        path: req?.path,
        method: req?.method
    });
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!', 
        ...(process.env.NODE_ENV === 'development' && { details: err.message }) 
    });
});

// Only start server when run directly (not in tests)
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info('server_start', { port: PORT, env: process.env.NODE_ENV });
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Admin API: http://localhost:${PORT}/api`);
        console.log(`📂 Uploads: http://localhost:${PORT}/uploads`);
    });
}

module.exports = app;