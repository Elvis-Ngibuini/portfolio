const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    ip_address: {
        type: String,
        required: false
    },
    user_agent: {
        type: String,
        required: false
    },
    referrer: {
        type: String,
        required: false
    },
    email_sent: {
        type: Boolean,
        default: false
    },
    auto_reply_sent: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        maxlength: 500
    },
    replied_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ created_at: -1 });
contactSchema.index({ priority: 1, status: 1 });

// Virtual for formatted date
contactSchema.virtual('formatted_date').get(function () {
    return this.created_at.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Method to mark as read
contactSchema.methods.markAsRead = function () {
    this.status = 'read';
    return this.save();
};

// Method to mark as replied
contactSchema.methods.markAsReplied = function () {
    this.status = 'replied';
    this.replied_at = new Date();
    return this.save();
};

// Static method to get unread count
contactSchema.statics.getUnreadCount = function () {
    return this.countDocuments({ status: 'new' });
};

// Static method to get recent submissions
contactSchema.statics.getRecent = function (limit = 10) {
    return this.find()
        .sort({ created_at: -1 })
        .limit(limit)
        .select('name email subject status created_at priority');
};

module.exports = mongoose.model('Contact', contactSchema);