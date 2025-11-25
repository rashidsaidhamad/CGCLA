
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoodReceivingNote from './GoodReceivingNote';
import SupplierFormModal from './SupplierForm/SupplierFormModal';
import SuppliersTable from './SuppliersTable/SuppliersTable';
import GRNPdfDownload from './GRNPdfDownload';
import Categorie from './Categorie';

const SuppliersDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view-grn');
  const [grns, setGrns] = useState([]);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockFormData, setStockFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_details: '',
    address: ''
  });

  // Supplier search state
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  // GRN Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'week', 'month', 'year'
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredGrns, setFilteredGrns] = useState([]);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  
  // Handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };
  
  const getHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No authentication token found in localStorage');
      handleAuthError();
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Helper function to get week number
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Filter GRNs based on selected filter type and date
  const filterGRNs = (grns, filterType, week, month, year) => {
    if (filterType === 'all') {
      return grns;
    }

    return grns.filter(grn => {
      const grnDate = new Date(grn.date_received || grn.created_at);
      
      switch (filterType) {
        case 'week':
          const grnWeek = getWeekNumber(grnDate);
          const grnYear = grnDate.getFullYear();
          return grnWeek === week && grnYear === year;
          
        case 'month':
          return grnDate.getMonth() === month && grnDate.getFullYear() === year;
          
        case 'year':
          return grnDate.getFullYear() === year;
          
        default:
          return true;
      }
    });
  };

  // Month names for dropdown
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year options - Generate dynamically (current year and previous 4 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch all GRNs
  const fetchGRNs = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/`, {
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        console.error('401 Unauthorized - Token may be expired or invalid');
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allGrns = data.results || data;
      setGrns(allGrns);
      
      // Apply current filters
      const filtered = filterGRNs(allGrns, filterType, selectedWeek, selectedMonth, selectedYear);
      setFilteredGrns(filtered);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      setError('Failed to load GRNs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single GRN details
  const fetchGRNDetails = async (grnId) => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/${grnId}/`, {
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        console.error('401 Unauthorized - Token may be expired or invalid');
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedGrn(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching GRN details:', error);
      setError('Failed to load GRN details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new GRN
  const handleCreateGRN = async (grnData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/suppliers/receiving-notes/create/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(grnData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create GRN');
      }
      
      alert('GRN created successfully!');
      fetchGRNs(); // Refresh the list
      setActiveTab('view-grn'); // Switch to view tab
    } catch (error) {
      console.error('Error creating GRN:', error);
      alert(`Error creating GRN: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and suppliers for the form
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/categories/`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // Debug: Check current user
      const userData = localStorage.getItem('user');
      console.log('Raw user data from localStorage:', userData);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);
        console.log('User role:', user.role);
      }
      
      const response = await fetch(`${API_BASE}/suppliers/suppliers/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch suppliers error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  // Get PO Number from GRN
  const getPONumberFromGRN = (grnId) => {
    const grn = grns.find(g => g.id === grnId);
    return grn?.po_number || 'N/A';
  };

  // Check if item exists by item code
  const checkItemExists = async (itemCode) => {
    try {
      const query = encodeURIComponent((itemCode || '').trim());
      const resp = await fetch(`${API_BASE}/inventory/items/?search=${query}`, {
        headers: getHeaders(),
      });

      if (resp.ok) {
        const data = await resp.json();
        const items = data.results || data;

        // Match by exact item_code OR by name (case-insensitive, exact or contains)
        const q = (itemCode || '').trim().toLowerCase();
        const found = items.find(it => {
          const code = (it.item_code || '').toLowerCase();
          const name = (it.name || '').toLowerCase();
          return (
            (code && code === q) ||
            (name && name === q) ||
            (name && q !== '' && name.includes(q))
          );
        });

        return found || null;
      }
      return null;
    } catch (error) {
      console.error('Error checking item existence:', error);
      return null;
    }
  };

  // Open stock form for specific items
  const openStockForm = (grnId, items) => {
    const grnPONumber = getPONumberFromGRN(grnId);

    // Try to determine default supplier for this GRN
    const grn = grns.find(g => g.id === grnId);
    let defaultSupplierId = null;
    if (grn) {
      // Common possible fields where supplier could be stored
      if (grn.supplier && grn.supplier.id) defaultSupplierId = grn.supplier.id;
      else if (grn.supplier_id) defaultSupplierId = grn.supplier_id;
      else if (grn.sender_id) defaultSupplierId = grn.sender_id;

      // If we don't have an id but we have a sender name, try to match by supplier name from loaded suppliers
      if (!defaultSupplierId && grn.sender_details && suppliers && suppliers.length > 0) {
        const senderName = String(grn.sender_details).toLowerCase();
        const matched = suppliers.find(s => String(s.name).toLowerCase() === senderName || String(s.name).toLowerCase().includes(senderName) || senderName.includes(String(s.name).toLowerCase()));
        if (matched) defaultSupplierId = matched.id;
      }
    }

    setStockFormData({
      grnId,
      poNumber: grnPONumber,
      items: items.filter(item => item.accepted > 0),
      formItems: items.filter(item => item.accepted > 0).map((item, idx) => ({
        ...item,
        // index of this item within the GRN's items array (relative to filtered accepted items)
        grn_item_index: idx,
        existingItemCode: '', // New field for checking existing items
        existingItem: null, // Store found existing item
        isExistingItem: false, // Flag to track if this is an update
        category_id: '',
        // Pre-fill supplier_id from GRN when available
        supplier_id: defaultSupplierId || '',
        location: 'Warehouse',
        min_stock: 10,
        max_stock: 1000,
        unit_price: item.unit_price ? parseFloat(item.unit_price) : (item.amount ? parseFloat(item.amount) / parseInt(item.accepted) : 0),
        expiry_date: ''
      }))
    });
    setShowStockForm(true);
  };

  // Handle existing item code input
  const handleExistingItemCheck = async (index, itemCode) => {
    if (!itemCode.trim()) {
      updateFormItem(index, 'existingItemCode', '');
      updateFormItem(index, 'existingItem', null);
      updateFormItem(index, 'isExistingItem', false);
      return;
    }

    const existingItem = await checkItemExists(itemCode.trim());
    
    updateFormItem(index, 'existingItemCode', itemCode);
    updateFormItem(index, 'existingItem', existingItem);
    updateFormItem(index, 'isExistingItem', !!existingItem);

    if (existingItem) {
      // Pre-fill form with existing item data
      updateFormItem(index, 'category_id', existingItem.category?.id || '');
      updateFormItem(index, 'location', existingItem.location || 'Warehouse');
      updateFormItem(index, 'min_stock', existingItem.min_stock || 10);
      updateFormItem(index, 'max_stock', existingItem.max_stock || 1000);
      // Intentionally do NOT copy supplier_id or unit_price to the form so the user can
      // choose the supplier and set the correct unit price for this GRN intake.
      alert(`Item found: ${existingItem.name}. Stock will be updated instead of creating new item. Please confirm supplier and unit price.`);
    } else {
      alert(`Item with code "${itemCode}" not found. A new item will be created.`);
    }
  };

  // Handle form submission for adding to stock
  const handleStockFormSubmit = async () => {
    try {
      setIsLoading(true);
      
      for (const item of stockFormData.formItems) {
        if (item.isExistingItem && item.existingItem) {
          // Update existing item stock
          const updateData = {
            stock: parseInt(item.existingItem.stock) + parseInt(item.accepted),
            unit_price: parseFloat(item.unit_price) || item.existingItem.unit_price
          };
          
          console.log('Updating existing item:', item.existingItem.id, updateData);
          
          const response = await fetch(`${API_BASE}/inventory/items/${item.existingItem.id}/update/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updateData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Update error:', errorData);
            throw new Error(`Failed to update item ${item.existingItem.name}: ${errorData.error || 'Unknown error'}`);
          }
          
          const result = await response.json();
          console.log(`Successfully updated item:`, result);
          
          // Create stock transaction for the update. Include supplier and GRN reference so
          // the transaction preserves the supplier and unit_price used during Add-to-Stock.
          // Determine supplier name for readability/persistence (backend may prefer name)
          const supplierNameExisting = (item.supplier_id && suppliers && suppliers.length > 0)
            ? (suppliers.find(s => s.id === Number(item.supplier_id)) || {}).name
            : (item.supplier_name || null);

          await fetch(`${API_BASE}/inventory/add-stock/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              item_id: item.existingItem.id,
              quantity: parseInt(item.accepted),
              unit_price: parseFloat(item.unit_price),
              date: new Date().toISOString().split('T')[0],
              // Include supplier if the user selected one in the stock form
              supplier_id: item.supplier_id && item.supplier_id !== '' ? parseInt(item.supplier_id) : null,
              supplier_name: supplierNameExisting || null,
              // Provide a clear reference to the originating GRN so transaction -> GRN linkage exists
              grn_id: stockFormData.grnId,
              // Also include the GRN item identifier (code/description) to help match
              grn_item_index: item.grn_item_index ?? null,
              grn_item_code: item.item_code || item.code || null,
              grn_item_description: item.description || item.name || null,
            }),
          });
          
        } else {
          // Create new item
          const stockData = {
            item_code: `GRN-${stockFormData.grnId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: item.description.trim(),
            category_id: item.category_id && item.category_id !== '' ? parseInt(item.category_id) : null,
            supplier_id: item.supplier_id && item.supplier_id !== '' ? parseInt(item.supplier_id) : null,
            stock: parseInt(item.accepted) || 0,
            min_stock: parseInt(item.min_stock) || 0,
            max_stock: parseInt(item.max_stock) || 100,
            unit: item.unit || 'Piece',
            location: item.location.trim() || 'Warehouse',
            unit_price: parseFloat(item.unit_price) || 0.00,
            expiry_date: item.expiry_date && item.expiry_date !== '' ? item.expiry_date : null,
            po_number: stockFormData.poNumber.trim()
          };
          
          console.log('Creating new item:', stockData);
          
          const response = await fetch(`${API_BASE}/inventory/items/create/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(stockData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Create error:', errorData);
            throw new Error(`Failed to create item ${item.description}: ${errorData.error || 'Unknown error'}`);
          }
          
          const result = await response.json();
          console.log(`Successfully created item:`, result);

          // After creating a new item, create an initial stock transaction that records
          // the supplier and unit_price used when adding this GRN's items to stock.
          try {
            const supplierNameNew = (item.supplier_id && suppliers && suppliers.length > 0)
              ? (suppliers.find(s => s.id === Number(item.supplier_id)) || {}).name
              : (item.supplier_name || null);

            await fetch(`${API_BASE}/inventory/add-stock/`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({
                item_id: result.id,
                quantity: parseInt(item.accepted) || 0,
                unit_price: parseFloat(item.unit_price) || 0,
                date: new Date().toISOString().split('T')[0],
                supplier_id: item.supplier_id && item.supplier_id !== '' ? parseInt(item.supplier_id) : null,
                supplier_name: supplierNameNew || null,
                grn_id: stockFormData.grnId,
                grn_item_index: item.grn_item_index ?? null,
                grn_item_code: item.item_code || item.code || null,
                grn_item_description: item.description || item.name || null,
              }),
            });
          } catch (txnErr) {
            console.warn('Failed to create initial stock transaction for new item:', txnErr);
          }
        }
      }
      
      // Update GRN status to 'completed' or 'added_to_stock'
      try {
        const updateResponse = await fetch(`${API_BASE}/suppliers/receiving-notes/${stockFormData.grnId}/`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            status: 'completed',
            processed_date: new Date().toISOString()
          }),
        });
        
        if (updateResponse.ok) {
          console.log('GRN status updated successfully');
          // Refresh GRNs to show updated status
          fetchGRNs();
        } else {
          console.warn('Failed to update GRN status, but items were added to stock');
        }
      } catch (statusError) {
        console.warn('Error updating GRN status:', statusError);
      }
      
      alert(`All items have been added to stock successfully with PO Number: ${stockFormData.poNumber}!`);
      setShowStockForm(false);
      setStockFormData(null);
      setError(null);
    } catch (error) {
      console.error('Error adding items to stock:', error);
      alert(`Error adding items to stock: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update form item data
  const updateFormItem = (index, field, value) => {
    setStockFormData(prev => ({
      ...prev,
      formItems: prev.formItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add GRN items to stock (legacy function - now opens form)
  const addToStock = (grnId, items) => {
    openStockForm(grnId, items);
  };

  // Supplier management functions
  const handleSupplierFormChange = (e) => {
    setSupplierForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const openSupplierForm = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm(supplier);
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        contact_details: '',
        address: ''
      });
    }
    setShowSupplierForm(true);
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Check current user before making request
    const userData = localStorage.getItem('user');
    console.log('User data before supplier submit:', userData);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('User role before submit:', user.role);
    }
    
    try {
      setIsLoading(true);
      const url = editingSupplier 
        ? `${API_BASE}/suppliers/suppliers/${editingSupplier.id}/update/`
        : `${API_BASE}/suppliers/suppliers/`;
      
      const method = editingSupplier ? 'PUT' : 'POST';
      
      console.log('Making request to:', url);
      console.log('Method:', method);
      console.log('Payload:', supplierForm);
      console.log('Headers:', getHeaders());
      
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(supplierForm)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.error || `Failed to ${editingSupplier ? 'update' : 'create'} supplier`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);
      
      alert(`Supplier ${editingSupplier ? 'updated' : 'created'} successfully!`);
      setShowSupplierForm(false);
      fetchSuppliers(); // Refresh suppliers list
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    // Debug: Check current user before making request
    const userData = localStorage.getItem('user');
    console.log('User data before supplier delete:', userData);
    if (userData) {
      const user = JSON.parse(userData);
      console.log('User role before delete:', user.role);
    }

    try {
      setIsLoading(true);
      const url = `${API_BASE}/suppliers/suppliers/${supplierId}/delete/`;
      console.log('Making DELETE request to:', url);
      console.log('Headers:', getHeaders());
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete supplier');
      }

      alert('Supplier deleted successfully!');
      fetchSuppliers(); // Refresh suppliers list
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(`Error deleting supplier: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view-grn') {
      fetchGRNs();
    } else if (activeTab === 'manage-suppliers') {
      fetchSuppliers();
    }
    // Fetch categories and suppliers when component mounts
    fetchCategories();
    fetchSuppliers();
  }, [activeTab]);

  // Apply filters when filter criteria change
  useEffect(() => {
    if (grns.length > 0) {
      const filtered = filterGRNs(grns, filterType, selectedWeek, selectedMonth, selectedYear);
      setFilteredGrns(filtered);
    }
  }, [grns, filterType, selectedWeek, selectedMonth, selectedYear]);

  const tabs = [
    { id: 'view-grn', name: 'View GRNs', icon: '📋' },
    { id: 'create-grn', name: 'Create GRN', icon: '➕' },
    { id: 'manage-suppliers', name: 'Manage Suppliers', icon: '🏢' },
    { id: 'manage-categories', name: 'Manage Categories', icon: '🗂️' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header removed as requested */}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* View GRNs Tab */}
          {activeTab === 'view-grn' && (
            <div className="space-y-6">
              {/* Filter Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter GRNs</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Filter Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="all">All GRNs</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  {/* Week Filter */}
                  {filterType === 'week' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                      <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {Array.from({ length: 52 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Month Filter */}
                  {filterType === 'month' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>{month}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Year Filter */}
                  {(filterType === 'year' || filterType === 'month' || filterType === 'week') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="flex items-end">
                    <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <span className="text-sm font-medium text-green-800">
                        {filteredGrns.length} GRN{filteredGrns.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Loading GRNs...</span>
                </div>
              ) : filteredGrns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterType === 'all' ? 'No GRNs found' : `No GRNs found for selected ${filterType}`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {filterType === 'all' 
                      ? 'Start by creating your first Goods Receiving Note' 
                      : 'Try adjusting your filter criteria or create a new GRN'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('create-grn')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create New GRN
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredGrns.map((grn) => (
                    <div
                      key={grn.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">#{grn.id}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              PO: {grn.po_number || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              From: {grn.sender_details || 'Unknown Sender'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(grn.status)}`}>
                            {grn.status || 'Pending'}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(grn.date_received)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Delivery Method:</span>
                          <p className="text-sm text-gray-900">{grn.delivery_method || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Transport:</span>
                          <p className="text-sm text-gray-900">{grn.transport || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Storekeeper:</span>
                          <p className="text-sm text-gray-900">{grn.storekeeper || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => fetchGRNDetails(grn.id)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                        >
                          View Details
                        </button>
                        {grn.status === 'completed' ? (
                          <span className="text-green-600 px-3 py-1 rounded text-sm font-medium">
                            ✓ Added to Stock
                          </span>
                        ) : (
                          <button
                            onClick={() => addToStock(grn.id, grn.items || [])}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Add to Stock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Form Modal */}
              {showStockForm && stockFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Add Items to Stock - GRN #{stockFormData.grnId}
                        </h3>
                        <button
                          onClick={() => setShowStockForm(false)}
                          className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Configure Stock Details for Each Item
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Please review and complete the stock information for each item before adding to inventory.
                        </p>
                        
                        {/* PO Number Field */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purchase Order (PO) Number (From GRN)
                          </label>
                          <input
                            type="text"
                            value={stockFormData.poNumber || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                            placeholder="PO Number from GRN"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            This PO number is retrieved from the selected GRN and will be associated with all items being added to stock
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {stockFormData.formItems.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium text-gray-900">{item.description}</h5>
                              <span className="text-sm text-gray-500">Quantity: {item.accepted} {item.unit}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Existing Item Code Check */}
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Existing Item Code (Optional)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={item.existingItemCode || ''}
                                    onChange={(e) => handleExistingItemCheck(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter existing item code to update stock instead of creating new item"
                                  />
                                  {item.isExistingItem && (
                                    <span className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                      ✓ Found: {item.existingItem?.name}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.isExistingItem 
                                    ? `Stock will be updated for existing item: ${item.existingItem?.name}` 
                                    : "Leave empty to create a new item. If you enter an existing item code, the stock will be updated instead."
                                  }
                                </p>
                              </div>

                              {/* Category */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Category *
                                </label>
                                <select
                                  value={item.category_id}
                                  onChange={(e) => updateFormItem(index, 'category_id', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Category</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Supplier */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Supplier
                                </label>
                                <select
                                  value={item.supplier_id}
                                  onChange={(e) => updateFormItem(index, 'supplier_id', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Supplier</option>
                                  {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                      {supplier.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Location */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Storage Location *
                                </label>
                                <input
                                  type="text"
                                  value={item.location}
                                  onChange={(e) => updateFormItem(index, 'location', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Warehouse A, Shelf 1, Cold Storage"
                                  required
                                />
                              </div>

                              {/* Min Stock */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Minimum Stock Level *
                                </label>
                                <input
                                  type="number"
                                  value={item.min_stock}
                                  onChange={(e) => updateFormItem(index, 'min_stock', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  required
                                />
                              </div>

                              {/* Max Stock */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Maximum Stock Level *
                                </label>
                                <input
                                  type="number"
                                  value={item.max_stock}
                                  onChange={(e) => updateFormItem(index, 'max_stock', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="1"
                                  required
                                />
                              </div>

                              {/* Unit Price */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unit Price (TSh)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateFormItem(index, 'unit_price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                />
                              </div>

                              {/* Expiry Date */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Expiry Date (Optional)
                                </label>
                                <input
                                  type="date"
                                  value={item.expiry_date}
                                  onChange={(e) => updateFormItem(index, 'expiry_date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              {/* Unit (readonly) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Unit
                                </label>
                                <input
                                  type="text"
                                  value={item.unit}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                  readOnly
                                />
                              </div>

                              {/* Accepted Quantity (readonly) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Stock Quantity
                                </label>
                                <input
                                  type="text"
                                  value={item.accepted}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setShowStockForm(false)}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStockFormSubmit}
                          disabled={isLoading || !stockFormData.poNumber || stockFormData.poNumber.trim() === ''}
                          className="px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Adding to Stock...' : 'Add All to Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GRN Details Modal */}
              {selectedGrn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          GRN Details - #{selectedGrn.id}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <GRNPdfDownload 
                            grn={selectedGrn} 
                            onDownload={(fileName) => {
                              console.log(`PDF downloaded: ${fileName}`);
                            }} 
                          />
                          <button
                            onClick={() => setSelectedGrn(null)}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* GRN Header Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">PO Number</label>
                            <p className="text-sm text-gray-900">{selectedGrn.po_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Delivery Number</label>
                            <p className="text-sm text-gray-900">{selectedGrn.delivery_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Sender Details</label>
                            <p className="text-sm text-gray-900">{selectedGrn.sender_details || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Transport</label>
                            <p className="text-sm text-gray-900">{selectedGrn.transport || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Registration Plate</label>
                            <p className="text-sm text-gray-900">{selectedGrn.registration_plate || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Date Received</label>
                            <p className="text-sm text-gray-900">{formatDate(selectedGrn.date_received)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Time Received</label>
                            <p className="text-sm text-gray-900">{selectedGrn.time_received || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Person Delivering</label>
                            <p className="text-sm text-gray-900">{selectedGrn.person_delivering || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Storekeeper</label>
                            <p className="text-sm text-gray-900">{selectedGrn.storekeeper || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedGrn.status)}`}>
                              {selectedGrn.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Items Received</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  S/N
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Received
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Accepted
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Rejected
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Price (TSh)
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Reason/Remark
                                </th>
                                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedGrn.items?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.total_received}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-green-600">{item.accepted}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-red-600">{item.rejected}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.unit_price ? `${parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.amount}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{item.rejected_reason || '-'}</td>
                                  <td className="px-4 py-3 text-sm">
                                    {item.accepted > 0 && (
                                      <button
                                        onClick={() => addToStock(selectedGrn.id, [item])}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                      >
                                        Add to Stock
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              )) || (
                                <tr>
                                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                    No items found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Created By</label>
                            <p className="text-sm text-gray-900">{selectedGrn.created_by_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Created Date</label>
                            <p className="text-sm text-gray-900">{formatDate(selectedGrn.created_at)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Processed Date</label>
                            <p className="text-sm text-gray-900">{selectedGrn.processed_date ? formatDate(selectedGrn.processed_date) : 'Not processed yet'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Total Items</label>
                            <p className="text-sm text-gray-900">{selectedGrn.items?.length || 0} items</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedGrn(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create GRN Tab */}
          {activeTab === 'create-grn' && (
            <GoodReceivingNote onSubmitNote={handleCreateGRN} suppliers={suppliers} />
          )}

          {/* Manage Categories Tab */}
          {activeTab === 'manage-categories' && (
            <div className="p-6">
              <Categorie />
            </div>
          )}

          {/* Manage Suppliers Tab */}
          {activeTab === 'manage-suppliers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Supplier Management</h3>
                <button
                  onClick={() => openSupplierForm()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add New Supplier</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={supplierSearchQuery}
                    onChange={(e) => setSupplierSearchQuery(e.target.value)}
                    placeholder="Search suppliers by name or contact details..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <svg
                    className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {supplierSearchQuery && (
                  <p className="text-sm text-gray-600 mt-2">
                    Found {suppliers.filter(s => 
                      s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                      (s.contact_details && s.contact_details.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
                    ).length} supplier{suppliers.filter(s => 
                      s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                      (s.contact_details && s.contact_details.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
                    ).length === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              {/* Suppliers Table */}
              <SuppliersTable
                suppliers={suppliers.filter(s => 
                  s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                  (s.contact_details && s.contact_details.toLowerCase().includes(supplierSearchQuery.toLowerCase()))
                )}
                onEdit={openSupplierForm}
                onDelete={deleteSupplier}
                onAddFirst={() => openSupplierForm()}
                searchQuery={supplierSearchQuery}
              />

              {/* Supplier Form Modal */}
              <SupplierFormModal
                show={showSupplierForm}
                onClose={() => setShowSupplierForm(false)}
                onSubmit={handleSupplierSubmit}
                isLoading={isLoading}
                editingSupplier={editingSupplier}
                supplierForm={supplierForm}
                handleSupplierFormChange={handleSupplierFormChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliersDashboard;
