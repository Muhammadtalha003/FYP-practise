import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const UniversityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDegrees: 0,
    pendingDegrees: 0,
    attestedDegrees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentDegrees, setRecentDegrees] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalStaff: 12,
        totalDegrees: 1250,
        pendingDegrees: 45,
        attestedDegrees: 1100,
      });

      setRecentDegrees([
        { id: 1, studentName: 'Ali Hassan', program: 'BS Computer Science', status: 'ISSUED', date: '2024-12-15' },
        { id: 2, studentName: 'Fatima Khan', program: 'MS Physics', status: 'VERIFIED', date: '2024-12-14' },
        { id: 3, studentName: 'Ahmed Raza', program: 'BE Electrical', status: 'HEC_ATTESTED', date: '2024-12-13' },
        { id: 4, studentName: 'Sara Malik', program: 'BS Mathematics', status: 'ISSUED', date: '2024-12-12' },
        { id: 5, studentName: 'Usman Ali', program: 'MBA', status: 'PENDING_VERIFICATION', date: '2024-12-11' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = [
    { month: 'Jan', degrees: 85 },
    { month: 'Feb', degrees: 92 },
    { month: 'Mar', degrees: 78 },
    { month: 'Apr', degrees: 110 },
    { month: 'May', degrees: 125 },
    { month: 'Jun', degrees: 140 },
    { month: 'Jul', degrees: 95 },
    { month: 'Aug', degrees: 88 },
    { month: 'Sep', degrees: 105 },
    { month: 'Oct', degrees: 115 },
    { month: 'Nov', degrees: 130 },
    { month: 'Dec', degrees: 87 },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_VERIFICATION: { class: 'badge-warning', label: 'Pending' },
      ISSUED: { class: 'badge-info', label: 'Issued' },
      VERIFIED: { class: 'badge-info', label: 'Verified' },
      HEC_ATTESTED: { class: 'badge-success', label: 'Attested' },
      REJECTED: { class: 'badge-error', label: 'Rejected' },
    };
    const config = statusConfig[status] || { class: 'badge-gray', label: status };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">University Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Staff"
            value={stats.totalStaff}
            subtitle="Active members"
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Total Degrees"
            value={stats.totalDegrees.toLocaleString()}
            subtitle="Issued to date"
            icon={AcademicCapIcon}
            color="purple"
          />
          <StatCard
            title="Pending"
            value={stats.pendingDegrees}
            subtitle="Awaiting action"
            icon={ClockIcon}
            color="orange"
          />
          <StatCard
            title="HEC Attested"
            value={stats.attestedDegrees.toLocaleString()}
            subtitle="Fully verified"
            icon={CheckCircleIcon}
            color="green"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Degrees Trend */}
          <div className="card">
            <h3 className="card-header">Degrees Issued (Monthly)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="degrees"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Degrees */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Degrees</h3>
              <a href="/university/degrees" className="text-sm text-university-blue-600 hover:text-university-blue-700">
                View all
              </a>
            </div>
            <div className="space-y-3">
              {recentDegrees.map((degree) => (
                <div
                  key={degree.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-university-blue-100 rounded-full flex items-center justify-center">
                      <AcademicCapIcon className="w-5 h-5 text-university-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{degree.studentName}</p>
                      <p className="text-sm text-gray-500">{degree.program}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(degree.status)}
                    <p className="text-xs text-gray-500 mt-1">{degree.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-header">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Issue New Degree"
              description="Create and issue a new degree certificate"
              href="/university/degrees"
              icon={AcademicCapIcon}
            />
            <QuickActionCard
              title="Manage Staff"
              description="Add or manage university staff members"
              href="/university/users"
              icon={UsersIcon}
            />
            <QuickActionCard
              title="Pending Verifications"
              description="Review degrees pending verification"
              href="/university/degrees"
              icon={ClockIcon}
            />
          </div>
        </div>

        {/* Role-based Access Info */}
        <div className="card bg-university-blue-50 border-university-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-university-blue-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-university-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-university-blue-900">Your Role: {user?.role}</h4>
              <p className="text-sm text-university-blue-700 mt-1">
                {user?.role === 'VC' && 'As Vice Chancellor, you can approve degrees, manage all staff, and sign official documents.'}
                {user?.role === 'REGISTRAR' && 'As Registrar, you can issue degrees, verify student records, and manage transcripts.'}
                {user?.role === 'CONTROLLER' && 'As Controller, you can manage exams, approve results, and handle grade records.'}
                {user?.role === 'DEAN' && 'As Dean, you can approve faculty degrees and manage department heads.'}
                {user?.role === 'HOD' && 'As HOD, you can recommend degrees and manage departmental student records.'}
                {user?.role === 'ADMIN' && 'As Admin, you can manage users and view all university data.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-university-blue-100 text-university-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, href, icon: Icon }) => {
  return (
    <a
      href={href}
      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="p-3 bg-university-blue-100 text-university-blue-600 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
};

export default UniversityDashboard;
