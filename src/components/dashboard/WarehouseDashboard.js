import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Overview from './Overview';
import PendingRequests from './PendingRequests';
import InventoryManagement from './InventoryManagement';
import Reports from './Reports';
import Settings from './Settings';

const WarehouseDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setRequests([
      { id: 'REQ-001', requester: 'John Doe', item: 'Laboratory Gloves', quantity: 100, status: 'Pending', date: '2025-08-25', priority: 'High', department: 'Chemistry Lab' },
      { id: 'REQ-002', requester: 'Jane Smith', item: 'Chemical Test Tubes', quantity: 50, status: 'Pending', date: '2025-08-24', priority: 'Medium', department: 'Biology Lab' },
      { id: 'REQ-003', requester: 'Mike Johnson', item: 'Safety Goggles', quantity: 20, status: 'Approved', date: '2025-08-23', priority: 'Low', department: 'Physics Lab' },
      { id: 'REQ-004', requester: 'Sarah Wilson', item: 'pH Test Strips', quantity: 200, status: 'Processing', date: '2025-08-22', priority: 'High', department: 'Chemistry Lab' },
    ]);

    setInventory([
      { id: 'ITEM-001', name: 'Laboratory Gloves', category: 'Safety Equipment', stock: 500, minStock: 100, unit: 'pairs', location: 'A1-B2', lastUpdated: '2025-08-25' },
      { id: 'ITEM-002', name: 'Test Tubes', category: 'Laboratory Equipment', stock: 200, minStock: 50, unit: 'pieces', location: 'B2-C3', lastUpdated: '2025-08-24' },
      { id: 'ITEM-003', name: 'Safety Goggles', category: 'Safety Equipment', stock: 30, minStock: 20, unit: 'pieces', location: 'A1-A2', lastUpdated: '2025-08-23' },
      { id: 'ITEM-004', name: 'pH Test Strips', category: 'Chemicals', stock: 15, minStock: 50, unit: 'strips', location: 'C1-D2', lastUpdated: '2025-08-22' },
      { id: 'ITEM-005', name: 'Beakers (500ml)', category: 'Laboratory Equipment', stock: 75, minStock: 25, unit: 'pieces', location: 'B1-B3', lastUpdated: '2025-08-21' },
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStockStatus = (current, minimum) => {
    if (current <= minimum) return 'critical';
    if (current <= minimum * 1.5) return 'low';
    return 'good';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'good': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleApproveRequest = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'Approved' } : req
    ));
  };

  const handleRejectRequest = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'Rejected' } : req
    ));
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="/cgcla.jpg"
                alt="CGCLA Logo"
                className="h-10 w-auto mr-4"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Management Dashboard</h1>
                <p className="text-sm text-gray-600">CGCLA Warehouse Control Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user?.name || 'Admin'} (Warehouse Manager)
              </div>
              <button
                onClick={onLogout}
                className="ml-4 text-gray-600 hover:text-gray-900 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {[
                { id: 'overview', name: 'Overview', icon: '🏠' },
                { id: 'requests', name: 'Pending Requests', icon: '📋' },
                { id: 'inventory', name: 'Inventory Management', icon: '📦' },
                { id: 'reports', name: 'Reports & Analytics', icon: '📊' },
                { id: 'settings', name: 'Settings', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-md transition duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📋</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {requests.filter(r => r.status === 'Pending').length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">⚠️</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {inventory.filter(item => getStockStatus(item.stock, item.minStock) !== 'good').length}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📦</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                            <dd className="text-lg font-medium text-gray-900">{inventory.length}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✅</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                            <dd className="text-lg font-medium text-gray-900">12</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Urgent Requests */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Urgent Requests</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {requests.filter(r => r.priority === 'High' && r.status === 'Pending').map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="font-medium text-gray-900">{request.item}</p>
                              <p className="text-sm text-gray-600">Requested by {request.requester}</p>
                              <p className="text-xs text-gray-500">{request.department}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Critical Stock Alerts */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Critical Stock Alerts</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {inventory.filter(item => getStockStatus(item.stock, item.minStock) === 'critical').map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-red-600">Only {item.stock} {item.unit} remaining</p>
                              <p className="text-xs text-gray-500">Min stock: {item.minStock} {item.unit}</p>
                            </div>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              Reorder
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Requests</h2>
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">All Pending Requests</h3>
                    <div className="flex items-center space-x-4">
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>All Priorities</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>All Departments</option>
                        <option>Chemistry Lab</option>
                        <option>Biology Lab</option>
                        <option>Physics Lab</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requester}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.item}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                                <button className="text-blue-600 hover:text-blue-900">View</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Management Tab */}
            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h2>
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">All Inventory Items</h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        placeholder="Search items..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>All Categories</option>
                        <option>Laboratory Equipment</option>
                        <option>Chemicals</option>
                        <option>Safety Equipment</option>
                      </select>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                        Add New Item
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => {
                          const stockStatus = getStockStatus(item.stock, item.minStock);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.stock} {item.unit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.minStock} {item.unit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                                  {stockStatus === 'critical' ? 'Critical' : stockStatus === 'low' ? 'Low Stock' : 'Good'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                  <button className="text-green-600 hover:text-green-900">Restock</button>
                                  <button className="text-gray-600 hover:text-gray-900">View</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Request Summary</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Requests This Month</span>
                          <span className="font-semibold">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approved</span>
                          <span className="font-semibold text-green-600">18</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-semibold text-yellow-600">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejected</span>
                          <span className="font-semibold text-red-600">2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Popular Items</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Laboratory Gloves</span>
                          <span className="font-semibold">8 requests</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Test Tubes</span>
                          <span className="font-semibold">6 requests</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Safety Goggles</span>
                          <span className="font-semibold">4 requests</span>
                        </div>
                        <div className="flex justify-between">
                          <span>pH Test Strips</span>
                          <span className="font-semibold">3 requests</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Email notifications for new requests</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Alert for low stock items</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">Daily summary reports</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Auto-approval Settings</h4>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">Auto-approve requests under 10 units</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">Auto-approve from trusted departments</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
