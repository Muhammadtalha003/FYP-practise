import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { hecApi, universityApi, degreeApi } from '../../services/api';
import {
  BuildingLibraryIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const HECDashboard = () => {
  const [stats, setStats] = useState({
    totalUniversities: 0,
    activeUniversities: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalDegrees: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalUniversities: 245,
        activeUniversities: 230,
        totalEmployees: 15,
        activeEmployees: 12,
        totalDegrees: 52340,
        pendingVerifications: 127,
      });

      setRecentActivity([
        { id: 1, type: 'university', message: 'New university registered: NUML', time: '2 hours ago' },
        { id: 2, type: 'degree', message: 'Degree attested for student Ahmed Khan', time: '3 hours ago' },
        { id: 3, type: 'employee', message: 'New HEC employee added: Dr. Asif', time: '5 hours ago' },
        { id: 4, type: 'university', message: 'University status updated: FAST-NU', time: '1 day ago' },
        { id: 5, type: 'degree', message: '50 degrees verified from Punjab University', time: '1 day ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Punjab', universities: 45 },
    { name: 'Sindh', universities: 38 },
    { name: 'KPK', universities: 32 },
    { name: 'Balochistan', universities: 12 },
    { name: 'ICT', universities: 28 },
  ];

  const degreeTypeData = [
    { name: 'BS', value: 45 },
    { name: 'MS', value: 25 },
    { name: 'PhD', value: 15 },
    { name: 'Others', value: 15 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316'];

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to HEC Admin Portal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Universities"
            value={stats.totalUniversities}
            subtitle={`${stats.activeUniversities} active`}
            icon={BuildingLibraryIcon}
            color="green"
          />
          <StatCard
            title="HEC Employees"
            value={stats.totalEmployees}
            subtitle={`${stats.activeEmployees} active`}
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Total Degrees"
            value={stats.totalDegrees.toLocaleString()}
            subtitle="Issued & Attested"
            icon={AcademicCapIcon}
            color="purple"
          />
          <StatCard
            title="Pending Verifications"
            value={stats.pendingVerifications}
            subtitle="Awaiting attestation"
            icon={ClockIcon}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Universities by Province */}
          <div className="card">
            <h3 className="card-header">Universities by Province</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="universities" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Degree Types Distribution */}
          <div className="card">
            <h3 className="card-header">Degree Types Distribution</h3>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={degreeTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {degreeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="card-header">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'university' ? 'bg-green-100 text-green-600' :
                  activity.type === 'degree' ? 'bg-purple-100 text-purple-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {activity.type === 'university' ? (
                    <BuildingLibraryIcon className="w-5 h-5" />
                  ) : activity.type === 'degree' ? (
                    <AcademicCapIcon className="w-5 h-5" />
                  ) : (
                    <UsersIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-header">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Add University"
              description="Register a new university in the system"
              href="/hec/universities"
              icon={BuildingLibraryIcon}
            />
            <QuickActionCard
              title="Add Employee"
              description="Add new HEC staff member"
              href="/hec/employees"
              icon={UsersIcon}
            />
            <QuickActionCard
              title="Attest Degrees"
              description="Review and attest pending degrees"
              href="/hec/degrees"
              icon={CheckCircleIcon}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-hec-green-100 text-hec-green-600',
    blue: 'bg-blue-100 text-blue-600',
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
      <div className="p-3 bg-hec-green-100 text-hec-green-600 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
};

export default HECDashboard;
