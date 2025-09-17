import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';

const Reports = () => {
  const [reportData, setReportData] = useState({
    inventoryReport: null,
    issuedReport: null
  });
  const [selectedReport, setSelectedReport] = useState('issued');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Generate month options for the current year
  const getMonthOptions = () => {
    const months = [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    return months;
  };

  // Generate week options for the current year
  const getWeekOptions = () => {
    const weeks = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get the first day of the year
    const firstDay = new Date(currentYear, 0, 1);
    const firstWeekStart = new Date(firstDay);
    
    // Adjust to start on Monday
    const dayOfWeek = firstDay.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstWeekStart.setDate(firstDay.getDate() + daysToMonday);
    
    for (let week = 1; week <= 52; week++) {
      const weekStart = new Date(firstWeekStart);
      weekStart.setDate(firstWeekStart.getDate() + (week - 1) * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Only include weeks that haven't passed current date + some future weeks
      if (weekStart <= new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000))) {
        weeks.push({
          value: week.toString(),
          label: `Week ${week} (${weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })})`
        });
      }
    }
    return weeks;
  };

  // Filter data based on selected time filter
  const filterDataByTime = (data) => {
    if (!data || selectedTimeFilter === 'all') return data;

    const now = new Date();
    let startDate, endDate;

    if (selectedTimeFilter === 'month' && selectedMonth) {
      const year = now.getFullYear();
      startDate = new Date(year, parseInt(selectedMonth) - 1, 1);
      endDate = new Date(year, parseInt(selectedMonth), 0);
    } else if (selectedTimeFilter === 'week' && selectedWeek) {
      const year = now.getFullYear();
      const firstDay = new Date(year, 0, 1);
      const firstWeekStart = new Date(firstDay);
      
      const dayOfWeek = firstDay.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      firstWeekStart.setDate(firstDay.getDate() + daysToMonday);
      
      startDate = new Date(firstWeekStart);
      startDate.setDate(firstWeekStart.getDate() + (parseInt(selectedWeek) - 1) * 7);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    if (startDate && endDate) {
      // Filter based on the data structure
      if (data.items) {
        return {
          ...data,
          items: data.items.filter(item => {
            const itemDate = new Date(item.created_at || item.date_requested || item.date);
            return itemDate >= startDate && itemDate <= endDate;
          })
        };
      } else if (Array.isArray(data)) {
        return data.filter(item => {
          const itemDate = new Date(item.created_at || item.date_requested || item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
    }

    return data;
  };

  // Fetch specific report
  const fetchReport = async (reportType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoints = {
        inventory: '/reports/inventory-report/',
        issued: '/reports/request-report/'
      };

      const response = await fetch(`${API_BASE}${endpoints[reportType]}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`${reportType} report data:`, data);
      
      setReportData(prev => ({
        ...prev,
        [`${reportType}Report`]: data
      }));
    } catch (error) {
      console.error(`Error fetching ${reportType} report:`, error);
      setError(`Failed to load ${reportType} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReport(selectedReport);
  }, [selectedReport]);

  // Handle report type change
  const handleReportChange = (reportType) => {
    setSelectedReport(reportType);
    if (!reportData[`${reportType}Report`]) {
      fetchReport(reportType);
    }
  };

  // Export report as CSV
  const exportToCSV = (data, filename) => {
    if (!data) {
      alert('No data to export');
      return;
    }

    let csvData = [];
    let csvFilename = filename;

    // Handle different data structures
    if (selectedReport === 'issued') {
      // For issued reports, extract the items array
      csvData = data.items || data.requests || data || [];
      csvFilename = 'issued_items_report';
    } else {
      // For other reports
      csvData = Array.isArray(data) ? data : (data.items || []);
    }

    if (!Array.isArray(csvData) || csvData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV headers based on the first object's keys
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          let value = row[header] || '';
          // Handle nested objects or arrays
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value).replace(/,/g, ';');
          }
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${csvFilename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get current report data with filtering applied
  const getCurrentReportData = () => {
    const rawData = reportData[`${selectedReport}Report`];
    return filterDataByTime(rawData);
  };

  // Render report content based on type
  const renderReportContent = () => {
    const currentData = getCurrentReportData();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!currentData) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a report type to view data.
          </p>
        </div>
      );
    }

    // Render based on report type
    switch (selectedReport) {
      case 'inventory':
        return renderInventoryReport(currentData);
      case 'issued':
        return renderIssuedReport(currentData);
      default:
        return <div>Unknown report type</div>;
    }
  };

  // Render inventory report
  const renderInventoryReport = (data) => {
    const items = data.items || data || [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Total Items</h4>
            <p className="text-2xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">In Stock</h4>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(item => item.quantity > 0).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900">Low Stock</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {items.filter(item => item.quantity <= 10 && item.quantity > 0).length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-900">Out of Stock</h4>
            <p className="text-2xl font-bold text-red-600">
              {items.filter(item => item.quantity === 0).length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (TSh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value (TSh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.quantity === 0 
                        ? 'bg-red-100 text-red-800'
                        : item.quantity <= 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render issued report (requests)
  const renderIssuedReport = (data) => {
    const requests = data.requests || data || [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Total Issued</h4>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900">Pending</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">Approved</h4>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-900">Rejected</h4>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request, index) => (
                <tr key={request.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.created_at || request.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(() => {
                      const user = request.requester || request.user;
                      if (user?.first_name && user?.last_name) {
                        return `${user.first_name} ${user.last_name}`;
                      }
                      return user?.username || user?.email || 'N/A';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const user = request.requester || request.user;
                      const dept = user?.department || request.department;
                      return dept?.name || 'N/A';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof request.item === 'object' && request.item !== null 
                      ? request.item.name || request.item.item_name || `Item ID: ${request.item.id}`
                      : request.item_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-indigo-100 text-lg">
          Comprehensive reports and data insights
        </p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Report Type and Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => handleReportChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="issued">Issued Report</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Filter
              </label>
              <select
                value={selectedTimeFilter}
                onChange={(e) => {
                  setSelectedTimeFilter(e.target.value);
                  if (e.target.value !== 'month') setSelectedMonth('');
                  if (e.target.value !== 'week') setSelectedWeek('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="month">By Month</option>
                <option value="week">By Week</option>
              </select>
            </div>

            {/* Month Filter */}
            {selectedTimeFilter === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose Month</option>
                  {getMonthOptions().map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Week Filter */}
            {selectedTimeFilter === 'week' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Week
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[250px]"
                >
                  <option value="">Choose Week</option>
                  {getWeekOptions().map(week => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => fetchReport(selectedReport)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={() => exportToCSV(getCurrentReportData(), selectedReport)}
              disabled={!getCurrentReportData()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {selectedReport.replace(/([A-Z])/g, ' $1').trim()} Report
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                {selectedTimeFilter !== 'all' && (
                  <span className="ml-2">
                    • Filtered by {selectedTimeFilter === 'month' ? `${getMonthOptions().find(m => m.value === selectedMonth)?.label || 'Month'}` : selectedTimeFilter === 'week' ? `Week ${selectedWeek}` : selectedTimeFilter}
                  </span>
                )}
              </p>
            </div>
            {selectedTimeFilter !== 'all' && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  Filtered
                </span>
                <button
                  onClick={() => {
                    setSelectedTimeFilter('all');
                    setSelectedMonth('');
                    setSelectedWeek('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;
