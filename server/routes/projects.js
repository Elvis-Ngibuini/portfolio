const express = require('express');
const router = express.Router();

// Mock project data (you can later connect to a database)
const projects = [
    {
        id: 1,
        title: "Huduma Center Birth Certificate Collection Inventory System",
        description: "A comprehensive dashboard for managing birth certificate collections and tracking inventory at Huduma Center GPO.",
        image: "/images/Huduma Center Homepage.png",
        category: "web",
        technologies: ["HTML", "JavaScript", "SQL", "CSS", "PHP"],
        features: [
            "Real-time inventory tracking",
            "User authentication system",
            "Data export functionality",
            "Responsive dashboard design"
        ],
        stats: {
            efficiency_gain: "20%",
            daily_users: "100+",
            processing_time: "50% faster"
        },
        github: "https://github.com/EluisNgibuni/huduma-center",
        demo: null,
        status: "completed",
        date: "2025-09-01",
        featured: true
    },
    {
        id: 2,
        title: "The Baobab Lounge - Menu Ordering System",
        description: "An interactive menu and ordering system for The Baobab Lounge, featuring real-time order management and a seamless user experience.",
        image: "/images/Baobab homepage.png",
        category: "web",
        technologies: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        features: [
            "Interactive menu display",
            "Real-time order tracking",
            "Payment integration",
            "Admin dashboard"
        ],
        stats: {
            menu_items: "50+",
            order_processing: "Real-time",
            user_rating: "4.8/5"
        },
        github: "https://github.com/EluisNgibuni/baobab-lounge",
        demo: "https://baobab-lounge-demo.netlify.app",
        status: "completed",
        date: "2025-10-01",
        featured: true
    },
    {
        id: 3,
        title: "Chacadom Investments - Real Estate Platform",
        description: "A modern real estate platform for Chacadom Investments featuring property listings, virtual tours, and seamless inquiry system for potential buyers and renters.",
        image: "/images/Chacadom homepage.png",
        category: "web",
        technologies: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
        features: [
            "Property search and filtering",
            "Virtual tour integration",
            "Inquiry management system",
            "Agent dashboard"
        ],
        stats: {
            properties: "50+",
            search_filters: "Advanced",
            response_time: "< 2s"
        },
        github: "https://github.com/EluisNgibuni/chacadom-investments",
        demo: "https://chacadom-demo.vercel.app",
        status: "completed",
        date: "2025-11-01",
        featured: true
    }
];

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
    const { category, featured, limit } = req.query;

    let filteredProjects = [...projects];

    // Filter by category
    if (category && category !== 'all') {
        filteredProjects = filteredProjects.filter(project =>
            project.category === category
        );
    }

    // Filter by featured
    if (featured === 'true') {
        filteredProjects = filteredProjects.filter(project => project.featured);
    }

    // Limit results
    if (limit) {
        filteredProjects = filteredProjects.slice(0, parseInt(limit));
    }

    // Sort by date (newest first)
    filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        success: true,
        count: filteredProjects.length,
        projects: filteredProjects
    });
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));

    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Project not found'
        });
    }

    res.json({
        success: true,
        project
    });
});

// GET /api/projects/stats/overview - Get project statistics
router.get('/stats/overview', (req, res) => {
    const stats = {
        total_projects: projects.length,
        featured_projects: projects.filter(p => p.featured).length,
        categories: {
            web: projects.filter(p => p.category === 'web').length,
            mobile: projects.filter(p => p.category === 'mobile').length,
            desktop: projects.filter(p => p.category === 'desktop').length,
            api: projects.filter(p => p.category === 'api').length
        },
        technologies: {
            javascript: projects.filter(p =>
                p.technologies.some(tech =>
                    tech.toLowerCase().includes('javascript') ||
                    tech.toLowerCase().includes('react') ||
                    tech.toLowerCase().includes('node')
                )
            ).length,
            python: projects.filter(p =>
                p.technologies.some(tech => tech.toLowerCase().includes('python'))
            ).length,
            php: projects.filter(p =>
                p.technologies.some(tech => tech.toLowerCase().includes('php'))
            ).length
        },
        completion_rate: "100%",
        avg_project_duration: "2-3 months"
    };

    res.json({
        success: true,
        stats
    });
});

module.exports = router;