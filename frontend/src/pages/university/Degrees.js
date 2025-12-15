import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { degreeApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const UniversityDegrees = () => {
  const { user } = useAuth();
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    fatherName: '',
    cnic: '',
    program: '',
    department: '',
    session: '',
    graduationYear: new Date().getFullYear(),
    cgpa: '',
    totalCredits: '',
    degreeType: 'BACHELOR',
    specialization: '',
  });

  // Check permissions based on role
  const canIssueDegree = ['REGISTRAR', 'ADMIN'].includes(user?.role);
  const canApproveDegree = ['VC', 'REGISTRAR'].includes(user?.role);

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      // Mock data for demo
      const mockData = [
        {
          id: 'DEG_2024_001',
          studentId: 'STU-2020-CS-001',
          studentName: 'Muhammad Ali Khan',
          fatherName: 'Imran Khan',
          cnic: '35201-1234567-1',
          program: 'BS Computer Science',
          department: 'Computer Science',
          session: '2020-2024',
          graduationYear: 2024,
          cgpa: '3.85',
          totalCredits: '136',
          degreeType: 'BACHELOR',
          specialization: 'Software Engineering',
          status: 'HEC_ATTESTED',
          issuedBy: 'registrar@university.edu.pk',
          issuedAt: '2024-02-15T10:30:00Z',
          approvedBy: 'vc@university.edu.pk',
          approvedAt: '2024-02-16T14:00:00Z',
          hecAttestedAt: '2024-02-20T09:00:00Z',
          verificationHash: 'abc123def456',
        },
        {
          id: 'DEG_2024_002',
          studentId: 'STU-2020-EE-015',
          studentName: 'Fatima Zahra',
          fatherName: 'Ahmed Zahra',
          cnic: '35201-2345678-2',
          program: 'BS Electrical Engineering',
          department: 'Electrical Engineering',
          session: '2020-2024',
          graduationYear: 2024,
          cgpa: '3.92',
          totalCredits: '140',
          degreeType: 'BACHELOR',
          specialization: 'Electronics',
          status: 'APPROVED',
          issuedBy: 'registrar@university.edu.pk',
          issuedAt: '2024-02-18T11:00:00Z',
          approvedBy: 'vc@university.edu.pk',
          approvedAt: '2024-02-19T15:30:00Z',
          verificationHash: 'xyz789ghi012',
        },
        {
          id: 'DEG_2024_003',
          studentId: 'STU-2022-MBA-008',
          studentName: 'Usman Ahmed',
          fatherName: 'Tariq Ahmed',
          cnic: '35201-3456789-3',
          program: 'MBA',
          department: 'Business Administration',
          session: '2022-2024',
          graduationYear: 2024,
          cgpa: '3.65',
          totalCredits: '72',
          degreeType: 'MASTER',
          specialization: 'Finance',
          status: 'PENDING_APPROVAL',
          issuedBy: 'registrar@university.edu.pk',
          issuedAt: '2024-02-22T09:00:00Z',
          verificationHash: 'qwe345rty678',
        },
        {
          id: 'DEG_2024_004',
          studentId: 'STU-2019-PHD-002',
          studentName: 'Dr. Sana Malik',
          fatherName: 'Khalid Malik',
          cnic: '35201-4567890-4',
          program: 'PhD Computer Science',
          department: 'Computer Science',
          session: '2019-2024',
          graduationYear: 2024,
          cgpa: '3.95',
          totalCredits: '54',
          degreeType: 'DOCTORATE',
          specialization: 'Artificial Intelligence',
          status: 'ISSUED',
          issuedBy: 'registrar@university.edu.pk',
          issuedAt: '2024-02-23T14:00:00Z',
          verificationHash: 'asd901fgh234',
        },
      ];
      setDegrees(mockData);
    } catch (error) {
      toast.error('Failed to fetch degrees');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueDegree = async (e) => {
    e.preventDefault();
    try {
      const newDegree = {
        id: `DEG_${new Date().getFullYear()}_${Date.now().toString().slice(-3)}`,
        ...formData,
        status: 'ISSUED',
        issuedBy: user?.email,
        issuedAt: new Date().toISOString(),
        verificationHash: Math.random().toString(36).substring(2, 15),
      };
      
      setDegrees([newDegree, ...degrees]);
      toast.success('Degree issued successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to issue degree');
    }
  };

  const handleApproveDegree = async (degree) => {
    try {
      const updatedDegrees = degrees.map((d) =>
        d.id === degree.id
          ? {
              ...d,
              status: 'APPROVED',
              approvedBy: user?.email,
              approvedAt: new Date().toISOString(),
            }
          : d
      );
      setDegrees(updatedDegrees);
      toast.success('Degree approved successfully');
    } catch (error) {
      toast.error('Failed to approve degree');
    }
  };

  const handleRequestAttestation = async (degree) => {
    try {
      const updatedDegrees = degrees.map((d) =>
        d.id === degree.id ? { ...d, status: 'PENDING_HEC_ATTESTATION' } : d
      );
      setDegrees(updatedDegrees);
      toast.success('Attestation request sent to HEC');
    } catch (error) {
      toast.error('Failed to request attestation');
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentId: '',
      fatherName: '',
      cnic: '',
      program: '',
      department: '',
      session: '',
      graduationYear: new Date().getFullYear(),
      cgpa: '',
      totalCredits: '',
      degreeType: 'BACHELOR',
      specialization: '',
    });
  };

  const filteredDegrees = degrees.filter((d) => {
    const matchesSearch =
      d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      ISSUED: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon, label: 'Issued' },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Approved' },
      PENDING_HEC_ATTESTATION: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, label: 'Pending HEC' },
      HEC_ATTESTED: { color: 'bg-purple-100 text-purple-800', icon: DocumentCheckIcon, label: 'HEC Attested' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rejected' },
    };
    const statusConfig = config[status] || config.ISSUED;
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getDegreeTypeBadge = (type) => {
    const colors = {
      BACHELOR: 'bg-blue-50 text-blue-700 border-blue-200',
      MASTER: 'bg-purple-50 text-purple-700 border-purple-200',
      DOCTORATE: 'bg-amber-50 text-amber-700 border-amber-200',
      DIPLOMA: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[type] || colors.BACHELOR;
  };

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Economics',
    'Psychology',
  ];

  const programs = {
    BACHELOR: [
      'BS Computer Science',
      'BS Electrical Engineering',
      'BS Mechanical Engineering',
      'BBA',
      'BS Physics',
      'BS Chemistry',
      'BS Mathematics',
    ],
    MASTER: [
      'MS Computer Science',
      'MS Electrical Engineering',
      'MBA',
      'MS Physics',
      'MS Chemistry',
      'MS Mathematics',
    ],
    DOCTORATE: [
      'PhD Computer Science',
      'PhD Electrical Engineering',
      'PhD Physics',
      'PhD Chemistry',
      'PhD Mathematics',
    ],
    DIPLOMA: [
      'Diploma in IT',
      'Diploma in Business',
      'Diploma in Engineering',
    ],
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Degree Management</h1>
            <p className="text-gray-600">Issue, approve, and manage student degrees</p>
          </div>
          {canIssueDegree && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Issue Degree
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Degrees</p>
                <p className="text-2xl font-bold text-gray-900">{degrees.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {degrees.filter((d) => d.status === 'PENDING_APPROVAL').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">HEC Attested</p>
                <p className="text-2xl font-bold text-purple-600">
                  {degrees.filter((d) => d.status === 'HEC_ATTESTED').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DocumentCheckIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {degrees.filter((d) => d.status === 'APPROVED').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, or degree..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="ISSUED">Issued</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_HEC_ATTESTATION">Pending HEC</option>
              <option value="HEC_ATTESTED">HEC Attested</option>
            </select>
            <button
              onClick={fetchDegrees}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Degrees Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CGPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDegrees.map((degree) => (
                  <tr key={degree.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{degree.studentName}</div>
                        <div className="text-sm text-gray-500">{degree.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{degree.program}</div>
                        <div className="text-sm text-gray-500">{degree.session}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDegreeTypeBadge(degree.degreeType)}`}>
                        {degree.degreeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{degree.cgpa}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(degree.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setSelectedDegree(degree); setShowViewModal(true); }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {canApproveDegree && (degree.status === 'ISSUED' || degree.status === 'PENDING_APPROVAL') && (
                          <button
                            onClick={() => handleApproveDegree(degree)}
                            className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        {degree.status === 'APPROVED' && (
                          <button
                            onClick={() => handleRequestAttestation(degree)}
                            className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded"
                            title="Request HEC Attestation"
                          >
                            <DocumentCheckIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Print"
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDegrees.length === 0 && (
            <div className="text-center py-12">
              <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No degrees found</p>
            </div>
          )}
        </div>

        {/* Issue Degree Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          title="Issue New Degree"
          size="lg"
        >
          <form onSubmit={handleIssueDegree} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Student ID *</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="form-input"
                  placeholder="e.g., STU-2020-CS-001"
                  required
                />
              </div>
              <div>
                <label className="form-label">Father's Name *</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">CNIC *</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 35201-1234567-1"
                  required
                />
              </div>
              <div>
                <label className="form-label">Degree Type *</label>
                <select
                  value={formData.degreeType}
                  onChange={(e) => setFormData({ ...formData, degreeType: e.target.value, program: '' })}
                  className="form-input"
                  required
                >
                  <option value="BACHELOR">Bachelor's</option>
                  <option value="MASTER">Master's</option>
                  <option value="DOCTORATE">Doctorate (PhD)</option>
                  <option value="DIPLOMA">Diploma</option>
                </select>
              </div>
              <div>
                <label className="form-label">Program *</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Select Program</option>
                  {programs[formData.degreeType]?.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
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
                <label className="form-label">Session *</label>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 2020-2024"
                  required
                />
              </div>
              <div>
                <label className="form-label">Graduation Year *</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                  className="form-input"
                  min="2000"
                  max="2030"
                  required
                />
              </div>
              <div>
                <label className="form-label">CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="form-input"
                  min="0"
                  max="4"
                  required
                />
              </div>
              <div>
                <label className="form-label">Total Credits *</label>
                <input
                  type="number"
                  value={formData.totalCredits}
                  onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Software Engineering"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium">
                Issue Degree
              </button>
            </div>
          </form>
        </Modal>

        {/* View Degree Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => { setShowViewModal(false); setSelectedDegree(null); }}
          title="Degree Details"
          size="lg"
        >
          {selectedDegree && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-4">
                <AcademicCapIcon className="w-16 h-16 text-university-blue-600 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-900">{selectedDegree.program}</h3>
                <p className="text-gray-500">{selectedDegree.degreeType} Degree</p>
                {getStatusBadge(selectedDegree.status)}
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Student Name</label>
                  <p className="font-medium">{selectedDegree.studentName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Student ID</label>
                  <p className="font-medium">{selectedDegree.studentId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Father's Name</label>
                  <p className="font-medium">{selectedDegree.fatherName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">CNIC</label>
                  <p className="font-medium">{selectedDegree.cnic}</p>
                </div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="text-sm text-gray-500">Department</label>
                  <p className="font-medium">{selectedDegree.department}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Session</label>
                  <p className="font-medium">{selectedDegree.session}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">CGPA</label>
                  <p className="font-medium">{selectedDegree.cgpa}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Total Credits</label>
                  <p className="font-medium">{selectedDegree.totalCredits}</p>
                </div>
                {selectedDegree.specialization && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Specialization</label>
                    <p className="font-medium">{selectedDegree.specialization}</p>
                  </div>
                )}
              </div>

              {/* Verification Info */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Verification Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Degree ID</label>
                      <p className="font-mono font-medium">{selectedDegree.id}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Verification Hash</label>
                      <p className="font-mono font-medium text-xs break-all">{selectedDegree.verificationHash}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Issued By</label>
                      <p className="font-medium">{selectedDegree.issuedBy}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Issued At</label>
                      <p className="font-medium">{new Date(selectedDegree.issuedAt).toLocaleString()}</p>
                    </div>
                    {selectedDegree.approvedBy && (
                      <>
                        <div>
                          <label className="text-gray-500">Approved By</label>
                          <p className="font-medium">{selectedDegree.approvedBy}</p>
                        </div>
                        <div>
                          <label className="text-gray-500">Approved At</label>
                          <p className="font-medium">{new Date(selectedDegree.approvedAt).toLocaleString()}</p>
                        </div>
                      </>
                    )}
                    {selectedDegree.hecAttestedAt && (
                      <div className="col-span-2">
                        <label className="text-gray-500">HEC Attested At</label>
                        <p className="font-medium">{new Date(selectedDegree.hecAttestedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setShowViewModal(false); setSelectedDegree(null); }} className="btn-secondary">
                  Close
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 transition-colors font-medium">
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default UniversityDegrees;
