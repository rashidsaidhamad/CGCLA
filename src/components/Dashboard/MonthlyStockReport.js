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
  const [stockTransactions, setStockTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalIssued: 0,
    totalReceived: 0,
    netChange: 0,
    transactionCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(10);

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

  // Generate years dynamically - current year and previous 4 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch stock summary and filtered transactions
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

      // Fetch stock transactions for the selected month
      const transactionsResponse = await fetch(`${API_BASE}/inventory/transactions/`, {
        headers: getHeaders()
      });

      if (!transactionsResponse.ok) {
        throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
      }

      const transactionsData = await transactionsResponse.json();
      const allTransactions = transactionsData.results || transactionsData;

      // Filter transactions by selected month and year
      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const txMonth = transactionDate.getMonth();
        const txYear = transactionDate.getFullYear();
        const matches = txMonth === selectedMonth && txYear === selectedYear;
        
        // Debug logging for first few transactions
        if (allTransactions.indexOf(transaction) < 3) {
          console.log(`Transaction ${transaction.id}:`, {
            date: transaction.date,
            parsed: transactionDate.toISOString(),
            month: txMonth,
            year: txYear,
            selectedMonth,
            selectedYear,
            matches
          });
        }
        
        return matches;
      });

      console.log(`Filtered ${filteredTransactions.length} transactions for ${monthNames[selectedMonth]} ${selectedYear} from ${allTransactions.length} total`);
      setStockTransactions(filteredTransactions);

      // Calculate monthly statistics
      const issuedTransactions = filteredTransactions.filter(t => t.transaction_type === 'issued');
      const receivedTransactions = filteredTransactions.filter(t => t.transaction_type === 'received');
      
      const totalIssued = issuedTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const totalReceived = receivedTransactions.reduce((sum, t) => sum + t.quantity, 0);
      
      setMonthlyStats({
        totalIssued,
        totalReceived,
        netChange: totalReceived - totalIssued,
        transactionCount: filteredTransactions.length
      });

    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Failed to load stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(`Fetching data for ${monthNames[selectedMonth]} ${selectedYear}`);
    fetchStockData();
    setCurrentPage(1);
    setTransactionsPage(1);
  }, [selectedMonth, selectedYear]);

  const handleRefresh = () => {
    fetchStockData();
  };

  // Calculate pagination for inventory items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventoryItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventoryItems.length / itemsPerPage);

  // Calculate pagination for transactions
  const indexOfLastTransaction = transactionsPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = stockTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalTransactionPages = Math.ceil(stockTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTransactionsPageChange = (pageNumber) => {
    setTransactionsPage(pageNumber);
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
            <h2 className="text-2xl font-bold text-gray-900">Stock Report - {monthNames[selectedMonth]} {selectedYear}</h2>
            <p className="text-gray-600 mt-1">
              Stock balance and transaction activity for the selected period
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
      

      {/* Monthly Transaction Statistics */}
      
      {/* Recent Transactions for Selected Month */}
      {stockTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transactions for {monthNames[selectedMonth]} {selectedYear}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction, index) => {
                  const transactionDate = new Date(transaction.date);
                  return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transactionDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {transactionDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.item_name || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === 'received' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.transaction_type === 'issued'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.performed_by_name || 'System'}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Transactions Pagination */}
          {totalTransactionPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastTransaction, stockTransactions.length)}</span> of{' '}
                    <span className="font-medium">{stockTransactions.length}</span> transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Per page:</label>
                    <select
                      value={transactionsPerPage}
                      onChange={(e) => {
                        setTransactionsPerPage(parseInt(e.target.value));
                        setTransactionsPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTransactionsPageChange(transactionsPage - 1)}
                    disabled={transactionsPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {[...Array(totalTransactionPages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === transactionsPage;
                      
                      // Show first page, last page, current page, and pages around current
                      const showPage = page === 1 || 
                                      page === totalTransactionPages || 
                                      (page >= transactionsPage - 1 && page <= transactionsPage + 1);
                      
                      if (!showPage) {
                        if (page === transactionsPage - 2 || page === transactionsPage + 2) {
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
                          onClick={() => handleTransactionsPageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isCurrentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handleTransactionsPageChange(transactionsPage + 1)}
                    disabled={transactionsPage === totalTransactionPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {stockTransactions.length === 0 && !isLoading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            No transactions found for {monthNames[selectedMonth]} {selectedYear}
          </p>
        </div>
      )}

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
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
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
        
        {/* Inventory Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, inventoryItems.length)}</span> of{' '}
                  <span className="font-medium">{inventoryItems.length}</span> items
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
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
    </div>
  );
};

export default MonthlyStockReport;
