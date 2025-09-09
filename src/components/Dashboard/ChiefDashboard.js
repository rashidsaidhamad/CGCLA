import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ChiefOverview from './ChiefOverview';
import MonthlyStockReport from './MonthlyStockReport';

const ChiefDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: '📊', 
      path: '/chief',
      description: 'Monthly reports summary'
    },
    { 
      id: 'stock-reports', 
      name: 'Stock Reports', 
      icon: '📈', 
      path: '/chief/stock-reports',
      description: 'Monthly stock issued and available'
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center">
              <img
                src="/cgcla.jpg"
                alt="CGCLA Logo"
                className="h-8 w-auto mr-3"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-lg font-bold text-blue-900">CGCLA</h2>
                <p className="text-xs text-blue-600">Chief Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                <span className={`text-xl ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Chief Info */}
        {sidebarOpen && (
          <div className="border-t border-gray-200 p-4">
            <div className="bg-purple-50 rounded-lg p-3 mb-3">
              <h4 className="text-sm font-medium text-purple-900">
                Chief Executive
              </h4>
              <p className="text-xs text-purple-600">
                Stock & Operations
              </p>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Chief Executive'}
                </p>
                <p className="text-xs text-gray-600">Chief Officer</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`${sidebarOpen ? 'ml-2' : 'mx-auto'} p-2 text-gray-400 hover:text-gray-600 transition-colors`}
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
                {menuItems.find(item => item.path === location.pathname)?.name || 'Chief Portal'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                CGCLA Warehouse Management - Executive Overview
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
              <Route path="/" element={<ChiefOverview user={user} />} />
              <Route path="/stock-reports" element={<MonthlyStockReport user={user} />} />
              <Route path="*" element={<Navigate to="/chief" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChiefDashboard;
