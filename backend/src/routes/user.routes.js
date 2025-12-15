const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, isUniversityUser, hasUniversityRole, canAccessUniversity } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// In-memory user storage for demo
let universityUsers = [];

// Get all users for a university
router.get('/university/:universityId', verifyToken, canAccessUniversity, async (req, res) => {
    try {
        const users = universityUsers.filter(u => u.universityId === req.params.universityId);
        
        res.json({
            success: true,
            data: users,
            total: users.length
        });
    } catch (error) {
        logger.error('Error fetching university users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Get single user
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const user = universityUsers.find(u => u.id === req.params.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check access permission
        if (req.user.orgType === 'UNIVERSITY' && req.user.universityId !== user.universityId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// Create university user (VC, Registrar, Controller, etc.)
router.post('/', verifyToken, [
    body('universityId').notEmpty().withMessage('University ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['VC', 'REGISTRAR', 'CONTROLLER', 'DEAN', 'HOD', 'ADMIN']).withMessage('Invalid role')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Check permissions
        if (req.user.orgType === 'UNIVERSITY') {
            // University users can only add to their own university
            if (req.user.universityId !== req.body.universityId) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot add users to other universities'
                });
            }
            
            // Only VC and ADMIN can create users
            if (!['VC', 'ADMIN'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only VC or Admin can create users'
                });
            }
        }

        const { universityId, name, email, role, department, designation, phone } = req.body;

        // Check if email already exists
        if (universityUsers.find(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const permissions = {
            'VC': ['approve_degree', 'view_all', 'manage_registrar', 'manage_controller', 'manage_dean', 'sign_documents'],
            'REGISTRAR': ['issue_degree', 'verify_degree', 'manage_students', 'view_degrees', 'manage_transcripts'],
            'CONTROLLER': ['manage_exams', 'approve_results', 'view_results', 'manage_grades'],
            'DEAN': ['approve_department_degrees', 'view_faculty', 'manage_hod'],
            'HOD': ['recommend_degree', 'view_department', 'manage_students'],
            'ADMIN': ['manage_users', 'view_all', 'manage_departments']
        };

        const userId = `USER_${universityId}_${Date.now()}`;

        const newUser = {
            id: userId,
            docType: 'universityUser',
            universityId,
            name,
            email,
            phone: phone || '',
            role,
            department: department || 'Administration',
            designation: designation || '',
            permissions: permissions[role] || ['view_own'],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        universityUsers.push(newUser);

        logger.info(`University user created: ${userId} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        logger.error('Error creating university user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
});

// Update university user
router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const userIndex = universityUsers.findIndex(u => u.id === req.params.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = universityUsers[userIndex];

        // Check access permission
        if (req.user.orgType === 'UNIVERSITY') {
            if (req.user.universityId !== user.universityId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            if (!['VC', 'ADMIN'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only VC or Admin can update users'
                });
            }
        }

        const { name, email, phone, department, designation, role, status } = req.body;

        const permissions = {
            'VC': ['approve_degree', 'view_all', 'manage_registrar', 'manage_controller', 'manage_dean', 'sign_documents'],
            'REGISTRAR': ['issue_degree', 'verify_degree', 'manage_students', 'view_degrees', 'manage_transcripts'],
            'CONTROLLER': ['manage_exams', 'approve_results', 'view_results', 'manage_grades'],
            'DEAN': ['approve_department_degrees', 'view_faculty', 'manage_hod'],
            'HOD': ['recommend_degree', 'view_department', 'manage_students'],
            'ADMIN': ['manage_users', 'view_all', 'manage_departments']
        };

        universityUsers[userIndex] = {
            ...user,
            name: name || user.name,
            email: email || user.email,
            phone: phone || user.phone,
            department: department || user.department,
            designation: designation || user.designation,
            role: role || user.role,
            permissions: role ? (permissions[role] || user.permissions) : user.permissions,
            status: status || user.status,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user.id
        };

        logger.info(`University user updated: ${req.params.userId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: universityUsers[userIndex]
        });
    } catch (error) {
        logger.error('Error updating university user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Deactivate user
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const userIndex = universityUsers.findIndex(u => u.id === req.params.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = universityUsers[userIndex];

        // Check access permission
        if (req.user.orgType === 'UNIVERSITY') {
            if (req.user.universityId !== user.universityId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            if (!['VC', 'ADMIN'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only VC or Admin can deactivate users'
                });
            }
        }

        universityUsers[userIndex].status = 'INACTIVE';
        universityUsers[userIndex].deactivatedAt = new Date().toISOString();
        universityUsers[userIndex].deactivatedBy = req.user.id;

        logger.info(`University user deactivated: ${req.params.userId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating university user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate user'
        });
    }
});

// Get users by role
router.get('/university/:universityId/role/:role', verifyToken, canAccessUniversity, async (req, res) => {
    try {
        const users = universityUsers.filter(
            u => u.universityId === req.params.universityId && 
                 u.role === req.params.role.toUpperCase() &&
                 u.status === 'ACTIVE'
        );
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        logger.error('Error fetching users by role:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

module.exports = router;
