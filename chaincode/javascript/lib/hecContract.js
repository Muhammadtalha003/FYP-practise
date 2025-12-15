'use strict';

const { Contract } = require('fabric-contract-api');

class HECContract extends Contract {

    constructor() {
        super('HECContract');
    }

    async InitLedger(ctx) {
        console.log('Initializing HEC Ledger');

        // Create initial HEC Admin
        const hecAdmin = {
            id: 'HEC_ADMIN_001',
            docType: 'hecEmployee',
            name: 'Super Admin',
            email: 'admin@hec.gov.pk',
            role: 'ADMIN',
            department: 'HEC Administration',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: 'SYSTEM'
        };

        await ctx.stub.putState(hecAdmin.id, Buffer.from(JSON.stringify(hecAdmin)));

        // Initialize counters
        const counters = {
            docType: 'counters',
            universityCount: 0,
            employeeCount: 1,
            degreeCount: 0
        };
        await ctx.stub.putState('COUNTERS', Buffer.from(JSON.stringify(counters)));

        console.log('HEC Ledger initialized successfully');
        return JSON.stringify({ success: true, message: 'Ledger initialized' });
    }

    // ==================== HEC Employee Management ====================

    async CreateHECEmployee(ctx, employeeData) {
        const data = JSON.parse(employeeData);
        
        // Verify caller is HEC Admin
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'HECMSP') {
            throw new Error('Only HEC members can create HEC employees');
        }

        // Get and update counter
        const countersBuffer = await ctx.stub.getState('COUNTERS');
        const counters = JSON.parse(countersBuffer.toString());
        counters.employeeCount += 1;

        const employeeId = `HEC_EMP_${String(counters.employeeCount).padStart(4, '0')}`;

        const employee = {
            id: employeeId,
            docType: 'hecEmployee',
            name: data.name,
            email: data.email,
            role: data.role || 'EMPLOYEE',
            department: data.department,
            phone: data.phone || '',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: data.createdBy
        };

        await ctx.stub.putState(employeeId, Buffer.from(JSON.stringify(employee)));
        await ctx.stub.putState('COUNTERS', Buffer.from(JSON.stringify(counters)));

        return JSON.stringify(employee);
    }

    async GetHECEmployee(ctx, employeeId) {
        const employeeBuffer = await ctx.stub.getState(employeeId);
        if (!employeeBuffer || employeeBuffer.length === 0) {
            throw new Error(`Employee ${employeeId} does not exist`);
        }
        return employeeBuffer.toString();
    }

    async GetAllHECEmployees(ctx) {
        const queryString = {
            selector: {
                docType: 'hecEmployee'
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async UpdateHECEmployee(ctx, employeeId, updateData) {
        const data = JSON.parse(updateData);
        
        const employeeBuffer = await ctx.stub.getState(employeeId);
        if (!employeeBuffer || employeeBuffer.length === 0) {
            throw new Error(`Employee ${employeeId} does not exist`);
        }

        const employee = JSON.parse(employeeBuffer.toString());
        
        // Update fields
        employee.name = data.name || employee.name;
        employee.email = data.email || employee.email;
        employee.department = data.department || employee.department;
        employee.phone = data.phone || employee.phone;
        employee.role = data.role || employee.role;
        employee.status = data.status || employee.status;
        employee.updatedAt = new Date().toISOString();
        employee.updatedBy = data.updatedBy;

        await ctx.stub.putState(employeeId, Buffer.from(JSON.stringify(employee)));
        return JSON.stringify(employee);
    }

    async DeactivateHECEmployee(ctx, employeeId, deactivatedBy) {
        const employeeBuffer = await ctx.stub.getState(employeeId);
        if (!employeeBuffer || employeeBuffer.length === 0) {
            throw new Error(`Employee ${employeeId} does not exist`);
        }

        const employee = JSON.parse(employeeBuffer.toString());
        employee.status = 'INACTIVE';
        employee.deactivatedAt = new Date().toISOString();
        employee.deactivatedBy = deactivatedBy;

        await ctx.stub.putState(employeeId, Buffer.from(JSON.stringify(employee)));
        return JSON.stringify(employee);
    }

    // ==================== Statistics ====================

    async GetSystemStatistics(ctx) {
        const countersBuffer = await ctx.stub.getState('COUNTERS');
        const counters = JSON.parse(countersBuffer.toString());

        // Get active universities
        const uniQuery = {
            selector: {
                docType: 'university',
                status: 'ACTIVE'
            }
        };
        const uniIterator = await ctx.stub.getQueryResult(JSON.stringify(uniQuery));
        const activeUniversities = await this._getAllResults(uniIterator);

        // Get active employees
        const empQuery = {
            selector: {
                docType: 'hecEmployee',
                status: 'ACTIVE'
            }
        };
        const empIterator = await ctx.stub.getQueryResult(JSON.stringify(empQuery));
        const activeEmployees = await this._getAllResults(empIterator);

        return JSON.stringify({
            totalUniversities: counters.universityCount,
            activeUniversities: activeUniversities.length,
            totalEmployees: counters.employeeCount,
            activeEmployees: activeEmployees.length,
            totalDegrees: counters.degreeCount
        });
    }

    // Helper function to iterate through results
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

module.exports = HECContract;
