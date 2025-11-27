import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import SystemSettings from './SystemSettings';
import '../../styles/sidebar-animations.css';

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
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-500 ease-in-out flex flex-col relative overflow-hidden fixed lg:static inset-y-0 left-0 z-50 ${isSidebarCollapsed && 'hidden lg:flex'}`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
        }}></div>
        
        {/* Logo/Header */}
        <div className="relative p-6 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-red-400/30">
              <span className="drop-shadow-sm">A</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-4 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-xl font-bold text-white drop-shadow-sm">Admin Panel</h1>
                <p className="text-sm text-slate-300">CGCLA System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 py-6 overflow-y-auto sidebar-nav">
          <ul className="space-y-1 px-4">
            {menuItems.map((item, index) => (
              <li key={item.path} className="opacity-0 animate-slideIn sidebar-menu-item" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <Link
                  to={item.path}
                  className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActivePath(item.path)
                      ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-white shadow-lg ring-1 ring-red-500/30 backdrop-blur-sm border-l-4 border-red-500'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white hover:shadow-md backdrop-blur-sm'
                  }`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <span className={`text-xl transition-all duration-300 ${
                    isActivePath(item.path) ? 'text-red-300 drop-shadow-glow' : 'group-hover:text-blue-300'
                  }`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="ml-4 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActivePath(item.path) && !isSidebarCollapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Actions */}
        <div className="relative border-t border-slate-700/50 p-4 backdrop-blur-sm">
          {!isSidebarCollapsed && (
            <div className="mb-4 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-600/30 hover:ring-slate-500/50 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-blue-400/30">
                  <span className="drop-shadow-sm">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 
                     user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name && user?.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 'Administrator'}
                  </p>
                  <p className="text-xs text-slate-300 truncate">
                    {user?.role?.name || 'System Administrator'}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex-1 p-3 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ring-1 ring-slate-600/30 hover:ring-slate-500/50"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className="flex-1 p-3 text-slate-300 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ring-1 ring-slate-600/30 hover:ring-red-500/50"
              title="Logout"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1 ml-4 lg:ml-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {menuItems.find(item => isActivePath(item.path))?.name || 'Administrator Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden md:block">
                CGCLA System Administration - Manage Users, Departments & Roles
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden xl:flex items-center text-xs sm:text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden 2xl:inline">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="2xl:hidden">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 hidden md:block truncate max-w-32">
                  {user?.name || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4 md:p-6">
            <Routes>
              <Route path="/users" element={<UserManagement user={user} />} />
              <Route path="/departments" element={<DepartmentManagement user={user} />} />
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
