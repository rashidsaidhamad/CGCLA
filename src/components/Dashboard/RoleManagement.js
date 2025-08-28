import React, { useState, useEffect } from 'react';

const RoleManagement = ({ user }) => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
    color: 'blue',
    status: 'active'
  });

  useEffect(() => {
    // Mock permissions data
    setPermissions([
      { id: 'user_view', name: 'View Users', category: 'User Management' },
      { id: 'user_create', name: 'Create Users', category: 'User Management' },
      { id: 'user_edit', name: 'Edit Users', category: 'User Management' },
      { id: 'user_delete', name: 'Delete Users', category: 'User Management' },
      { id: 'dept_view', name: 'View Departments', category: 'Department Management' },
      { id: 'dept_create', name: 'Create Departments', category: 'Department Management' },
      { id: 'dept_edit', name: 'Edit Departments', category: 'Department Management' },
      { id: 'dept_delete', name: 'Delete Departments', category: 'Department Management' },
      { id: 'inventory_view', name: 'View Inventory', category: 'Inventory Management' },
      { id: 'inventory_edit', name: 'Edit Inventory', category: 'Inventory Management' },
      { id: 'inventory_add', name: 'Add Inventory Items', category: 'Inventory Management' },
      { id: 'inventory_remove', name: 'Remove Inventory Items', category: 'Inventory Management' },
      { id: 'request_view', name: 'View Requests', category: 'Request Management' },
      { id: 'request_create', name: 'Create Requests', category: 'Request Management' },
      { id: 'request_approve', name: 'Approve Requests', category: 'Request Management' },
      { id: 'request_reject', name: 'Reject Requests', category: 'Request Management' },
      { id: 'reports_view', name: 'View Reports', category: 'Reports & Analytics' },
      { id: 'reports_export', name: 'Export Reports', category: 'Reports & Analytics' },
      { id: 'system_settings', name: 'System Settings', category: 'System Administration' },
      { id: 'role_management', name: 'Role Management', category: 'System Administration' }
    ]);

    // Mock roles data
    setRoles([
      {
        id: 1,
        name: 'System Administrator',
        description: 'Full system access with all permissions',
        permissions: ['user_view', 'user_create', 'user_edit', 'user_delete', 'dept_view', 'dept_create', 'dept_edit', 'dept_delete', 'inventory_view', 'inventory_edit', 'inventory_add', 'inventory_remove', 'request_view', 'request_create', 'request_approve', 'request_reject', 'reports_view', 'reports_export', 'system_settings', 'role_management'],
        color: 'red',
        status: 'active',
        userCount: 2,
        createdAt: '2025-01-01'
      },
      {
        id: 2,
        name: 'Warehouse Manager',
        description: 'Manages warehouse operations and inventory',
        permissions: ['user_view', 'inventory_view', 'inventory_edit', 'inventory_add', 'inventory_remove', 'request_view', 'request_approve', 'request_reject', 'reports_view'],
        color: 'blue',
        status: 'active',
        userCount: 3,
        createdAt: '2025-01-05'
      },
      {
        id: 3,
        name: 'Warehouse Employee',
        description: 'Basic warehouse operations access',
        permissions: ['inventory_view', 'request_view', 'request_create'],
        color: 'green',
        status: 'active',
        userCount: 8,
        createdAt: '2025-01-10'
      },
      {
        id: 4,
        name: 'Department Manager',
        description: 'Manages department operations and users',
        permissions: ['user_view', 'dept_view', 'inventory_view', 'request_view', 'request_create', 'request_approve', 'reports_view'],
        color: 'purple',
        status: 'active',
        userCount: 5,
        createdAt: '2025-01-15'
      },
      {
        id: 5,
        name: 'Department User',
        description: 'Basic department user with request capabilities',
        permissions: ['inventory_view', 'request_view', 'request_create'],
        color: 'gray',
        status: 'active',
        userCount: 25,
        createdAt: '2025-01-20'
      },
      {
        id: 6,
        name: 'Guest',
        description: 'Limited read-only access',
        permissions: ['inventory_view'],
        color: 'yellow',
        status: 'inactive',
        userCount: 0,
        createdAt: '2025-02-01'
      }
    ]);
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((groups, permission) => {
    const category = permission.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});

  const handleAddRole = () => {
    const id = Math.max(...roles.map(r => r.id)) + 1;
    const roleToAdd = {
      ...newRole,
      id,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRoles([...roles, roleToAdd]);
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      color: 'blue',
      status: 'active'
    });
    setShowAddModal(false);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRole(role);
    setShowAddModal(true);
  };

  const handleUpdateRole = () => {
    setRoles(roles.map(r => r.id === editingRole.id ? newRole : r));
    setEditingRole(null);
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      color: 'blue',
      status: 'active'
    });
    setShowAddModal(false);
  };

  const handleDeleteRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role.userCount > 0) {
      alert('Cannot delete role with assigned users. Please reassign users first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handlePermissionChange = (permissionId) => {
    const updatedPermissions = newRole.permissions.includes(permissionId)
      ? newRole.permissions.filter(p => p !== permissionId)
      : [...newRole.permissions, permissionId];
    setNewRole({...newRole, permissions: updatedPermissions});
  };

  const getColorClass = (color) => {
    const colorMap = {
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const RoleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h3>
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingRole(null);
                setNewRole({
                  name: '',
                  description: '',
                  permissions: [],
                  color: 'blue',
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter role description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={newRole.color}
                    onChange={(e) => setNewRole({...newRole, color: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newRole.status}
                    onChange={(e) => setNewRole({...newRole, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="border border-gray-200 rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">{category}</h5>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingRole(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingRole ? handleUpdateRole : handleAddRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingRole ? 'Update Role' : 'Add Role'}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Management</h2>
            <p className="text-gray-600">
              Manage user roles and permissions for access control.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Role
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">🔑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Users Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.reduce((sum, r) => sum + r.userCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Roles</label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClass(role.color)}`}>
                  {role.name}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(role.status)}`}>
                  {role.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Users:</span>
                  <span className="text-gray-900 font-medium">{role.userCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Permissions:</span>
                  <span className="text-gray-900">{role.permissions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{role.createdAt}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Key Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map(permId => {
                    const perm = permissions.find(p => p.id === permId);
                    return perm ? (
                      <span key={permId} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {perm.name}
                      </span>
                    ) : null;
                  })}
                  {role.permissions.length > 3 && (
                    <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditRole(role)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 transition-colors"
                  disabled={role.userCount > 0}
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
        Showing {filteredRoles.length} of {roles.length} roles
      </div>

      {/* Modal */}
      {showAddModal && <RoleModal />}
    </div>
  );
};

export default RoleManagement;
