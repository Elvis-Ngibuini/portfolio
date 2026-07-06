const { ROLES } = require('../config/roles');
const logger = require('../config/logger');

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.user?.role || 'VIEWER';
        const roleConfig = ROLES[userRole];
        
        if (!roleConfig) {
            return res.status(403).json({
                success: false,
                message: 'Invalid role'
            });
        }
        
        // Super admin has all permissions
        if (roleConfig.permissions.includes('*')) {
            return next();
        }
        
        // Check specific permission
        if (roleConfig.permissions.includes(requiredPermission)) {
            return next();
        }
        
        logger.warn('PERMISSION_DENIED', {
            user: req.user?.username,
            role: userRole,
            required: requiredPermission,
            path: req.path
        });
        
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
        });
    };
};

const requireRole = (minLevel) => {
    return (req, res, next) => {
        const userRole = req.user?.role || 'VIEWER';
        const roleLevel = ROLES[userRole]?.level || 0;
        
        if (roleLevel < minLevel) {
            logger.warn('ROLE_DENIED', {
                user: req.user?.username,
                role: userRole,
                requiredLevel: minLevel
            });
            return res.status(403).json({
                success: false,
                message: 'Insufficient role level'
            });
        }
        
        next();
    };
};

module.exports = { checkPermission, requireRole };