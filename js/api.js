// API Configuration
// TODO: Update this URL after deploying backend (see BACKEND-DEPLOYMENT.md)
// For local development: http://localhost:3000/api
// For production: https://your-backend-url.com/api
const API_BASE_URL = 'http://localhost:3000/api';

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
            // Only log in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.error('API Error:', error);
            }
            throw error;
        }
    }

    // Contact Form Submission
    async submitContactForm(formData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
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
            // Don't throw analytics errors - fail silently
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Analytics tracking failed:', error);
            }
        }
    }

    // Track Contact Form Submission
    async trackContactSubmission() {
        try {
            return this.request('/analytics/contact', {
                method: 'POST',
                body: JSON.stringify({
                    visitor_id: this.visitorId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Contact analytics tracking failed:', error);
            }
        }
    }

    // Get Analytics Dashboard (for admin use)
    async getAnalyticsDashboard() {
        return this.request('/analytics/dashboard');
    }
}

// Create global API instance
const portfolioAPI = new PortfolioAPI();

// Enhanced Contact Form Handler
async function handleContactFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Get form data
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
    };

    // Validate form data
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // Submit form
        const response = await portfolioAPI.submitContactForm(formData);

        if (response.success) {
            showNotification(response.message, 'success');
            form.reset();

            // Track successful submission
            await portfolioAPI.trackContactSubmission();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Contact form error:', error);
        }
        showNotification(
            error.message || 'Failed to send message. Please try again later.',
            'error'
        );
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

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
    portfolioAPI.trackPageView({
        page: page || window.location.pathname,
        section,
        referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });
}

function trackProjectView(projectId) {
    portfolioAPI.trackPageView({
        page: window.location.pathname,
        section: 'projects',
        project_id: projectId
    });
}

// Initialize analytics tracking
document.addEventListener('DOMContentLoaded', () => {
    // Track initial page view
    trackPageView();

    // Track section views on scroll
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackPageView(window.location.pathname, entry.target.id);
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
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