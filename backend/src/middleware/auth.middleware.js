const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Check if user is HEC Admin
const isHECAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.orgType !== 'HEC' || !['ADMIN', 'EMPLOYEE'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. HEC admin privileges required.'
        });
    }

    next();
};

// Check if user belongs to a university
const isUniversityUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.orgType !== 'UNIVERSITY') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. University user privileges required.'
        });
    }

    next();
};

// Check specific university roles
const hasUniversityRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.orgType !== 'UNIVERSITY') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. University user privileges required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

// Check if user has specific permission
const hasPermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No permissions found.'
            });
        }

        const hasAllPermissions = requiredPermissions.every(
            permission => req.user.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Check if user can access specific university data
const canAccessUniversity = (req, res, next) => {
    const requestedUniversityId = req.params.universityId || req.body.universityId;
    
    // HEC users can access all universities
    if (req.user.orgType === 'HEC') {
        return next();
    }

    // University users can only access their own university
    if (req.user.universityId !== requestedUniversityId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Cannot access other university data.'
        });
    }

    next();
};

module.exports = {
    verifyToken,
    isHECAdmin,
    isUniversityUser,
    hasUniversityRole,
    hasPermission,
    canAccessUniversity
};
