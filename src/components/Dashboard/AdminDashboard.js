import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import RoleManagement from './RoleManagement';
import SystemSettings from './SystemSettings';

const AdminDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { 
      path: '/admin/users', 
      name: 'User Management', 
      icon: '👥',
      description: 'Manage employees and users'
    },
    { 
      path: '/admin/departments', 
      name: 'Department Management', 
      icon: '🏢',
      description: 'Manage departments and units'
    },
    { 
      path: '/admin/roles', 
      name: 'Role Management', 
      icon: '🔐',
      description: 'Manage user roles and permissions'
    },
    { 
      path: '/admin/settings', 
      name: 'System Settings', 
      icon: '⚙️',
      description: 'System configuration and settings'
    }
  ];

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">CGCLA System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-red-100 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="ml-3">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Actions */}
        <div className="border-t border-gray-200 p-4">
          {!isSidebarCollapsed && (
            <div className="mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 
                   user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user?.role?.name || 'System Administrator'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => isActivePath(item.path))?.name || 'Administrator Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                CGCLA System Administration - Manage Users, Departments & Roles
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-900 hidden md:block">
                  {user?.name || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Routes>
              <Route path="/users" element={<UserManagement user={user} />} />
              <Route path="/departments" element={<DepartmentManagement user={user} />} />
              <Route path="/roles" element={<RoleManagement user={user} />} />
              <Route path="/settings" element={<SystemSettings user={user} />} />
              <Route path="*" element={<Navigate to="/admin/users" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
