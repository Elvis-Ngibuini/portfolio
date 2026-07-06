// API Configuration
// Detect environment and use appropriate backend URL
let API_BASE_URL = 'http://localhost:3001/api'; // Default to local
try {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
    if (!isLocalhost) {
        API_BASE_URL = 'https://portfolio-6u3n.onrender.com/api';
    }
} catch (e) {
    // Fallback to local if any error
    API_BASE_URL = 'http://localhost:3001/api';
}

// API Helper Functions
class PortfolioAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.visitorId = this.getOrCreateVisitorId();
    }

    // Generate or retrieve visitor ID
    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('portfolio_visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('portfolio_visitor_id', visitorId);
        }
        return visitorId;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            // Fail silently - don't log anything to console
            throw error;
        }
    }

    // Get Projects
    async getProjects(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/projects${queryParams ? '?' + queryParams : ''}`;
        return this.request(endpoint);
    }

    // Get Single Project
    async getProject(id) {
        return this.request(`/projects/${id}`);
    }

    // Get Project Statistics
    async getProjectStats() {
        return this.request('/projects/stats/overview');
    }

    // Track Analytics
    async trackPageView(data) {
        try {
            return this.request('/analytics/track', {
                method: 'POST',
                body: JSON.stringify({
                    visitor_id: this.visitorId,
                    timestamp: new Date().toISOString(),
                    ...data
                })
            });
        } catch (error) {
            // Don't throw analytics errors - fail completely silently
            return null;
        }
    }

    // Get Analytics Dashboard (for admin use)
    async getAnalyticsDashboard() {
        return this.request('/analytics/dashboard');
    }
}

// Create global API instance
const portfolioAPI = new PortfolioAPI();



// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        background: ${getNotificationColor(type)};
        color: white;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// Analytics Tracking Functions
function trackPageView(page, section = null) {
    // Wrap in try/catch and don't let errors bubble up
    try {
        portfolioAPI.trackPageView({
            page: page || window.location.pathname,
            section,
            referrer: document.referrer || 'direct',
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        }).catch(() => {
            // Completely silent catch
        });
    } catch (e) {
        // Completely silent
    }
}

function trackProjectView(projectId) {
    try {
        portfolioAPI.trackPageView({
            page: window.location.pathname,
            section: 'projects',
            project_id: projectId
        }).catch(() => {});
    } catch (e) {
        // Silent
    }
}

// Initialize analytics tracking
document.addEventListener('DOMContentLoaded', () => {
    // Track initial page view - silently
    try {
        trackPageView();
    } catch (e) {}

    // Track section views on scroll
    try {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackPageView(window.location.pathname, entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    } catch (e) {
        // Silent
    }
});

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);