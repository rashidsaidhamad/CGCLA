import React, { useState, useEffect } from 'react';

const Overview = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalItems: 0,
    lowStockItems: 0,
    totalRequesters: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Mock data for demonstration
    setStats({
      totalRequests: 145,
      pendingRequests: 23,
      totalItems: 1250,
      lowStockItems: 15,
      totalRequesters: 48,
      recentActivity: [
        { id: 1, action: 'New request from John Doe', time: '2 minutes ago', type: 'request' },
        { id: 2, action: 'Stock updated for Laboratory Gloves', time: '15 minutes ago', type: 'stock' },
        { id: 3, action: 'Request approved for Safety Goggles', time: '1 hour ago', type: 'approval' },
        { id: 4, action: 'New requester registered: Jane Smith', time: '2 hours ago', type: 'user' },
        { id: 5, action: 'Monthly report generated', time: '3 hours ago', type: 'report' }
      ]
    });
  }, []);

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              {change.positive ? '↑' : '↓'} {change.value} from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'request': return '📋';
      case 'stock': return '📦';
      case 'approval': return '✅';
      case 'user': return '👤';
      case 'report': return '📊';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'request': return 'bg-blue-100 text-blue-600';
      case 'stock': return 'bg-green-100 text-green-600';
      case 'approval': return 'bg-purple-100 text-purple-600';
      case 'user': return 'bg-yellow-100 text-yellow-600';
      case 'report': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to CGCLA Warehouse Dashboard</h2>
        <p className="text-blue-100">
          Monitor your warehouse operations, track inventory, and manage requests efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon="📋"
          color="bg-blue-100"
          change={{ positive: true, value: '12%' }}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon="⏳"
          color="bg-yellow-100"
          change={{ positive: false, value: '5%' }}
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon="📦"
          color="bg-green-100"
          change={{ positive: true, value: '8%' }}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          color="bg-red-100"
          change={{ positive: false, value: '3%' }}
        />
        <StatCard
          title="Active Requesters"
          value={stats.totalRequesters}
          icon="👥"
          color="bg-purple-100"
          change={{ positive: true, value: '15%' }}
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium text-gray-700">View Requests</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <span className="text-2xl mb-2">📦</span>
              <span className="text-sm font-medium text-gray-700">Check Stock</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800">Database</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800">API Server</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-yellow-800">Backup System</p>
              <p className="text-xs text-yellow-600">Scheduled</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
