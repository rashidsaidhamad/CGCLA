import React, { useState, useEffect } from 'react';

const StockBalance = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Mock data for demonstration
    setInventory([
      {
        id: 'ITEM-001',
        name: 'Laboratory Gloves',
        category: 'Safety Equipment',
        stock: 500,
        minStock: 100,
        maxStock: 1000,
        unit: 'pairs',
        location: 'A1-B2',
        supplier: 'SafetyFirst Ltd',
        unitPrice: 2.50,
        totalValue: 1250,
        lastUpdated: '2025-08-25',
        expiryDate: '2026-08-25'
      },
      {
        id: 'ITEM-002',
        name: 'Test Tubes (50ml)',
        category: 'Laboratory Equipment',
        stock: 200,
        minStock: 50,
        maxStock: 500,
        unit: 'pieces',
        location: 'B2-C3',
        supplier: 'LabGlass Co',
        unitPrice: 1.75,
        totalValue: 350,
        lastUpdated: '2025-08-24',
        expiryDate: null
      },
      {
        id: 'ITEM-003',
        name: 'Safety Goggles',
        category: 'Safety Equipment',
        stock: 30,
        minStock: 20,
        maxStock: 100,
        unit: 'pieces',
        location: 'A1-A2',
        supplier: 'SafetyFirst Ltd',
        unitPrice: 15.00,
        totalValue: 450,
        lastUpdated: '2025-08-23',
        expiryDate: null
      },
      {
        id: 'ITEM-004',
        name: 'pH Test Strips',
        category: 'Chemicals',
        stock: 15,
        minStock: 50,
        maxStock: 200,
        unit: 'strips',
        location: 'C1-D2',
        supplier: 'ChemTest Inc',
        unitPrice: 0.25,
        totalValue: 3.75,
        lastUpdated: '2025-08-22',
        expiryDate: '2025-12-31'
      },
      {
        id: 'ITEM-005',
        name: 'Beakers (500ml)',
        category: 'Laboratory Equipment',
        stock: 75,
        minStock: 25,
        maxStock: 150,
        unit: 'pieces',
        location: 'B1-B3',
        supplier: 'LabGlass Co',
        unitPrice: 8.50,
        totalValue: 637.50,
        lastUpdated: '2025-08-21',
        expiryDate: null
      },
      {
        id: 'ITEM-006',
        name: 'Distilled Water',
        category: 'Chemicals',
        stock: 120,
        minStock: 50,
        maxStock: 300,
        unit: 'liters',
        location: 'C2-D3',
        supplier: 'PureWater Ltd',
        unitPrice: 1.20,
        totalValue: 144,
        lastUpdated: '2025-08-20',
        expiryDate: '2026-02-20'
      }
    ]);
  }, []);

  const getStockStatus = (current, minimum, maximum) => {
    if (current <= minimum) return 'critical';
    if (current <= minimum * 1.5) return 'low';
    if (current >= maximum * 0.9) return 'high';
    return 'normal';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [...new Set(inventory.map(item => item.category))];

  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const status = getStockStatus(item.stock, item.minStock, item.maxStock);
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.stock - a.stock;
        case 'value':
          return b.totalValue - a.totalValue;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const criticalItems = inventory.filter(item => getStockStatus(item.stock, item.minStock, item.maxStock) === 'critical').length;
  const lowStockItems = inventory.filter(item => getStockStatus(item.stock, item.minStock, item.maxStock) === 'low').length;

  const updateStock = (itemId, newStock) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        stock: newStock, 
        totalValue: newStock * item.unitPrice,
        lastUpdated: new Date().toISOString().split('T')[0] 
      } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Balance</h2>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage inventory stock levels across all categories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-gray-900">{criticalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="critical">Critical</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal</option>
              <option value="high">High Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="stock">Stock Level</option>
              <option value="value">Total Value</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item.stock, item.minStock, item.maxStock);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                      <div className="text-sm text-gray-500">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.stock} {item.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${item.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        @${item.unitPrice} per {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStockColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => updateStock(item.id, item.stock + 10)}
                          className="text-green-600 hover:text-green-900"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => updateStock(item.id, Math.max(0, item.stock - 10))}
                          className="text-red-600 hover:text-red-900"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredInventory.length} of {inventory.length} items
      </div>
    </div>
  );
};

export default StockBalance;
