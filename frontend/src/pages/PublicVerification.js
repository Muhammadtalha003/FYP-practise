import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

const PublicVerification = () => {
  const [searchType, setSearchType] = useState('degreeId');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Please enter a value to search');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Mock verification for demo
      // In production, this would call the actual API
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // Mock results based on search
      const mockDegrees = {
        'DEG_2024_001': {
          verified: true,
          degree: {
            id: 'DEG_2024_001',
            studentName: 'Muhammad Ali Khan',
            fatherName: 'Imran Khan',
            program: 'BS Computer Science',
            degreeType: 'BACHELOR',
            department: 'Computer Science',
            session: '2020-2024',
            graduationYear: 2024,
            cgpa: '3.85',
            universityName: 'Punjab University',
            universityId: 'UNI_0001',
            status: 'HEC_ATTESTED',
            issuedAt: '2024-02-15T10:30:00Z',
            hecAttestedAt: '2024-02-20T09:00:00Z',
            verificationHash: 'abc123def456ghi789',
          },
        },
        'DEG_2024_002': {
          verified: true,
          degree: {
            id: 'DEG_2024_002',
            studentName: 'Fatima Zahra',
            fatherName: 'Ahmed Zahra',
            program: 'BS Electrical Engineering',
            degreeType: 'BACHELOR',
            department: 'Electrical Engineering',
            session: '2020-2024',
            graduationYear: 2024,
            cgpa: '3.92',
            universityName: 'LUMS',
            universityId: 'UNI_0002',
            status: 'APPROVED',
            issuedAt: '2024-02-18T11:00:00Z',
            verificationHash: 'xyz789ghi012jkl345',
          },
        },
      };

      // Check if searching by degree ID
      if (searchType === 'degreeId' && mockDegrees[searchValue.toUpperCase()]) {
        setResult(mockDegrees[searchValue.toUpperCase()]);
      } else if (searchType === 'studentId' && searchValue.toLowerCase() === 'stu-2020-cs-001') {
        setResult(mockDegrees['DEG_2024_001']);
      } else if (searchType === 'verificationHash' && searchValue.toLowerCase() === 'abc123def456ghi789') {
        setResult(mockDegrees['DEG_2024_001']);
      } else {
        setError('No degree found with the provided information. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to verify degree. Please try again later.');
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      HEC_ATTESTED: {
        label: 'HEC Attested',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: DocumentCheckIcon,
        description: 'This degree has been verified and attested by HEC Pakistan.',
      },
      APPROVED: {
        label: 'University Approved',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: CheckCircleIcon,
        description: 'This degree is approved by the university. HEC attestation is pending.',
      },
      ISSUED: {
        label: 'Issued',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: AcademicCapIcon,
        description: 'This degree has been issued by the university.',
      },
    };
    return statusMap[status] || statusMap.ISSUED;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-8 h-8 text-hec-green-600" />
              <span className="text-xl font-bold text-gray-900">Degree Verification</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-hec-green-100 mb-6">
            <DocumentCheckIcon className="w-10 h-10 text-hec-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Verify Degree Authenticity
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of any degree issued by HEC-recognized universities in Pakistan.
            Enter the degree information below to get instant verification results.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Search Type Selector */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSearchType('degreeId')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  searchType === 'degreeId'
                    ? 'border-hec-green-500 bg-hec-green-50 text-hec-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <HashtagIcon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Degree ID</p>
              </button>
              <button
                type="button"
                onClick={() => setSearchType('studentId')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  searchType === 'studentId'
                    ? 'border-hec-green-500 bg-hec-green-50 text-hec-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <UserCircleIcon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Student ID</p>
              </button>
              <button
                type="button"
                onClick={() => setSearchType('verificationHash')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  searchType === 'verificationHash'
                    ? 'border-hec-green-500 bg-hec-green-50 text-hec-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <ShieldCheckIcon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">QR/Hash</p>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'degreeId'
                    ? 'Enter Degree ID (e.g., DEG_2024_001)'
                    : searchType === 'studentId'
                    ? 'Enter Student ID (e.g., STU-2020-CS-001)'
                    : 'Enter Verification Hash or QR Code'
                }
                className="w-full pl-14 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-hec-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-hec-green-600 text-white text-lg font-semibold rounded-xl hover:bg-hec-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-6 h-6 mr-2" />
                  Verify Degree
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-12 h-12 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Verification Failed</h3>
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-red-500 mt-2">
                  If you believe this is an error, please contact HEC or the issuing university.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && result.verified && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Status Banner */}
            {(() => {
              const statusInfo = getStatusInfo(result.degree.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div className={`${statusInfo.bg} ${statusInfo.border} border-b p-6`}>
                  <div className="flex items-center justify-center space-x-3">
                    <StatusIcon className={`w-10 h-10 ${statusInfo.color}`} />
                    <div className="text-center">
                      <h3 className={`text-xl font-bold ${statusInfo.color}`}>
                        ✓ Degree Verified - {statusInfo.label}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Degree Details */}
            <div className="p-8">
              <div className="text-center mb-8">
                <AcademicCapIcon className="w-16 h-16 text-university-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">{result.degree.program}</h2>
                <p className="text-gray-500">{result.degree.degreeType} Degree</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Student Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{result.degree.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Father's Name</p>
                      <p className="font-medium">{result.degree.fatherName}</p>
                    </div>
                  </div>
                </div>

                {/* University Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    University Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <BuildingLibraryIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">University</p>
                      <p className="font-medium">{result.degree.universityName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{result.degree.department}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Academic Details
                  </h4>
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Session</p>
                      <p className="font-medium">{result.degree.session}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">CGPA</p>
                      <p className="font-medium">{result.degree.cgpa}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Verification Details
                  </h4>
                  <div className="flex items-center space-x-3">
                    <HashtagIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Degree ID</p>
                      <p className="font-mono font-medium">{result.degree.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Issued Date</p>
                      <p className="font-medium">
                        {new Date(result.degree.issuedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Hash */}
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Blockchain Verification Hash</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <code className="text-sm font-mono text-gray-700 break-all">
                    {result.degree.verificationHash}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This hash is stored on the Hyperledger Fabric blockchain and can be used to verify the degree's authenticity.
                </p>
              </div>

              {/* HEC Attestation Info */}
              {result.degree.status === 'HEC_ATTESTED' && result.degree.hecAttestedAt && (
                <div className="mt-6 bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <DocumentCheckIcon className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-purple-800">HEC Attestation</h4>
                      <p className="text-sm text-purple-600">
                        Attested on{' '}
                        {new Date(result.degree.hecAttestedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            <strong>Demo Mode:</strong> Try searching for "DEG_2024_001" or "STU-2020-CS-001" to see a sample verified degree.
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Verification</h3>
            <p className="text-sm text-gray-600">
              All degrees are stored on a tamper-proof Hyperledger Fabric blockchain network.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">
              Get immediate verification results with complete degree details and HEC attestation status.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BuildingLibraryIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">HEC Recognized</h3>
            <p className="text-sm text-gray-600">
              Only degrees from HEC-recognized universities are included in the verification system.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} HEC Pakistan Degree Verification System. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Powered by Hyperledger Fabric Blockchain Technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicVerification;
