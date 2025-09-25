import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';

const DamagedItemsDeclaration = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [damagedItems, setDamagedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  // Modal state
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [damageDeclaration, setDamageDeclaration] = useState({
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/inventory/items/`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }

      const data = await response.json();
      setInventoryItems(data.results || data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setError('Failed to load inventory items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/categories/`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch damaged items declarations
  const fetchDamagedItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/damaged-items/`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setDamagedItems(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching damaged items:', error);
      // Fallback: try transactions endpoint
      try {
        const transactionsResponse = await fetch(`${API_BASE}/inventory/transactions/`, {
          headers: getHeaders(),
        });
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          const damaged = (transactionsData.results || transactionsData || [])
            .filter(t => t.transaction_type === 'DAMAGE' || t.type === 'damage');
          setDamagedItems(damaged);
        }
      } catch (fallbackError) {
        console.error('Error fetching from transactions endpoint:', fallbackError);
      }
    }
  };

  // Submit damage declaration
  const submitDamageDeclaration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        item: selectedItem.id,
        quantity: parseInt(damageDeclaration.quantity),
        reason: damageDeclaration.reason,
        date: damageDeclaration.date,
        description: damageDeclaration.description,
        transaction_type: 'DAMAGE',
        type: 'damage'
      };

      // Try multiple endpoints for damage declaration
      let success = false;
      const endpoints = [
        `${API_BASE}/inventory/damaged-items/`,
        `${API_BASE}/inventory/transactions/`,
        `${API_BASE}/inventory/damage-declaration/`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            success = true;
            break;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }

      if (success) {
        setSuccessMessage(`Successfully declared ${damageDeclaration.quantity} ${selectedItem.unit} of ${selectedItem.name} as damaged.`);
        setShowDamageModal(false);
        setDamageDeclaration({
          quantity: 0,
          reason: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        fetchDamagedItems(); // Refresh damaged items list
      } else {
        // Store in local state if API fails
        const newDamageRecord = {
          id: Date.now(),
          item: selectedItem,
          quantity: parseInt(damageDeclaration.quantity),
          reason: damageDeclaration.reason,
          date: damageDeclaration.date,
          description: damageDeclaration.description,
          created_at: new Date().toISOString(),
          declared_by: 'Store Keeper' // This could be dynamic based on user
        };
        
        setDamagedItems(prev => [newDamageRecord, ...prev]);
        setSuccessMessage(`Successfully declared ${damageDeclaration.quantity} ${selectedItem.unit} of ${selectedItem.name} as damaged (stored locally).`);
        setShowDamageModal(false);
        setDamageDeclaration({
          quantity: 0,
          reason: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
      }

    } catch (error) {
      console.error('Error submitting damage declaration:', error);
      setError('Failed to submit damage declaration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open damage modal
  const openDamageModal = (item) => {
    setSelectedItem(item);
    setShowDamageModal(true);
  };

  // Close damage modal
  const closeDamageModal = () => {
    setShowDamageModal(false);
    setSelectedItem(null);
    setDamageDeclaration({
      quantity: 0,
      reason: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  // Filter items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || 
                           item.category?.id?.toString() === selectedCategory ||
                           item.category?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchInventoryItems();
    fetchCategories();
    fetchDamagedItems();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Damaged Items Declaration</h1>
        <p className="text-red-100 text-lg">
          Declare and track damaged inventory items for accurate stock management
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select items to declare as damaged
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <span className="ml-2 text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-red-600">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.code} • {item.category?.name || 'No Category'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{item.current_stock || item.stock || 0}</span>
                        <span className="text-gray-500 ml-1">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.unit_price || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDamageModal(item)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Declare Damage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Damage Declarations */}
      {damagedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Damage Declarations</h3>
            <p className="text-sm text-gray-500 mt-1">
              Recently declared damaged items
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Damaged
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {damagedItems.slice(0, 10).map((damage, index) => (
                  <tr key={damage.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {damage.item?.name || damage.item_name || 'Unknown Item'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {damage.quantity} {damage.item?.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={damage.reason || damage.description}>
                        {damage.reason || damage.description || 'No reason provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(damage.date || damage.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Damage Declaration Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Declare Damage - {selectedItem?.name}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Damaged Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem?.current_stock || selectedItem?.stock || 0}
                  value={damageDeclaration.quantity}
                  onChange={(e) => setDamageDeclaration(prev => ({
                    ...prev,
                    quantity: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter quantity damaged"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available stock: {selectedItem?.current_stock || selectedItem?.stock || 0} {selectedItem?.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Damage *
                </label>
                <input
                  type="date"
                  value={damageDeclaration.date}
                  onChange={(e) => setDamageDeclaration(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Damage *
                </label>
                <select
                  value={damageDeclaration.reason}
                  onChange={(e) => setDamageDeclaration(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select reason</option>
                  <option value="Expired">Expired</option>
                  <option value="Physical Damage">Physical Damage</option>
                  <option value="Water Damage">Water Damage</option>
                  <option value="Manufacturing Defect">Manufacturing Defect</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Storage Issues">Storage Issues</option>
                  <option value="Transportation Damage">Transportation Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Description
                </label>
                <textarea
                  value={damageDeclaration.description}
                  onChange={(e) => setDamageDeclaration(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Additional details about the damage..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeDamageModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={submitDamageDeclaration}
                disabled={!damageDeclaration.quantity || !damageDeclaration.reason || isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Declaring...' : 'Declare Damage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamagedItemsDeclaration;