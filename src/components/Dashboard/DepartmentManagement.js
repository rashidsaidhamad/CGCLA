import React, { useState, useEffect } from 'react';

// Modal Component outside main component to prevent re-creation on each render
const DepartmentModal = ({ 
  showAddModal, 
  editingDepartment, 
  newDepartment, 
  setNewDepartment, 
  resetForm, 
  handleAddDepartment, 
  handleUpdateDepartment 
}) => {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingDepartment ? handleUpdateDepartment() : handleAddDepartment();
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter department name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter department description"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {editingDepartment ? 'Update Department' : 'Add Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DepartmentManagement = ({ user }) => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsPerPage] = useState(8);

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/auth/departments/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDepartments(data.results || data);
      setError(null);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users to count department members
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/users/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.results || data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastDept = currentPage * departmentsPerPage;
  const indexOfFirstDept = indexOfLastDept - departmentsPerPage;
  const currentDepartments = filteredDepartments.slice(indexOfFirstDept, indexOfLastDept);
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  // Get department member count
  const getDepartmentMemberCount = (departmentId) => {
    return users.filter(user => user.department?.id === departmentId).length;
  };

  // CRUD Operations
  const handleAddDepartment = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/departments/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          name: newDepartment.name,
          description: newDepartment.description 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Object.values(errorData).flat().join(', '));
      }

      await fetchDepartments();
      resetForm();
      alert('Department created successfully!');
    } catch (error) {
      console.error('Error creating department:', error);
      alert(`Error creating department: ${error.message}`);
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/departments/${editingDepartment.id}/update/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: newDepartment.name, description: newDepartment.description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Object.values(errorData).flat().join(', '));
      }

      await fetchDepartments();
      resetForm();
      alert('Department updated successfully!');
    } catch (error) {
      console.error('Error updating department:', error);
      alert(`Error updating department: ${error.message}`);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/departments/${departmentId}/delete/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchDepartments();
      alert('Department deleted successfully!');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert(`Error deleting department: ${error.message}`);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewDepartment({ name: '', description: '' });
    setEditingDepartment(null);
    setShowAddModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Department Management</h1>
            <p className="text-blue-100 text-lg">
              Organize and manage your company departments
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{departments.length}</div>
              <div className="text-blue-100">Total Departments</div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search departments by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDepartments.map((department) => (
              <div key={department.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Department"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Department"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{department.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    {getDepartmentMemberCount(department.id)} member{getDepartmentMemberCount(department.id) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstDept + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastDept, filteredDepartments.length)}</span> of{' '}
                  <span className="font-medium">{filteredDepartments.length}</span> departments
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* Modal */}
      <DepartmentModal 
        showAddModal={showAddModal}
        editingDepartment={editingDepartment}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
        resetForm={resetForm}
        handleAddDepartment={handleAddDepartment}
        handleUpdateDepartment={handleUpdateDepartment}
      />
    </div>
  );
};

export default DepartmentManagement;