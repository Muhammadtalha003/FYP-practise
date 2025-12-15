import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { universityApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BuildingLibraryIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const UniversityLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const { loginUniversity } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      // For demo, we'll use mock data since backend requires auth
      setUniversities([
        { id: 'UNI_0001', name: 'University of the Punjab' },
        { id: 'UNI_0002', name: 'Quaid-i-Azam University' },
        { id: 'UNI_0003', name: 'COMSATS University Islamabad' },
        { id: 'UNI_0004', name: 'NUST' },
        { id: 'UNI_0005', name: 'LUMS' },
      ]);
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!universityId) {
      toast.error('Please select a university');
      return;
    }

    setLoading(true);

    try {
      const result = await loginUniversity(email, password, universityId);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/university/dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-university-blue-600 items-center justify-center p-8">
        <div className="max-w-lg text-center text-white">
          <BuildingLibraryIcon className="w-24 h-24 mx-auto mb-8 opacity-90" />
          <h3 className="text-3xl font-bold mb-4">
            University Portal
          </h3>
          <p className="text-university-blue-100 text-lg">
            Manage your university staff, issue degrees, and track verifications
            through our secure blockchain-powered platform.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">VC</p>
              <p className="text-sm text-university-blue-100">Vice Chancellor</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">REG</p>
              <p className="text-sm text-university-blue-100">Registrar</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">CON</p>
              <p className="text-sm text-university-blue-100">Controller</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">DEAN</p>
              <p className="text-sm text-university-blue-100">Faculty Dean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-university-blue-600 rounded-xl flex items-center justify-center">
                <BuildingLibraryIcon className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">University Portal</h2>
            <p className="text-gray-600 mt-2">Sign in to manage degrees and staff</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="university" className="form-label">
                Select University
              </label>
              <div className="relative">
                <BuildingLibraryIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  id="university"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="form-input pl-10 pr-10 appearance-none"
                  required
                  disabled={loadingUniversities}
                >
                  <option value="">Select your university</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="registrar@university.edu.pk"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-university-blue-600 text-white rounded-lg hover:bg-university-blue-700 focus:ring-2 focus:ring-university-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              HEC Administrator?{' '}
              <Link to="/hec/login" className="text-university-blue-600 hover:text-university-blue-700 font-medium">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <strong>Note:</strong> Contact your university administrator for login credentials.
              University accounts are created by HEC or VC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityLogin;
