const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, isHECAdmin } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// Note: In production, these would interact with the Fabric network
// For demo, using in-memory storage

let hecEmployees = [
    {
        id: 'HEC_ADMIN_001',
        name: 'Super Admin',
        email: 'admin@hec.gov.pk',
        role: 'ADMIN',
        department: 'Administration',
        phone: '+92-51-1234567',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
    }
];

let systemStats = {
    totalUniversities: 0,
    activeUniversities: 0,
    totalEmployees: 1,
    activeEmployees: 1,
    totalDegrees: 0,
    pendingVerifications: 0
};

// Get all HEC employees
router.get('/employees', verifyToken, isHECAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            data: hecEmployees
        });
    } catch (error) {
        logger.error('Error fetching HEC employees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees'
        });
    }
});

// Get single HEC employee
router.get('/employees/:id', verifyToken, isHECAdmin, async (req, res) => {
    try {
        const employee = hecEmployees.find(emp => emp.id === req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        logger.error('Error fetching HEC employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee'
        });
    }
});

// Create new HEC employee
router.post('/employees', verifyToken, isHECAdmin, [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['ADMIN', 'EMPLOYEE']).withMessage('Invalid role'),
    body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, role, department, phone } = req.body;

        // Check if email already exists
        if (hecEmployees.find(emp => emp.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const newEmployee = {
            id: `HEC_EMP_${String(hecEmployees.length + 1).padStart(4, '0')}`,
            name,
            email,
            role,
            department,
            phone: phone || '',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        hecEmployees.push(newEmployee);
        systemStats.totalEmployees++;
        systemStats.activeEmployees++;

        logger.info(`HEC employee created: ${newEmployee.id} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: newEmployee
        });
    } catch (error) {
        logger.error('Error creating HEC employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create employee'
        });
    }
});

// Update HEC employee
router.put('/employees/:id', verifyToken, isHECAdmin, async (req, res) => {
    try {
        const employeeIndex = hecEmployees.findIndex(emp => emp.id === req.params.id);
        
        if (employeeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const { name, email, role, department, phone, status } = req.body;

        hecEmployees[employeeIndex] = {
            ...hecEmployees[employeeIndex],
            name: name || hecEmployees[employeeIndex].name,
            email: email || hecEmployees[employeeIndex].email,
            role: role || hecEmployees[employeeIndex].role,
            department: department || hecEmployees[employeeIndex].department,
            phone: phone || hecEmployees[employeeIndex].phone,
            status: status || hecEmployees[employeeIndex].status,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user.id
        };

        logger.info(`HEC employee updated: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: hecEmployees[employeeIndex]
        });
    } catch (error) {
        logger.error('Error updating HEC employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update employee'
        });
    }
});

// Deactivate HEC employee
router.delete('/employees/:id', verifyToken, isHECAdmin, async (req, res) => {
    try {
        const employeeIndex = hecEmployees.findIndex(emp => emp.id === req.params.id);
        
        if (employeeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Don't delete, just deactivate
        hecEmployees[employeeIndex].status = 'INACTIVE';
        hecEmployees[employeeIndex].deactivatedAt = new Date().toISOString();
        hecEmployees[employeeIndex].deactivatedBy = req.user.id;
        
        systemStats.activeEmployees--;

        logger.info(`HEC employee deactivated: ${req.params.id} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Employee deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating HEC employee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate employee'
        });
    }
});

// Get system statistics
router.get('/statistics', verifyToken, isHECAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            data: systemStats
        });
    } catch (error) {
        logger.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Initialize ledger
router.post('/init-ledger', verifyToken, isHECAdmin, async (req, res) => {
    try {
        // In production, this would call the chaincode
        logger.info(`Ledger initialization requested by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Ledger initialized successfully'
        });
    } catch (error) {
        logger.error('Error initializing ledger:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize ledger'
        });
    }
});

module.exports = router;
