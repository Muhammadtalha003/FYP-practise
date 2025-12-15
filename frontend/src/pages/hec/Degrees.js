import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { degreeApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';

const HECDegrees = () => {
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAttestModal, setShowAttestModal] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [attestRemarks, setAttestRemarks] = useState('');

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      // Mock data for demo
      const mockData = [
        {
          id: 'DEG_UNI_0001_000001',
          universityId: 'UNI_0001',
          universityName: 'University of the Punjab',
          student: {
            name: 'Ahmed Khan',
            fatherName: 'Muhammad Khan',
            rollNumber: 'PU-2020-CS-001',
            registrationNumber: 'REG-2020-12345',
            cnic: '35201-1234567-1',
          },
          program: {
            name: 'Computer Science',
            type: 'BS',
            department: 'Computer Science',
          },
          academic: {
            cgpa: 3.75,
            sessionStart: '2020',
            sessionEnd: '2024',
          },
          issueDate: '2024-06-15',
          status: 'ISSUED',
          verificationStatus: 'VERIFIED',
          issuedBy: 'USER_UNI_0001_REG',
        },
        {
          id: 'DEG_UNI_0002_000001',
          universityId: 'UNI_0002',
          universityName: 'Quaid-i-Azam University',
          student: {
            name: 'Fatima Ali',
            fatherName: 'Ali Ahmad',
            rollNumber: 'QAU-2019-PHY-015',
            registrationNumber: 'REG-2019-67890',
            cnic: '61101-9876543-2',
          },
          program: {
            name: 'Physics',
            type: 'MS',
            department: 'Physics',
          },
          academic: {
            cgpa: 3.92,
            sessionStart: '2019',
            sessionEnd: '2021',
          },
          issueDate: '2024-05-20',
          status: 'ISSUED',
          verificationStatus: 'VERIFIED',
          issuedBy: 'USER_UNI_0002_REG',
        },
        {
          id: 'DEG_UNI_0003_000001',
          universityId: 'UNI_0003',
          universityName: 'COMSATS University Islamabad',
          student: {
            name: 'Hassan Raza',
            fatherName: 'Raza Ahmad',
            rollNumber: 'CUI-2018-EE-042',
            registrationNumber: 'REG-2018-11111',
            cnic: '37405-1111111-3',
          },
          program: {
            name: 'Electrical Engineering',
            type: 'BE',
            department: 'Electrical Engineering',
          },
          academic: {
            cgpa: 3.45,
            sessionStart: '2018',
            sessionEnd: '2022',
          },
          issueDate: '2024-04-10',
          status: 'ISSUED',
          verificationStatus: 'HEC_ATTESTED',
          hecAttestation: {
            attested: true,
            attestationNumber: 'HEC-ATT-1234567890',
            attestedAt: '2024-05-01T10:30:00Z',
          },
          issuedBy: 'USER_UNI_0003_REG',
        },
        {
          id: 'DEG_UNI_0004_000001',
          universityId: 'UNI_0004',
          universityName: 'NUST',
          student: {
            name: 'Sara Malik',
            fatherName: 'Malik Ahmad',
            rollNumber: 'NUST-2017-CS-100',
            registrationNumber: 'REG-2017-22222',
            cnic: '44000-2222222-4',
          },
          program: {
            name: 'Software Engineering',
            type: 'BS',
            department: 'Software Engineering',
          },
          academic: {
            cgpa: 3.88,
            sessionStart: '2017',
            sessionEnd: '2021',
          },
          issueDate: '2024-03-25',
          status: 'ISSUED',
          verificationStatus: 'PENDING_VERIFICATION',
          issuedBy: 'USER_UNI_0004_REG',
        },
      ];
      setDegrees(mockData);
    } catch (error) {
      toast.error('Failed to fetch degrees');
    } finally {
      setLoading(false);
    }
  };

  const handleAttest = async () => {
    if (!selectedDegree) return;
    
    try {
      const updatedDegrees = degrees.map((deg) =>
        deg.id === selectedDegree.id
          ? {
              ...deg,
              verificationStatus: 'HEC_ATTESTED',
              hecAttestation: {
                attested: true,
                attestationNumber: `HEC-ATT-${Date.now()}`,
                attestedAt: new Date().toISOString(),
                remarks: attestRemarks,
              },
            }
          : deg
      );
      
      setDegrees(updatedDegrees);
      toast.success('Degree attested successfully');
      setShowAttestModal(false);
      setSelectedDegree(null);
      setAttestRemarks('');
    } catch (error) {
      toast.error('Failed to attest degree');
    }
  };

  const handleReject = async (degree) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const updatedDegrees = degrees.map((deg) =>
        deg.id === degree.id
          ? {
              ...deg,
              status: 'REJECTED',
              verificationStatus: 'REJECTED',
              rejectionReason: reason,
            }
          : deg
      );
      
      setDegrees(updatedDegrees);
      toast.success('Degree rejected');
    } catch (error) {
      toast.error('Failed to reject degree');
    }
  };

  const openViewModal = (degree) => {
    setSelectedDegree(degree);
    setShowViewModal(true);
  };

  const openAttestModal = (degree) => {
    setSelectedDegree(degree);
    setShowAttestModal(true);
  };

  const filteredDegrees = degrees.filter((deg) => {
    const matchesSearch =
      deg.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deg.universityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || deg.verificationStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_VERIFICATION: { class: 'badge-warning', label: 'Pending' },
      VERIFIED: { class: 'badge-info', label: 'Verified' },
      HEC_ATTESTED: { class: 'badge-success', label: 'HEC Attested' },
      REJECTED: { class: 'badge-error', label: 'Rejected' },
    };
    const config = statusConfig[status] || { class: 'badge-gray', label: status };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Degree Management</h1>
          <p className="text-gray-600">Review and attest university degrees</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900">{degrees.length}</p>
            <p className="text-sm text-gray-500">Total Degrees</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {degrees.filter(d => d.verificationStatus === 'PENDING_VERIFICATION').length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">
              {degrees.filter(d => d.verificationStatus === 'VERIFIED').length}
            </p>
            <p className="text-sm text-gray-500">Verified</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">
              {degrees.filter(d => d.verificationStatus === 'HEC_ATTESTED').length}
            </p>
            <p className="text-sm text-gray-500">Attested</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, or university..."
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
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified (Awaiting Attestation)</option>
              <option value="HEC_ATTESTED">HEC Attested</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredDegrees.length} of {degrees.length} degrees
            </div>
          </div>
        </div>

        {/* Degrees Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Degree ID</th>
                  <th>Student</th>
                  <th>University</th>
                  <th>Program</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDegrees.map((degree) => (
                  <tr key={degree.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <AcademicCapIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{degree.id}</p>
                          <p className="text-xs text-gray-500">{degree.issueDate}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-gray-900">{degree.student.name}</p>
                      <p className="text-xs text-gray-500">{degree.student.rollNumber}</p>
                    </td>
                    <td>
                      <p className="text-sm text-gray-900">{degree.universityName}</p>
                    </td>
                    <td>
                      <p className="text-sm text-gray-900">{degree.program.name}</p>
                      <span className="badge badge-gray">{degree.program.type}</span>
                    </td>
                    <td>
                      <span className="font-medium text-gray-900">{degree.academic.cgpa}</span>
                    </td>
                    <td>{getStatusBadge(degree.verificationStatus)}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openViewModal(degree)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {degree.verificationStatus === 'VERIFIED' && (
                          <>
                            <button
                              onClick={() => openAttestModal(degree)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                              title="Attest"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(degree)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Degree Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => { setShowViewModal(false); setSelectedDegree(null); }}
          title="Degree Details"
          size="lg"
        >
          {selectedDegree && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedDegree.student.name}</p>
                    <p><span className="text-gray-500">Father's Name:</span> {selectedDegree.student.fatherName}</p>
                    <p><span className="text-gray-500">Roll Number:</span> {selectedDegree.student.rollNumber}</p>
                    <p><span className="text-gray-500">Registration:</span> {selectedDegree.student.registrationNumber}</p>
                    <p><span className="text-gray-500">CNIC:</span> {selectedDegree.student.cnic}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Program Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Program:</span> {selectedDegree.program.name}</p>
                    <p><span className="text-gray-500">Type:</span> {selectedDegree.program.type}</p>
                    <p><span className="text-gray-500">Department:</span> {selectedDegree.program.department}</p>
                    <p><span className="text-gray-500">CGPA:</span> {selectedDegree.academic.cgpa}</p>
                    <p><span className="text-gray-500">Session:</span> {selectedDegree.academic.sessionStart} - {selectedDegree.academic.sessionEnd}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">University & Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-gray-500">University:</span> {selectedDegree.universityName}</p>
                  <p><span className="text-gray-500">Issue Date:</span> {selectedDegree.issueDate}</p>
                  <p><span className="text-gray-500">Status:</span> {getStatusBadge(selectedDegree.verificationStatus)}</p>
                  {selectedDegree.hecAttestation && (
                    <p><span className="text-gray-500">Attestation No:</span> {selectedDegree.hecAttestation.attestationNumber}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Attest Modal */}
        <Modal
          isOpen={showAttestModal}
          onClose={() => { setShowAttestModal(false); setSelectedDegree(null); setAttestRemarks(''); }}
          title="HEC Attestation"
        >
          {selectedDegree && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentCheckIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Attest Degree</p>
                    <p className="text-sm text-green-700">
                      {selectedDegree.student.name} - {selectedDegree.program.type} in {selectedDegree.program.name}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Remarks (Optional)</label>
                <textarea
                  value={attestRemarks}
                  onChange={(e) => setAttestRemarks(e.target.value)}
                  className="form-input"
                  rows="3"
                  placeholder="Add any remarks for this attestation..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => { setShowAttestModal(false); setSelectedDegree(null); setAttestRemarks(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleAttest} className="btn-primary">
                  Confirm Attestation
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default HECDegrees;
