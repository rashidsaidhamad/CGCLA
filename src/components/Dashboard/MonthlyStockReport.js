import React, { useState, useEffect } from 'react';

const MonthlyStockReport = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stockData, setStockData] = useState({
    total_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_stock_value: 0
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2023, 2024, 2025];

  // Fetch stock summary
  const fetchStockData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch stock summary
      const summaryResponse = await fetch(`${API_BASE}/inventory/stock/summary/`, {
        headers: getHeaders()
      });

      if (!summaryResponse.ok) {
        throw new Error(`HTTP error! status: ${summaryResponse.status}`);
      }

      const summaryData = await summaryResponse.json();
      setStockData(summaryData);

      // Fetch inventory items
      const itemsResponse = await fetch(`${API_BASE}/inventory/items/`, {
        headers: getHeaders()
      });

      if (!itemsResponse.ok) {
        throw new Error(`HTTP error! status: ${itemsResponse.status}`);
      }

      const itemsData = await itemsResponse.json();
      setInventoryItems(itemsData.results || itemsData);

    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Failed to load stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [selectedMonth, selectedYear]);

  const handleRefresh = () => {
    fetchStockData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900"> Stock Report</h2>
            <p className="text-gray-600 mt-1">
              Current stock balance and inventory status
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-600">{stockData.total_items}</p>
              <p className="text-xs text-gray-500">Items in inventory</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{stockData.low_stock_items}</p>
              <p className="text-xs text-gray-500">Below minimum level</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stockData.out_of_stock_items}</p>
              <p className="text-xs text-gray-500">Zero stock items</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600">TZS {stockData.total_stock_value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total inventory value</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Current Inventory Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Inventory Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stock} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TZS {item.unit_price?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      TZS {((item.stock || 0) * (item.unit_price || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stock === 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : item.stock <= item.min_stock ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStockReport;
