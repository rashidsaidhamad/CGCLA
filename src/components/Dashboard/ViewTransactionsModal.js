import React, { useState, useEffect } from 'react';

const ViewTransactionsModal = ({ isOpen, onClose, selectedItem }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch item transactions
  const fetchTransactions = async (itemId) => {
    try {
      setIsLoading(true);
      console.log(`Fetching transactions for item ID: ${itemId}`);
      
      const response = await fetch(`${API_BASE}/inventory/item-transactions/${itemId}/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        let txns = data.transactions || data.results || data || [];
        console.log(`Fetched ${txns.length || 0} transactions:`, txns);
        
        // CRITICAL DEBUG: Log what backend actually returns for each transaction
        console.log('=== BACKEND TRANSACTION DATA ===');
        txns.forEach((t, idx) => {
          console.log(`Transaction ${idx + 1}:`, {
            id: t.id,
            date: t.date,
            quantity: t.quantity,
            unit_price: t.unit_price,
            supplier_name: t.supplier_name,
            supplier_id: t.supplier_id,
            grn_id: t.grn_id || t.receiving_note_id || t.reference_id,
            grn_item_index: t.grn_item_index,
            grn_item_code: t.grn_item_code,
            transaction_type: t.transaction_type
          });
        });
        console.log('=================================');

        // Collect referenced GRN ids from transactions using common keys
        const grnIdKeys = ['grn_id', 'receiving_note_id', 'reference_id', 'receiving_note', 'reference'];
        const referencedIds = new Set();
        txns.forEach(t => {
          for (const k of grnIdKeys) {
            if (t && t[k]) { referencedIds.add(t[k]); break; }
          }
        });

        // Fetch GRNs for referenced ids and build a map
        const grnMap = {};
        if (referencedIds.size > 0) {
          await Promise.all(Array.from(referencedIds).map(async (id) => {
            try {
              const r = await fetch(`${API_BASE}/suppliers/receiving-notes/${id}/`, { headers: getHeaders() });
              if (r.ok) {
                const grn = await r.json();
                grnMap[id] = grn;
              }
            } catch (err) {
              console.warn(`Failed to fetch GRN ${id}:`, err);
            }
          }));
        }

        // Enrich transactions: prefer transaction-level fields, but fill missing unit_price/supplier from referenced GRN item
        const enriched = txns.map(t => {
          const newT = { ...t };

          // Ensure numbers are numbers (if provided)
          if (newT.quantity !== undefined && newT.quantity !== null) newT.quantity = Number(newT.quantity);

          // Determine referenced GRN id for this transaction
          let grnId = null;
          for (const k of grnIdKeys) {
            if (t && t[k]) { grnId = t[k]; break; }
          }

          const grn = grnId ? grnMap[grnId] : null;
          if (grn) {
            // CRITICAL FIX: Use grn_item_index if present (exact match) to avoid matching all transactions to the first GRN item
            let match = null;
            
            // Priority 1: Use explicit grn_item_index if backend persisted it
            if (t.grn_item_index !== undefined && t.grn_item_index !== null && grn.items && grn.items[t.grn_item_index]) {
              match = grn.items[t.grn_item_index];
            } 
            // Priority 2: Try transaction-specific identifiers (NOT selectedItem, which is same for all transactions)
            else if (t.item_code || t.code || t.sku || t.description || t.name || t.grn_item_code || t.grn_item_description) {
              const candidates = [];
              const pushIf = (v) => { if (v !== undefined && v !== null) { const s = String(v).trim().toLowerCase(); if (s) candidates.push(s); } };
              pushIf(t.grn_item_code);        // Prefer grn-specific fields sent in add-stock
              pushIf(t.grn_item_description);
              pushIf(t.item_code);
              pushIf(t.code);
              pushIf(t.sku);
              pushIf(t.description);
              pushIf(t.name);

              // Try to match inside GRN.items - but this can still be ambiguous if descriptions overlap
              match = (grn.items || []).find(it => {
                const itCode = (it.item_code || it.code || '').toString().trim().toLowerCase();
                const itDesc = (it.description || it.name || '').toString().trim().toLowerCase();
                return candidates.some(c => (
                  (itCode && itCode === c) ||
                  (itDesc && itDesc === c)
                ));
              });
            }

            // If transaction doesn't have a unit_price, but the matched GRN item has one, use it
            // IMPORTANT: Only fill if transaction.unit_price is actually missing (respect backend data)
            if ((newT.unit_price === undefined || newT.unit_price === null || newT.unit_price === '') && match && (match.unit_price !== undefined && match.unit_price !== null)) {
              newT.unit_price = Number(match.unit_price);
            }

            // DEBUG: log matching results to help trace why multiple rows may get same unit_price
            // (remove or disable these logs after debugging)
            try {
              console.debug('txn-enrich', {
                txnId: newT.id || newT.reference || null,
                date: t.date,
                grnId,
                grn_item_index: t.grn_item_index,
                usedIndexMatch: (t.grn_item_index !== undefined && t.grn_item_index !== null),
                originalUnitPrice: t.unit_price,
                originalSupplier: t.supplier_name,
                resolvedUnitPrice: newT.unit_price,
                resolvedSupplier: newT.supplier_name,
                matchedGrnItem: match ? { 
                  index: (grn.items || []).indexOf(match),
                  code: match.item_code || match.code, 
                  description: match.description || match.name, 
                  unit_price: match.unit_price 
                } : null
              });
            } catch (e) {
              // ignore logging errors
            }

            // Prefer transaction-level supplier; if absent, use GRN-level supplier/sender
            if (!newT.supplier_name) {
              newT.supplier_name = grn.supplier?.name || grn.sender_details || grn.supplier_name || newT.supplier_name;
            }

            // Attach a ref for debugging or linking
            if (!newT._grn_ref) newT._grn_ref = grn.id;
          }

          return newT;
        });

        setTransactions(enriched);
        // Don't set filteredTransactions here - let the useEffect handle it
      } else {
        console.error(`Failed to fetch transactions: ${response.status}`);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions by month and year
  const filterTransactionsByDate = (txns, month, year) => {
    if (month === 'all') {
      return txns;
    }
    
    return txns.filter(t => {
      const txnDate = new Date(t.date);
      const txnMonth = txnDate.getMonth(); // 0-11
      const txnYear = txnDate.getFullYear();
      
      return txnMonth === parseInt(month) && txnYear === year;
    });
  };

  // Apply filters when month/year changes
  useEffect(() => {
    const filtered = filterTransactionsByDate(transactions, selectedMonth, selectedYear);
    setFilteredTransactions(filtered);
  }, [transactions, selectedMonth, selectedYear]);

  // Download transactions as CSV
  const downloadTransactionsCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to download');
      return;
    }

    // CSV headers
    const headers = ['Date', 'Transaction Type', 'Quantity', 'Unit Price (TSh)', 'Supplier', 'Total Price (TSh)', 'Performed By'];
    
    // CSV rows
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.transaction_type || 'N/A',
      `${t.quantity > 0 ? '+' : ''}${t.quantity}`,
      t.unit_price !== undefined && t.unit_price !== null ? Number(t.unit_price).toFixed(2) : 'N/A',
      t.supplier_name || 'N/A',
      t.unit_price !== undefined && t.unit_price !== null ? (Math.abs(Number(t.quantity) || 0) * Number(t.unit_price)).toFixed(2) : 'N/A',
      t.performed_by || 'System'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `transactions_${selectedItem.item_code}_${selectedMonth === 'all' ? 'all' : new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}_${selectedYear}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load transactions when modal opens or when key changes
  useEffect(() => {
    if (isOpen && selectedItem) {
      fetchTransactions(selectedItem.id);
    }
  }, [isOpen, selectedItem]);

  // Reset transactions when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransactions([]);
      setFilteredTransactions([]);
      setSelectedMonth('all'); // Reset filters
      setSelectedYear(new Date().getFullYear());
    }
  }, [isOpen]);

  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Transaction History - {selectedItem.name} ({selectedItem.item_code})
            </h3>
            <div className="flex items-center space-x-2">
              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              {/* Download Button */}
              <button
                onClick={downloadTransactionsCSV}
                disabled={filteredTransactions.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                title="Download as CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => fetchTransactions(selectedItem.id)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh transactions"
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M4.582 15A8.001 8.001 0 0019.418 11m0 0V11a8 8 0 10-15.356-2" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : (
            <>
              {/* Filter summary */}
              <div className="mb-2 text-sm text-gray-600">
                Showing {filteredTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </div>
              
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (TSh)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (TSh)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.transaction_type === 'received' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.transaction_type === 'issued'
                            ? 'bg-red-100 text-red-800'
                            : transaction.transaction_type === 'adjust'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.transaction_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`font-medium ${
                          transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {selectedItem.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(transaction.unit_price !== undefined && transaction.unit_price !== null)
                          ? Number(transaction.unit_price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.supplier_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(transaction.unit_price !== undefined && transaction.unit_price !== null)
                          ? (Math.abs(Number(transaction.quantity) || 0) * Number(transaction.unit_price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.performed_by || 'System'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>No transactions found for this item</p>
                          <p className="text-sm text-gray-400 mt-1">Stock transactions will appear here once stock is added</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTransactionsModal;