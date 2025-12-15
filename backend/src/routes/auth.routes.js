const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// In-memory user store for demo (replace with database in production)
const users = new Map();

// Initialize demo users - HEC Admin
users.set('admin@hec.edu.pk', {
    id: 'HEC_ADMIN_001',
    email: 'admin@hec.edu.pk',
    password: bcrypt.hashSync('admin123', 10),
    name: 'HEC Super Admin',
    role: 'ADMIN',
    orgType: 'HEC',
    permissions: ['all']
});

// Also allow admin@hec.gov.pk for backwards compatibility
users.set('admin@hec.gov.pk', {
    id: 'HEC_ADMIN_001',
    email: 'admin@hec.gov.pk',
    password: bcrypt.hashSync('admin123', 10),
    name: 'HEC Super Admin',
    role: 'ADMIN',
    orgType: 'HEC',
    permissions: ['all']
});

// Demo University Users - Punjab University
users.set('vc@pu.edu.pk', {
    id: 'USER_UNI_0001_001',
    email: 'vc@pu.edu.pk',
    password: bcrypt.hashSync('password123', 10),
    name: 'Dr. Ahmad Khan',
    role: 'VC',
    orgType: 'UNIVERSITY',
    universityId: 'UNI_0001',
    universityName: 'University of the Punjab',
    permissions: ['approve_degree', 'view_all', 'manage_registrar', 'sign_documents']
});

users.set('registrar@pu.edu.pk', {
    id: 'USER_UNI_0001_002',
    email: 'registrar@pu.edu.pk',
    password: bcrypt.hashSync('password123', 10),
    name: 'Mr. Tariq Mahmood',
    role: 'REGISTRAR',
    orgType: 'UNIVERSITY',
    universityId: 'UNI_0001',
    universityName: 'University of the Punjab',
    permissions: ['issue_degree', 'verify_degree', 'manage_students']
});

// Demo University Users - LUMS
users.set('vc@lums.edu.pk', {
    id: 'USER_UNI_0005_001',
    email: 'vc@lums.edu.pk',
    password: bcrypt.hashSync('password123', 10),
    name: 'Dr. Arshad Ahmad',
    role: 'VC',
    orgType: 'UNIVERSITY',
    universityId: 'UNI_0005',
    universityName: 'LUMS',
    permissions: ['approve_degree', 'view_all', 'manage_registrar', 'sign_documents']
});

users.set('registrar@lums.edu.pk', {
    id: 'USER_UNI_0005_002',
    email: 'registrar@lums.edu.pk',
    password: bcrypt.hashSync('password123', 10),
    name: 'Ms. Ayesha Siddiqui',
    role: 'REGISTRAR',
    orgType: 'UNIVERSITY',
    universityId: 'UNI_0005',
    universityName: 'LUMS',
    permissions: ['issue_degree', 'verify_degree', 'manage_students']
});

// Login validation
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('orgType').isIn(['HEC', 'UNIVERSITY']).withMessage('Organization type must be HEC or UNIVERSITY')
];

// HEC Login
router.post('/hec/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = users.get(email);
        if (!user || user.orgType !== 'HEC') {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                orgType: 'HEC',
                permissions: user.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        logger.info(`HEC user logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    orgType: 'HEC'
                }
            }
        });
    } catch (error) {
        logger.error('HEC login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// University Login
router.post('/university/login', [
    ...loginValidation,
    body('universityId').notEmpty().withMessage('University ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, universityId } = req.body;

        // Find user
        const user = users.get(email);
        if (!user || user.orgType !== 'UNIVERSITY' || user.universityId !== universityId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                orgType: 'UNIVERSITY',
                universityId: user.universityId,
                universityName: user.universityName,
                permissions: user.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        logger.info(`University user logged in: ${email} from ${universityId}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    orgType: 'UNIVERSITY',
                    universityId: user.universityId,
                    universityName: user.universityName
                }
            }
        });
    } catch (error) {
        logger.error('University login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Register HEC Employee (internal use)
router.post('/hec/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').isIn(['ADMIN', 'EMPLOYEE'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, name, role, department } = req.body;

        if (users.has(email)) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `HEC_EMP_${Date.now()}`;

        const newUser = {
            id: userId,
            email,
            password: hashedPassword,
            name,
            role,
            department: department || 'Administration',
            orgType: 'HEC',
            permissions: role === 'ADMIN' ? ['all'] : ['view', 'create']
        };

        users.set(email, newUser);

        logger.info(`New HEC employee registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Register University User (internal use)
router.post('/university/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').isIn(['VC', 'REGISTRAR', 'CONTROLLER', 'DEAN', 'HOD', 'ADMIN']),
    body('universityId').notEmpty(),
    body('universityName').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password, name, role, universityId, universityName, department } = req.body;

        if (users.has(email)) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `USER_${universityId}_${Date.now()}`;

        const permissions = {
            'VC': ['approve_degree', 'view_all', 'manage_registrar', 'manage_controller', 'manage_dean', 'sign_documents'],
            'REGISTRAR': ['issue_degree', 'verify_degree', 'manage_students', 'view_degrees', 'manage_transcripts'],
            'CONTROLLER': ['manage_exams', 'approve_results', 'view_results', 'manage_grades'],
            'DEAN': ['approve_department_degrees', 'view_faculty', 'manage_hod'],
            'HOD': ['recommend_degree', 'view_department', 'manage_students'],
            'ADMIN': ['manage_users', 'view_all', 'manage_departments']
        };

        const newUser = {
            id: userId,
            email,
            password: hashedPassword,
            name,
            role,
            department: department || 'Administration',
            orgType: 'UNIVERSITY',
            universityId,
            universityName,
            permissions: permissions[role] || ['view_own']
        };

        users.set(email, newUser);

        logger.info(`New university user registered: ${email} for ${universityId}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                universityId: newUser.universityId
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            data: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
