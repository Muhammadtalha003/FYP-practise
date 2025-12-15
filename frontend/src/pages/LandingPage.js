import React from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-hec-green-600 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HEC University System</h1>
                <p className="text-xs text-gray-500">Blockchain-Powered Verification</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                to="/verify"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Verify Degree
              </Link>
              <Link
                to="/hec/login"
                className="px-4 py-2 text-sm font-medium text-white bg-hec-green-600 rounded-lg hover:bg-hec-green-700 transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Degree Verification with
            <span className="text-hec-green-600"> Blockchain</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            A transparent and tamper-proof system for managing universities, issuing degrees,
            and verifying academic credentials across Pakistan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/hec/login"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-hec-green-600 rounded-lg hover:bg-hec-green-700 transition-colors"
            >
              HEC Admin Portal
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/university/login"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors"
            >
              University Portal
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            System Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={BuildingLibraryIcon}
              title="University Management"
              description="HEC can add, manage, and monitor all recognized universities in Pakistan."
              color="green"
            />
            <FeatureCard
              icon={AcademicCapIcon}
              title="Degree Issuance"
              description="Universities can issue degrees with full audit trail and verification."
              color="blue"
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="HEC Attestation"
              description="Official HEC attestation for degrees with blockchain verification."
              color="purple"
            />
            <FeatureCard
              icon={DocumentCheckIcon}
              title="Public Verification"
              description="Anyone can verify the authenticity of degrees using our public portal."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="University Registers"
              description="HEC registers and verifies universities on the blockchain network."
            />
            <StepCard
              number="2"
              title="Degree Issuance"
              description="Universities issue degrees which are recorded on the immutable ledger."
            />
            <StepCard
              number="3"
              title="Verification"
              description="Employers and institutions can instantly verify degree authenticity."
            />
          </div>
        </div>
      </section>

      {/* Verify CTA */}
      <section className="py-16 px-4 bg-hec-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Need to Verify a Degree?
          </h3>
          <p className="text-hec-green-100 mb-8">
            Use our public verification portal to instantly check the authenticity of any degree.
          </p>
          <Link
            to="/verify"
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-hec-green-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            Verify Now
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-hec-green-600 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">HEC System</span>
              </div>
              <p className="text-sm">
                Blockchain-powered university and degree management system for Pakistan.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/hec/login" className="hover:text-white">HEC Login</Link></li>
                <li><Link to="/university/login" className="hover:text-white">University Login</Link></li>
                <li><Link to="/verify" className="hover:text-white">Verify Degree</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Higher Education Commission</li>
                <li>Sector H-9, Islamabad</li>
                <li>info@hec.gov.pk</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm">
                <li>Hyperledger Fabric</li>
                <li>Node.js</li>
                <li>React.js</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 HEC University Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    green: 'bg-hec-green-100 text-hec-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const StepCard = ({ number, title, description }) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-hec-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;
