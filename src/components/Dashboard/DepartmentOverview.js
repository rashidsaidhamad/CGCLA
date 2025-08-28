import React, { useState, useEffect } from 'react';

const DepartmentOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    recentRequests: [],
    quickStats: {}
  });

  useEffect(() => {
    // Mock data for demonstration
    setStats({
      totalRequests: 28,
      pendingRequests: 5,
      approvedRequests: 18,
      rejectedRequests: 5,
      recentRequests: [
        { 
          id: 'REQ-001', 
          item: 'Laboratory Gloves', 
          quantity: 100, 
          status: 'Approved', 
          date: '2025-08-27',
          urgency: 'High'
        },
        { 
          id: 'REQ-002', 
          item: 'Test Tubes (50ml)', 
          quantity: 50, 
          status: 'Pending', 
          date: '2025-08-26',
          urgency: 'Medium'
        },
        { 
          id: 'REQ-003', 
          item: 'Safety Goggles', 
          quantity: 20, 
          status: 'Processing', 
          date: '2025-08-25',
          urgency: 'Low'
        },
        { 
          id: 'REQ-004', 
          item: 'pH Test Strips', 
          quantity: 200, 
          status: 'Delivered', 
          date: '2025-08-24',
          urgency: 'High'
        }
      ],
      quickStats: {
        thisMonth: 12,
        avgResponseTime: '2.5 days',
        successRate: '85%'
      }
    });
  }, []);

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value} from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {user?.name || 'Department User'}!
        </h2>
        <p className="text-blue-100">
          Department: {user?.department || 'Chemistry Lab'} | 
          Manage your laboratory item requests efficiently
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon="📋"
          color="bg-blue-100"
          subtitle="All time"
          trend={{ positive: true, value: '15%' }}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingRequests}
          icon="⏳"
          color="bg-yellow-100"
          subtitle="Awaiting response"
          trend={{ positive: false, value: '5%' }}
        />
        <StatCard
          title="Approved Requests"
          value={stats.approvedRequests}
          icon="✅"
          color="bg-green-100"
          subtitle="Ready for pickup"
          trend={{ positive: true, value: '20%' }}
        />
        <StatCard
          title="This Month"
          value={stats.quickStats.thisMonth}
          icon="📅"
          color="bg-purple-100"
          subtitle={`Avg: ${stats.quickStats.avgResponseTime}`}
          trend={{ positive: true, value: '8%' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</span>
              <span className="text-sm font-medium text-gray-700">New Request</span>
              <span className="text-xs text-gray-500">Create item request</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
              <span className="text-sm font-medium text-gray-700">My Requests</span>
              <span className="text-xs text-gray-500">Track status</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</span>
              <span className="text-sm font-medium text-gray-700">Browse Items</span>
              <span className="text-xs text-gray-500">Available inventory</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</span>
              <span className="text-sm font-medium text-gray-700">Request History</span>
              <span className="text-xs text-gray-500">View reports</span>
            </button>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{request.item}</span>
                    <span className={`text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{request.id}</span>
                    <span className="mx-2">•</span>
                    <span>Qty: {request.quantity}</span>
                    <span className="mx-2">•</span>
                    <span>{request.date}</span>
                  </div>
                </div>
                <span className={`ml-4 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Info & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-green-600">{stats.quickStats.successRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-sm font-semibold text-blue-600">{stats.quickStats.avgResponseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Requests This Month</span>
              <span className="text-sm font-semibold text-purple-600">{stats.quickStats.thisMonth}</span>
            </div>
          </div>
        </div>

        {/* Request Guidelines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Guidelines</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-sm text-gray-600">Submit requests 3-5 days in advance</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-sm text-gray-600">Provide accurate quantity estimates</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-sm text-gray-600">Include justification for urgent requests</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-sm text-gray-600">Check inventory before requesting</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Request System</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Warehouse</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Available</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval System</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-yellow-600">Busy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOverview;
