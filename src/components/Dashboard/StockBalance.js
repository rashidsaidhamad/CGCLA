import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import StockAdjustmentModal from './StockAdjustmentModal';
import ItemHistoryModal from './ItemHistoryModal';

const StockBalance = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stock adjustment modal state
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'increase',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    unit_price: 0 // New unit price field
  });

  // Item history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [localHistory, setLocalHistory] = useState({}); // Store local history per item

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Inventory items data:', data.results?.[0] || data[0]); // Debug log
      setInventoryItems(data.results || data);
      setError(null);
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch recent stock transactions
  const fetchStockTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/transactions/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStockTransactions((data.results || data).slice(0, 5)); // Get last 5 transactions
      }
    } catch (error) {
      console.error('Error fetching stock transactions:', error);
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async () => {
    if (!stockAdjustment.quantity || !stockAdjustment.reason || !stockAdjustment.date) {
      alert('Please enter quantity, reason, and date for adjustment');
      return;
    }

    try {
      // Calculate adjustment value (positive for increase, negative for decrease)
      const adjustmentValue = stockAdjustment.type === 'increase' 
        ? stockAdjustment.quantity 
        : -stockAdjustment.quantity;

      const requestData = {
        item_id: selectedItem.id,
        adjustment: adjustmentValue,
        reason: stockAdjustment.reason,
        date: stockAdjustment.date,
        // Store current values as "before" values for history tracking
        stock_before: selectedItem.stock,
        price_before: selectedItem.unit_price || 0
      };

      // Include unit price if provided
      if (stockAdjustment.unit_price && stockAdjustment.unit_price > 0) {
        requestData.unit_price = parseFloat(stockAdjustment.unit_price);
        requestData.price_after = parseFloat(stockAdjustment.unit_price);
      } else {
        requestData.price_after = selectedItem.unit_price || 0;
      }

      // Calculate stock after
      requestData.stock_after = selectedItem.stock + adjustmentValue;

      console.log('Sending stock adjustment data:', requestData);

      const response = await fetch(`${API_BASE}/inventory/stock/adjust/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create local history entry
        const historyEntry = {
          id: Date.now(), // Temporary ID
          item_name: selectedItem.name,
          stock_before: selectedItem.stock,
          stock_after: selectedItem.stock + adjustmentValue,
          price_before: selectedItem.unit_price || 0,
          price_after: requestData.price_after,
          date: stockAdjustment.date,
          created_at: new Date().toISOString(),
          reason: stockAdjustment.reason,
          adjustment: adjustmentValue,
          transaction_type: stockAdjustment.type
        };

        // Store in local history
        setLocalHistory(prev => ({
          ...prev,
          [selectedItem.id]: [historyEntry, ...(prev[selectedItem.id] || [])]
        }));

        alert(`Stock adjusted successfully! ${result.item}: ${result.old_stock} → ${result.new_stock} units`);
        setShowStockModal(false);
        setSelectedItem(null);
        setStockAdjustment({ 
          type: 'increase', 
          quantity: 0, 
          reason: '', 
          date: new Date().toISOString().split('T')[0],
          unit_price: 0 
        });
        // Refresh the inventory data to show updated stock
        await fetchInventoryItems();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to adjust stock'}`);
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error updating stock. Please try again.');
    }
  };

  // Open stock adjustment modal
  const openStockModal = (item) => {
    setSelectedItem(item);
    setStockAdjustment(prev => ({
      ...prev,
      unit_price: item.unit_price || 0 // Pre-fill with current unit price
    }));
    setShowStockModal(true);
  };

  // Fetch item history
  const fetchItemHistory = async (itemId) => {
    try {
      setHistoryLoading(true);
      console.log('Fetching history for item:', itemId);
      
      // Try multiple possible endpoints for history
      const possibleEndpoints = [
        `${API_BASE}/inventory/items/${itemId}/history/`,
        `${API_BASE}/inventory/transactions/?item=${itemId}`,
        `${API_BASE}/inventory/stock-adjustments/?item=${itemId}`,
        `${API_BASE}/inventory/history/${itemId}/`
      ];

      let historyData = [];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          const response = await fetch(endpoint, {
            headers: getHeaders(),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('History data from', endpoint, ':', data);
            historyData = data.results || data || [];
            if (historyData.length > 0) {
              break; // Use the first endpoint that returns data
            }
          } else {
            console.log('Endpoint failed:', endpoint, response.status);
          }
        } catch (endpointError) {
          console.log('Error with endpoint:', endpoint, endpointError);
          continue;
        }
      }

      if (historyData.length === 0) {
        // If no history from API, create mock data from recent stock transactions
        console.log('No history found, checking recent transactions');
        try {
          const transResponse = await fetch(`${API_BASE}/inventory/transactions/`, {
            headers: getHeaders(),
          });
          
          if (transResponse.ok) {
            const transData = await transResponse.json();
            const itemTransactions = (transData.results || transData).filter(
              transaction => transaction.item_id === itemId || transaction.item?.id === itemId
            );
            historyData = itemTransactions.slice(0, 10); // Get last 10 transactions
          }
        } catch (transError) {
          console.log('Error fetching transactions:', transError);
        }
      }

      // Sort by date (newest first) for proper before/after logic
      const sortedHistory = historyData.sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || a.timestamp);
        const dateB = new Date(b.date || b.created_at || b.timestamp);
        return dateB - dateA; // Newest first
      });

      console.log('Final sorted history:', sortedHistory);
      
      // Combine with local history if available
      const itemLocalHistory = localHistory[itemId] || [];
      const combinedHistory = [...itemLocalHistory, ...sortedHistory];
      
      // Remove duplicates and sort again
      const uniqueHistory = combinedHistory.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      ).sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || a.timestamp);
        const dateB = new Date(b.date || b.created_at || b.timestamp);
        return dateB - dateA; // Newest first
      });

      setItemHistory(uniqueHistory);
      
      // If still no history, show a message
      if (uniqueHistory.length === 0) {
        console.log('No history found for item:', itemId);
      }
      
    } catch (error) {
      console.error('Error fetching item history:', error);
      setItemHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Open item history modal
  const openHistoryModal = (item) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
    fetchItemHistory(item.id);
  };



  useEffect(() => {
    fetchInventoryItems();
    fetchCategories();
    fetchStockTransactions();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             item.category?.id === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle nested category name
      if (sortBy === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }
      
      // Handle date sorting
      if (sortBy === 'last_updated') {
        aValue = new Date(a.last_updated || 0);
        bValue = new Date(b.last_updated || 0);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  // Get stock status
  const getStockStatus = (item) => {
    if (item.stock <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' };
    } else if (item.stock <= item.min_stock) {
      return { status: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' };
    } else if (item.stock >= item.max_stock) {
      return { status: 'Overstock', color: 'text-purple-600', bg: 'bg-purple-100', icon: '📦' };
    } else {
      return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' };
    }
  };



  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Stock Balance</h1>
        <p className="text-green-100 text-lg">
          Monitor inventory levels and stock movements
        </p>
      </div>



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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('item_code')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Item Code
                    {sortBy === 'item_code' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Name
                    {sortBy === 'name' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stock')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Current Stock
                    {sortBy === 'stock' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min/Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th 
                  onClick={() => handleSort('unit_price')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Unit Price (TSh)
                    {sortBy === 'unit_price' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount (TSh)
                </th>
                <th 
                  onClick={() => handleSort('last_updated')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Last Updated
                    {sortBy === 'last_updated' && (
                      <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => {
                const stockInfo = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{item.stock}</span> {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.min_stock} / {item.max_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.bg} ${stockInfo.color}`}>
                        <span className="mr-1">{stockInfo.icon}</span>
                        {stockInfo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(item.stock * parseFloat(item.unit_price || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="text-gray-900">
                          {item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.last_updated ? new Date(item.last_updated).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStockModal(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Adjust Stock
                        </button>
                        <button
                          onClick={() => openHistoryModal(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View History
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredAndSortedItems.length)}</span> of{' '}
                <span className="font-medium">{filteredAndSortedItems.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        showStockModal={showStockModal}
        selectedItem={selectedItem}
        stockAdjustment={stockAdjustment}
        setStockAdjustment={setStockAdjustment}
        handleStockAdjustment={handleStockAdjustment}
        onClose={() => {
          setShowStockModal(false);
          setSelectedItem(null);
        }}
      />

      {/* Item History Modal */}
      <ItemHistoryModal
        showHistoryModal={showHistoryModal}
        selectedItem={selectedItem}
        itemHistory={itemHistory}
        historyLoading={historyLoading}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedItem(null);
          setItemHistory([]);
        }}
      />
     
    </div>
  );
};

export default StockBalance;
