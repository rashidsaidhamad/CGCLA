import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';

const Reports = () => {
  const [reportData, setReportData] = useState({
    inventoryReport: null,
    issuedReport: null
  });
  const [filteredData, setFilteredData] = useState(null);
  const [selectedReport, setSelectedReport] = useState('issued');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch departments for filtering
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/departments/departments/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch units for filtering
  const fetchUnits = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/items/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extract unique units from items
        const uniqueUnits = [...new Set(data.map(item => item.unit).filter(Boolean))];
        setUnits(uniqueUnits);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  // Filter data based on month, year, department, and unit
  const filterData = (data) => {
    if (!data) return data;

    let filteredItems = data.requests || data.items || data || [];
    
    // Apply month and year filter
    if (selectedMonth !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.created_at || item.date_requested || item.date);
        const itemMonth = itemDate.getMonth(); // 0-11
        const itemYear = itemDate.getFullYear();
        
        return itemMonth === parseInt(selectedMonth) && itemYear === selectedYear;
      });
    } else {
      // Filter by year only
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.created_at || item.date_requested || item.date);
        const itemYear = itemDate.getFullYear();
        return itemYear === selectedYear;
      });
    }

    // Apply department filter (for issued reports)
    if (selectedDepartment !== 'all' && selectedReport === 'issued') {
      filteredItems = filteredItems.filter(item => {
        const user = item.requester || item.user;
        const dept = user?.department;
        return dept?.id === parseInt(selectedDepartment) || dept?.name === selectedDepartment;
      });
    }

    // Apply unit filter
    if (selectedUnit !== 'all') {
      if (selectedReport === 'inventory') {
        filteredItems = filteredItems.filter(item => item.unit === selectedUnit);
      } else if (selectedReport === 'issued') {
        filteredItems = filteredItems.filter(item => {
          const itemObj = typeof item.item === 'object' ? item.item : null;
          return itemObj?.unit === selectedUnit;
        });
      }
    }

    // Return filtered data in the same structure as original
    if (data.requests) {
      return { ...data, requests: filteredItems };
    } else if (data.items) {
      return { ...data, items: filteredItems };
    } else {
      return filteredItems;
    }
  };

  // Fetch specific report
  const fetchReport = async (reportType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const endpoints = {
        inventory: '/reports/inventory-report/',
        issued: '/reports/request-report/'
      };

      const response = await fetch(`${API_BASE}${endpoints[reportType]}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`${reportType} report data:`, data);
      
      setReportData(prev => ({
        ...prev,
        [`${reportType}Report`]: data
      }));
    } catch (error) {
      console.error(`Error fetching ${reportType} report:`, error);
      setError(`Failed to load ${reportType} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReport(selectedReport);
    fetchDepartments();
    fetchUnits();
  }, [selectedReport]);

  // Apply filters whenever data or filter values change
  useEffect(() => {
    const rawData = reportData[`${selectedReport}Report`];
    if (rawData) {
      const filtered = filterData(rawData);
      setFilteredData(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } else {
      setFilteredData(null);
    }
  }, [reportData, selectedReport, selectedMonth, selectedYear, selectedDepartment, selectedUnit]);

  // Handle report type change
  const handleReportChange = (reportType) => {
    setSelectedReport(reportType);
    if (!reportData[`${reportType}Report`]) {
      fetchReport(reportType);
    }
  };

  // Print report
  const printReport = () => {
    const currentData = getCurrentReportData();
    if (!currentData) {
      alert('No data to print');
      return;
    }

    const monthName = selectedMonth === 'all' ? 'All Months' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedMonth)];
    const departmentName = selectedDepartment !== 'all' ? departments.find(d => d.id === parseInt(selectedDepartment))?.name || 'All Departments' : 'All Departments';
    
    const printWindow = window.open('', '_blank');
    
    let reportContent = '';
    
    if (selectedReport === 'issued') {
      const requests = currentData.requests || currentData || [];
      reportContent = `
        <table>
          <thead>
            <tr>
              <th>Date Issued</th>
              <th>Requester</th>
              <th>Department</th>
              <th>Item</th>
              <th class="text-center">Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(request => {
              const user = request.requester || request.user;
              const userName = user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.username || user?.email || 'N/A';
              const dept = user?.department || request.department;
              const deptName = dept?.name || 'N/A';
              const itemName = typeof request.item === 'object' && request.item !== null 
                ? request.item.name || request.item.item_name || `Item ID: ${request.item.id}`
                : request.item_name || 'N/A';
              
              return `
                <tr>
                  <td>${new Date(request.created_at || request.date).toLocaleDateString()}</td>
                  <td>${userName}</td>
                  <td>${deptName}</td>
                  <td>${itemName}</td>
                  <td class="text-center">${request.quantity}</td>
                  <td>
                    <span class="badge badge-${request.status === 'approved' ? 'approved' : request.status === 'rejected' ? 'rejected' : 'pending'}">
                      ${request.status || 'pending'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Total Issued:</span>
              <span class="summary-value">${requests.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Pending:</span>
              <span class="summary-value">${requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Approved:</span>
              <span class="summary-value">${requests.filter(r => r.status === 'approved').length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Rejected:</span>
              <span class="summary-value">${requests.filter(r => r.status === 'rejected').length}</span>
            </div>
          </div>
        </div>
      `;
    } else if (selectedReport === 'inventory') {
      const items = currentData.items || currentData || [];
      reportContent = `
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Unit Price (TSh)</th>
              <th class="text-right">Total Value (TSh)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category?.name || 'N/A'}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                <td class="text-right">${formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                <td>
                  <span class="badge badge-${item.quantity === 0 ? 'out' : item.quantity <= 10 ? 'low' : 'in'}">
                    ${item.quantity === 0 ? 'Out of Stock' : item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Total Items:</span>
              <span class="summary-value">${items.length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">In Stock:</span>
              <span class="summary-value">${items.filter(item => item.quantity > 0).length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Low Stock:</span>
              <span class="summary-value">${items.filter(item => item.quantity <= 10 && item.quantity > 0).length}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Out of Stock:</span>
              <span class="summary-value">${items.filter(item => item.quantity === 0).length}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedReport === 'issued' ? 'Issued Items Report' : 'Inventory Report'}</title>
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
              text-transform: uppercase;
            }
            
            .report-info {
              background-color: #f5f5f5;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            
            .report-info-grid {
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
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .badge-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            
            .badge-approved {
              background-color: #d1fae5;
              color: #065f46;
            }
            
            .badge-rejected {
              background-color: #fee2e2;
              color: #991b1b;
            }
            
            .badge-in {
              background-color: #d1fae5;
              color: #065f46;
            }
            
            .badge-low {
              background-color: #fef3c7;
              color: #92400e;
            }
            
            .badge-out {
              background-color: #fee2e2;
              color: #991b1b;
            }
            
            .summary {
              margin-top: 30px;
              padding: 15px;
              background-color: #f0f9ff;
              border-left: 4px solid #3b82f6;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            
            .summary-item {
              display: flex;
              flex-direction: column;
              padding: 5px 0;
            }
            
            .summary-label {
              font-weight: bold;
              font-size: 11px;
              color: #555;
            }
            
            .summary-value {
              font-weight: bold;
              font-size: 16px;
              color: #3b82f6;
              margin-top: 3px;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
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
            <h2>${selectedReport === 'issued' ? 'Issued Items Report' : 'Inventory Report'}</h2>
          </div>
          
          <div class="report-info">
            <div class="report-info-grid">
              <div class="info-item">
                <span class="info-label">Report Type:</span>
                <span>${selectedReport === 'issued' ? 'Issued Items' : 'Inventory'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Period:</span>
                <span>${monthName} ${selectedYear}</span>
              </div>
              ${selectedReport === 'issued' ? `
              <div class="info-item">
                <span class="info-label">Department:</span>
                <span>${departmentName}</span>
              </div>
              ` : ''}
              ${selectedUnit !== 'all' ? `
              <div class="info-item">
                <span class="info-label">Unit:</span>
                <span>${selectedUnit}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Generated:</span>
                <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          ${reportContent}
          
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

  // Get current report data with filtering applied
  const getCurrentReportData = () => {
    return filteredData;
  };

  // Render report content based on type
  const renderReportContent = () => {
    const currentData = getCurrentReportData();
    
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

    if (!currentData) {
      return (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No report data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a report type to view data.
          </p>
        </div>
      );
    }

    // Render based on report type
    switch (selectedReport) {
      case 'inventory':
        return renderInventoryReport(currentData);
      case 'issued':
        return renderIssuedReport(currentData);
      default:
        return <div>Unknown report type</div>;
    }
  };

  // Render inventory report
  const renderInventoryReport = (data) => {
    const items = data.items || data || [];
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Total Items</h4>
            <p className="text-2xl font-bold text-blue-600">{items.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">In Stock</h4>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(item => item.quantity > 0).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900">Low Stock</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {items.filter(item => item.quantity <= 10 && item.quantity > 0).length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-900">Out of Stock</h4>
            <p className="text-2xl font-bold text-red-600">
              {items.filter(item => item.quantity === 0).length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (TSh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value (TSh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.quantity === 0 
                        ? 'bg-red-100 text-red-800'
                        : item.quantity <= 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, items.length)}</span> of{' '}
                  <span className="font-medium">{items.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render issued report (requests)
  const renderIssuedReport = (data) => {
    const requests = data.requests || data || [];
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Total Issued</h4>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900">Pending</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">Approved</h4>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-900">Rejected</h4>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRequests.map((request, index) => (
                <tr key={request.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.created_at || request.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(() => {
                      const user = request.requester || request.user;
                      if (user?.first_name && user?.last_name) {
                        return `${user.first_name} ${user.last_name}`;
                      }
                      return user?.username || user?.email || 'N/A';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const user = request.requester || request.user;
                      const dept = user?.department || request.department;
                      return dept?.name || 'N/A';
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof request.item === 'object' && request.item !== null 
                      ? request.item.name || request.item.item_name || `Item ID: ${request.item.id}`
                      : request.item_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, requests.length)}</span> of{' '}
                  <span className="font-medium">{requests.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-black">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-600 text-lg">
          Comprehensive reports and data insights
        </p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Report Type and Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReport}
                onChange={(e) => handleReportChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="issued">Issued Report</option>
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            {/* Department Filter */}
            {selectedReport === 'issued' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Unit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[140px]"
              >
                <option value="all">All Units</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => fetchReport(selectedReport)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={printReport}
              disabled={!getCurrentReportData()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {selectedReport.replace(/([A-Z])/g, ' $1').trim()} Report
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                {(selectedMonth !== 'all' || selectedDepartment !== 'all' || selectedUnit !== 'all') && (
                  <span className="ml-2">
                    • Filtered by {selectedMonth !== 'all' ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedMonth)]} ${selectedYear}` : `Year ${selectedYear}`}
                    {selectedDepartment !== 'all' && selectedReport === 'issued' && ` • ${departments.find(d => d.id === parseInt(selectedDepartment))?.name || 'Department'}`}
                    {selectedUnit !== 'all' && ` • Unit: ${selectedUnit}`}
                  </span>
                )}
              </p>
            </div>
            {(selectedMonth !== 'all' || selectedDepartment !== 'all' || selectedUnit !== 'all') && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  Filtered
                </span>
                <button
                  onClick={() => {
                    setSelectedMonth('all');
                    setSelectedDepartment('all');
                    setSelectedUnit('all');
                    setSelectedYear(new Date().getFullYear());
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;
