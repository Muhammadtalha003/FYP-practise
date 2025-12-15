'use strict';

const { Contract } = require('fabric-contract-api');

class UniversityContract extends Contract {

    constructor() {
        super('UniversityContract');
    }

    // ==================== University Management (HEC Only) ====================

    async RegisterUniversity(ctx, universityData) {
        const data = JSON.parse(universityData);
        
        // Verify caller is HEC
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC can register universities');
        }

        // Get and update counter
        const countersBuffer = await ctx.stub.getState('COUNTERS');
        const counters = JSON.parse(countersBuffer.toString());
        counters.universityCount += 1;

        const universityId = `UNI_${String(counters.universityCount).padStart(4, '0')}`;

        const university = {
            id: universityId,
            docType: 'university',
            name: data.name,
            code: data.code,
            type: data.type, // PUBLIC, PRIVATE, SEMI-GOVERNMENT
            charter: data.charter,
            address: {
                street: data.street || '',
                city: data.city,
                province: data.province,
                country: 'Pakistan'
            },
            contact: {
                email: data.email,
                phone: data.phone,
                website: data.website || ''
            },
            hecRecognized: true,
            hecRanking: data.hecRanking || null,
            establishedYear: data.establishedYear,
            status: 'ACTIVE',
            mspId: `${data.code}MSP`,
            peerEndpoint: data.peerEndpoint || '',
            departments: [],
            createdAt: new Date().toISOString(),
            createdBy: data.createdBy
        };

        await ctx.stub.putState(universityId, Buffer.from(JSON.stringify(university)));
        await ctx.stub.putState('COUNTERS', Buffer.from(JSON.stringify(counters)));

        // Emit event for university registration
        ctx.stub.setEvent('UniversityRegistered', Buffer.from(JSON.stringify({
            universityId: universityId,
            name: data.name,
            code: data.code
        })));

        return JSON.stringify(university);
    }

    async GetUniversity(ctx, universityId) {
        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }
        return universityBuffer.toString();
    }

    async GetAllUniversities(ctx) {
        const queryString = {
            selector: {
                docType: 'university'
            },
            sort: [{ name: 'asc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async GetUniversitiesByProvince(ctx, province) {
        const queryString = {
            selector: {
                docType: 'university',
                'address.province': province,
                status: 'ACTIVE'
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async UpdateUniversity(ctx, universityId, updateData) {
        const data = JSON.parse(updateData);
        
        // Verify caller is HEC
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC can update university details');
        }

        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        
        // Update fields
        university.name = data.name || university.name;
        university.type = data.type || university.type;
        university.charter = data.charter || university.charter;
        university.hecRanking = data.hecRanking || university.hecRanking;
        university.status = data.status || university.status;
        
        if (data.email) university.contact.email = data.email;
        if (data.phone) university.contact.phone = data.phone;
        if (data.website) university.contact.website = data.website;
        if (data.city) university.address.city = data.city;
        if (data.province) university.address.province = data.province;
        
        university.updatedAt = new Date().toISOString();
        university.updatedBy = data.updatedBy;

        await ctx.stub.putState(universityId, Buffer.from(JSON.stringify(university)));
        return JSON.stringify(university);
    }

    async SuspendUniversity(ctx, universityId, reason, suspendedBy) {
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC can suspend universities');
        }

        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        university.status = 'SUSPENDED';
        university.suspensionReason = reason;
        university.suspendedAt = new Date().toISOString();
        university.suspendedBy = suspendedBy;

        await ctx.stub.putState(universityId, Buffer.from(JSON.stringify(university)));

        ctx.stub.setEvent('UniversitySuspended', Buffer.from(JSON.stringify({
            universityId: universityId,
            reason: reason
        })));

        return JSON.stringify(university);
    }

    async ReactivateUniversity(ctx, universityId, reactivatedBy) {
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC can reactivate universities');
        }

        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        university.status = 'ACTIVE';
        university.reactivatedAt = new Date().toISOString();
        university.reactivatedBy = reactivatedBy;
        delete university.suspensionReason;

        await ctx.stub.putState(universityId, Buffer.from(JSON.stringify(university)));
        return JSON.stringify(university);
    }

    // ==================== Department Management ====================

    async AddDepartment(ctx, universityId, departmentData) {
        const data = JSON.parse(departmentData);
        
        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        
        const department = {
            id: `DEPT_${Date.now()}`,
            name: data.name,
            code: data.code,
            faculty: data.faculty,
            hodName: data.hodName || '',
            programs: data.programs || [],
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
        };

        university.departments.push(department);
        university.updatedAt = new Date().toISOString();

        await ctx.stub.putState(universityId, Buffer.from(JSON.stringify(university)));
        return JSON.stringify(department);
    }

    async GetUniversityDepartments(ctx, universityId) {
        const universityBuffer = await ctx.stub.getState(universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());
        return JSON.stringify(university.departments);
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

module.exports = UniversityContract;
