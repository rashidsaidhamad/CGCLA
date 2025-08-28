import React, { useState, useEffect } from 'react';

const AdminOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    activeUsers: 0,
    systemHealth: 'excellent'
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Mock data - replace with real API calls
    setStats({
      totalUsers: 45,
      totalDepartments: 8,
      activeUsers: 42,
      systemHealth: 'excellent'
    });

    setRecentActivities([
      {
        id: 1,
        type: 'user_created',
        description: 'New user "John Smith" added to Chemistry Department',
        timestamp: '2025-08-28 09:30:00',
        user: 'admin@cgcla.go.tz'
      },
      {
        id: 2,
        type: 'department_updated',
        description: 'Research & Development department settings updated',
        timestamp: '2025-08-28 08:45:00',
        user: 'admin@cgcla.go.tz'
      },
      {
        id: 3,
        type: 'role_assigned',
        description: 'Department Manager role assigned to Dr. Sarah Johnson',
        timestamp: '2025-08-28 08:15:00',
        user: 'admin@cgcla.go.tz'
      },
      {
        id: 4,
        type: 'user_login',
        description: 'Employee login from Warehouse Operations',
        timestamp: '2025-08-28 07:30:00',
        user: 'employee@cgcla.go.tz'
      },
      {
        id: 5,
        type: 'system_backup',
        description: 'Automated system backup completed successfully',
        timestamp: '2025-08-28 06:00:00',
        user: 'system'
      }
    ]);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_created': return '👤';
      case 'department_updated': return '🏢';
      case 'role_assigned': return '🔐';
      case 'user_login': return '🔑';
      case 'system_backup': return '💾';
      default: return '📋';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Administrator'}!
            </h2>
            <p className="text-gray-600">
              Here's an overview of your CGCLA system. All systems are running smoothly.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl">🎛️</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-green-600">+3 this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-gray-500">Last 24 hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
              <p className="text-sm text-blue-600">All active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className={`text-lg font-bold capitalize px-2 py-1 rounded-full ${getHealthColor(stats.systemHealth)}`}>
                {stats.systemHealth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <span className="text-2xl mr-3">👤</span>
            <div>
              <p className="font-medium text-gray-900">Add New User</p>
              <p className="text-sm text-gray-600">Create employee account</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <span className="text-2xl mr-3">🏢</span>
            <div>
              <p className="font-medium text-gray-900">Add Department</p>
              <p className="text-sm text-gray-600">Create new department</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <span className="text-2xl mr-3">🔐</span>
            <div>
              <p className="font-medium text-gray-900">Manage Roles</p>
              <p className="text-sm text-gray-600">Configure permissions</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">System analytics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activities and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{activity.timestamp}</span>
                    <span className="mx-1">•</span>
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all activities →
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-sm text-green-600">Online</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">API Services</span>
              </div>
              <span className="text-sm text-green-600">Running</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">File Storage</span>
              </div>
              <span className="text-sm text-green-600">Available</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Backup System</span>
              </div>
              <span className="text-sm text-yellow-600">Scheduled</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Email Service</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Server Uptime</span>
              <span className="text-sm text-gray-600">15 days, 7 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">99.9%</div>
            <div className="text-sm text-gray-600 mt-1">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">1.2s</div>
            <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600 mt-1">Requests/Hour</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
