const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, isHECAdmin, hasPermission, canAccessUniversity } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// In-memory degree storage for demo
let degrees = [];

// Get all degrees (with filters)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { universityId, programType, status, verificationStatus } = req.query;
        
        let filteredDegrees = [...degrees];

        // Filter by user's university if not HEC
        if (req.user.orgType === 'UNIVERSITY') {
            filteredDegrees = filteredDegrees.filter(d => d.universityId === req.user.universityId);
        }
        
        if (universityId) {
            filteredDegrees = filteredDegrees.filter(d => d.universityId === universityId);
        }
        
        if (programType) {
            filteredDegrees = filteredDegrees.filter(d => d.program.type === programType);
        }
        
        if (status) {
            filteredDegrees = filteredDegrees.filter(d => d.status === status);
        }
        
        if (verificationStatus) {
            filteredDegrees = filteredDegrees.filter(d => d.verificationStatus === verificationStatus);
        }

        res.json({
            success: true,
            data: filteredDegrees,
            total: filteredDegrees.length
        });
    } catch (error) {
        logger.error('Error fetching degrees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch degrees'
        });
    }
});

// Get single degree
router.get('/:degreeId', verifyToken, async (req, res) => {
    try {
        const degree = degrees.find(d => d.id === req.params.degreeId);
        
        if (!degree) {
            return res.status(404).json({
                success: false,
                message: 'Degree not found'
            });
        }

        // Check access permission
        if (req.user.orgType === 'UNIVERSITY' && req.user.universityId !== degree.universityId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: degree
        });
    } catch (error) {
        logger.error('Error fetching degree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch degree'
        });
    }
});

// Issue new degree
router.post('/', verifyToken, [
    body('universityId').notEmpty().withMessage('University ID is required'),
    body('studentName').notEmpty().withMessage('Student name is required'),
    body('fatherName').notEmpty().withMessage('Father name is required'),
    body('rollNumber').notEmpty().withMessage('Roll number is required'),
    body('registrationNumber').notEmpty().withMessage('Registration number is required'),
    body('cnic').notEmpty().withMessage('CNIC is required'),
    body('programName').notEmpty().withMessage('Program name is required'),
    body('programType').isIn(['BS', 'MS', 'MPhil', 'PhD', 'BE', 'MBBS', 'LLB', 'MBA', 'BBA']).withMessage('Invalid program type'),
    body('department').notEmpty().withMessage('Department is required'),
    body('cgpa').isFloat({ min: 0, max: 4 }).withMessage('CGPA must be between 0 and 4')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Check permissions
        if (req.user.orgType === 'UNIVERSITY') {
            if (req.user.universityId !== req.body.universityId) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot issue degrees for other universities'
                });
            }
            if (!['REGISTRAR', 'VC', 'ADMIN'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only Registrar, VC or Admin can issue degrees'
                });
            }
        }

        const data = req.body;
        const degreeId = `DEG_${data.universityId}_${String(degrees.length + 1).padStart(6, '0')}`;

        const newDegree = {
            id: degreeId,
            docType: 'degree',
            universityId: data.universityId,
            universityName: data.universityName || 'Unknown University',
            student: {
                name: data.studentName,
                fatherName: data.fatherName,
                rollNumber: data.rollNumber,
                registrationNumber: data.registrationNumber,
                cnic: data.cnic,
                dateOfBirth: data.dateOfBirth || ''
            },
            program: {
                name: data.programName,
                type: data.programType,
                department: data.department,
                faculty: data.faculty || '',
                duration: data.duration || '4 years'
            },
            academic: {
                sessionStart: data.sessionStart || '',
                sessionEnd: data.sessionEnd || '',
                cgpa: data.cgpa,
                totalCreditHours: data.totalCreditHours || 0,
                division: data.division || '',
                grade: data.grade || ''
            },
            degreeNumber: data.degreeNumber || degreeId,
            issueDate: data.issueDate || new Date().toISOString().split('T')[0],
            convocationDate: data.convocationDate || null,
            status: 'ISSUED',
            verificationStatus: 'PENDING_VERIFICATION',
            issuedBy: req.user.id,
            issuedByRole: req.user.role,
            approvals: [{
                role: req.user.role,
                userId: req.user.id,
                action: 'ISSUED',
                timestamp: new Date().toISOString()
            }],
            createdAt: new Date().toISOString()
        };

        degrees.push(newDegree);

        logger.info(`Degree issued: ${degreeId} by ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Degree issued successfully',
            data: newDegree
        });
    } catch (error) {
        logger.error('Error issuing degree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to issue degree'
        });
    }
});

// Verify degree (University level)
router.post('/:degreeId/verify', verifyToken, [
    body('remarks').optional()
], async (req, res) => {
    try {
        const degreeIndex = degrees.findIndex(d => d.id === req.params.degreeId);
        
        if (degreeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Degree not found'
            });
        }

        const degree = degrees[degreeIndex];

        // Check permissions
        if (req.user.orgType === 'UNIVERSITY') {
            if (req.user.universityId !== degree.universityId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            if (!['VC', 'REGISTRAR'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Only VC or Registrar can verify degrees'
                });
            }
        }

        degrees[degreeIndex] = {
            ...degree,
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date().toISOString(),
            verifiedBy: req.user.id,
            verificationRemarks: req.body.remarks || '',
            approvals: [
                ...degree.approvals,
                {
                    role: req.user.role,
                    userId: req.user.id,
                    action: 'VERIFIED',
                    remarks: req.body.remarks,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        logger.info(`Degree verified: ${req.params.degreeId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Degree verified successfully',
            data: degrees[degreeIndex]
        });
    } catch (error) {
        logger.error('Error verifying degree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify degree'
        });
    }
});

// HEC Attestation
router.post('/:degreeId/attest', verifyToken, isHECAdmin, [
    body('remarks').optional()
], async (req, res) => {
    try {
        const degreeIndex = degrees.findIndex(d => d.id === req.params.degreeId);
        
        if (degreeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Degree not found'
            });
        }

        const degree = degrees[degreeIndex];

        if (degree.verificationStatus !== 'VERIFIED') {
            return res.status(400).json({
                success: false,
                message: 'Degree must be verified before HEC attestation'
            });
        }

        degrees[degreeIndex] = {
            ...degree,
            hecAttestation: {
                attested: true,
                attestationNumber: `HEC-ATT-${Date.now()}`,
                attestedBy: req.user.id,
                attestedAt: new Date().toISOString(),
                remarks: req.body.remarks || ''
            },
            verificationStatus: 'HEC_ATTESTED',
            approvals: [
                ...degree.approvals,
                {
                    role: 'HEC_OFFICER',
                    userId: req.user.id,
                    action: 'HEC_ATTESTED',
                    remarks: req.body.remarks,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        logger.info(`Degree HEC attested: ${req.params.degreeId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Degree attested by HEC successfully',
            data: degrees[degreeIndex]
        });
    } catch (error) {
        logger.error('Error attesting degree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to attest degree'
        });
    }
});

// Reject degree
router.post('/:degreeId/reject', verifyToken, [
    body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const degreeIndex = degrees.findIndex(d => d.id === req.params.degreeId);
        
        if (degreeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Degree not found'
            });
        }

        const degree = degrees[degreeIndex];

        degrees[degreeIndex] = {
            ...degree,
            status: 'REJECTED',
            verificationStatus: 'REJECTED',
            rejectedAt: new Date().toISOString(),
            rejectedBy: req.user.id,
            rejectionReason: req.body.reason,
            approvals: [
                ...degree.approvals,
                {
                    role: req.user.role,
                    userId: req.user.id,
                    action: 'REJECTED',
                    reason: req.body.reason,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        logger.info(`Degree rejected: ${req.params.degreeId} by ${req.user.id}`);

        res.json({
            success: true,
            message: 'Degree rejected',
            data: degrees[degreeIndex]
        });
    } catch (error) {
        logger.error('Error rejecting degree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject degree'
        });
    }
});

// Public verification endpoint (no auth required)
router.post('/public/verify', [
    body('degreeId').notEmpty().withMessage('Degree ID is required'),
    body('cnic').notEmpty().withMessage('CNIC is required'),
    body('rollNumber').notEmpty().withMessage('Roll number is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { degreeId, cnic, rollNumber } = req.body;

        const degree = degrees.find(d => d.id === degreeId);
        
        if (!degree) {
            return res.json({
                success: true,
                verified: false,
                message: 'Degree not found'
            });
        }

        // Verify credentials match
        if (degree.student.cnic !== cnic || degree.student.rollNumber !== rollNumber) {
            return res.json({
                success: true,
                verified: false,
                message: 'Credentials do not match'
            });
        }

        // Return limited public information
        res.json({
            success: true,
            verified: true,
            degree: {
                id: degree.id,
                universityName: degree.universityName,
                studentName: degree.student.name,
                programName: degree.program.name,
                programType: degree.program.type,
                issueDate: degree.issueDate,
                status: degree.status,
                verificationStatus: degree.verificationStatus,
                hecAttested: degree.hecAttestation ? degree.hecAttestation.attested : false,
                attestationNumber: degree.hecAttestation ? degree.hecAttestation.attestationNumber : null
            }
        });
    } catch (error) {
        logger.error('Error in public verification:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed'
        });
    }
});

// Get degree history
router.get('/:degreeId/history', verifyToken, async (req, res) => {
    try {
        const degree = degrees.find(d => d.id === req.params.degreeId);
        
        if (!degree) {
            return res.status(404).json({
                success: false,
                message: 'Degree not found'
            });
        }

        // Check access permission
        if (req.user.orgType === 'UNIVERSITY' && req.user.universityId !== degree.universityId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: degree.approvals
        });
    } catch (error) {
        logger.error('Error fetching degree history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch degree history'
        });
    }
});

// Get degrees by student CNIC
router.get('/student/:cnic', verifyToken, async (req, res) => {
    try {
        const studentDegrees = degrees.filter(d => d.student.cnic === req.params.cnic);
        
        // For university users, filter to only their university
        if (req.user.orgType === 'UNIVERSITY') {
            const filteredDegrees = studentDegrees.filter(d => d.universityId === req.user.universityId);
            return res.json({
                success: true,
                data: filteredDegrees
            });
        }

        res.json({
            success: true,
            data: studentDegrees
        });
    } catch (error) {
        logger.error('Error fetching student degrees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch degrees'
        });
    }
});

module.exports = router;
