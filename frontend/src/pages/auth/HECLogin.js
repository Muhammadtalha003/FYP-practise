import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AcademicCapIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const HECLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginHEC } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginHEC(email, password);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/hec/dashboard');
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
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-hec-green-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-7 h-7 text-white" />
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">HEC Admin Portal</h2>
            <p className="text-gray-600 mt-2">Sign in to manage universities and degrees</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="admin@hec.gov.pk"
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
              className="w-full btn-primary py-3 flex items-center justify-center"
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
              University user?{' '}
              <Link to="/university/login" className="text-hec-green-600 hover:text-hec-green-700 font-medium">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@hec.gov.pk<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-hec-green-600 items-center justify-center p-8">
        <div className="max-w-lg text-center text-white">
          <AcademicCapIcon className="w-24 h-24 mx-auto mb-8 opacity-90" />
          <h3 className="text-3xl font-bold mb-4">
            Higher Education Commission
          </h3>
          <p className="text-hec-green-100 text-lg">
            Manage universities, employees, and degree attestations through our
            secure blockchain-powered platform.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">200+</p>
              <p className="text-sm text-hec-green-100">Universities</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-hec-green-100">Degrees</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-hec-green-100">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HECLogin;
