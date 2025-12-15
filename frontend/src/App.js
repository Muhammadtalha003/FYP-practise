import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import HECLogin from './pages/auth/HECLogin';
import UniversityLogin from './pages/auth/UniversityLogin';
import HECDashboard from './pages/hec/Dashboard';
import HECUniversities from './pages/hec/Universities';
import HECEmployees from './pages/hec/Employees';
import HECDegrees from './pages/hec/Degrees';
import UniversityDashboard from './pages/university/Dashboard';
import UniversityUsers from './pages/university/Users';
import UniversityDegrees from './pages/university/Degrees';
import PublicVerification from './pages/PublicVerification';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/hec/login" element={<HECLogin />} />
            <Route path="/university/login" element={<UniversityLogin />} />
            <Route path="/verify" element={<PublicVerification />} />

            {/* HEC Protected Routes */}
            <Route
              path="/hec/dashboard"
              element={
                <ProtectedRoute orgType="HEC">
                  <HECDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hec/universities"
              element={
                <ProtectedRoute orgType="HEC">
                  <HECUniversities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hec/employees"
              element={
                <ProtectedRoute orgType="HEC">
                  <HECEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hec/degrees"
              element={
                <ProtectedRoute orgType="HEC">
                  <HECDegrees />
                </ProtectedRoute>
              }
            />

            {/* University Protected Routes */}
            <Route
              path="/university/dashboard"
              element={
                <ProtectedRoute orgType="UNIVERSITY">
                  <UniversityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/university/users"
              element={
                <ProtectedRoute orgType="UNIVERSITY">
                  <UniversityUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/university/degrees"
              element={
                <ProtectedRoute orgType="UNIVERSITY">
                  <UniversityDegrees />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
