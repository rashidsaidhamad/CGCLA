import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

const Requesters = () => {
  const [requests, setRequests] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/requests/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Requests API response:', data); // Debug log
      if (data.results && data.results.length > 0) {
        console.log('Sample request object:', data.results[0]); // Debug log
      }
      setRequests(data.results || data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  // Fetch inventory items to get item names
  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/items/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/departments/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.results || data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchInventoryItems();
    fetchDepartments();
  }, []);

  // Handle request approval
  const approveRequest = async (requestId, feedback = '') => {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}/approve/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          feedback: feedback
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh requests list
      await fetchRequests();
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Error approving request: ${error.message}`);
    }
  };

  // Handle request rejection
  const rejectRequest = async (requestId, reason = '') => {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}/reject/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          reason: reason
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh requests list
      await fetchRequests();
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Error rejecting request: ${error.message}`);
    }
  };

  // Handle approve with feedback
  const handleApprove = (requestId) => {
    const feedback = prompt('Add approval feedback (optional):');
    approveRequest(requestId, feedback || '');
  };

  // Handle reject with reason
  const handleReject = (requestId) => {
    const reason = prompt('Rejection reason (required):');
    if (reason && reason.trim()) {
      rejectRequest(requestId, reason);
    } else {
      alert('Rejection reason is required!');
    }
  };

  // Get item name by ID or object
  const getItemName = (itemData) => {
    // If itemData is an object, return its name
    if (typeof itemData === 'object' && itemData !== null) {
      return itemData.name || itemData.item_name || `Item ID: ${itemData.id}`;
    }
    
    // If itemData is an ID, find it in inventoryItems
    const item = inventoryItems.find(item => item.id === itemData);
    return item ? item.name : `Item ID: ${itemData}`;
  };

  // Date filtering function
  const filterByDate = (request) => {
    if (selectedDateFilter === 'all') return true;
    
    const requestDate = new Date(request.created_at);
    const now = new Date();
    
    switch (selectedDateFilter) {
      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return requestDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return requestDate >= oneMonthAgo;
      case 'year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return requestDate >= oneYearAgo;
      default:
        return true;
    }
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = sortedRequests.map(request => {
      const user = request.requester || request.user;
      const dept = user?.department || request.department;
      return {
        'Request ID': request.id,
        'Requester': user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.username || user?.email || 'Unknown User',
        'Department': dept?.name || 'Unknown Department',
        'Item': getItemName(request.item),
        'Quantity': request.quantity,
        'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
        'Feedback': request.feedback || '',
        'Date Submitted': new Date(request.created_at).toLocaleDateString(),
        'Time Submitted': new Date(request.created_at).toLocaleTimeString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `requests_report_${dateStr}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Requests Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Prepare table data
    const tableData = sortedRequests.map(request => {
      const user = request.requester || request.user;
      const dept = user?.department || request.department;
      return [
        request.id,
        user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.username || user?.email || 'Unknown User',
        dept?.name || 'Unknown Department',
        getItemName(request.item),
        request.quantity,
        request.status.charAt(0).toUpperCase() + request.status.slice(1),
        new Date(request.created_at).toLocaleDateString()
      ];
    });

    // Try to use autoTable, fallback to manual table if not available
    try {
      if (doc.autoTable) {
        doc.autoTable({
          head: [['ID', 'Requester', 'Department', 'Item', 'Quantity', 'Status', 'Date']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      // Fallback: Manual table creation
      console.log('Using manual table creation for simple PDF:', error);
      doc.setFontSize(8);
      
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.text('ID', 20, 50);
      doc.text('Requester', 35, 50);
      doc.text('Department', 80, 50);
      doc.text('Item', 120, 50);
      doc.text('Qty', 160, 50);
      doc.text('Status', 175, 50);
      
      // Table data
      doc.setFont('helvetica', 'normal');
      let yPos = 60;
      tableData.slice(0, 25).forEach((row, index) => { // Limit to 25 rows to fit on page
        doc.text(String(row[0]), 20, yPos);
        doc.text(String(row[1]).substring(0, 15), 35, yPos); // Truncate long names
        doc.text(String(row[2]).substring(0, 12), 80, yPos);
        doc.text(String(row[3]).substring(0, 12), 120, yPos);
        doc.text(String(row[4]), 160, yPos);
        doc.text(String(row[5]), 175, yPos);
        yPos += 8;
      });
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`requests_report_${dateStr}.pdf`);
  };

  const exportToCSV = () => {
    const csvData = sortedRequests.map(request => {
      const user = request.requester || request.user;
      const dept = user?.department || request.department;
      return [
        request.id,
        user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.username || user?.email || 'Unknown User',
        dept?.name || 'Unknown Department',
        getItemName(request.item),
        request.quantity,
        request.status.charAt(0).toUpperCase() + request.status.slice(1),
        request.feedback || '',
        new Date(request.created_at).toLocaleDateString(),
        new Date(request.created_at).toLocaleTimeString()
      ];
    });

    const headers = ['Request ID', 'Requester', 'Department', 'Item', 'Quantity', 'Status', 'Feedback', 'Date Submitted', 'Time Submitted'];
    const csvContent = [headers, ...csvData].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const dateStr = new Date().toISOString().split('T')[0];
    saveAs(blob, `requests_report_${dateStr}.csv`);
  };

  // Export to PDF with signature placeholder
  const exportToPDFWithSignature = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM REQUESTS REPORT', 105, 20, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add summary statistics
    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(req => req.status === 'pending').length,
      approvedRequests: requests.filter(req => req.status === 'approved').length,
      rejectedRequests: requests.filter(req => req.status === 'rejected').length
    };
    
    doc.setFontSize(10);
    doc.text(`Total Requests: ${stats.totalRequests}`, 20, 45);
    doc.text(`Pending: ${stats.pendingRequests}`, 20, 52);
    doc.text(`Approved: ${stats.approvedRequests}`, 80, 45);
    doc.text(`Rejected: ${stats.rejectedRequests}`, 80, 52);
    
    // Prepare table data
    const tableData = sortedRequests.map(request => {
      const user = request.requester || request.user;
      const dept = user?.department || request.department;
      return [
        request.id,
        user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.username || user?.email || 'Unknown User',
        dept?.name || 'Unknown Department',
        getItemName(request.item),
        request.quantity,
        request.status.charAt(0).toUpperCase() + request.status.slice(1),
        new Date(request.created_at).toLocaleDateString()
      ];
    });

    // Try to use autoTable, fallback to manual table if not available
    let finalY = 65;
    try {
      if (doc.autoTable) {
        doc.autoTable({
          head: [['ID', 'Requester', 'Department', 'Item', 'Quantity', 'Status', 'Date']],
          body: tableData,
          startY: 65,
          styles: { 
            fontSize: 8,
            cellPadding: 3
          },
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
        finalY = doc.lastAutoTable.finalY || 200;
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      // Fallback: Manual table creation
      console.log('Using manual table creation:', error);
      doc.setFontSize(8);
      
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.text('ID', 20, 70);
      doc.text('Requester', 35, 70);
      doc.text('Department', 80, 70);
      doc.text('Item', 120, 70);
      doc.text('Qty', 160, 70);
      doc.text('Status', 175, 70);
      
      // Table data
      doc.setFont('helvetica', 'normal');
      let yPos = 80;
      tableData.slice(0, 20).forEach((row, index) => { // Limit to 20 rows to fit on page
        doc.text(String(row[0]), 20, yPos);
        doc.text(String(row[1]).substring(0, 15), 35, yPos); // Truncate long names
        doc.text(String(row[2]).substring(0, 12), 80, yPos);
        doc.text(String(row[3]).substring(0, 12), 120, yPos);
        doc.text(String(row[4]), 160, yPos);
        doc.text(String(row[5]), 175, yPos);
        yPos += 8;
      });
      
      finalY = yPos + 10;
    }
    
    // Add signature section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AUTHORIZATION SIGNATURES', 20, finalY + 20);
    
    // Signature boxes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Approved by
    doc.text('Approved by:', 20, finalY + 90);
    doc.text('Name: ________________________________', 20, finalY + 100);
    doc.text('Signature: ___________________________', 20, finalY + 110);
    doc.text('Date: _______________', 20, finalY + 120);
    
    // Received by
    doc.text('Received by:', 110, finalY + 90);
    doc.text('Name: ________________________________', 110, finalY + 100);
    doc.text('Signature: ___________________________', 110, finalY + 110);
    doc.text('Date: _______________', 110, finalY + 120);
    
    // Add footer note
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('physical signatures', 105, finalY + 140, { align: 'center' });
    doc.text('Generated by CGCLA Warehouse Management System', 105, finalY + 148, { align: 'center' });
    
    // Save the PDF
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`requests_report_with_signature_${dateStr}.pdf`);
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const user = request.requester || request.user;
    const matchesSearch = 
      (user?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      getItemName(request.item).toLowerCase().includes(searchTerm.toLowerCase());
    
    const dept = user?.department || request.department;
    const matchesDepartment = selectedDepartment === 'all' || 
                             dept?.id === parseInt(selectedDepartment);
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesDate = filterByDate(request);
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  // Sort requests by creation date (newest first)
  const sortedRequests = filteredRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = sortedRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(sortedRequests.length / requestsPerPage);

  // Calculate statistics
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(req => req.status === 'pending').length,
    approvedRequests: requests.filter(req => req.status === 'approved').length,
    rejectedRequests: requests.filter(req => req.status === 'rejected').length
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' };
      case 'approved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: '✅' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: '❌' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '❓' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-gray-600">Loading requests...</div>
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
            <h3 className="text-sm font-medium text-red-800">Error Loading Requests</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchRequests}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Incoming Requests</h1>
        <p className="text-blue-100 text-lg">
          Manage and respond to item requests from departments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by requester name or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
        
        {/* Export Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to Excel
          </button>
          
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Export to CSV
          </button>

          <button
            onClick={exportToPDFWithSignature}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            📝 Export PDF with Signature
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          {sortedRequests.length} request{sortedRequests.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Item Requests</h3>
        </div>
        
        {currentRequests.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-4v2m0 4v2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No requests have been submitted yet. Requests will appear here when users submit them.'}
            </p>
            <div className="mt-4">
              <button
                onClick={fetchRequests}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentRequests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Requester Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {(() => {
                              const user = request.requester || request.user;
                              const initial = user?.first_name?.[0] || user?.username?.[0] || user?.email?.[0] || 'U';
                              return initial.toUpperCase();
                            })()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {(() => {
                              const user = request.requester || request.user;
                              if (user?.first_name && user?.last_name) {
                                return `${user.first_name} ${user.last_name}`;
                              }
                              return user?.username || user?.email || 'Unknown User';
                            })()}
                          </h4>
                          <span className="text-sm text-gray-500">
                            from {(() => {
                              const user = request.requester || request.user;
                              const dept = user?.department || request.department;
                              return dept?.name || 'Unknown Department';
                            })()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            Requesting <span className="font-medium">{request.quantity}</span> units of{' '}
                            <span className="font-medium">{getItemName(request.item)}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted on {new Date(request.created_at).toLocaleDateString()} at{' '}
                            {new Date(request.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status and Actions */}
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        <span className="mr-1">{statusInfo.icon}</span>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Feedback and Rejection Reason */}
                  {(request.feedback || request.rejection_reason) && (
                    <div className="mt-4 space-y-2">
                      {request.feedback && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Approval Feedback:</span> {request.feedback}
                          </p>
                        </div>
                      )}
                      {request.rejection_reason && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstRequest + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastRequest, sortedRequests.length)}</span> of{' '}
                <span className="font-medium">{sortedRequests.length}</span> results
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
    </div>
  );
};

export default Requesters;
