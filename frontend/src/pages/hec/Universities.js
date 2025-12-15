import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { universityApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const HECUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'PUBLIC',
    charter: '',
    street: '',
    city: '',
    province: '',
    email: '',
    phone: '',
    website: '',
    hecRanking: '',
    establishedYear: '',
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      // Mock data for demo
      const mockData = [
        {
          id: 'UNI_0001',
          name: 'University of the Punjab',
          code: 'PU',
          type: 'PUBLIC',
          charter: 'Punjab Government',
          address: { city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
          contact: { email: 'info@pu.edu.pk', phone: '+92-42-99231105', website: 'www.pu.edu.pk' },
          hecRanking: 'W4',
          establishedYear: 1882,
          status: 'ACTIVE',
        },
        {
          id: 'UNI_0002',
          name: 'Quaid-i-Azam University',
          code: 'QAU',
          type: 'PUBLIC',
          charter: 'Federal Government',
          address: { city: 'Islamabad', province: 'ICT', country: 'Pakistan' },
          contact: { email: 'info@qau.edu.pk', phone: '+92-51-9064000', website: 'www.qau.edu.pk' },
          hecRanking: 'W4',
          establishedYear: 1967,
          status: 'ACTIVE',
        },
        {
          id: 'UNI_0003',
          name: 'COMSATS University Islamabad',
          code: 'CUI',
          type: 'PUBLIC',
          charter: 'Federal Government',
          address: { city: 'Islamabad', province: 'ICT', country: 'Pakistan' },
          contact: { email: 'info@comsats.edu.pk', phone: '+92-51-9049802', website: 'www.comsats.edu.pk' },
          hecRanking: 'W4',
          establishedYear: 1998,
          status: 'ACTIVE',
        },
        {
          id: 'UNI_0004',
          name: 'NUST',
          code: 'NUST',
          type: 'PUBLIC',
          charter: 'Federal Government',
          address: { city: 'Islamabad', province: 'ICT', country: 'Pakistan' },
          contact: { email: 'info@nust.edu.pk', phone: '+92-51-9085100', website: 'www.nust.edu.pk' },
          hecRanking: 'W3',
          establishedYear: 1991,
          status: 'ACTIVE',
        },
        {
          id: 'UNI_0005',
          name: 'LUMS',
          code: 'LUMS',
          type: 'PRIVATE',
          charter: 'Private',
          address: { city: 'Lahore', province: 'Punjab', country: 'Pakistan' },
          contact: { email: 'info@lums.edu.pk', phone: '+92-42-35608000', website: 'www.lums.edu.pk' },
          hecRanking: 'W3',
          establishedYear: 1985,
          status: 'ACTIVE',
        },
      ];
      setUniversities(mockData);
    } catch (error) {
      toast.error('Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      const newUniversity = {
        id: `UNI_${String(universities.length + 1).padStart(4, '0')}`,
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          province: formData.province,
          country: 'Pakistan',
        },
        contact: {
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
        },
        status: 'ACTIVE',
      };
      
      setUniversities([...universities, newUniversity]);
      toast.success('University registered successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to register university');
    }
  };

  const handleUpdateUniversity = async (e) => {
    e.preventDefault();
    try {
      const updatedUniversities = universities.map((uni) =>
        uni.id === selectedUniversity.id
          ? {
              ...uni,
              ...formData,
              address: {
                street: formData.street,
                city: formData.city,
                province: formData.province,
                country: 'Pakistan',
              },
              contact: {
                email: formData.email,
                phone: formData.phone,
                website: formData.website,
              },
            }
          : uni
      );
      
      setUniversities(updatedUniversities);
      toast.success('University updated successfully');
      setShowEditModal(false);
      setSelectedUniversity(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update university');
    }
  };

  const handleSuspendUniversity = async (university) => {
    if (window.confirm(`Are you sure you want to suspend ${university.name}?`)) {
      try {
        const updatedUniversities = universities.map((uni) =>
          uni.id === university.id ? { ...uni, status: 'SUSPENDED' } : uni
        );
        setUniversities(updatedUniversities);
        toast.success('University suspended');
      } catch (error) {
        toast.error('Failed to suspend university');
      }
    }
  };

  const handleReactivateUniversity = async (university) => {
    try {
      const updatedUniversities = universities.map((uni) =>
        uni.id === university.id ? { ...uni, status: 'ACTIVE' } : uni
      );
      setUniversities(updatedUniversities);
      toast.success('University reactivated');
    } catch (error) {
      toast.error('Failed to reactivate university');
    }
  };

  const openEditModal = (university) => {
    setSelectedUniversity(university);
    setFormData({
      name: university.name,
      code: university.code,
      type: university.type,
      charter: university.charter,
      street: university.address?.street || '',
      city: university.address?.city || '',
      province: university.address?.province || '',
      email: university.contact?.email || '',
      phone: university.contact?.phone || '',
      website: university.contact?.website || '',
      hecRanking: university.hecRanking || '',
      establishedYear: university.establishedYear || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'PUBLIC',
      charter: '',
      street: '',
      city: '',
      province: '',
      email: '',
      phone: '',
      website: '',
      hecRanking: '',
      establishedYear: '',
    });
  };

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = !filterProvince || uni.address?.province === filterProvince;
    const matchesType = !filterType || uni.type === filterType;
    return matchesSearch && matchesProvince && matchesType;
  });

  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT'];

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
            <p className="text-gray-600">Manage registered universities</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add University
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="form-input"
            >
              <option value="">All Provinces</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="SEMI-GOVERNMENT">Semi-Government</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredUniversities.length} of {universities.length} universities
            </div>
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university) => (
            <div key={university.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-hec-green-100 rounded-lg flex items-center justify-center">
                    <BuildingLibraryIcon className="w-6 h-6 text-hec-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{university.name}</h3>
                    <p className="text-sm text-gray-500">{university.code}</p>
                  </div>
                </div>
                <span className={`badge ${
                  university.status === 'ACTIVE' ? 'badge-success' : 'badge-error'
                }`}>
                  {university.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span>{university.address?.city}, {university.address?.province}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span>{university.contact?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>{university.contact?.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="badge badge-info">{university.type}</span>
                  {university.hecRanking && (
                    <span className="badge badge-gray">{university.hecRanking}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(university)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {university.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleSuspendUniversity(university)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Suspend"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivateUniversity(university)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Reactivate"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add University Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          title="Register New University"
          size="lg"
        >
          <UniversityForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddUniversity}
            onCancel={() => { setShowAddModal(false); resetForm(); }}
            submitText="Register University"
          />
        </Modal>

        {/* Edit University Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedUniversity(null); resetForm(); }}
          title="Edit University"
          size="lg"
        >
          <UniversityForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateUniversity}
            onCancel={() => { setShowEditModal(false); setSelectedUniversity(null); resetForm(); }}
            submitText="Update University"
          />
        </Modal>
      </div>
    </Layout>
  );
};

const UniversityForm = ({ formData, setFormData, onSubmit, onCancel, submitText }) => {
  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT'];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="form-label">University Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Code *</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="form-input"
            placeholder="e.g., PU, QAU"
            required
          />
        </div>
        <div>
          <label className="form-label">Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="form-input"
            required
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="SEMI-GOVERNMENT">Semi-Government</option>
          </select>
        </div>
        <div>
          <label className="form-label">Charter *</label>
          <input
            type="text"
            value={formData.charter}
            onChange={(e) => setFormData({ ...formData, charter: e.target.value })}
            className="form-input"
            placeholder="e.g., Punjab Government"
            required
          />
        </div>
        <div>
          <label className="form-label">Established Year *</label>
          <input
            type="number"
            value={formData.establishedYear}
            onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
            className="form-input"
            min="1800"
            max={new Date().getFullYear()}
            required
          />
        </div>
        <div>
          <label className="form-label">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Province *</label>
          <select
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="form-input"
            required
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Phone *</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Website</label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="form-input"
            placeholder="www.university.edu.pk"
          />
        </div>
        <div>
          <label className="form-label">HEC Ranking</label>
          <select
            value={formData.hecRanking}
            onChange={(e) => setFormData({ ...formData, hecRanking: e.target.value })}
            className="form-input"
          >
            <option value="">Select Ranking</option>
            <option value="W1">W1</option>
            <option value="W2">W2</option>
            <option value="W3">W3</option>
            <option value="W4">W4</option>
            <option value="X">X</option>
            <option value="Y">Y</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default HECUniversities;
