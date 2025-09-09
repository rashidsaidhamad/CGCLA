import React, { useState, useEffect } from 'react';

const ChiefOverview = ({ user }) => {
  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());
  
  // Mock data for monthly overview
  const monthlyData = {
    totalStockValue: 2500000,
    itemsIssued: 1250,
    availableItems: 8750,
    departments: 12,
    topIssuedItems: [
      { name: 'Laboratory Gloves', issued: 500, category: 'Safety Equipment' },
      { name: 'Test Tubes', issued: 350, category: 'Laboratory Equipment' },
      { name: 'Safety Goggles', issued: 200, category: 'Safety Equipment' },
      { name: 'Beakers', issued: 180, category: 'Laboratory Equipment' },
      { name: 'Pipettes', issued: 150, category: 'Laboratory Equipment' }
    ],
    monthlyTrend: [
      { month: 'Jan', issued: 980, available: 9020 },
      { month: 'Feb', issued: 1100, available: 8900 },
      { month: 'Mar', issued: 1200, available: 8800 },
      { month: 'Apr', issued: 1150, available: 8850 },
      { month: 'May', issued: 1300, available: 8700 },
      { month: 'Jun', issued: 1180, available: 8820 },
      { month: 'Jul', issued: 1220, available: 8780 },
      { month: 'Aug', issued: 1250, available: 8750 }
    ]
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`text-3xl`}>
          {icon}
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
            <h2 className="text-2xl font-bold text-gray-900">
              Executive Dashboard - {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-gray-600 mt-2">
              Monthly stock overview and performance metrics
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock Value"
          value={`TZS ${monthlyData.totalStockValue.toLocaleString()}`}
          subtitle="Current inventory value"
          icon="💰"
          color="text-green-600"
        />
        <StatCard
          title="Items Issued"
          value={monthlyData.itemsIssued.toLocaleString()}
          subtitle="This month"
          icon="📤"
          color="text-blue-600"
        />
        <StatCard
          title="Available Items"
          value={monthlyData.availableItems.toLocaleString()}
          subtitle="In stock"
          icon="📦"
          color="text-purple-600"
        />
        <StatCard
          title="Active Departments"
          value={monthlyData.departments}
          subtitle="Making requests"
          icon="🏢"
          color="text-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend (2025)</h3>
          <div className="space-y-4">
            {monthlyData.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
                <div className="flex-1 mx-4">
                  <div className="flex h-8 bg-gray-100 rounded overflow-hidden">
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(month.issued / (month.issued + month.available)) * 100}%` }}
                    >
                      {month.issued}
                    </div>
                    <div 
                      className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(month.available / (month.issued + month.available)) * 100}%` }}
                    >
                      {month.available}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {((month.issued / (month.issued + month.available)) * 100).toFixed(1)}% issued
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Issued</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          </div>
        </div>

        {/* Top Issued Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Issued Items This Month</h3>
          <div className="space-y-4">
            {monthlyData.topIssuedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{item.issued}</div>
                  <div className="text-xs text-gray-500">units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">View Detailed Reports</div>
            <div className="text-sm text-gray-500">Access comprehensive stock reports</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">📈</div>
            <div className="font-medium text-gray-900">Export Data</div>
            <div className="text-sm text-gray-500">Download monthly reports</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-2xl mb-2">🔔</div>
            <div className="font-medium text-gray-900">Set Alerts</div>
            <div className="text-sm text-gray-500">Configure stock level alerts</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChiefOverview;
