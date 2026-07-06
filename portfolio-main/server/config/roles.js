// Role definitions with permissions
const ROLES = {
    SUPER_ADMIN: {
        level: 100,
        permissions: ['*'] // All permissions
    },
    ADMIN: {
        level: 50,
        permissions: [
            'home:read', 'home:write',
            'projects:read', 'projects:write', 'projects:delete',
            'skills:read', 'skills:write', 'skills:delete',
            'graphic-design:read', 'graphic-design:write', 'graphic-design:delete',
            'challenges:read', 'challenges:write', 'challenges:delete',
            'contributions:read', 'contributions:write', 'contributions:delete',
            'experience:read', 'experience:write', 'experience:delete',
            'contact:read', 'contact:write'
        ]
    },
    EDITOR: {
        level: 25,
        permissions: [
            'projects:read', 'projects:write',
            'skills:read', 'skills:write',
            'challenges:read', 'challenges:write',
            'contributions:read', 'contributions:write'
        ]
    },
    VIEWER: {
        level: 10,
        permissions: [
            'home:read',
            'projects:read',
            'skills:read',
            'graphic-design:read',
            'challenges:read',
            'contributions:read',
            'experience:read'
        ]
    }
};

module.exports = { ROLES };