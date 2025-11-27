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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed lg:static inset-y-0 left-0 z-50 ${!sidebarOpen && 'hidden lg:flex'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center">
              <img
                src="/cgcla.jpg"
                alt="CGCLA Logo"
                className="h-6 sm:h-8 w-auto mr-2 sm:mr-3"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-blue-900">CGCLA</h2>
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
        <nav className="flex-1 px-2 py-3 sm:py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                <span className={`text-lg sm:text-xl ${sidebarOpen ? 'mr-2 sm:mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Chief Info */}
        {sidebarOpen && (
          <div className="border-t border-gray-200 p-3 sm:p-4">
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 mb-3">
              <h4 className="text-xs sm:text-sm font-medium text-purple-900">
                Chief Executive
              </h4>
              <p className="text-xs text-purple-600">
                Stock & Operations
              </p>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 
                   user?.username ? user.username.charAt(0).toUpperCase() : 'C'}
                </span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'Chief Executive'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.role?.name || 'Chief Officer'}
                </p>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`${sidebarOpen ? 'ml-2' : 'mx-auto'} p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors`}
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-1 ml-4 lg:ml-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Chief Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden md:block">
                CGCLA Warehouse Management - Executive Overview
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
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 hidden sm:inline">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4 md:p-6">
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
