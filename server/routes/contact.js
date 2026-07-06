const express = require('express');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const ContactFile = require('../models/ContactFile');
const router = express.Router();

// Authentication middleware for admin endpoints
const authenticateAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const adminKey = process.env.ADMIN_API_KEY;

    // If no admin key is set, warn but allow access in development
    if (!adminKey || adminKey === 'your-secure-admin-key-here') {
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'Admin API key not configured'
            });
        }
        console.warn('⚠️  ADMIN_API_KEY not set - admin endpoints are unprotected!');
        return next();
    }

    if (apiKey !== adminKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid API key'
        });
    }

    next();
};

// Simple input sanitization function
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove HTML tags and script content
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
};

// Honeypot check middleware
const checkHoneypot = (req, res, next) => {
    // If honeypot field is filled, it's likely a bot
    if (req.body.website) {
        return res.status(400).json({
            success: false,
            message: 'Invalid submission'
        });
    }
    next();
};

// Validation schema
const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(1000).required(),
    website: Joi.string().allow('').optional() // Honeypot field
});

// Email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// POST /api/contact
router.post('/', checkHoneypot, async (req, res) => {
    try {
        // Validate input
        const { error, value } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        // Sanitize inputs
        const { name, email, subject, message } = value;
        const sanitizedData = {
            name: sanitizeInput(name),
            email: email.toLowerCase().trim(),
            subject: sanitizeInput(subject),
            message: sanitizeInput(message)
        };

        // Create contact record in file storage
        const contactSubmission = await ContactFile.addContact({
            name: sanitizedData.name,
            email: sanitizedData.email,
            subject: sanitizedData.subject,
            message: sanitizedData.message,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer') || 'direct'
        });

        // Create email content
        const emailContent = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_TO,
            subject: `Portfolio Contact: ${sanitizedData.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                        New Portfolio Contact Message
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Submission ID:</strong> ${contactSubmission._id}</p>
                        <p><strong>Name:</strong> ${sanitizedData.name}</p>
                        <p><strong>Email:</strong> ${sanitizedData.email}</p>
                        <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #00d4ff; margin: 20px 0;">
                        <h3>Message:</h3>
                        <p style="line-height: 1.6;">${sanitizedData.message.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
                        <p>This message was sent from your portfolio website contact form.</p>
                        <p>Timestamp: ${new Date().toLocaleString()}</p>
                        <p>IP: ${req.ip}</p>
                        <p>User Agent: ${req.get('User-Agent')}</p>
                        <p>View in admin panel: <a href="${process.env.FRONTEND_URL || 'http://localhost:8000'}/admin.html">Click here</a></p>
                    </div>
                </div>
            `,
            text: `
New Portfolio Contact Message

Submission ID: ${contactSubmission._id}
Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

Sent from portfolio website at ${new Date().toLocaleString()}
IP: ${req.ip}
            `
        };

        // Send email only if email configuration is complete
        if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your-app-password-here') {
            try {
                // Send email
                const transporter = createTransporter();
                await transporter.sendMail(emailContent);

                // Update contact record - email sent
                await ContactFile.updateContact(contactSubmission._id, { email_sent: true });

                // Send auto-reply to sender
                await transporter.sendMail(autoReply);

                // Update contact record - auto reply sent
                await ContactFile.updateContact(contactSubmission._id, { auto_reply_sent: true });

                console.log('✅ Emails sent successfully');
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the entire request if email fails
            }
        } else {
            console.log('⚠️  Email not configured - skipping email notifications');
            console.log('💡 To enable emails, set EMAIL_PASS in server/.env with your Gmail App Password');
        }

        res.json({
            success: true,
            message: 'Message sent successfully! You should receive a confirmation email shortly.',
            submission_id: contactSubmission._id
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// GET /api/contact - Get all contact submissions (admin)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const result = await ContactFile.getContacts(req.query);
        const stats = await ContactFile.getStats();

        res.json({
            success: true,
            data: {
                contacts: result.contacts,
                pagination: {
                    current_page: result.page,
                    total_pages: result.totalPages,
                    total_items: result.total,
                    items_per_page: result.limit
                },
                stats: {
                    total_submissions: result.total,
                    unread_count: stats.unread_count,
                    new_today: stats.today_count
                }
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact submissions'
        });
    }
});

// GET /api/contact/:id - Get single contact submission
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const contact = await ContactFile.getContactById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        // Mark as read if it's new
        if (contact.status === 'new') {
            await ContactFile.updateContact(contact._id, { status: 'read' });
            contact.status = 'read';
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact submission'
        });
    }
});

// PUT /api/contact/:id/status - Update contact status
router.put('/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const validStatuses = ['new', 'read', 'replied', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const updates = { status };
        if (notes !== undefined) updates.notes = notes;
        if (status === 'replied') updates.replied_at = new Date().toISOString();

        const contact = await ContactFile.updateContact(req.params.id, updates);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status'
        });
    }
});

// PUT /api/contact/:id/notes - Update contact notes
router.put('/:id/notes', authenticateAdmin, async (req, res) => {
    try {
        const { notes } = req.body;

        const contact = await ContactFile.updateContact(req.params.id, { notes });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact notes updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact notes'
        });
    }
});

// PUT /api/contact/:id/priority - Update contact priority
router.put('/:id/priority', authenticateAdmin, async (req, res) => {
    try {
        const { priority } = req.body;

        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ')
            });
        }

        const contact = await ContactFile.updateContact(req.params.id, { priority });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact priority updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact priority error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact priority'
        });
    }
});

// DELETE /api/contact/:id - Delete contact submission
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const deleted = await ContactFile.deleteContact(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact submission deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact submission'
        });
    }
});

// GET /api/contact/stats/dashboard - Get contact statistics
router.get('/stats/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const stats = await ContactFile.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact statistics'
        });
    }
});

module.exports = router;