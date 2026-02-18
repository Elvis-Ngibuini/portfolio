const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('📊 Connected to MongoDB'))
        .catch(err => console.log('❌ MongoDB connection error:', err));
} else {
    console.log('⚠️  MongoDB not configured - contact submissions will only be sent via email');
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000"]
        }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// CORS Configuration - Secure for production
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin && process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased for admin operations
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            error: 'RATE_LIMIT_EXCEEDED'
        });
    }
});
app.use(limiter);

// Contact form submission rate limiting (stricter for POST only)
const contactSubmissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Only for form submissions
    message: {
        success: false,
        message: 'Too many contact form submissions from this IP. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many contact form submissions from this IP. Please try again later.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: '1 hour'
        });
    },
    // Only apply to POST requests (form submissions)
    skip: (req) => req.method !== 'POST'
});

// Admin operations rate limiting (more lenient)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // More requests for admin operations
    message: {
        success: false,
        message: 'Too many admin requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only apply to GET, PUT, DELETE requests (admin operations)
    skip: (req) => req.method === 'POST'
});

// Routes with appropriate rate limiting
app.use('/api/contact', contactSubmissionLimiter, adminLimiter, require('./routes/contact'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check with database status
app.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'not configured'
    };

    if (mongoose.connection.readyState === 1) {
        health.database = 'connected';
    } else if (mongoose.connection.readyState === 2) {
        health.database = 'connecting';
    } else if (mongoose.connection.readyState === 0) {
        health.database = 'disconnected';
    }

    res.json(health);
});

// Reset rate limits (development only)
if (process.env.NODE_ENV === 'development') {
    app.post('/reset-rate-limits', (req, res) => {
        // Clear rate limit stores
        limiter.resetKey(req.ip);
        contactSubmissionLimiter.resetKey(req.ip);
        adminLimiter.resetKey(req.ip);

        res.json({
            success: true,
            message: 'Rate limits reset for your IP address.'
        });
    });
}

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
    console.log(`📊 Projects API: http://localhost:${PORT}/api/projects`);
});

module.exports = app;