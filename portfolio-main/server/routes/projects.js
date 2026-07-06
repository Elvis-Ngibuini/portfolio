const express = require('express');
const ProjectFile = require('../models/ProjectFile');
const Joi = require('joi');
const router = express.Router();

// Authentication middleware for admin endpoints (write operations)
const authenticateAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const token = req.headers.authorization?.replace('Bearer ', '');
    const adminKey = process.env.ADMIN_PASSWORD;
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
            return next();
        } catch (e) {}
    }
    
    if (!adminKey || adminKey === 'your-secure-admin-key-here') {
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required'
            });
        }
        console.warn('⚠️ ADMIN_PASSWORD not set - admin endpoints are unprotected!');
        return next();
    }
    
    if (apiKey !== adminKey && req.body.password !== adminKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid credentials'
        });
    }
    
    next();
};

// Project validation schema
const projectSchema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    image: Joi.string().allow('').optional(),
    category: Joi.string().valid('web', 'mobile', 'desktop', 'api', 'other').default('web'),
    technologies: Joi.array().items(Joi.string()).default([]),
    features: Joi.array().items(Joi.string()).default([]),
    stats: Joi.object().default({}),
    github: Joi.string().allow('').optional(),
    demo: Joi.string().allow('').optional(),
    status: Joi.string().valid('planned', 'in-progress', 'completed', 'archived').default('completed'),
    date: Joi.string().required(),
    featured: Joi.boolean().default(false)
});

// GET /api/projects - Get all projects (PUBLIC)
router.get('/', async (req, res) => {
    try {
        const result = await ProjectFile.getProjects(req.query);
        res.json({
            success: true,
            count: result.total,
            projects: result.projects,
            pagination: {
                current_page: result.page,
                total_pages: result.totalPages,
                total_items: result.total,
                items_per_page: result.limit
            }
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects'
        });
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await ProjectFile.getProjectById(req.params.id);
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
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project'
        });
    }
});

// POST /api/projects - Create a project (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const { error, value } = projectSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }
        const newProject = await ProjectFile.addProject(value);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: newProject
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
});

// PUT /api/projects/:id - Update a project (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const { error, value } = projectSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }
        const updatedProject = await ProjectFile.updateProject(req.params.id, value);
        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project'
        });
    }
});

// DELETE /api/projects/:id - Delete a project (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const deleted = await ProjectFile.deleteProject(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
});

// GET /api/projects/stats/overview - Get project statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const projects = await ProjectFile.readProjects();
        const stats = {
            total_projects: projects.length,
            featured_projects: projects.filter(p => p.featured).length,
            categories: {
                web: projects.filter(p => p.category === 'web').length,
                mobile: projects.filter(p => p.category === 'mobile').length,
                desktop: projects.filter(p => p.category === 'desktop').length,
                api: projects.filter(p => p.category === 'api').length,
                other: projects.filter(p => p.category === 'other').length
            },
            technologies: {
                javascript: projects.filter(p =>
                    p.technologies && p.technologies.some(tech =>
                        tech.toLowerCase().includes('javascript') ||
                        tech.toLowerCase().includes('react') ||
                        tech.toLowerCase().includes('node')
                    )
                ).length,
                python: projects.filter(p =>
                    p.technologies && p.technologies.some(tech =>
                        tech.toLowerCase().includes('python')
                    )
                ).length,
                php: projects.filter(p =>
                    p.technologies && p.technologies.some(tech =>
                        tech.toLowerCase().includes('php')
                    )
                ).length
            },
            completion_rate: "100%",
            avg_project_duration: "2-3 months"
        };
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get project stats'
        });
    }
});

module.exports = router;