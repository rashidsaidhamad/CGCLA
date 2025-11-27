import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import DepartmentOverview from './DepartmentOverview_simple';
import MyRequests from './MyRequests_fixed';
import NewRequest from './NewRequest';
import '../../styles/sidebar-animations.css';

const DepartmentDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { 
      id: 'overview', 
      name: 'OVERVIEW', 
      icon: '📊', 
      path: '/department',
      description: 'Department overview and statistics'
    },
    { 
      id: 'new-request', 
      name: 'NEW REQUEST', 
      icon: '➕', 
      path: '/department/new-request',
      description: 'Create new item requests'
    },
    { 
      id: 'my-requests', 
      name: 'MY REQUESTS', 
      icon: '📋', 
      path: '/department/my-requests',
      description: 'View and track your requests'
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 shadow-2xl transition-all duration-500 ease-in-out flex flex-col relative overflow-hidden`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`
        }}></div>
        
        {/* Sidebar Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-indigo-700/50 backdrop-blur-sm">
          {sidebarOpen && (
            <div className="flex items-center opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/30 mr-4">
                <span className="text-white font-bold text-xl drop-shadow-sm">C</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">CGCLA</h2>
                <p className="text-sm text-indigo-300">Department Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-800/60 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ring-1 ring-indigo-600/30 hover:ring-indigo-500/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 py-6 space-y-1 overflow-y-auto sidebar-nav">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 sidebar-menu-item opacity-0 animate-slideIn ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-600/20 text-white shadow-lg ring-1 ring-blue-500/30 backdrop-blur-sm border-l-4 border-blue-500'
                    : 'text-indigo-300 hover:bg-indigo-800/60 hover:text-white hover:shadow-md backdrop-blur-sm'
                }`}
                title={!sidebarOpen ? item.name : ''}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <span className={`text-xl transition-all duration-300 ${sidebarOpen ? 'mr-4' : 'mx-auto'} ${
                  isActive ? 'text-blue-300 drop-shadow-glow' : 'group-hover:text-cyan-300'
                }`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <div className="flex-1 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <div className="font-bold text-base">{item.name}</div>
                    <div className={`text-xs transition-colors mt-1 ${
                      isActive 
                        ? 'text-indigo-200 font-bold' 
                        : 'text-indigo-400 group-hover:text-indigo-300'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}
                
                {/* Active indicator */}
                {isActive && !sidebarOpen && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                  </div>
                )}
                
                {isActive && sidebarOpen && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-sm"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Department Info */}
        {sidebarOpen && (
          <div className="relative border-t border-indigo-700/50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-4 mb-4 ring-1 ring-blue-500/30 hover:ring-blue-400/50 transition-all duration-300 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m12 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v14m2 0h2m-2 0h-2" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-white drop-shadow-sm">
                  {user?.department?.name || 'Not Assigned'}
                </h4>
              </div>
              {user?.unit?.name && (
                <div className="flex items-center text-xs text-cyan-200 mb-2">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-5 0H3m5 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Unit: {user.unit.name}
                </div>
              )}
              <div className="flex items-center text-xs text-indigo-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Head: {user?.headOfDepartment || 'Not Assigned'}
              </div>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="relative border-t border-indigo-700/50 p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-emerald-400/30">
                <span className="text-white text-sm font-bold drop-shadow-sm">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 
                   user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1 opacity-0 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name && user?.last_name ? 
                    `${user.first_name} ${user.last_name}` : 
                    user?.username || 'Department User'}
                </p>
                <div className="flex items-center text-xs text-indigo-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  Department Staff
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`${sidebarOpen ? 'ml-3' : 'mx-auto'} p-2 text-indigo-300 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ring-1 ring-indigo-600/30 hover:ring-red-500/50`}
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
                {menuItems.find(item => item.path === location.pathname)?.name || 'Department Portal'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.department?.name || 'Not Assigned'} {user?.unit?.name ? `- ${user.unit.name}` : ''} - CGCLA Item Request System
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
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<DepartmentOverview user={user} />} />
              <Route path="/new-request" element={<NewRequest user={user} />} />
              <Route path="/my-requests" element={<MyRequests user={user} />} />
              <Route path="*" element={<Navigate to="/department" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
