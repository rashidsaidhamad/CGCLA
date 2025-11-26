import React, { useState, useEffect } from 'react';

const ViewTransactionsModal = ({ isOpen, onClose, selectedItem }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, selectedMonth, selectedYear]);

  // Print transactions
  const printTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to print');
      return;
    }

    // Create print window content
    const printWindow = window.open('', '_blank');
    const monthName = selectedMonth === 'all' ? 'All Months' : new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction History - ${selectedItem.name}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 20px;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.4;
            }
            
            .header {
              display: flex;
              align-items: flex-start;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .logo-section {
              flex-shrink: 0;
              margin-right: 20px;
            }
            
            .logo-section img {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            
            .company-info {
              flex-grow: 1;
            }
            
            .company-info h1 {
              margin: 0 0 5px 0;
              font-size: 18px;
              font-weight: bold;
              color: #1a1a1a;
            }
            
            .company-info p {
              margin: 3px 0;
              font-size: 11px;
              color: #555;
            }
            
            .document-title {
              text-align: center;
              margin: 20px 0;
            }
            
            .document-title h2 {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
              color: #1a1a1a;
            }
            
            .item-info {
              background-color: #f5f5f5;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            
            .item-info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            
            .info-item {
              display: flex;
              margin-bottom: 5px;
            }
            
            .info-label {
              font-weight: bold;
              margin-right: 10px;
              min-width: 120px;
            }
            
            .filter-info {
              text-align: center;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11px;
            }
            
            thead {
              background-color: #475569;
              color: white;
            }
            
            th, td {
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
            }
            
            th {
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
            }
            
            tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            tbody tr:hover {
              background-color: #f1f5f9;
            }
            
            .positive {
              color: #059669;
              font-weight: 600;
            }
            
            .negative {
              color: #dc2626;
              font-weight: 600;
            }
            
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .badge-received {
              background-color: #d1fae5;
              color: #065f46;
            }
            
            .badge-issued {
              background-color: #fee2e2;
              color: #991b1b;
            }
            
            .badge-adjust {
              background-color: #fef3c7;
              color: #92400e;
            }
            
            .badge-supplier {
              background-color: #dbeafe;
              color: #1e40af;
            }
            
            .summary {
              margin-top: 30px;
              padding: 15px;
              background-color: #f0f9ff;
              border-left: 4px solid #3b82f6;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            
            .summary-label {
              font-weight: bold;
            }
            
            .summary-value {
              font-weight: bold;
              color: #3b82f6;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <img src="/cgcla.jpg" alt="CGCLA Logo" onerror="this.style.display='none'" />
            </div>
            <div class="company-info">
              <h1>CGCLA INVENTORY MANAGEMENT</h1>
              <p>146 Bububu Road, 70403 Urban West, Zanzibar, Maruhubi S.L.P 759</p>
              <p>Email: info@cgcla.go.tz | Tel. No: +255-24-2238123 | Fax: +255-24-2238124</p>
            </div>
          </div>
          
          <div class="document-title">
            <h2>TRANSACTION HISTORY REPORT</h2>
          </div>
          
          <div class="item-info">
            <div class="item-info-grid">
              <div class="info-item">
                <span class="info-label">Item Name:</span>
                <span>${selectedItem.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Item Code:</span>
                <span>${selectedItem.item_code}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Unit:</span>
                <span>${selectedItem.unit || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Current Stock:</span>
                <span>${selectedItem.stock || 0} ${selectedItem.unit || ''}</span>
              </div>
            </div>
          </div>
          
          <div class="filter-info">
            <strong>Period:</strong> ${monthName} ${selectedYear} | 
            <strong>Total Transactions:</strong> ${filteredTransactions.length} | 
            <strong>Total Amount:</strong> ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TSh
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction Type</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Unit Price (TSh)</th>
                <th>Supplier</th>
                <th class="text-right">Total Price (TSh)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <span class="badge badge-${t.transaction_type === 'received' ? 'received' : t.transaction_type === 'issued' ? 'issued' : 'adjust'}">
                      ${t.transaction_type || 'N/A'}
                    </span>
                  </td>
                  <td class="text-center ${t.quantity > 0 ? 'positive' : 'negative'}">
                    ${t.quantity > 0 ? '+' : ''}${t.quantity} ${selectedItem.unit}
                  </td>
                  <td class="text-right">
                    ${(t.unit_price !== undefined && t.unit_price !== null) 
                      ? Number(t.unit_price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : 'N/A'
                    }
                  </td>
                  <td>
                    <span class="badge badge-supplier">
                      ${t.supplier_name || 'N/A'}
                    </span>
                  </td>
                  <td class="text-right">
                    ${(t.unit_price !== undefined && t.unit_price !== null)
                      ? (Math.abs(Number(t.quantity) || 0) * Number(t.unit_price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : 'N/A'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Transactions:</span>
                <span class="summary-value">${filteredTransactions.length}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Amount:</span>
                <span class="summary-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TSh</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Period:</span>
                <span class="summary-value">${monthName} ${selectedYear}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Report Date:</span>
                <span class="summary-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Generated by: CGCLA Warehouse Management System</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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
      setCurrentPage(1); // Reset pagination
    }
  }, [isOpen]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Calculate total amount for all filtered transactions
  const calculateTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      if (transaction.unit_price !== undefined && transaction.unit_price !== null) {
        const amount = Math.abs(Number(transaction.quantity) || 0) * Number(transaction.unit_price);
        return total + amount;
      }
      return total;
    }, 0);
  };

  const totalAmount = calculateTotalAmount();

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

              {/* Print Button */}
              <button
                onClick={printTransactions}
                disabled={filteredTransactions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                title="Print Report"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
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
              {/* Filter summary and Total */}
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  Total Amount: <span className="text-blue-600">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TSh</span>
                </div>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.length > 0 ? currentTransactions.map((transaction, index) => (
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
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            <span key={page} className="px-2 py-1 text-sm text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            isCurrentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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