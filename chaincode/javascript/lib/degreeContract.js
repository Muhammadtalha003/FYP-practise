'use strict';

const { Contract } = require('fabric-contract-api');

class DegreeContract extends Contract {

    constructor() {
        super('DegreeContract');
    }

    // ==================== Degree Management ====================

    async IssueDegree(ctx, degreeData) {
        const data = JSON.parse(degreeData);
        
        // Verify university exists
        const universityBuffer = await ctx.stub.getState(data.universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${data.universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        
        if (university.status !== 'ACTIVE') {
            throw new Error('Cannot issue degree from a suspended university');
        }

        // Get and update counter
        const countersBuffer = await ctx.stub.getState('COUNTERS');
        const counters = JSON.parse(countersBuffer.toString());
        counters.degreeCount += 1;

        const degreeId = `DEG_${data.universityId}_${String(counters.degreeCount).padStart(6, '0')}`;

        const degree = {
            id: degreeId,
            docType: 'degree',
            universityId: data.universityId,
            universityName: university.name,
            student: {
                name: data.studentName,
                fatherName: data.fatherName,
                rollNumber: data.rollNumber,
                registrationNumber: data.registrationNumber,
                cnic: data.cnic,
                dateOfBirth: data.dateOfBirth
            },
            program: {
                name: data.programName,
                type: data.programType, // BS, MS, PhD, etc.
                department: data.department,
                faculty: data.faculty,
                duration: data.duration
            },
            academic: {
                sessionStart: data.sessionStart,
                sessionEnd: data.sessionEnd,
                cgpa: data.cgpa,
                totalCreditHours: data.totalCreditHours,
                division: data.division,
                grade: data.grade
            },
            degreeNumber: data.degreeNumber || degreeId,
            issueDate: data.issueDate || new Date().toISOString().split('T')[0],
            convocationDate: data.convocationDate || null,
            status: 'ISSUED',
            verificationStatus: 'PENDING_VERIFICATION',
            issuedBy: data.issuedBy,
            issuedByRole: data.issuedByRole,
            approvals: [{
                role: data.issuedByRole,
                userId: data.issuedBy,
                action: 'ISSUED',
                timestamp: new Date().toISOString()
            }],
            createdAt: new Date().toISOString()
        };

        await ctx.stub.putState(degreeId, Buffer.from(JSON.stringify(degree)));
        await ctx.stub.putState('COUNTERS', Buffer.from(JSON.stringify(counters)));

        ctx.stub.setEvent('DegreeIssued', Buffer.from(JSON.stringify({
            degreeId: degreeId,
            universityId: data.universityId,
            studentName: data.studentName
        })));

        return JSON.stringify(degree);
    }

    async GetDegree(ctx, degreeId) {
        const degreeBuffer = await ctx.stub.getState(degreeId);
        if (!degreeBuffer || degreeBuffer.length === 0) {
            throw new Error(`Degree ${degreeId} does not exist`);
        }
        return degreeBuffer.toString();
    }

    async GetDegreesByUniversity(ctx, universityId) {
        const queryString = {
            selector: {
                docType: 'degree',
                universityId: universityId
            },
            sort: [{ createdAt: 'desc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async GetDegreesByStudent(ctx, cnic) {
        const queryString = {
            selector: {
                docType: 'degree',
                'student.cnic': cnic
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async SearchDegrees(ctx, searchCriteria) {
        const criteria = JSON.parse(searchCriteria);
        
        const selector = { docType: 'degree' };
        
        if (criteria.universityId) selector.universityId = criteria.universityId;
        if (criteria.programType) selector['program.type'] = criteria.programType;
        if (criteria.status) selector.status = criteria.status;
        if (criteria.verificationStatus) selector.verificationStatus = criteria.verificationStatus;

        const queryString = { selector };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    // ==================== Degree Verification ====================

    async VerifyDegree(ctx, degreeId, verificationData) {
        const data = JSON.parse(verificationData);
        
        const degreeBuffer = await ctx.stub.getState(degreeId);
        if (!degreeBuffer || degreeBuffer.length === 0) {
            throw new Error(`Degree ${degreeId} does not exist`);
        }

        const degree = JSON.parse(degreeBuffer.toString());

        degree.verificationStatus = 'VERIFIED';
        degree.verifiedAt = new Date().toISOString();
        degree.verifiedBy = data.verifiedBy;
        degree.verificationRemarks = data.remarks || '';
        
        degree.approvals.push({
            role: data.verifierRole,
            userId: data.verifiedBy,
            action: 'VERIFIED',
            remarks: data.remarks,
            timestamp: new Date().toISOString()
        });

        await ctx.stub.putState(degreeId, Buffer.from(JSON.stringify(degree)));

        ctx.stub.setEvent('DegreeVerified', Buffer.from(JSON.stringify({
            degreeId: degreeId,
            verifiedBy: data.verifiedBy
        })));

        return JSON.stringify(degree);
    }

    async HECAttestation(ctx, degreeId, attestationData) {
        const data = JSON.parse(attestationData);
        
        // Only HEC can attest
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC can attest degrees');
        }

        const degreeBuffer = await ctx.stub.getState(degreeId);
        if (!degreeBuffer || degreeBuffer.length === 0) {
            throw new Error(`Degree ${degreeId} does not exist`);
        }

        const degree = JSON.parse(degreeBuffer.toString());

        if (degree.verificationStatus !== 'VERIFIED') {
            throw new Error('Degree must be verified before HEC attestation');
        }

        degree.hecAttestation = {
            attested: true,
            attestationNumber: `HEC-ATT-${Date.now()}`,
            attestedBy: data.attestedBy,
            attestedAt: new Date().toISOString(),
            remarks: data.remarks || ''
        };
        
        degree.verificationStatus = 'HEC_ATTESTED';
        
        degree.approvals.push({
            role: 'HEC_OFFICER',
            userId: data.attestedBy,
            action: 'HEC_ATTESTED',
            remarks: data.remarks,
            timestamp: new Date().toISOString()
        });

        await ctx.stub.putState(degreeId, Buffer.from(JSON.stringify(degree)));

        ctx.stub.setEvent('DegreeHECAttested', Buffer.from(JSON.stringify({
            degreeId: degreeId,
            attestationNumber: degree.hecAttestation.attestationNumber
        })));

        return JSON.stringify(degree);
    }

    async RejectDegree(ctx, degreeId, rejectionData) {
        const data = JSON.parse(rejectionData);
        
        const degreeBuffer = await ctx.stub.getState(degreeId);
        if (!degreeBuffer || degreeBuffer.length === 0) {
            throw new Error(`Degree ${degreeId} does not exist`);
        }

        const degree = JSON.parse(degreeBuffer.toString());

        degree.status = 'REJECTED';
        degree.verificationStatus = 'REJECTED';
        degree.rejectedAt = new Date().toISOString();
        degree.rejectedBy = data.rejectedBy;
        degree.rejectionReason = data.reason;
        
        degree.approvals.push({
            role: data.rejectorRole,
            userId: data.rejectedBy,
            action: 'REJECTED',
            reason: data.reason,
            timestamp: new Date().toISOString()
        });

        await ctx.stub.putState(degreeId, Buffer.from(JSON.stringify(degree)));
        return JSON.stringify(degree);
    }

    // ==================== Public Verification ====================

    async PublicVerifyDegree(ctx, degreeId, cnic, rollNumber) {
        const degreeBuffer = await ctx.stub.getState(degreeId);
        if (!degreeBuffer || degreeBuffer.length === 0) {
            return JSON.stringify({ 
                verified: false, 
                message: 'Degree not found' 
            });
        }

        const degree = JSON.parse(degreeBuffer.toString());

        // Verify credentials match
        if (degree.student.cnic !== cnic || degree.student.rollNumber !== rollNumber) {
            return JSON.stringify({ 
                verified: false, 
                message: 'Credentials do not match' 
            });
        }

        // Return limited public information
        return JSON.stringify({
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
    }

    // ==================== Degree History ====================

    async GetDegreeHistory(ctx, degreeId) {
        const iterator = await ctx.stub.getHistoryForKey(degreeId);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const modification = {
                txId: result.value.txId,
                timestamp: result.value.timestamp,
                isDelete: result.value.isDelete
            };

            if (!result.value.isDelete) {
                modification.value = JSON.parse(result.value.value.toString('utf8'));
            }

            history.push(modification);
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(history);
    }

    // Helper function
    async _getAllResults(iterator) {
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            results.push(record);
            result = await iterator.next();
        }
        return results;
    }
}

module.exports = DegreeContract;
