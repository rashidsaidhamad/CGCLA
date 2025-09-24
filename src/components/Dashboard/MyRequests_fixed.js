import React, { useState, useEffect } from 'react';

const MyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/requests/my-requests/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform Django request data to match frontend structure
        const transformedRequests = data.map(request => ({
          id: `REQ-${request.id}`,
          itemName: request.item?.name || 'Unknown Item',
          category: request.item?.category?.name || 'Unknown Category',
          quantity: request.quantity,
          unit: request.item?.unit || 'pieces',
          status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
          requestDate: new Date(request.created_at).toISOString().split('T')[0],
          justification: request.feedback || 'No justification provided',
          requesterName: request.requester_name || user?.username || 'Unknown'
        }));
        setRequests(transformedRequests);
      } else {
        console.error('Failed to fetch requests');
        setMockData();
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setRequests([
      {
        id: 'REQ-001',
        itemName: 'Laboratory Gloves',
        category: 'Safety Equipment',
        quantity: 100,
        unit: 'pairs',
        status: 'Approved',
        requestDate: '2025-08-27',
        justification: 'Required for handling chemical substances in daily experiments',
      },
      {
        id: 'REQ-002',
        itemName: 'Test Tubes (50ml)',
        category: 'Laboratory Equipment',
        quantity: 50,
        unit: 'pieces',
        status: 'Pending',
        requestDate: '2025-08-26',
        justification: 'Needed for upcoming analytical chemistry experiments',
      }
    ]);
  };

  // Helper function to get date range based on filter
  const getDateRange = (filter) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'thisWeek': {
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      }
      case 'thisMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      }
      case 'lastWeek': {
        const startOfLastWeek = new Date(startOfDay);
        startOfLastWeek.setDate(startOfDay.getDate() - startOfDay.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start: startOfLastWeek, end: endOfLastWeek };
      }
      case 'lastMonth': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        return { start: startOfLastMonth, end: endOfLastMonth };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Check if a request date falls within the selected time range
  const isWithinDateRange = (requestDate, filter) => {
    if (filter === 'all') return true;
    
    const dateRange = getDateRange(filter);
    if (!dateRange) return true;
    
    const reqDate = new Date(requestDate);
    return reqDate >= dateRange.start && reqDate <= dateRange.end;
  };

  // Clear time filters
  const clearTimeFilters = () => {
    setTimeFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Filter requests based on status, search term, and date range
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase() === filterStatus;
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = isWithinDateRange(request.requestDate, timeFilter);
    return matchesStatus && matchesSearch && matchesDateRange;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'processing': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-purple-100 text-purple-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const statusCounts = requests.reduce((counts, request) => {
    const status = request.status.toLowerCase();
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Requests</h2>
        <p className="text-gray-600">Track and manage your item requests</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">❌</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* First row - Status and Time filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {timeFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || timeFilter !== 'all' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {timeFilter !== 'all' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Time: {timeFilter === 'thisWeek' ? 'This Week' : 
                          timeFilter === 'lastWeek' ? 'Last Week' :
                          timeFilter === 'thisMonth' ? 'This Month' :
                          timeFilter === 'lastMonth' ? 'Last Month' :
                          timeFilter === 'custom' ? 'Custom Range' : timeFilter}
                  <button
                    onClick={clearTimeFilters}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:bg-green-200"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-600 hover:bg-purple-200"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchTerm('');
                  clearTimeFilters();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Request History ({filteredRequests.length})
          </h3>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">You haven't made any requests yet or none match your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{request.id}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-600">{request.requestDate}</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.itemName}</p>
                    <p className="text-sm text-gray-600">{request.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-sm font-medium text-gray-900">{request.quantity} {request.unit}</p>
                  </div>
                </div>
                
                {request.justification && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Justification:</span> {request.justification}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
