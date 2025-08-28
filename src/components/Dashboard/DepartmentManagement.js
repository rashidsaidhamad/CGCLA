import React, { useState, useEffect } from 'react';

const DepartmentManagement = ({ user }) => {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    contactEmail: '',
    budget: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    // Mock department data
    setDepartments([
      {
        id: 1,
        name: 'Research & Development',
        code: 'RND',
        description: 'Research and development of new products and technologies',
        head: 'Dr. Sarah Johnson',
        contactEmail: 'rnd@cgcla.go.tz',
        budget: 500000,
        location: 'Building A, Floor 3',
        status: 'active',
        userCount: 12,
        createdAt: '2025-01-15'
      },
      {
        id: 2,
        name: 'Chemistry Lab',
        code: 'CHEM',
        description: 'Chemical analysis and testing laboratory',
        head: 'Dr. Michael Chen',
        contactEmail: 'chemistry@cgcla.go.tz',
        budget: 300000,
        location: 'Building B, Floor 1',
        status: 'active',
        userCount: 8,
        createdAt: '2025-01-20'
      },
      {
        id: 3,
        name: 'Quality Control',
        code: 'QC',
        description: 'Quality assurance and control department',
        head: 'Ms. Alice Cooper',
        contactEmail: 'qc@cgcla.go.tz',
        budget: 200000,
        location: 'Building C, Floor 2',
        status: 'active',
        userCount: 6,
        createdAt: '2025-02-01'
      },
      {
        id: 4,
        name: 'Warehouse Operations',
        code: 'WAREHOUSE',
        description: 'Inventory management and warehouse operations',
        head: 'Mr. Michael Brown',
        contactEmail: 'warehouse@cgcla.go.tz',
        budget: 150000,
        location: 'Main Warehouse',
        status: 'active',
        userCount: 5,
        createdAt: '2025-01-10'
      },
      {
        id: 5,
        name: 'Administration',
        code: 'ADMIN',
        description: 'Administrative and support services',
        head: 'Ms. Emma Davis',
        contactEmail: 'admin@cgcla.go.tz',
        budget: 100000,
        location: 'Building A, Floor 1',
        status: 'active',
        userCount: 4,
        createdAt: '2025-01-05'
      },
      {
        id: 6,
        name: 'IT Department',
        code: 'IT',
        description: 'Information technology services and support',
        head: 'Mr. David Wilson',
        contactEmail: 'it@cgcla.go.tz',
        budget: 250000,
        location: 'Building A, Floor 2',
        status: 'active',
        userCount: 3,
        createdAt: '2025-01-12'
      },
      {
        id: 7,
        name: 'Procurement',
        code: 'PROC',
        description: 'Purchasing and procurement department',
        head: 'Ms. Lisa Johnson',
        contactEmail: 'procurement@cgcla.go.tz',
        budget: 80000,
        location: 'Building B, Floor 2',
        status: 'active',
        userCount: 3,
        createdAt: '2025-02-15'
      },
      {
        id: 8,
        name: 'Finance',
        code: 'FIN',
        description: 'Financial management and accounting',
        head: 'Mr. Robert Smith',
        contactEmail: 'finance@cgcla.go.tz',
        budget: 120000,
        location: 'Building A, Floor 1',
        status: 'inactive',
        userCount: 4,
        createdAt: '2025-01-08'
      }
    ]);
  }, []);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = () => {
    const id = Math.max(...departments.map(d => d.id)) + 1;
    const deptToAdd = {
      ...newDepartment,
      id,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDepartments([...departments, deptToAdd]);
    setNewDepartment({
      name: '',
      code: '',
      description: '',
      head: '',
      contactEmail: '',
      budget: '',
      location: '',
      status: 'active'
    });
    setShowAddModal(false);
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment(dept);
    setNewDepartment(dept);
    setShowAddModal(true);
  };

  const handleUpdateDepartment = () => {
    setDepartments(departments.map(d => d.id === editingDepartment.id ? newDepartment : d));
    setEditingDepartment(null);
    setNewDepartment({
      name: '',
      code: '',
      description: '',
      head: '',
      contactEmail: '',
      budget: '',
      location: '',
      status: 'active'
    });
    setShowAddModal(false);
  };

  const handleDeleteDepartment = (deptId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      setDepartments(departments.filter(d => d.id !== deptId));
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const DepartmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingDepartment(null);
                setNewDepartment({
                  name: '',
                  code: '',
                  description: '',
                  head: '',
                  contactEmail: '',
                  budget: '',
                  location: '',
                  status: 'active'
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Code</label>
              <input
                type="text"
                value={newDepartment.code}
                onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value.toUpperCase()})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department code"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
              <input
                type="text"
                value={newDepartment.head}
                onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department head name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={newDepartment.contactEmail}
                onChange={(e) => setNewDepartment({...newDepartment, contactEmail: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Budget ($)</label>
              <input
                type="number"
                value={newDepartment.budget}
                onChange={(e) => setNewDepartment({...newDepartment, budget: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter annual budget"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={newDepartment.location}
                onChange={(e) => setNewDepartment({...newDepartment, location: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter physical location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={newDepartment.status}
                onChange={(e) => setNewDepartment({...newDepartment, status: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingDepartment(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingDepartment ? handleUpdateDepartment : handleAddDepartment}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingDepartment ? 'Update Department' : 'Add Department'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Department Management</h2>
            <p className="text-gray-600">
              Manage organizational departments, their structure, and personnel assignments.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Department
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, d) => sum + d.userCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ${departments.reduce((sum, d) => sum + (parseInt(d.budget) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Departments</label>
          <input
            type="text"
            placeholder="Search by name, code, or head..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {dept.code.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-600">{dept.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dept.status)}`}>
                  {dept.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dept.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Head:</span>
                  <span className="text-gray-900 font-medium">{dept.head}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Employees:</span>
                  <span className="text-gray-900">{dept.userCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget:</span>
                  <span className="text-gray-900">${parseInt(dept.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{dept.location}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditDepartment(dept)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="text-sm text-gray-500">
        Showing {filteredDepartments.length} of {departments.length} departments
      </div>

      {/* Modal */}
      {showAddModal && <DepartmentModal />}
    </div>
  );
};

export default DepartmentManagement;
