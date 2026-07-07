const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ANALYTICS_FILE = path.join(__dirname, '../storage/analytics.json');

function readAnalytics() {
    try {
        if (fs.existsSync(ANALYTICS_FILE)) {
            return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
        }
    } catch (e) {}
    return { pageViews: {}, totalViews: 0 };
}

function writeAnalytics(data) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

router.post('/analytics', (req, res) => {
    const { page, referrer } = req.body;
    const analytics = readAnalytics();
    
    analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
    analytics.totalViews = (analytics.totalViews || 0) + 1;
    
    if (!analytics.lastVisit) analytics.lastVisit = {};
    analytics.lastVisit[page] = new Date().toISOString();
    
    writeAnalytics(analytics);
    res.json({ success: true });
});

router.get('/analytics', (req, res) => {
    res.json({ success: true, analytics: readAnalytics() });
});

module.exports = router;