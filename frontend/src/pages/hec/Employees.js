import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { hecApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const HECEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    department: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Mock data for demo
      const mockData = [
        {
          id: 'HEC_ADMIN_001',
          name: 'Super Admin',
          email: 'admin@hec.gov.pk',
          phone: '+92-51-1234567',
          role: 'ADMIN',
          department: 'Administration',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'HEC_EMP_0002',
          name: 'Dr. Ahmed Ali',
          email: 'ahmed.ali@hec.gov.pk',
          phone: '+92-51-1234568',
          role: 'EMPLOYEE',
          department: 'Quality Assurance',
          status: 'ACTIVE',
          createdAt: '2024-02-15T00:00:00Z',
        },
        {
          id: 'HEC_EMP_0003',
          name: 'Ms. Fatima Khan',
          email: 'fatima.khan@hec.gov.pk',
          phone: '+92-51-1234569',
          role: 'EMPLOYEE',
          department: 'Attestation',
          status: 'ACTIVE',
          createdAt: '2024-03-10T00:00:00Z',
        },
        {
          id: 'HEC_EMP_0004',
          name: 'Mr. Hassan Raza',
          email: 'hassan.raza@hec.gov.pk',
          phone: '+92-51-1234570',
          role: 'ADMIN',
          department: 'IT Department',
          status: 'ACTIVE',
          createdAt: '2024-04-01T00:00:00Z',
        },
      ];
      setEmployees(mockData);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const newEmployee = {
        id: `HEC_EMP_${String(employees.length + 1).padStart(4, '0')}`,
        ...formData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      
      setEmployees([...employees, newEmployee]);
      toast.success('Employee added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const updatedEmployees = employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp
      );
      
      setEmployees(updatedEmployees);
      toast.success('Employee updated successfully');
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeactivateEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to deactivate ${employee.name}?`)) {
      try {
        const updatedEmployees = employees.map((emp) =>
          emp.id === employee.id ? { ...emp, status: 'INACTIVE' } : emp
        );
        setEmployees(updatedEmployees);
        toast.success('Employee deactivated');
      } catch (error) {
        toast.error('Failed to deactivate employee');
      }
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'EMPLOYEE',
      department: '',
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const departments = [
    'Administration',
    'Quality Assurance',
    'Attestation',
    'IT Department',
    'Finance',
    'Legal',
    'Human Resources',
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hec-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HEC Employees</h1>
            <p className="text-gray-600">Manage HEC staff members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-hec-green-100 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-hec-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.phone}
                        </div>
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td>
                      <span className={`badge ${
                        employee.role === 'ADMIN' ? 'badge-info' : 'badge-gray'
                      }`}>
                        {employee.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        employee.status === 'ACTIVE' ? 'badge-success' : 'badge-error'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {employee.status === 'ACTIVE' && employee.id !== 'HEC_ADMIN_001' && (
                          <button
                            onClick={() => handleDeactivateEmployee(employee)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Deactivate"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          title="Add New Employee"
        >
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input"
                required
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-input"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Employee
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Employee Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }}
          title="Edit Employee"
        >
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input"
                required
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-input"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Employee
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HECEmployees;
