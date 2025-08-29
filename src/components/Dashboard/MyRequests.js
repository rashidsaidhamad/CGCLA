import React, { useState, useEffect } from 'react';

const MyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    // Mock data for user's requests
    setRequests([
      {
        id: 'REQ-001',
        itemName: 'Laboratory Gloves',
        category: 'Safety Equipment',
        quantity: 100,
        unit: 'pairs',
        status: 'Approved',
        urgency: 'High',
        requestDate: '2025-08-27',
        requestedDate: '2025-08-30',
        approvalDate: '2025-08-27',
        justification: 'Required for handling chemical substances in daily experiments',
        notes: 'Nitrile gloves preferred',
        approvedBy: 'Dr. Sarah Wilson',
        estimatedDelivery: '2025-08-29'
      },
      {
        id: 'REQ-002',
        itemName: 'Test Tubes (50ml)',
        category: 'Laboratory Equipment',
        quantity: 50,
        unit: 'pieces',
        status: 'Pending',
        urgency: 'Medium',
        requestDate: '2025-08-26',
        requestedDate: '2025-08-29',
        justification: 'Needed for upcoming analytical chemistry experiments',
        notes: 'Glass test tubes required',
        estimatedDelivery: null
      },
      {
        id: 'REQ-003',
        itemName: 'Safety Goggles',
        category: 'Safety Equipment',
        quantity: 20,
        unit: 'pieces',
        status: 'Processing',
        urgency: 'Low',
        requestDate: '2025-08-25',
        requestedDate: '2025-08-28',
        approvalDate: '2025-08-26',
        justification: 'Replacement for damaged safety equipment',
        notes: 'Anti-fog coating preferred',
        approvedBy: 'Dr. Sarah Wilson',
        estimatedDelivery: '2025-08-28'
      },
      {
        id: 'REQ-004',
        itemName: 'pH Test Strips',
        category: 'Chemicals',
        quantity: 200,
        unit: 'strips',
        status: 'Delivered',
        urgency: 'High',
        requestDate: '2025-08-24',
        requestedDate: '2025-08-27',
        approvalDate: '2025-08-24',
        deliveryDate: '2025-08-27',
        justification: 'Urgent requirement for pH monitoring in ongoing research',
        notes: 'pH range 1-14 required',
        approvedBy: 'Dr. Sarah Wilson',
        deliveredBy: 'Warehouse Team'
      },
      {
        id: 'REQ-005',
        itemName: 'Distilled Water',
        category: 'Chemicals',
        quantity: 50,
        unit: 'liters',
        status: 'Rejected',
        urgency: 'Medium',
        requestDate: '2025-08-23',
        requestedDate: '2025-08-26',
        rejectionDate: '2025-08-24',
        justification: 'Required for preparing standard solutions',
        notes: 'High purity grade needed',
        rejectedBy: 'Dr. Sarah Wilson',
        rejectionReason: 'Sufficient stock available in department storage'
      }
    ]);
  }, []);

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

  const filteredRequests = requests
    .filter(request => {
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  const statusCounts = requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  const RequestModal = ({ request, onClose }) => {
    if (!request) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Request ID</label>
                  <p className="text-sm text-gray-900">{request.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Item</label>
                  <p className="text-sm text-gray-900">{request.itemName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm text-gray-900">{request.quantity} {request.unit}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Justification</label>
                <p className="text-sm text-gray-900">{request.justification}</p>
              </div>

              {request.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                  <p className="text-sm text-gray-900">{request.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Date</label>
                  <p className="text-sm text-gray-900">{new Date(request.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested For</label>
                  <p className="text-sm text-gray-900">{new Date(request.requestedDate).toLocaleDateString()}</p>
                </div>
              </div>

              {request.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approved By</label>
                    <p className="text-sm text-gray-900">{request.approvedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approval Date</label>
                    <p className="text-sm text-gray-900">{new Date(request.approvalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {request.rejectedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                  <p className="text-sm text-red-600">{request.rejectionReason}</p>
                  <p className="text-xs text-gray-500">Rejected by: {request.rejectedBy}</p>
                </div>
              )}

              {request.estimatedDelivery && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
                  <p className="text-sm text-gray-900">{new Date(request.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Requests</h2>
        <p className="text-gray-600">
          Track and manage all your item requests from {user?.department || 'your department'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.Pending || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.Approved || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.Delivered || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.Rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item & Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.id}</div>
                      <div className="text-sm text-gray-500">{request.category}</div>
                      <div className={`text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency} Priority
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.itemName}</div>
                    <div className="text-sm text-gray-500">{request.quantity} {request.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Requested: {new Date(request.requestDate).toLocaleDateString()}</div>
                    <div>Needed: {new Date(request.requestedDate).toLocaleDateString()}</div>
                    {request.estimatedDelivery && (
                      <div className="text-blue-600">Est. Delivery: {new Date(request.estimatedDelivery).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    {request.status === 'Pending' && (
                      <button className="text-red-600 hover:text-red-900">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>

      {/* Request Modal */}
      <RequestModal 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
};

export default MyRequests;
