import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const UniversityUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'HOD',
    department: '',
    designation: '',
  });

  // Check if current user can manage users
  const canManageUsers = ['VC', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for demo
      const mockData = [
        {
          id: 'USER_UNI_0001_001',
          universityId: user?.universityId,
          name: 'Dr. Ahmad Khan',
          email: 'vc@university.edu.pk',
          phone: '+92-42-1111111',
          role: 'VC',
          department: 'Administration',
          designation: 'Vice Chancellor',
          permissions: ['approve_degree', 'view_all', 'manage_registrar', 'sign_documents'],
          status: 'ACTIVE',
        },
        {
          id: 'USER_UNI_0001_002',
          universityId: user?.universityId,
          name: 'Mr. Tariq Mahmood',
          email: 'registrar@university.edu.pk',
          phone: '+92-42-2222222',
          role: 'REGISTRAR',
          department: 'Administration',
          designation: 'Registrar',
          permissions: ['issue_degree', 'verify_degree', 'manage_students'],
          status: 'ACTIVE',
        },
        {
          id: 'USER_UNI_0001_003',
          universityId: user?.universityId,
          name: 'Dr. Ayesha Siddiqui',
          email: 'controller@university.edu.pk',
          phone: '+92-42-3333333',
          role: 'CONTROLLER',
          department: 'Examination',
          designation: 'Controller of Examinations',
          permissions: ['manage_exams', 'approve_results', 'view_results'],
          status: 'ACTIVE',
        },
        {
          id: 'USER_UNI_0001_004',
          universityId: user?.universityId,
          name: 'Prof. Zahid Ali',
          email: 'dean.science@university.edu.pk',
          phone: '+92-42-4444444',
          role: 'DEAN',
          department: 'Faculty of Science',
          designation: 'Dean',
          permissions: ['approve_department_degrees', 'view_faculty'],
          status: 'ACTIVE',
        },
        {
          id: 'USER_UNI_0001_005',
          universityId: user?.universityId,
          name: 'Dr. Sana Fatima',
          email: 'hod.cs@university.edu.pk',
          phone: '+92-42-5555555',
          role: 'HOD',
          department: 'Computer Science',
          designation: 'Head of Department',
          permissions: ['recommend_degree', 'view_department'],
          status: 'ACTIVE',
        },
      ];
      setUsers(mockData);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const permissions = {
        'VC': ['approve_degree', 'view_all', 'manage_registrar', 'manage_controller', 'manage_dean', 'sign_documents'],
        'REGISTRAR': ['issue_degree', 'verify_degree', 'manage_students', 'view_degrees', 'manage_transcripts'],
        'CONTROLLER': ['manage_exams', 'approve_results', 'view_results', 'manage_grades'],
        'DEAN': ['approve_department_degrees', 'view_faculty', 'manage_hod'],
        'HOD': ['recommend_degree', 'view_department', 'manage_students'],
        'ADMIN': ['manage_users', 'view_all', 'manage_departments']
      };

      const newUser = {
        id: `USER_${user?.universityId}_${Date.now()}`,
        universityId: user?.universityId,
        ...formData,
        permissions: permissions[formData.role] || ['view_own'],
        status: 'ACTIVE',
      };
      
      setUsers([...users, newUser]);
      toast.success('Staff member added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add staff member');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      );
      
      setUsers(updatedUsers);
      toast.success('Staff member updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update staff member');
    }
  };

  const handleDeactivateUser = async (userToDeactivate) => {
    if (window.confirm(`Are you sure you want to deactivate ${userToDeactivate.name}?`)) {
      try {
        const updatedUsers = users.map((u) =>
          u.id === userToDeactivate.id ? { ...u, status: 'INACTIVE' } : u
        );
        setUsers(updatedUsers);
        toast.success('Staff member deactivated');
      } catch (error) {
        toast.error('Failed to deactivate staff member');
      }
    }
  };

  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      phone: userToEdit.phone,
      role: userToEdit.role,
      department: userToEdit.department,
      designation: userToEdit.designation,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'HOD',
      department: '',
      designation: '',
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      VC: 'bg-purple-100 text-purple-800',
      REGISTRAR: 'bg-blue-100 text-blue-800',
      CONTROLLER: 'bg-green-100 text-green-800',
      DEAN: 'bg-orange-100 text-orange-800',
      HOD: 'bg-yellow-100 text-yellow-800',
      ADMIN: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const departments = [
    'Administration',
    'Examination',
    'Computer Science',
    'Electrical Engineering',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Business Administration',
    'Faculty of Science',
    'Faculty of Engineering',
    'Faculty of Arts',
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">University Staff</h1>
            <p className="text-gray-600">Manage VC, Registrar, Controller, and other staff</p>
          </div>
          {canManageUsers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Staff
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
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
              <option value="VC">Vice Chancellor</option>
              <option value="REGISTRAR">Registrar</option>
              <option value="CONTROLLER">Controller</option>
              <option value="DEAN">Dean</option>
              <option value="HOD">HOD</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredUsers.length} of {users.length} staff members
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((staffUser) => (
            <div key={staffUser.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-university-blue-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-university-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{staffUser.name}</h3>
                    <p className="text-sm text-gray-500">{staffUser.designation}</p>
                  </div>
                </div>
                <span className={`badge ${staffUser.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                  {staffUser.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{staffUser.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>{staffUser.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                  <span>{staffUser.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`badge ${getRoleBadgeColor(staffUser.role)}`}>
                  {staffUser.role}
                </span>
                {canManageUsers && staffUser.id !== user?.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(staffUser)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {staffUser.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDeactivateUser(staffUser)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Deactivate"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {staffUser.permissions?.slice(0, 3).map((perm, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {staffUser.permissions?.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      +{staffUser.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add User Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          title="Add Staff Member"
        >
          <form onSubmit={handleAddUser} className="space-y-4">
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
                <option value="VC">Vice Chancellor</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="CONTROLLER">Controller</option>
                <option value="DEAN">Dean</option>
                <option value="HOD">Head of Department</option>
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
            <div>
              <label className="form-label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="form-input"
                placeholder="e.g., Professor, Associate Professor"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium">
                Add Staff
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); resetForm(); }}
          title="Edit Staff Member"
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
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
                <option value="VC">Vice Chancellor</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="CONTROLLER">Controller</option>
                <option value="DEAN">Dean</option>
                <option value="HOD">Head of Department</option>
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
            <div>
              <label className="form-label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium">
                Update Staff
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default UniversityUsers;
