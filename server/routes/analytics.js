const express = require('express');
const router = express.Router();

// Simple in-memory analytics (in production, use a database)
let analytics = {
    page_views: 0,
    unique_visitors: new Set(),
    contact_submissions: 0,
    project_views: {},
    popular_sections: {
        home: 0,
        projects: 0,
        skills: 0,
        experience: 0,
        contact: 0
    },
    visitor_countries: {},
    referrers: {},
    last_updated: new Date()
};

// POST /api/analytics/track - Track page view
router.post('/track', (req, res) => {
    const {
        page,
        section,
        visitor_id,
        country,
        referrer,
        project_id
    } = req.body;

    try {
        // Track page view
        analytics.page_views++;

        // Track unique visitor
        if (visitor_id) {
            analytics.unique_visitors.add(visitor_id);
        }

        // Track section views
        if (section && analytics.popular_sections.hasOwnProperty(section)) {
            analytics.popular_sections[section]++;
        }

        // Track project views
        if (project_id) {
            analytics.project_views[project_id] = (analytics.project_views[project_id] || 0) + 1;
        }

        // Track country
        if (country) {
            analytics.visitor_countries[country] = (analytics.visitor_countries[country] || 0) + 1;
        }

        // Track referrer
        if (referrer && referrer !== 'direct') {
            analytics.referrers[referrer] = (analytics.referrers[referrer] || 0) + 1;
        }

        analytics.last_updated = new Date();

        res.json({ success: true, message: 'Analytics tracked' });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ success: false, message: 'Failed to track analytics' });
    }
});

// POST /api/analytics/contact - Track contact form submission
router.post('/contact', (req, res) => {
    analytics.contact_submissions++;
    analytics.last_updated = new Date();

    res.json({ success: true, message: 'Contact submission tracked' });
});

// GET /api/analytics/dashboard - Get analytics dashboard data
router.get('/dashboard', (req, res) => {
    const dashboardData = {
        overview: {
            total_page_views: analytics.page_views,
            unique_visitors: analytics.unique_visitors.size,
            contact_submissions: analytics.contact_submissions,
            bounce_rate: "65%", // Mock data
            avg_session_duration: "2m 34s" // Mock data
        },
        popular_sections: analytics.popular_sections,
        project_views: analytics.project_views,
        top_countries: Object.entries(analytics.visitor_countries)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .reduce((obj, [country, views]) => {
                obj[country] = views;
                return obj;
            }, {}),
        top_referrers: Object.entries(analytics.referrers)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .reduce((obj, [referrer, views]) => {
                obj[referrer] = views;
                return obj;
            }, {}),
        recent_activity: [
            { action: "Page View", page: "/", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
            { action: "Project View", page: "/projects", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
            { action: "Contact Form", page: "/contact", timestamp: new Date(Date.now() - 1000 * 60 * 30) }
        ],
        last_updated: analytics.last_updated
    };

    res.json({
        success: true,
        data: dashboardData
    });
});

// GET /api/analytics/export - Export analytics data
router.get('/export', (req, res) => {
    const exportData = {
        ...analytics,
        unique_visitors: analytics.unique_visitors.size, // Convert Set to number
        exported_at: new Date()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio-analytics.json');
    res.json(exportData);
});

module.exports = router;