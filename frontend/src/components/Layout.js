import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingLibraryIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout, isHEC } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hecNavigation = [
    { name: 'Dashboard', href: '/hec/dashboard', icon: HomeIcon },
    { name: 'Universities', href: '/hec/universities', icon: BuildingLibraryIcon },
    { name: 'Employees', href: '/hec/employees', icon: UsersIcon },
    { name: 'Degrees', href: '/hec/degrees', icon: AcademicCapIcon },
  ];

  const universityNavigation = [
    { name: 'Dashboard', href: '/university/dashboard', icon: HomeIcon },
    { name: 'Staff', href: '/university/users', icon: UsersIcon },
    { name: 'Degrees', href: '/university/degrees', icon: AcademicCapIcon },
  ];

  const navigation = isHEC ? hecNavigation : universityNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to={isHEC ? '/hec/dashboard' : '/university/dashboard'} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isHEC ? 'bg-hec-green-600' : 'bg-university-blue-600'
            }`}>
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              {isHEC ? 'HEC Portal' : 'University'}
            </span>
          </Link>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isHEC
                      ? 'bg-hec-green-50 text-hec-green-700'
                      : 'bg-university-blue-50 text-university-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${
                  isActive
                    ? isHEC ? 'text-hec-green-600' : 'text-university-blue-600'
                    : 'text-gray-400'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                isHEC
                  ? 'bg-hec-green-100 text-hec-green-800'
                  : 'bg-university-blue-100 text-university-blue-800'
              }`}>
                {isHEC ? 'HEC Admin' : user?.universityName || 'University Portal'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
