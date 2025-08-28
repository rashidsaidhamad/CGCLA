import React, { useState, useEffect } from 'react';

const Inventory = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Mock inventory data
    setInventory([
      {
        id: 'ITEM-001',
        name: 'Laboratory Gloves',
        category: 'Safety Equipment',
        description: 'Nitrile disposable gloves, powder-free, size medium',
        available: 500,
        unit: 'pairs',
        location: 'A1-B2',
        supplier: 'SafetyFirst Ltd',
        lastUpdated: '2025-08-25',
        specifications: ['Nitrile material', 'Powder-free', 'Chemical resistant', 'Size M'],
        image: '/placeholder-gloves.jpg'
      },
      {
        id: 'ITEM-002',
        name: 'Test Tubes (50ml)',
        category: 'Laboratory Equipment',
        description: 'Borosilicate glass test tubes with graduated markings',
        available: 200,
        unit: 'pieces',
        location: 'B2-C3',
        supplier: 'LabGlass Co',
        lastUpdated: '2025-08-24',
        specifications: ['Borosilicate glass', '50ml capacity', 'Graduated', 'Heat resistant'],
        image: '/placeholder-testtubes.jpg'
      },
      {
        id: 'ITEM-003',
        name: 'Safety Goggles',
        category: 'Safety Equipment',
        description: 'Chemical splash protection goggles with anti-fog coating',
        available: 30,
        unit: 'pieces',
        location: 'A1-A2',
        supplier: 'SafetyFirst Ltd',
        lastUpdated: '2025-08-23',
        specifications: ['Anti-fog coating', 'Chemical resistant', 'Adjustable strap', 'Clear lens'],
        image: '/placeholder-goggles.jpg'
      },
      {
        id: 'ITEM-004',
        name: 'pH Test Strips',
        category: 'Chemicals',
        description: 'Universal pH indicator strips, range 1-14',
        available: 15,
        unit: 'strips',
        location: 'C1-D2',
        supplier: 'ChemTest Inc',
        lastUpdated: '2025-08-22',
        specifications: ['pH range 1-14', 'Color chart included', 'Waterproof packaging', 'Expiry: Dec 2025'],
        image: '/placeholder-ph-strips.jpg'
      },
      {
        id: 'ITEM-005',
        name: 'Beakers (500ml)',
        category: 'Laboratory Equipment',
        description: 'Borosilicate glass beakers with spout and graduations',
        available: 75,
        unit: 'pieces',
        location: 'B1-B3',
        supplier: 'LabGlass Co',
        lastUpdated: '2025-08-21',
        specifications: ['500ml capacity', 'Graduated scale', 'Spout design', 'Heat resistant'],
        image: '/placeholder-beakers.jpg'
      },
      {
        id: 'ITEM-006',
        name: 'Distilled Water',
        category: 'Chemicals',
        description: 'High purity distilled water for laboratory use',
        available: 120,
        unit: 'liters',
        location: 'C2-D3',
        supplier: 'PureWater Ltd',
        lastUpdated: '2025-08-20',
        specifications: ['Ultra-pure grade', 'Sterile packaging', 'Low conductivity', 'Expiry: Feb 2026'],
        image: '/placeholder-water.jpg'
      },
      {
        id: 'ITEM-007',
        name: 'Microscope Slides',
        category: 'Laboratory Equipment',
        description: 'Pre-cleaned glass microscope slides, 25x75mm',
        available: 300,
        unit: 'pieces',
        location: 'B3-C1',
        supplier: 'MicroLab Supply',
        lastUpdated: '2025-08-19',
        specifications: ['25x75mm size', 'Pre-cleaned', 'Frosted end', 'Thickness 1mm'],
        image: '/placeholder-slides.jpg'
      },
      {
        id: 'ITEM-008',
        name: 'Pipettes (10ml)',
        category: 'Laboratory Equipment',
        description: 'Graduated glass pipettes for precise liquid measurement',
        available: 45,
        unit: 'pieces',
        location: 'A2-B1',
        supplier: 'PrecisionLab',
        lastUpdated: '2025-08-18',
        specifications: ['10ml capacity', 'Graduated markings', 'Class A accuracy', 'Borosilicate glass'],
        image: '/placeholder-pipettes.jpg'
      }
    ]);
  }, []);

  const categories = [...new Set(inventory.map(item => item.category))];

  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'available':
          return b.available - a.available;
        case 'updated':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        default:
          return 0;
      }
    });

  const getAvailabilityColor = (available) => {
    if (available > 100) return 'text-green-600 bg-green-50';
    if (available > 50) return 'text-yellow-600 bg-yellow-50';
    if (available > 0) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getAvailabilityStatus = (available) => {
    if (available > 100) return 'High Stock';
    if (available > 50) return 'Medium Stock';
    if (available > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const ItemModal = ({ item, onClose, onRequest }) => {
    if (!item) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Image */}
              <div>
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-6xl">{getCategoryIcon(item.category)}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(item.available)}`}>
                  {getAvailabilityStatus(item.available)}: {item.available} {item.unit}
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm text-gray-900">{item.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">{item.location}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Specifications</label>
                  <ul className="text-sm text-gray-900 list-disc list-inside">
                    {item.specifications.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-sm text-gray-900">{item.supplier}</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => onRequest(item)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={item.available === 0}
                  >
                    Request This Item
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Safety Equipment': return '🦺';
      case 'Laboratory Equipment': return '🔬';
      case 'Chemicals': return '🧪';
      case 'Consumables': return '📦';
      default: return '📋';
    }
  };

  const handleRequestItem = (item) => {
    alert(`Redirecting to request form for ${item.name}...`);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Inventory</h2>
        <p className="text-gray-600">
          Browse available items in the warehouse. Click on any item to view details and submit a request.
        </p>
      </div>

      {/* Stats */}
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
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter(item => item.available > 0).length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {inventory.filter(item => item.available <= 50 && item.available > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="available">Availability</option>
              <option value="updated">Last Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(item.available)}`}>
                  {item.available} {item.unit}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-900">{item.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{item.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${item.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getAvailabilityStatus(item.available)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRequestItem(item)}
                  disabled={item.available === 0}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredInventory.length} of {inventory.length} items
      </div>

      {/* Item Modal */}
      <ItemModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)}
        onRequest={handleRequestItem}
      />
    </div>
  );
};

export default Inventory;
