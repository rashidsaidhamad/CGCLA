import React, { useState, useEffect } from 'react';
import Reports from './Reports';

const ItemIssuedReport = () => {
  const [reportData, setReportData] = useState(null);
  const [itemDetails, setItemDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch detailed item issued report
  const fetchItemIssuedReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all required data including damage reports for each item
      const [requestsResponse, inventoryResponse, categoriesResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_BASE}/reports/request-report/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/reports/inventory-report/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/inventory/categories/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/inventory/transactions/`, { headers: getHeaders() })
      ]);

      if (!requestsResponse.ok || !inventoryResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const requestsData = await requestsResponse.json();
      const inventoryData = await inventoryResponse.json();
      const categoriesData = await categoriesResponse.json();
      const transactionsData = transactionsResponse.ok ? await transactionsResponse.json() : [];

      // Fetch stock transactions for each item to get received quantities
      const inventoryItems = inventoryData.items || inventoryData || [];
      const stockTransactionsPromises = inventoryItems.map(async (item) => {
        try {
          const response = await fetch(`${API_BASE}/inventory/item-transactions/${item.id}/`, { headers: getHeaders() });
          if (response.ok) {
            const data = await response.json();
            return { itemId: item.id, transactions: data.transactions || [] };
          }
        } catch (error) {
          console.error(`Error fetching stock transactions for item ${item.id}:`, error);
        }
        return { itemId: item.id, transactions: [] };
      });

      const stockTransactionsData = await Promise.all(stockTransactionsPromises);

      // Fetch damage reports for all items
      const damageReportsPromises = inventoryItems.map(async (item) => {
        try {
          const response = await fetch(`${API_BASE}/inventory/damage-reports/${item.id}/`, { headers: getHeaders() });
          if (response.ok) {
            const data = await response.json();
            return { itemId: item.id, reports: data.reports || [] };
          }
        } catch (error) {
          console.error(`Error fetching damage reports for item ${item.id}:`, error);
        }
        return { itemId: item.id, reports: [] };
      });

      const damageReportsData = await Promise.all(damageReportsPromises);

      console.log('Requests Data:', requestsData);
      console.log('Inventory Data:', inventoryData);
      console.log('Categories Data:', categoriesData);
      console.log('Transactions Data:', transactionsData);

      // Set categories for filtering
      setCategories(categoriesData.results || categoriesData || []);

      // Process and combine the data with damage reports and stock transactions
      const processedData = processItemData(requestsData, inventoryData, transactionsData, damageReportsData, stockTransactionsData);
      setItemDetails(processedData);
      setReportData({ 
        requests: requestsData, 
        inventory: inventoryData, 
        transactions: transactionsData,
        damageReports: damageReportsData,
        stockTransactions: stockTransactionsData
      });

    } catch (error) {
      console.error('Error fetching item issued report:', error);
      setError('Failed to load item issued report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process and combine request and inventory data
  const processItemData = (requestsData, inventoryData, transactionsData = [], damageReportsData = [], stockTransactionsData = []) => {
    const requests = requestsData.requests || requestsData || [];
    const inventory = inventoryData.items || inventoryData || [];
    const transactions = transactionsData.results || transactionsData || [];

    // Create a map of damage reports by item ID for quick lookup
    const damageReportsMap = {};
    damageReportsData.forEach(({ itemId, reports }) => {
      damageReportsMap[itemId] = reports;
    });

    // Create a map of stock transactions by item ID for quick lookup
    const stockTransactionsMap = {};
    stockTransactionsData.forEach(({ itemId, transactions }) => {
      stockTransactionsMap[itemId] = transactions || [];
    });

    // Create a map of inventory items for quick lookup
    const inventoryMap = {};
    inventory.forEach(item => {
      inventoryMap[item.id] = item;
    });

    // Calculate monthly data for each item
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const itemStockMap = {};

    // Initialize stock data for all inventory items
    inventory.forEach(item => {
      if (!itemStockMap[item.id]) {
        itemStockMap[item.id] = {
          id: item.id,
          itemCode: item.item_code || 'N/A',
          itemName: item.name,
          unit: item.unit || 'pcs',
          category: item.category?.name || item.category || 'Uncategorized',
          categoryId: item.category?.id || null,
          lastMonthStock: 0,
          lastMonthDamaged: 0,
          receivedThisMonth: 0,
          issuedThisMonth: 0,
          currentStock: item.current_stock || item.stock || item.quantity || 0,
          currentDamaged: 0,
          unitPrice: item.unit_price || 0
        };
      }
    });

    // Process requests for issued items this month
    requests
      .filter(request => request.status === 'approved')
      .forEach(request => {
        const requestDate = new Date(request.created_at || request.date_requested);
        const requestMonth = requestDate.getMonth();
        const requestYear = requestDate.getFullYear();

        if (requestMonth === currentMonth && requestYear === currentYear) {
          const itemId = typeof request.item === 'object' ? request.item?.id : request.item;
          if (itemStockMap[itemId]) {
            itemStockMap[itemId].issuedThisMonth += request.approved_quantity || request.quantity || 0;
          }
        }
      });

    // Calculate damage quantities and received quantities from actual data
    Object.values(itemStockMap).forEach(item => {
      const itemDamageReports = damageReportsMap[item.id] || [];
      const itemStockTransactions = stockTransactionsMap[item.id] || [];
      
      // Calculate current month and last month damage quantities
      let currentMonthDamage = 0;
      let lastMonthDamage = 0;
      
      itemDamageReports.forEach(report => {
        const reportDate = new Date(report.date);
        const reportMonth = reportDate.getMonth();
        const reportYear = reportDate.getFullYear();
        
        if (reportMonth === currentMonth && reportYear === currentYear) {
          currentMonthDamage += report.damage_quantity || 0;
        } else if (reportMonth === lastMonth && reportYear === lastMonthYear) {
          lastMonthDamage += report.damage_quantity || 0;
        }
      });
      
      // Calculate received quantities from stock transactions
      let receivedThisMonth = 0;
      
      itemStockTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        
        // Only count transactions that add stock and are positive quantities
        const isReceivingTransaction = ['received', 'restock', 'purchase'].includes(transaction.transaction_type?.toLowerCase());
        const isCurrentMonth = transactionMonth === currentMonth && transactionYear === currentYear;
        
        if (isReceivingTransaction && isCurrentMonth && transaction.quantity > 0) {
          receivedThisMonth += transaction.quantity || 0;
        }
      });
      
      // Update quantities with actual data
      item.currentDamaged = currentMonthDamage;
      item.lastMonthDamaged = lastMonthDamage;
      item.receivedThisMonth = receivedThisMonth;
      
      // Calculate last month stock (current + issued - received)
      item.lastMonthStock = Math.max(0, item.currentStock + item.issuedThisMonth - item.receivedThisMonth);
      item.totalValue = item.currentStock * item.unitPrice;
    });

    return Object.values(itemStockMap);
  };

  // Generate month options
  const getMonthOptions = () => {
    const months = [
      { value: '0', label: 'January' },
      { value: '1', label: 'February' },
      { value: '2', label: 'March' },
      { value: '3', label: 'April' },
      { value: '4', label: 'May' },
      { value: '5', label: 'June' },
      { value: '6', label: 'July' },
      { value: '7', label: 'August' },
      { value: '8', label: 'September' },
      { value: '9', label: 'October' },
      { value: '10', label: 'November' },
      { value: '11', label: 'December' }
    ];
    return months;
  };

  // Filter and recalculate data by month and category
  const getFilteredData = () => {
    let filtered = [...itemDetails];

    // If a specific month is selected, recalculate the data for that month
    if (selectedMonth && reportData) {
      const monthIndex = parseInt(selectedMonth);
      const currentYear = new Date().getFullYear();
      
      // Recalculate data for the selected month
      filtered = recalculateDataForMonth(monthIndex, currentYear);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === parseInt(selectedCategory));
    }

    return filtered;
  };

  // Recalculate data for a specific month
  const recalculateDataForMonth = (targetMonth, targetYear) => {
    if (!reportData) return itemDetails;

    const requests = reportData.requests.requests || reportData.requests || [];
    const inventory = reportData.inventory.items || reportData.inventory || [];
    const damageReports = reportData.damageReports || [];
    const stockTransactions = reportData.stockTransactions || [];

    // Create maps for quick lookup
    const damageReportsMap = {};
    damageReports.forEach(({ itemId, reports }) => {
      damageReportsMap[itemId] = reports;
    });

    const stockTransactionsMap = {};
    stockTransactions.forEach(({ itemId, transactions }) => {
      stockTransactionsMap[itemId] = transactions || [];
    });

    const itemStockMap = {};

    // Initialize stock data for all inventory items
    inventory.forEach(item => {
      if (!itemStockMap[item.id]) {
        itemStockMap[item.id] = {
          id: item.id,
          itemCode: item.item_code || 'N/A',
          itemName: item.name,
          unit: item.unit || 'pcs',
          category: item.category?.name || item.category || 'Uncategorized',
          categoryId: item.category?.id || null,
          lastMonthStock: 0,
          lastMonthDamaged: 0,
          receivedThisMonth: 0,
          issuedThisMonth: 0,
          currentStock: item.current_stock || item.stock || item.quantity || 0,
          currentDamaged: 0,
          unitPrice: item.unit_price || 0
        };
      }
    });

    // Calculate previous month values
    const previousMonth = targetMonth === 0 ? 11 : targetMonth - 1;
    const previousYear = targetMonth === 0 ? targetYear - 1 : targetYear;

    // Process requests for issued items in the target month
    requests
      .filter(request => request.status === 'approved')
      .forEach(request => {
        const requestDate = new Date(request.created_at || request.date_requested);
        const requestMonth = requestDate.getMonth();
        const requestYear = requestDate.getFullYear();

        if (requestMonth === targetMonth && requestYear === targetYear) {
          const itemId = typeof request.item === 'object' ? request.item?.id : request.item;
          if (itemStockMap[itemId]) {
            itemStockMap[itemId].issuedThisMonth += request.approved_quantity || request.quantity || 0;
          }
        }
      });

    // Calculate damage quantities and received quantities for the target month
    Object.values(itemStockMap).forEach(item => {
      const itemDamageReports = damageReportsMap[item.id] || [];
      const itemStockTransactions = stockTransactionsMap[item.id] || [];
      
      // Calculate target month and previous month damage quantities
      let targetMonthDamage = 0;
      let previousMonthDamage = 0;
      
      itemDamageReports.forEach(report => {
        const reportDate = new Date(report.date);
        const reportMonth = reportDate.getMonth();
        const reportYear = reportDate.getFullYear();
        
        if (reportMonth === targetMonth && reportYear === targetYear) {
          targetMonthDamage += report.damage_quantity || 0;
        } else if (reportMonth === previousMonth && reportYear === previousYear) {
          previousMonthDamage += report.damage_quantity || 0;
        }
      });
      
      // Calculate received quantities for the target month
      let receivedThisMonth = 0;
      
      itemStockTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        
        // Only count transactions that add stock and are positive quantities
        const isReceivingTransaction = ['received', 'restock', 'purchase'].includes(transaction.transaction_type?.toLowerCase());
        const isTargetMonth = transactionMonth === targetMonth && transactionYear === targetYear;
        
        if (isReceivingTransaction && isTargetMonth && transaction.quantity > 0) {
          receivedThisMonth += transaction.quantity || 0;
        }
      });
      
      // Update quantities with calculated data for the target month
      item.currentDamaged = targetMonthDamage;
      item.lastMonthDamaged = previousMonthDamage;
      item.receivedThisMonth = receivedThisMonth;
      
      // Calculate last month stock (current + issued - received)
      item.lastMonthStock = Math.max(0, item.currentStock + item.issuedThisMonth - item.receivedThisMonth);
      item.totalValue = item.currentStock * item.unitPrice;
    });

    return Object.values(itemStockMap);
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      currentItems: filteredData.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredData.length,
      totalPages: Math.ceil(filteredData.length / itemsPerPage),
      indexOfFirstItem,
      indexOfLastItem
    };
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Export to CSV
  const exportToCSV = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Item Code',
      'Item Name',
      'Unit',
      'Last Month Stock',
      'Last Month Damaged',
      'Received This Month',
      'Issued This Month',
      'Current Stock',
      'Current Month Damaged',
      'Category'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.itemCode}"`,
        `"${item.itemName}"`,
        `"${item.unit}"`,
        item.lastMonthStock,
        item.lastMonthDamaged,
        item.receivedThisMonth,
        item.issuedThisMonth,
        item.currentStock,
        item.currentDamaged,
        `"${item.category}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Initial load
  useEffect(() => {
    fetchItemIssuedReport();
  }, []);

  const { currentItems, totalItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
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
      {/* Header removed as requested */}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  resetPagination();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Months</option>
                {getMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  resetPagination();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={fetchItemIssuedReport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={totalItems === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>

            {(selectedMonth || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedCategory('');
                  resetPagination();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Stock Movement Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
            {(selectedMonth || selectedCategory) && (
              <span className="ml-2 text-indigo-600">
                • Filtered by {selectedMonth && `month`} {selectedCategory && `category`}
              </span>
            )}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">
                  Last Month Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received This Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued This Month
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">
                  Current Stock
                </th>
              </tr>
              <tr className="bg-gray-50 border-t">
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Quantity</th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Damaged</th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Quantity</th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Damaged This Month</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Item Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.itemCode}
                    </span>
                  </td>

                  {/* Item Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {item.itemName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.unit}
                    </span>
                  </td>

                  {/* Last Month Stock - Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {item.lastMonthStock.toLocaleString()}
                    </span>
                  </td>

                  {/* Last Month Stock - Damaged */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.lastMonthDamaged.toLocaleString()}
                    </span>
                  </td>

                  {/* Received This Month */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{item.receivedThisMonth.toLocaleString()}
                    </span>
                  </td>

                  {/* Issued This Month */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      -{item.issuedThisMonth.toLocaleString()}
                    </span>
                  </td>

                  {/* Current Stock - Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.currentStock > 10 
                        ? 'bg-blue-100 text-blue-800'
                        : item.currentStock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.currentStock.toLocaleString()}
                    </span>
                  </td>

                  {/* Current Stock - Damaged */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.currentDamaged.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalItems === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {(selectedMonth || selectedCategory) 
                  ? 'No items found for the selected filters.'
                  : 'No stock movement data found.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    
                    // Show first page, last page, current page, and pages around current
                    const showPage = page === 1 || 
                                    page === totalPages || 
                                    (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-3 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
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

      {/* Items Per Page Selector */}
      {totalItems > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemIssuedReport;