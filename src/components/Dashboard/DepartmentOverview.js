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

  const [availableItems, setAvailableItems] = useState([]);

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

    // Mock available stock items data
    setAvailableItems([
      { 
        id: 'ITEM-001', 
        name: 'Laboratory Gloves',
        category: 'Safety Equipment',
        availability: 'In Stock',
        lastUpdated: '2025-09-01'
      },
      { 
        id: 'ITEM-002', 
        name: 'Test Tubes (50ml)',
        category: 'Glassware',
        availability: 'In Stock',
        lastUpdated: '2025-09-02'
      },
      { 
        id: 'ITEM-003', 
        name: 'Safety Goggles',
        category: 'Safety Equipment',
        availability: 'In Stock',
        lastUpdated: '2025-09-01'
      },
      { 
        id: 'ITEM-004', 
        name: 'pH Test Strips',
        category: 'Testing Materials',
        availability: 'In Stock',
        lastUpdated: '2025-09-03'
      },
      { 
        id: 'ITEM-005', 
        name: 'Beakers (250ml)',
        category: 'Glassware',
        availability: 'In Stock',
        lastUpdated: '2025-09-02'
      },
      { 
        id: 'ITEM-006', 
        name: 'Pipettes',
        category: 'Laboratory Tools',
        availability: 'In Stock',
        lastUpdated: '2025-09-01'
      },
      { 
        id: 'ITEM-007', 
        name: 'Measuring Cylinders',
        category: 'Glassware',
        availability: 'In Stock',
        lastUpdated: '2025-09-03'
      },
      { 
        id: 'ITEM-008', 
        name: 'Lab Coats',
        category: 'Safety Equipment',
        availability: 'In Stock',
        lastUpdated: '2025-09-02'
      },
      { 
        id: 'ITEM-009', 
        name: 'Burette Clamps',
        category: 'Laboratory Tools',
        availability: 'In Stock',
        lastUpdated: '2025-09-01'
      },
      { 
        id: 'ITEM-010', 
        name: 'Thermometers',
        category: 'Instruments',
        availability: 'In Stock',
        lastUpdated: '2025-09-03'
      }
    ]);
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

      {/* Available Stock Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Available Stock Items</h3>
              <p className="text-sm text-gray-600 mt-1">Items currently available in warehouse</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {availableItems.length} Items Available
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableItems.map((item) => (
              <div 
                key={item.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h4>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                    ✓ Available
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {availableItems.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Available</h3>
              <p className="text-gray-600">Check back later or contact the warehouse manager.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        {/* Recent Requests */}

      </div>

      {/* Department Info & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        {/* Request Guidelines */}
        {/* System Status */}
      </div>
    </div>
  );
};

export default DepartmentOverview;
