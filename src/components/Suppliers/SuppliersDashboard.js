
import React, { useState, useEffect } from 'react';

const SuppliersDashboard = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('grn-form');
  
  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_details: '',
    address: ''
  });

  // GRN state
  const [goodsReceivingNotes, setGoodsReceivingNotes] = useState([]);
  const [grnForm, setGrnForm] = useState({
    po_number: '',
    delivery_number: '',
    sender_details: '',
    delivery_method: '',
    transport: '',
    date_received: new Date().toISOString().split('T')[0],
    time_received: '',
    registration_plate: '',
    container_seal_no: '',
    person_delivering: '',
    storekeeper: '',
    status: 'draft',
    items: [
      {
        description: '',
        item_code: '',
        unit: 'pieces',
        total_received: '',
        accepted: '',
        rejected: 0,
        amount: 0,
        rejected_reason: ''
      }
    ]
  });
  const [isSubmittingGRN, setIsSubmittingGRN] = useState(false);

  // Stock submission state
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSubmissionItems, setStockSubmissionItems] = useState([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/suppliers/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers');
    }
  };

  // Fetch GRNs
  const fetchGRNs = async () => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/goods-receiving-notes/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoodsReceivingNotes(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      setError('Failed to load GRNs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchGRNs();
  }, []);

  // Add supplier
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/suppliers/suppliers/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newSupplier),
      });

      if (response.ok) {
        await fetchSuppliers();
        setShowAddSupplierModal(false);
        setNewSupplier({ name: '', contact_details: '', address: '' });
        alert('Supplier added successfully!');
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Error adding supplier');
    }
  };

  // Handle GRN form changes
  const handleGRNFormChange = (e) => {
    const { name, value } = e.target;
    setGrnForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle GRN item changes
  const handleGRNItemChange = (index, field, value) => {
    setGrnForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new GRN item
  const addGRNItem = () => {
    setGrnForm(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        item_code: '',
        unit: 'pieces',
        total_received: '',
        accepted: '',
        rejected: 0,
        amount: 0,
        rejected_reason: ''
      }]
    }));
  };

  // Remove GRN item
  const removeGRNItem = (index) => {
    if (grnForm.items.length > 1) {
      setGrnForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit GRN as draft
  const handleSubmitGRN = async (e) => {
    e.preventDefault();
    setIsSubmittingGRN(true);

    try {
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/create/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...grnForm, status: 'draft' }),
      });

      if (response.ok) {
        alert('GRN created successfully as draft!');
        
        // Reset form
        setGrnForm({
          po_number: '',
          delivery_number: '',
          sender_details: '',
          delivery_method: '',
          transport: '',
          date_received: new Date().toISOString().split('T')[0],
          time_received: '',
          registration_plate: '',
          container_seal_no: '',
          person_delivering: '',
          storekeeper: '',
          status: 'draft',
          items: [{
            description: '',
            item_code: '',
            unit: 'pieces',
            total_received: '',
            accepted: '',
            rejected: 0,
            amount: 0,
            rejected_reason: ''
          }]
        });

        // Refresh GRNs and switch to view tab
        await fetchGRNs();
        setActiveTab('view-grns');
      } else {
        const errorData = await response.json();
        alert(`Error creating GRN: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating GRN:', error);
      alert('Error creating GRN');
    } finally {
      setIsSubmittingGRN(false);
    }
  };

  // Prepare stock submission
  const prepareStockSubmission = (grn) => {
    setSelectedGRN(grn);
    const stockItems = grn.items.map(item => ({
      ...item,
      stockToAdd: item.accepted || 0,
      reason: 'GRN Receipt'
    }));
    setStockSubmissionItems(stockItems);
    setShowStockModal(true);
  };

  // Submit to stock balance
  const handleSubmitToStock = async () => {
    try {
      const stockData = {
        grn_id: selectedGRN.id,
        items: stockSubmissionItems.map(item => ({
          item_code: item.item_code,
          quantity: item.stockToAdd,
          unit_price: item.amount / (item.total_received || 1),
          reason: item.reason
        }))
      };

      const response = await fetch(`${API_BASE}/inventory/stock/bulk-update/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(stockData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Stock updated successfully! ${result.updated_count} items processed.`);
        setShowStockModal(false);
        await fetchGRNs();
      } else {
        const errorData = await response.json();
        alert(`Error updating stock: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting to stock:', error);
      alert('Error submitting to stock balance');
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      processed: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
        <p className="text-purple-100 text-lg">
          Manage suppliers, create GRNs, and submit to stock balance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'grn-form', label: 'Create GRN', icon: '📝' },
              { id: 'view-grns', label: 'View GRNs', icon: '📋' },
              { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* GRN Form Tab */}
          {activeTab === 'grn-form' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Goods Receiving Note</h2>
              
              <form onSubmit={handleSubmitGRN} className="space-y-6">
                {/* GRN Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PO/LPO Number
                    </label>
                    <input
                      type="text"
                      name="po_number"
                      value={grnForm.po_number}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter PO/LPO number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Number
                    </label>
                    <input
                      type="text"
                      name="delivery_number"
                      value={grnForm.delivery_number}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter delivery number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Received *
                    </label>
                    <input
                      type="date"
                      name="date_received"
                      value={grnForm.date_received}
                      onChange={handleGRNFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Received
                    </label>
                    <input
                      type="time"
                      name="time_received"
                      value={grnForm.time_received}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Details
                    </label>
                    <input
                      type="text"
                      name="sender_details"
                      value={grnForm.sender_details}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Sender information"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Method
                    </label>
                    <input
                      type="text"
                      name="delivery_method"
                      value={grnForm.delivery_method}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Truck, Van, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport
                    </label>
                    <input
                      type="text"
                      name="transport"
                      value={grnForm.transport}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Transport details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Plate
                    </label>
                    <input
                      type="text"
                      name="registration_plate"
                      value={grnForm.registration_plate}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Vehicle registration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Person Delivering
                    </label>
                    <input
                      type="text"
                      name="person_delivering"
                      value={grnForm.person_delivering}
                      onChange={handleGRNFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Delivery person name"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Items Received</h3>
                    <button
                      type="button"
                      onClick={addGRNItem}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Received</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accepted</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {grnForm.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.item_code}
                                onChange={(e) => handleGRNItemChange(index, 'item_code', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Item code"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleGRNItemChange(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Description"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={item.unit}
                                onChange={(e) => handleGRNItemChange(index, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kg</option>
                                <option value="liters">Liters</option>
                                <option value="boxes">Boxes</option>
                                <option value="packs">Packs</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.total_received}
                                onChange={(e) => handleGRNItemChange(index, 'total_received', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.accepted}
                                onChange={(e) => handleGRNItemChange(index, 'accepted', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.rejected}
                                onChange={(e) => handleGRNItemChange(index, 'rejected', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount}
                                onChange={(e) => handleGRNItemChange(index, 'amount', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-2">
                              {grnForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeGRNItem(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGRN}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isSubmittingGRN ? 'Creating...' : 'Create GRN'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View GRNs Tab */}
          {activeTab === 'view-grns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Goods Receiving Notes</h2>
                <button
                  onClick={() => setActiveTab('grn-form')}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Create New GRN
                </button>
              </div>

              {goodsReceivingNotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No GRNs found</h3>
                  <p className="text-gray-600">Create your first Goods Receiving Note to get started.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO/LPO</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {goodsReceivingNotes.map((grn) => (
                          <tr key={grn.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {grn.po_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grn.sender_details || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(grn.date_received).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(grn.status || 'draft')}`}>
                                {(grn.status || 'draft').charAt(0).toUpperCase() + (grn.status || 'draft').slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {grn.items?.length || 0} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => prepareStockSubmission(grn)}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                              >
                                Submit to Stock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
                <button
                  onClick={() => setShowAddSupplierModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Add Supplier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{supplier.contact_details}</p>
                    <p className="text-sm text-gray-500">{supplier.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Details
                </label>
                <input
                  type="text"
                  value={newSupplier.contact_details}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Submission Modal */}
      {showStockModal && selectedGRN && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Submit to Stock Balance</h3>
                  <p className="text-green-100">GRN: {selectedGRN.po_number || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-gray-600">
                Review and adjust the quantities to be added to stock balance. Only accepted items will be processed.
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accepted Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock to Add</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockSubmissionItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-medium">{item.item_code}</td>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2 text-sm">{item.accepted}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.stockToAdd}
                            onChange={(e) => {
                              const newItems = [...stockSubmissionItems];
                              newItems[index].stockToAdd = parseInt(e.target.value) || 0;
                              setStockSubmissionItems(newItems);
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={(item.amount / (item.total_received || 1)).toFixed(2)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => {
                              const newItems = [...stockSubmissionItems];
                              newItems[index].reason = e.target.value;
                              setStockSubmissionItems(newItems);
                            }}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitToStock}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Submit to Stock Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersDashboard;
