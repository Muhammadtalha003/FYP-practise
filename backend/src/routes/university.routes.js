const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, isHECAdmin, canAccessUniversity } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// In-memory university storage for demo
let universities = [];

// Get all universities
router.get('/', verifyToken, async (req, res) => {
    try {
        const { province, status, type } = req.query;
        
        let filteredUniversities = [...universities];
        
        if (province) {
            filteredUniversities = filteredUniversities.filter(
                u => u.address.province.toLowerCase() === province.toLowerCase()
            );
        }
        
        if (status) {
            filteredUniversities = filteredUniversities.filter(
                u => u.status === status.toUpperCase()
            );
        }
        
        if (type) {
            filteredUniversities = filteredUniversities.filter(
                u => u.type === type.toUpperCase()
            );
        }

        res.json({
            success: true,
            data: filteredUniversities,
            total: filteredUniversities.length
        });
    } catch (error) {
        logger.error('Error fetching universities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch universities'
        });
    }
});

// Get single university
router.get('/:universityId', verifyToken, async (req, res) => {
    try {
        const university = universities.find(u => u.id === req.params.universityId);
        
        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        res.json({
            success: true,
            data: university
        });
    } catch (error) {
        logger.error('Error fetching university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch university'
        });
    }
});

// Register new university (HEC only)
router.post('/', verifyToken, isHECAdmin, [
    body('name').notEmpty().withMessage('University name is required'),
    body('code').notEmpty().withMessage('University code is required'),
    body('type').isIn(['PUBLIC', 'PRIVATE', 'SEMI-GOVERNMENT']).withMessage('Invalid university type'),
    body('charter').notEmpty().withMessage('Charter is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('province').notEmpty().withMessage('Province is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('establishedYear').isNumeric().withMessage('Established year must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const {
            name, code, type, charter, street, city, province,
            email, phone, website, hecRanking, establishedYear, peerEndpoint
        } = req.body;

        // Check if code already exists
        if (universities.find(u => u.code === code)) {
            return res.status(400).json({
                success: false,
                message: 'University code already registered'
            });
        }

        const universityId = `UNI_${String(universities.length + 1).padStart(4, '0')}`;

        const newUniversity = {
            id: universityId,
            docType: 'university',
            name,
            code,
            type,
            charter,
            address: {
                street: street || '',
                city,
                province,
                country: 'Pakistan'
            },
            contact: {
                email,
                phone,
                website: website || ''
            },
            hecRecognized: true,
            hecRanking: hecRanking || null,
            establishedYear,
            status: 'ACTIVE',
            mspId: `${code}MSP`,
            peerEndpoint: peerEndpoint || '',
            departments: [],
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        universities.push(newUniversity);

        logger.info(`University registered: ${universityId} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'University registered successfully',
            data: newUniversity
        });
    } catch (error) {
        logger.error('Error registering university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register university'
        });
    }
});

// Update university (HEC only)
router.put('/:universityId', verifyToken, isHECAdmin, async (req, res) => {
    try {
        const universityIndex = universities.findIndex(u => u.id === req.params.universityId);
        
        if (universityIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        const updateData = req.body;
        const university = universities[universityIndex];

        // Update fields
        if (updateData.name) university.name = updateData.name;
        if (updateData.type) university.type = updateData.type;
        if (updateData.charter) university.charter = updateData.charter;
        if (updateData.hecRanking) university.hecRanking = updateData.hecRanking;
        if (updateData.status) university.status = updateData.status;
        if (updateData.email) university.contact.email = updateData.email;
        if (updateData.phone) university.contact.phone = updateData.phone;
        if (updateData.website) university.contact.website = updateData.website;
        if (updateData.city) university.address.city = updateData.city;
        if (updateData.province) university.address.province = updateData.province;
        
        university.updatedAt = new Date().toISOString();
        university.updatedBy = req.user.id;

        universities[universityIndex] = university;

        logger.info(`University updated: ${req.params.universityId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'University updated successfully',
            data: university
        });
    } catch (error) {
        logger.error('Error updating university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update university'
        });
    }
});

// Suspend university (HEC only)
router.post('/:universityId/suspend', verifyToken, isHECAdmin, [
    body('reason').notEmpty().withMessage('Suspension reason is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const universityIndex = universities.findIndex(u => u.id === req.params.universityId);
        
        if (universityIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        universities[universityIndex].status = 'SUSPENDED';
        universities[universityIndex].suspensionReason = req.body.reason;
        universities[universityIndex].suspendedAt = new Date().toISOString();
        universities[universityIndex].suspendedBy = req.user.id;

        logger.info(`University suspended: ${req.params.universityId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'University suspended successfully',
            data: universities[universityIndex]
        });
    } catch (error) {
        logger.error('Error suspending university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to suspend university'
        });
    }
});

// Reactivate university (HEC only)
router.post('/:universityId/reactivate', verifyToken, isHECAdmin, async (req, res) => {
    try {
        const universityIndex = universities.findIndex(u => u.id === req.params.universityId);
        
        if (universityIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        universities[universityIndex].status = 'ACTIVE';
        universities[universityIndex].reactivatedAt = new Date().toISOString();
        universities[universityIndex].reactivatedBy = req.user.id;
        delete universities[universityIndex].suspensionReason;

        logger.info(`University reactivated: ${req.params.universityId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'University reactivated successfully',
            data: universities[universityIndex]
        });
    } catch (error) {
        logger.error('Error reactivating university:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reactivate university'
        });
    }
});

// Add department to university
router.post('/:universityId/departments', verifyToken, canAccessUniversity, [
    body('name').notEmpty().withMessage('Department name is required'),
    body('code').notEmpty().withMessage('Department code is required'),
    body('faculty').notEmpty().withMessage('Faculty name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const universityIndex = universities.findIndex(u => u.id === req.params.universityId);
        
        if (universityIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        const { name, code, faculty, hodName, programs } = req.body;

        const department = {
            id: `DEPT_${Date.now()}`,
            name,
            code,
            faculty,
            hodName: hodName || '',
            programs: programs || [],
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
        };

        universities[universityIndex].departments.push(department);
        universities[universityIndex].updatedAt = new Date().toISOString();

        logger.info(`Department added to ${req.params.universityId}: ${department.id}`);

        res.status(201).json({
            success: true,
            message: 'Department added successfully',
            data: department
        });
    } catch (error) {
        logger.error('Error adding department:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add department'
        });
    }
});

// Get university departments
router.get('/:universityId/departments', verifyToken, async (req, res) => {
    try {
        const university = universities.find(u => u.id === req.params.universityId);
        
        if (!university) {
            return res.status(404).json({
                success: false,
                message: 'University not found'
            });
        }

        res.json({
            success: true,
            data: university.departments
        });
    } catch (error) {
        logger.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments'
        });
    }
});

module.exports = router;
