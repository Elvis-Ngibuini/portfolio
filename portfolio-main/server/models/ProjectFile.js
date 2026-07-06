const fs = require('fs').promises;
const path = require('path');

class ProjectFile {
    constructor() {
        this.filePath = path.join(__dirname, '../storage/projects.json');
        this.ensureFileExists();
    }

    async ensureFileExists() {
        try {
            const storageDir = path.dirname(this.filePath);
            await fs.mkdir(storageDir, { recursive: true });
            await fs.access(this.filePath);
        } catch (error) {
            const initialProjects = [
                {
                    _id: this.generateId(),
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
                    featured: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    _id: this.generateId(),
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
                    featured: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    _id: this.generateId(),
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
                    featured: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            await fs.writeFile(this.filePath, JSON.stringify(initialProjects, null, 2), 'utf8');
        }
    }

    async readProjects() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading projects file:', error);
            return [];
        }
    }

    async writeProjects(projects) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(projects, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error writing projects file:', error);
            return false;
        }
    }

    async addProject(projectData) {
        const projects = await this.readProjects();
        const newProject = {
            _id: this.generateId(),
            ...projectData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        projects.push(newProject);
        await this.writeProjects(projects);
        return newProject;
    }

    async getProjects(filters = {}) {
        let projects = await this.readProjects();

        if (filters.category && filters.category !== 'all') {
            projects = projects.filter(p => p.category === filters.category);
        }

        if (filters.featured === 'true') {
            projects = projects.filter(p => p.featured);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            projects = projects.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        projects.sort((a, b) => new Date(b.date) - new Date(a.date));

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            projects: projects.slice(startIndex, endIndex),
            total: projects.length,
            page,
            limit,
            totalPages: Math.ceil(projects.length / limit)
        };
    }

    async getProjectById(id) {
        const projects = await this.readProjects();
        return projects.find(p => p._id === id);
    }

    async updateProject(id, updates) {
        const projects = await this.readProjects();
        const index = projects.findIndex(p => p._id === id);

        if (index === -1) {
            return null;
        }

        projects[index] = {
            ...projects[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        await this.writeProjects(projects);
        return projects[index];
    }

    async deleteProject(id) {
        const projects = await this.readProjects();
        const filteredProjects = projects.filter(p => p._id !== id);

        if (filteredProjects.length === projects.length) {
            return false;
        }

        await this.writeProjects(filteredProjects);
        return true;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

module.exports = new ProjectFile();
