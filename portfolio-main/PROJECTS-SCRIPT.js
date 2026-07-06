/* ===== ENHANCED PROJECTS FUNCTIONALITY ===== */
/* Add this to your js/script.js file or create a new js/projects.js file */

// Project Data for Modals
const projectsData = {
    huduma: {
        title: "Huduma Center Birth Certificate Collection System",
        subtitle: "Enterprise Inventory Management Solution",
        image: "images/Huduma Center Homepage.png",
        description: "A comprehensive web-based inventory management system developed during my internship at Huduma Center GPO. The system revolutionized the birth certificate collection process by introducing real-time tracking, automated notifications, and data-driven insights.",
        challenge: "Huduma Center GPO was managing birth certificate collections manually using paper-based systems, leading to inefficiencies, delays, and difficulty in tracking inventory levels. The process was time-consuming and prone to errors.",
        solution: "Developed a full-stack web application that digitizes the entire collection process. The system features a user-friendly dashboard, real-time inventory tracking, automated email notifications, and comprehensive reporting capabilities.",
        features: [
            "Real-time inventory tracking and management",
            "Automated email notifications for low stock alerts",
            "Comprehensive analytics dashboard with charts and graphs",
            "User authentication and role-based access control",
            "Search and filter functionality for quick access",
            "Export data to PDF and Excel formats",
            "Mobile-responsive design for on-the-go access",
            "Audit trail for all transactions"
        ],
        technologies: [
            { name: "HTML5", icon: "fab fa-html5" },
            { name: "CSS3", icon: "fab fa-css3-alt" },
            { name: "JavaScript", icon: "fab fa-js" },
            { name: "PHP", icon: "fab fa-php" },
            { name: "MySQL", icon: "fas fa-database" },
            { name: "Bootstrap", icon: "fab fa-bootstrap" }
        ],
        metrics: [
            { value: "25%", label: "Efficiency Increase" },
            { value: "150+", label: "Daily Active Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "5000+", label: "Records Managed" }
        ],
        links: {
            github: "https://github.com/EluisNgibuni",
            demo: "images/Huduma Center.png"
        }
    },
    baobab: {
        title: "The Baobab Lounge - Digital Menu & Ordering System",
        subtitle: "Modern Restaurant Management Platform",
        image: "images/Baobab homepage.png",
        description: "A cutting-edge digital menu and ordering system designed for The Baobab Lounge restaurant. The platform provides customers with an interactive menu experience while streamlining order management for staff.",
        challenge: "Traditional paper menus were costly to update, difficult to manage, and didn't provide real-time order tracking. The restaurant needed a modern solution to enhance customer experience and operational efficiency.",
        solution: "Built a full-stack React application with real-time order management, QR code integration for contactless ordering, and seamless payment processing. The system includes both customer-facing and admin interfaces.",
        features: [
            "Interactive digital menu with high-quality images",
            "QR code scanning for instant menu access",
            "Real-time order status tracking",
            "Integrated payment gateway (M-Pesa, Card)",
            "Admin dashboard for menu management",
            "Order history and analytics",
            "Customer feedback system",
            "Multi-language support (English, Swahili)"
        ],
        technologies: [
            { name: "React", icon: "fab fa-react" },
            { name: "Node.js", icon: "fab fa-node-js" },
            { name: "Express", icon: "fas fa-server" },
            { name: "MongoDB", icon: "fas fa-database" },
            { name: "Tailwind CSS", icon: "fab fa-css3-alt" },
            { name: "Socket.io", icon: "fas fa-plug" }
        ],
        metrics: [
            { value: "75+", label: "Menu Items" },
            { value: "40%", label: "Faster Orders" },
            { value: "95%", label: "Customer Satisfaction" },
            { value: "200+", label: "Daily Orders" }
        ],
        links: {
            github: "https://github.com/EluisNgibuni",
            demo: "#"
        }
    },
    chacadom: {
        title: "Chacadom Investments - Real Estate Platform",
        subtitle: "Comprehensive Property Management Solution",
        image: "images/Chacadom homepage.png",
        description: "A modern real estate platform connecting buyers, sellers, and agents. Features advanced property search, virtual tours, mortgage calculators, and integrated communication tools.",
        challenge: "Real estate agents needed a centralized platform to showcase properties, manage inquiries, and connect with potential buyers. Traditional methods were inefficient and lacked modern features like virtual tours.",
        solution: "Developed a feature-rich Next.js application with advanced search filters, interactive maps, virtual tour integration, and a comprehensive agent portal. The platform streamlines the entire property buying/selling process.",
        features: [
            "Advanced property search with multiple filters",
            "Interactive map integration (Google Maps)",
            "360° virtual property tours",
            "Mortgage calculator and affordability tools",
            "Agent portal for property management",
            "Inquiry and appointment scheduling system",
            "Favorites and comparison features",
            "Email and SMS notifications"
        ],
        technologies: [
            { name: "Next.js", icon: "fab fa-react" },
            { name: "Node.js", icon: "fab fa-node-js" },
            { name: "PostgreSQL", icon: "fas fa-database" },
            { name: "Tailwind CSS", icon: "fab fa-css3-alt" },
            { name: "Google Maps API", icon: "fas fa-map-marked-alt" },
            { name: "AWS S3", icon: "fab fa-aws" }
        ],
        metrics: [
            { value: "100+", label: "Properties Listed" },
            { value: "50+", label: "Active Agents" },
            { value: "1000+", label: "Monthly Visitors" },
            { value: "85%", label: "Lead Conversion" }
        ],
        links: {
            github: "https://github.com/EluisNgibuni",
            demo: "#"
        }
    },
    portfolio: {
        title: "Personal Portfolio & Admin System",
        subtitle: "Secure Full-Stack Portfolio Website",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300d4ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237928ca;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='800' height='600'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='white' font-weight='bold'%3EPortfolio Website%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='white' opacity='0.9'%3ESecure • Fast • Accessible%3C/text%3E%3C/svg%3E",
        description: "A modern, secure portfolio website showcasing my work and skills. Features a custom-built backend API with authentication, admin dashboard for contact management, and comprehensive security measures.",
        challenge: "Needed a professional portfolio that not only showcases projects but also handles contact form submissions securely, provides an admin interface for managing inquiries, and maintains high performance and accessibility standards.",
        solution: "Built a full-stack solution with vanilla JavaScript frontend and Express.js backend. Implemented API authentication, input sanitization, rate limiting, and comprehensive security features. Achieved 95+ Lighthouse score.",
        features: [
            "Secure REST API with authentication",
            "Admin dashboard for contact management",
            "Input sanitization and XSS protection",
            "Rate limiting and spam prevention",
            "Email notifications for new contacts",
            "SEO optimized with structured data",
            "WCAG 2.1 AA accessibility compliant",
            "95+ Lighthouse performance score"
        ],
        technologies: [
            { name: "HTML5", icon: "fab fa-html5" },
            { name: "CSS3", icon: "fab fa-css3-alt" },
            { name: "JavaScript", icon: "fab fa-js" },
            { name: "Node.js", icon: "fab fa-node-js" },
            { name: "Express", icon: "fas fa-server" },
            { name: "GitHub Pages", icon: "fab fa-github" }
        ],
        metrics: [
            { value: "95+", label: "Lighthouse Score" },
            { value: "8/10", label: "Security Rating" },
            { value: "9/10", label: "SEO Score" },
            { value: "<2s", label: "Load Time" }
        ],
        links: {
            github: "https://github.com/EluisNgibuni/portfolio",
            demo: "https://eluisngibuni.github.io/portfolio"
        }
    }
};

// Open Project Modal
function openProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('projectModalBody');

    // Build modal content
    const content = `
        <div class="modal-project-header">
            <h2 class="modal-project-title">${project.title}</h2>
            <p class="modal-project-subtitle">${project.subtitle}</p>
        </div>

        <img src="${project.image}" alt="${project.title}" class="modal-project-image" loading="lazy">

        <div class="modal-section">
            <h3><i class="fas fa-info-circle"></i> Overview</h3>
            <p>${project.description}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-exclamation-triangle"></i> The Challenge</h3>
            <p>${project.challenge}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-lightbulb"></i> The Solution</h3>
            <p>${project.solution}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-star"></i> Key Features</h3>
            <ul>
                ${project.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-code"></i> Technologies Used</h3>
            <div class="modal-tech-grid">
                ${project.technologies.map(tech => `
                    <div class="modal-tech-item">
                        <i class="${tech.icon}"></i>
                        <div>${tech.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-chart-bar"></i> Impact & Metrics</h3>
            <div class="modal-metrics">
                ${project.metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-value">${metric.value}</div>
                        <div class="metric-label">${metric.label}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="modal-links">
            <a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="modal-link-btn primary">
                <i class="fab fa-github"></i> View on GitHub
            </a>
            ${project.links.demo !== '#' ? `
                <a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="modal-link-btn secondary">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>
            ` : ''}
        </div>
    `;

    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Project Modal
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to all "View Case Study" buttons
    const projectButtons = document.querySelectorAll('.view-project-btn');
    projectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = button.getAttribute('data-project');
            openProjectModal(projectId);
        });
    });

    // Close modal when clicking outside
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});
