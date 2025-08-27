import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    // Mock data for demonstration
    setReportData({
      overview: {
        totalRequests: 145,
        approvedRequests: 98,
        rejectedRequests: 15,
        pendingRequests: 32,
        requestTrend: [
          { month: 'Jan', requests: 45 },
          { month: 'Feb', requests: 52 },
          { month: 'Mar', requests: 48 },
          { month: 'Apr', requests: 61 },
          { month: 'May', requests: 55 },
          { month: 'Jun', requests: 67 }
        ]
      },
      inventory: {
        totalItems: 1250,
        lowStockItems: 15,
        outOfStockItems: 5,
        categories: [
          { name: 'Laboratory Equipment', count: 450, percentage: 36 },
          { name: 'Safety Equipment', count: 320, percentage: 26 },
          { name: 'Chemicals', count: 280, percentage: 22 },
          { name: 'Consumables', count: 200, percentage: 16 }
        ]
      },
      requesters: {
        totalRequesters: 48,
        activeRequesters: 35,
        topRequesters: [
          { name: 'Dr. John Doe', requests: 45, department: 'Chemistry Lab' },
          { name: 'Prof. Mike Johnson', requests: 38, department: 'Physics Lab' },
          { name: 'Dr. Jane Smith', requests: 32, department: 'Biology Lab' },
          { name: 'Dr. Sarah Wilson', requests: 28, department: 'Environmental Lab' }
        ]
      }
    });
  }, [selectedReport, dateRange]);

  const reportTypes = [
    { id: 'overview', name: 'Overview Report', icon: '📊', description: 'General system overview and statistics' },
    { id: 'inventory', name: 'Inventory Report', icon: '📦', description: 'Stock levels and inventory analysis' },
    { id: 'requesters', name: 'Requesters Report', icon: '👥', description: 'Requester activity and statistics' },
    { id: 'requests', name: 'Requests Report', icon: '📋', description: 'Request trends and analysis' }
  ];

  const generateReport = () => {
    alert(`Generating ${reportTypes.find(r => r.id === selectedReport)?.name} for ${dateRange}`);
  };

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}`);
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={reportData.overview?.totalRequests || 0}
          icon="📋"
          color="bg-blue-100"
          change={12}
        />
        <StatCard
          title="Approved"
          value={reportData.overview?.approvedRequests || 0}
          icon="✅"
          color="bg-green-100"
          change={8}
        />
        <StatCard
          title="Rejected"
          value={reportData.overview?.rejectedRequests || 0}
          icon="❌"
          color="bg-red-100"
          change={-5}
        />
        <StatCard
          title="Pending"
          value={reportData.overview?.pendingRequests || 0}
          icon="⏳"
          color="bg-yellow-100"
          change={3}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Trends</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {reportData.overview?.requestTrend?.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 rounded-t w-full"
                style={{ height: `${(item.requests / 70) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
              <span className="text-xs font-medium text-gray-900">{item.requests}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={reportData.inventory?.totalItems || 0}
          icon="📦"
          color="bg-blue-100"
          change={5}
        />
        <StatCard
          title="Low Stock"
          value={reportData.inventory?.lowStockItems || 0}
          icon="⚠️"
          color="bg-yellow-100"
          change={-10}
        />
        <StatCard
          title="Out of Stock"
          value={reportData.inventory?.outOfStockItems || 0}
          icon="🚫"
          color="bg-red-100"
          change={-25}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
        <div className="space-y-4">
          {reportData.inventory?.categories?.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count} items</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-sm font-medium text-gray-900">{category.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequestersReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Requesters"
          value={reportData.requesters?.totalRequesters || 0}
          icon="👥"
          color="bg-purple-100"
          change={15}
        />
        <StatCard
          title="Active Requesters"
          value={reportData.requesters?.activeRequesters || 0}
          icon="✅"
          color="bg-green-100"
          change={8}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Requesters</h3>
        <div className="space-y-4">
          {reportData.requesters?.topRequesters?.map((requester, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-medium text-sm">
                    {requester.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{requester.name}</p>
                  <p className="text-xs text-gray-500">{requester.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{requester.requests}</p>
                <p className="text-xs text-gray-500">requests</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'inventory':
        return renderInventoryReport();
      case 'requesters':
        return renderRequestersReport();
      default:
        return <div className="text-center py-8">Select a report type to view data</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Generate and view comprehensive reports for warehouse operations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate
          </button>
          <div className="relative">
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedReport === type.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last3months">Last 3 months</option>
              <option value="last6months">Last 6 months</option>
              <option value="lastyear">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {renderReportContent()}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <span className="mr-2">📄</span>
            Export as PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <span className="mr-2">📊</span>
            Export as Excel
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <span className="mr-2">📋</span>
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
