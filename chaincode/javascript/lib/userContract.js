'use strict';

const { Contract } = require('fabric-contract-api');

class UserContract extends Contract {

    constructor() {
        super('UserContract');
    }

    // ==================== University Staff Management ====================

    async CreateUniversityUser(ctx, userData) {
        const data = JSON.parse(userData);
        
        // Verify the university exists
        const universityBuffer = await ctx.stub.getState(data.universityId);
        if (!universityBuffer || universityBuffer.length === 0) {
            throw new Error(`University ${data.universityId} does not exist`);
        }

        const university = JSON.parse(universityBuffer.toString());

        const userId = `USER_${data.universityId}_${Date.now()}`;

        const user = {
            id: userId,
            docType: 'universityUser',
            universityId: data.universityId,
            universityName: university.name,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            role: data.role, // VC, REGISTRAR, CONTROLLER, DEAN, HOD, ADMIN
            department: data.department || 'Administration',
            designation: data.designation || '',
            permissions: this._getPermissionsByRole(data.role),
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: data.createdBy
        };

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));

        ctx.stub.setEvent('UserCreated', Buffer.from(JSON.stringify({
            userId: userId,
            universityId: data.universityId,
            role: data.role
        })));

        return JSON.stringify(user);
    }

    _getPermissionsByRole(role) {
        const permissions = {
            'VC': ['approve_degree', 'view_all', 'manage_registrar', 'manage_controller', 'manage_dean', 'sign_documents'],
            'REGISTRAR': ['issue_degree', 'verify_degree', 'manage_students', 'view_degrees', 'manage_transcripts'],
            'CONTROLLER': ['manage_exams', 'approve_results', 'view_results', 'manage_grades'],
            'DEAN': ['approve_department_degrees', 'view_faculty', 'manage_hod'],
            'HOD': ['recommend_degree', 'view_department', 'manage_students'],
            'ADMIN': ['manage_users', 'view_all', 'manage_departments']
        };
        return permissions[role] || ['view_own'];
    }

    async GetUniversityUser(ctx, userId) {
        const userBuffer = await ctx.stub.getState(userId);
        if (!userBuffer || userBuffer.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }
        return userBuffer.toString();
    }

    async GetUniversityUserByEmail(ctx, email) {
        const queryString = {
            selector: {
                docType: 'universityUser',
                email: email
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        
        if (results.length === 0) {
            throw new Error(`User with email ${email} does not exist`);
        }
        
        return JSON.stringify(results[0]);
    }

    async GetUsersByUniversity(ctx, universityId) {
        const queryString = {
            selector: {
                docType: 'universityUser',
                universityId: universityId
            },
            sort: [{ role: 'asc' }]
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async GetUsersByRole(ctx, universityId, role) {
        const queryString = {
            selector: {
                docType: 'universityUser',
                universityId: universityId,
                role: role,
                status: 'ACTIVE'
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        return JSON.stringify(results);
    }

    async UpdateUniversityUser(ctx, userId, updateData) {
        const data = JSON.parse(updateData);
        
        const userBuffer = await ctx.stub.getState(userId);
        if (!userBuffer || userBuffer.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userBuffer.toString());
        
        user.name = data.name || user.name;
        user.email = data.email || user.email;
        user.phone = data.phone || user.phone;
        user.department = data.department || user.department;
        user.designation = data.designation || user.designation;
        
        if (data.role && data.role !== user.role) {
            user.role = data.role;
            user.permissions = this._getPermissionsByRole(data.role);
        }
        
        user.status = data.status || user.status;
        user.updatedAt = new Date().toISOString();
        user.updatedBy = data.updatedBy;

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    async DeactivateUser(ctx, userId, deactivatedBy) {
        const userBuffer = await ctx.stub.getState(userId);
        if (!userBuffer || userBuffer.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userBuffer.toString());
        user.status = 'INACTIVE';
        user.deactivatedAt = new Date().toISOString();
        user.deactivatedBy = deactivatedBy;

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    async ActivateUser(ctx, userId, activatedBy) {
        const userBuffer = await ctx.stub.getState(userId);
        if (!userBuffer || userBuffer.length === 0) {
            throw new Error(`User ${userId} does not exist`);
        }

        const user = JSON.parse(userBuffer.toString());
        user.status = 'ACTIVE';
        user.activatedAt = new Date().toISOString();
        user.activatedBy = activatedBy;

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return JSON.stringify(user);
    }

    // ==================== Authentication Support ====================

    async ValidateUserCredentials(ctx, email, universityId) {
        const queryString = {
            selector: {
                docType: 'universityUser',
                email: email,
                universityId: universityId,
                status: 'ACTIVE'
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);
        
        if (results.length === 0) {
            return JSON.stringify({ valid: false, message: 'Invalid credentials or inactive user' });
        }
        
        return JSON.stringify({ valid: true, user: results[0] });
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

module.exports = UserContract;
