
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoodReceivingNote from './GoodReceivingNote';

const SuppliersDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view-grn');
  const [grns, setGrns] = useState([]);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockFormData, setStockFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tin_number: '',
    bank_details: ''
  });

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  
  // Handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };
  
  const getHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found in localStorage');
      handleAuthError();
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch all GRNs
  const fetchGRNs = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/`, {
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        console.error('401 Unauthorized - Token may be expired or invalid');
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGrns(data.results || data);
      setError(null);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      setError('Failed to load GRNs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single GRN details
  const fetchGRNDetails = async (grnId) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/${grnId}/`, {
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        console.error('401 Unauthorized - Token may be expired or invalid');
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedGrn(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      setError('Failed to load GRN details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new GRN
  const handleCreateGRN = async (grnData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/create/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(grnData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create GRN');
      }
      
      alert('GRN created successfully!');
      fetchGRNs(); // Refresh the list
      setActiveTab('view-grn'); // Switch to view tab
    } catch (error) {
      console.error('Error creating GRN:', error);
      alert(`Error creating GRN: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and suppliers for the form
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/categories/`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/suppliers/`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  // Open stock form for specific items
  const openStockForm = (grnId, items) => {
    setStockFormData({
      grnId,
      poNumber: '',
      items: items.filter(item => item.accepted > 0),
      formItems: items.filter(item => item.accepted > 0).map(item => ({
        ...item,
        category_id: '',
        supplier_id: '',
        location: 'Warehouse',
        min_stock: 10,
        max_stock: 1000,
        unit_price: item.amount ? parseFloat(item.amount) / parseInt(item.accepted) : 0,
        expiry_date: ''
      }))
    });
    setShowStockForm(true);
  };

  // Handle form submission for adding to stock
  const handleStockFormSubmit = async () => {
    try {
      // Validate PO Number
      if (!stockFormData.poNumber || stockFormData.poNumber.trim() === '') {
        alert('Please enter a PO Number before submitting.');
        return;
      }

      setIsLoading(true);
      
      for (const item of stockFormData.formItems) {
        // Ensure proper data types and null handling
        const stockData = {
          item_code: `GRN-${stockFormData.grnId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.description.trim(),
          category_id: item.category_id && item.category_id !== '' ? parseInt(item.category_id) : null,
          supplier_id: item.supplier_id && item.supplier_id !== '' ? parseInt(item.supplier_id) : null,
          stock: parseInt(item.accepted) || 0,
          min_stock: parseInt(item.min_stock) || 0,
          max_stock: parseInt(item.max_stock) || 100,
          unit: item.unit || 'Piece',
          location: item.location.trim() || 'Warehouse',
          unit_price: parseFloat(item.unit_price) || 0.00,
          expiry_date: item.expiry_date && item.expiry_date !== '' ? item.expiry_date : null,
          po_number: stockFormData.poNumber.trim() // Add PO Number to stock data
        };
        
        console.log('Sending stock data:', stockData); // Debug log
        
        const response = await fetch(`${API_BASE}/inventory/items/create/`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(stockData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to add ${item.description} to stock:`, errorData);
          throw new Error(`Failed to add ${item.description}: ${JSON.stringify(errorData)}`);
        }
        
        const result = await response.json();
        console.log(`Successfully created item:`, result); // Debug log
      }
      
      alert(`All items have been added to stock successfully with PO Number: ${stockFormData.poNumber}!`);
      setShowStockForm(false);
      setStockFormData(null);
      setError(null);
    } catch (error) {
      console.error('Error adding items to stock:', error);
      alert(`Error adding items to stock: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update form item data
  const updateFormItem = (index, field, value) => {
    setStockFormData(prev => ({
      ...prev,
      formItems: prev.formItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add GRN items to stock (legacy function - now opens form)
  const addToStock = (grnId, items) => {
    openStockForm(grnId, items);
  };

  // Supplier management functions
  const handleSupplierFormChange = (e) => {
    setSupplierForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const openSupplierForm = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm(supplier);
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tin_number: '',
        bank_details: ''
      });
    }
    setShowSupplierForm(true);
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const url = editingSupplier 
        ? `${API_BASE}/suppliers/suppliers/${editingSupplier.id}/`
        : `${API_BASE}/suppliers/suppliers/`;
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(supplierForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingSupplier ? 'update' : 'create'} supplier`);
      }

      alert(`Supplier ${editingSupplier ? 'updated' : 'created'} successfully!`);
      setShowSupplierForm(false);
      fetchSuppliers(); // Refresh suppliers list
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/suppliers/suppliers/${supplierId}/`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      alert('Supplier deleted successfully!');
      fetchSuppliers(); // Refresh suppliers list
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(`Error deleting supplier: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view-grn') {
      fetchGRNs();
    } else if (activeTab === 'manage-suppliers') {
      fetchSuppliers();
    }
    // Fetch categories and suppliers when component mounts
    fetchCategories();
    fetchSuppliers();
  }, [activeTab]);

  const tabs = [
    { id: 'view-grn', name: 'View GRNs', icon: '📋' },
    { id: 'create-grn', name: 'Create GRN', icon: '➕' },
    { id: 'manage-suppliers', name: 'Manage Suppliers', icon: '🏢' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📦 Goods Receiving Notes</h1>
            <p className="text-green-100">
              Manage incoming goods, deliveries, and stock updates
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{grns.length}</div>
            <div className="text-sm text-green-200">Total GRNs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* View GRNs Tab */}
          {activeTab === 'view-grn' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Loading GRNs...</span>
                </div>
              ) : grns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No GRNs found</h3>
                  <p className="text-gray-500 mb-4">Start by creating your first Goods Receiving Note</p>
                  <button
                    onClick={() => setActiveTab('create-grn')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create First GRN
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {grns.map((grn) => (
                    <div
                      key={grn.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">#{grn.id}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              PO: {grn.po_number || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              From: {grn.sender_details || 'Unknown Sender'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(grn.status)}`}>
                            {grn.status || 'Pending'}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(grn.date_received)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Delivery Method:</span>
                          <p className="text-sm text-gray-900">{grn.delivery_method || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Transport:</span>
                          <p className="text-sm text-gray-900">{grn.transport || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Storekeeper:</span>
                          <p className="text-sm text-gray-900">{grn.storekeeper || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => fetchGRNDetails(grn.id)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => addToStock(grn.id, grn.items || [])}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Add to Stock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Form Modal */}
              {showStockForm && stockFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Add Items to Stock - GRN #{stockFormData.grnId}
                        </h3>
                        <button
                          onClick={() => setShowStockForm(false)}
                          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Configure Stock Details for Each Item
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Please review and complete the stock information for each item before adding to inventory.
                        </p>
                        
                        {/* PO Number Field */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Order (PO) Number *
                          </label>
                          <input
                            type="text"
                            value={stockFormData.poNumber || ''}
                            onChange={(e) => setStockFormData(prev => ({...prev, poNumber: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter PO Number (e.g., PO-2025-001)"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            This PO number will be associated with all items being added to stock
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {stockFormData.formItems.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium text-gray-900">{item.description}</h5>
                              <span className="text-sm text-gray-500">Quantity: {item.accepted} {item.unit}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Category */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Category *
                                </label>
                                <select
                                  value={item.category_id}
                                  onChange={(e) => updateFormItem(index, 'category_id', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Category</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Supplier */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Supplier
                                </label>
                                <select
                                  value={item.supplier_id}
                                  onChange={(e) => updateFormItem(index, 'supplier_id', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Supplier</option>
                                  {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                      {supplier.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Location */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Storage Location *
                                </label>
                                <input
                                  type="text"
                                  value={item.location}
                                  onChange={(e) => updateFormItem(index, 'location', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Warehouse A, Shelf 1, Cold Storage"
                                  required
                                />
                              </div>

                              {/* Min Stock */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Minimum Stock Level *
                                </label>
                                <input
                                  type="number"
                                  value={item.min_stock}
                                  onChange={(e) => updateFormItem(index, 'min_stock', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  required
                                />
                              </div>

                              {/* Max Stock */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Maximum Stock Level *
                                </label>
                                <input
                                  type="number"
                                  value={item.max_stock}
                                  onChange={(e) => updateFormItem(index, 'max_stock', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="1"
                                  required
                                />
                              </div>

                              {/* Unit Price */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unit Price (TSh)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateFormItem(index, 'unit_price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                />
                              </div>

                              {/* Expiry Date */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Expiry Date (Optional)
                                </label>
                                <input
                                  type="date"
                                  value={item.expiry_date}
                                  onChange={(e) => updateFormItem(index, 'expiry_date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              {/* Unit (readonly) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unit
                                </label>
                                <input
                                  type="text"
                                  value={item.unit}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                  readOnly
                                />
                              </div>

                              {/* Accepted Quantity (readonly) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Stock Quantity
                                </label>
                                <input
                                  type="text"
                                  value={item.accepted}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setShowStockForm(false)}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStockFormSubmit}
                          disabled={isLoading || !stockFormData.poNumber || stockFormData.poNumber.trim() === ''}
                          className="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Adding to Stock...' : 'Add All to Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GRN Details Modal */}
              {selectedGrn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          GRN Details - #{selectedGrn.id}
                        </h3>
                        <button
                          onClick={() => setSelectedGrn(null)}
                          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* GRN Header Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">PO Number</label>
                            <p className="text-sm text-gray-900">{selectedGrn.po_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Sender Details</label>
                            <p className="text-sm text-gray-900">{selectedGrn.sender_details || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Delivery Method</label>
                            <p className="text-sm text-gray-900">{selectedGrn.delivery_method || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Transport</label>
                            <p className="text-sm text-gray-900">{selectedGrn.transport || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Date Received</label>
                            <p className="text-sm text-gray-900">{formatDate(selectedGrn.date_received)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Time Received</label>
                            <p className="text-sm text-gray-900">{selectedGrn.time_received || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Registration Plate</label>
                            <p className="text-sm text-gray-900">{selectedGrn.registration_plate || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Container/Seal No.</label>
                            <p className="text-sm text-gray-900">{selectedGrn.container_seal_no || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Items Received</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  S/N
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Received
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Accepted
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rejected
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Reason/Remark
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedGrn.items?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.total_received}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-green-600">{item.accepted}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-red-600">{item.rejected}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.amount}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.reason || '-'}</td>
                                  <td className="px-4 py-3 text-sm">
                                    {item.accepted > 0 && (
                                      <button
                                        onClick={() => addToStock(selectedGrn.id, [item])}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                      >
                                        Add to Stock
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              )) || (
                                <tr>
                                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                    No items found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Person Delivering</label>
                            <p className="text-sm text-gray-900">{selectedGrn.person_delivering || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Delivery Signature</label>
                            <p className="text-sm text-gray-900">{selectedGrn.person_delivering_signature || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Storekeeper</label>
                            <p className="text-sm text-gray-900">{selectedGrn.storekeeper || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Storekeeper Signature</label>
                            <p className="text-sm text-gray-900">{selectedGrn.storekeeper_signature || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedGrn(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create GRN Tab */}
          {activeTab === 'create-grn' && (
            <GoodReceivingNote onSubmitNote={handleCreateGRN} suppliers={suppliers} />
          )}

          {/* Manage Suppliers Tab */}
          {activeTab === 'manage-suppliers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Supplier Management</h3>
                <button
                  onClick={() => openSupplierForm()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add New Supplier</span>
                </button>
              </div>

              {/* Suppliers Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contact Person
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">🏢</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                          <p className="text-gray-500 mb-4">Start by adding your first supplier</p>
                          <button
                            onClick={() => openSupplierForm()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Add First Supplier
                          </button>
                        </td>
                      </tr>
                    ) : (
                      suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {supplier.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {supplier.contact_person || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {supplier.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {supplier.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium space-x-2">
                            <button
                              onClick={() => openSupplierForm(supplier)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Supplier Form Modal */}
              {showSupplierForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                        </h3>
                        <button
                          onClick={() => setShowSupplierForm(false)}
                          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSupplierSubmit} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplier Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={supplierForm.name}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            name="contact_person"
                            value={supplierForm.contact_person}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={supplierForm.email}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={supplierForm.phone}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <textarea
                            name="address"
                            value={supplierForm.address}
                            onChange={handleSupplierFormChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            TIN Number
                          </label>
                          <input
                            type="text"
                            name="tin_number"
                            value={supplierForm.tin_number}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Details
                          </label>
                          <input
                            type="text"
                            name="bank_details"
                            value={supplierForm.bank_details}
                            onChange={handleSupplierFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Bank name, Account number, etc."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowSupplierForm(false)}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Create Supplier')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliersDashboard;
