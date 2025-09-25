import React, { useState, useEffect } from 'react';

const BatchTrackingStockReceiving = () => {
  const [formData, setFormData] = useState({
    name: '',
    item_code: '',
    quantity: '',
    unit_price: '',
    category_id: '',
    supplier_id: '',
    unit: 'Piece',
    location: 'Warehouse',
    min_stock: '10',
    max_stock: '100',
    po_number: '',
    grn_reference: '',
    expiry_date: ''
  });
  
  const [itemCheck, setItemCheck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Load suppliers and categories
  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE}/suppliers/suppliers/`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

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

  // Check if item exists when name changes
  const checkItemExists = async (name) => {
    if (!name.trim()) {
      setItemCheck(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/inventory/check-item-batches/?name=${encodeURIComponent(name)}`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setItemCheck(data);
      }
    } catch (error) {
      console.error('Error checking item:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check item existence when name changes
    if (field === 'name') {
      checkItemExists(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.quantity || !formData.unit_price) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/inventory/receive-with-batches/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          unit_price: parseFloat(formData.unit_price),
          min_stock: parseInt(formData.min_stock),
          max_stock: parseInt(formData.max_stock),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          ...data
        });
        
        // Reset form
        setFormData({
          name: '',
          item_code: '',
          quantity: '',
          unit_price: '',
          category_id: '',
          supplier_id: '',
          unit: 'Piece',
          location: 'Warehouse',
          min_stock: '10',
          max_stock: '100',
          po_number: '',
          grn_reference: '',
          expiry_date: ''
        });
        setItemCheck(null);
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to process item'
        });
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Batch Tracking Stock Receiving</h2>
          <p className="text-sm text-gray-600">Add items with separate batch tracking - each price is maintained individually</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Shinex Clean"
              required
            />
            
            {/* Item Check Result */}
            {itemCheck && (
              <div className={`mt-2 p-3 rounded-lg border ${
                itemCheck.exists 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${
                    itemCheck.exists ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {itemCheck.exists ? '📦' : '✅'}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      itemCheck.exists ? 'text-blue-800' : 'text-green-800'
                    }`}>
                      {itemCheck.message}
                    </p>
                    {itemCheck.exists && itemCheck.item && (
                      <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>Total Stock:</strong> {itemCheck.item.total_stock} units</p>
                          <p><strong>FIFO Price:</strong> TSh {formatCurrency(itemCheck.item.current_fifo_price)}</p>
                          <p><strong>Avg Price:</strong> TSh {formatCurrency(itemCheck.item.average_price)}</p>
                        </div>
                        <div>
                          <p><strong>Active Batches:</strong> {itemCheck.item.active_batches_count}</p>
                          <p><strong>Code:</strong> {itemCheck.item.item_code}</p>
                        </div>
                      </div>
                    )}
                    
                    {itemCheck.exists && itemCheck.batch_summary && itemCheck.batch_summary.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Recent Batches:</p>
                        <div className="space-y-1">
                          {itemCheck.batch_summary.map((batch, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <span className="font-medium">{batch.batch_number}</span>: 
                              {batch.remaining_qty} units @ TSh {formatCurrency(batch.unit_price)} 
                              ({batch.date_received})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Code
              </label>
              <input
                type="text"
                value={formData.item_code}
                onChange={(e) => handleInputChange('item_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Piece">Piece</option>
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Kg">Kg</option>
                <option value="Liter">Liter</option>
                <option value="Meter">Meter</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Warehouse location"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (TSh) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter unit price"
                required
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => handleInputChange('po_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Purchase Order Number"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Batch Preview */}
          {formData.name && formData.quantity && formData.unit_price && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">New Batch Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p><strong>Item:</strong> {formData.name}</p>
                  <p><strong>Quantity:</strong> {formData.quantity} {formData.unit}</p>
                </div>
                <div>
                  <p><strong>Unit Price:</strong> TSh {formatCurrency(parseFloat(formData.unit_price || 0))}</p>
                  <p><strong>Total Value:</strong> TSh {formatCurrency(parseInt(formData.quantity || 0) * parseFloat(formData.unit_price || 0))}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (itemCheck?.exists ? 'Add New Batch' : 'Create Item with First Batch')}
            </button>
          </div>
        </form>

        {/* Result Display */}
        {result && (
          <div className={`mx-6 mb-6 p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 text-lg">
                  {result.success ? '✅' : '❌'}
                </div>
                <div className="ml-2 flex-1">
                  <p className="font-medium">
                    {result.success ? result.message : `Error: ${result.error}`}
                  </p>
                  
                  {result.success && result.batch_info && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-900 mb-2">New Batch Created:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Batch Number:</strong> {result.batch_info.batch_number}</p>
                            <p><strong>Quantity:</strong> {result.batch_info.quantity} units</p>
                          </div>
                          <div>
                            <p><strong>Unit Price:</strong> TSh {formatCurrency(result.batch_info.unit_price)}</p>
                            <p><strong>Total Value:</strong> TSh {formatCurrency(result.batch_info.total_value)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {result.stock_summary && (
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-green-900 mb-2">Stock Summary:</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                            <div>
                              <p><strong>Total Stock:</strong> {result.stock_summary.total_stock} units</p>
                              <p><strong>Total Batches:</strong> {result.stock_summary.total_batches}</p>
                            </div>
                            <div>
                              <p><strong>FIFO Price:</strong> TSh {formatCurrency(result.stock_summary.current_fifo_price)}</p>
                              <p><strong>Avg Price:</strong> TSh {formatCurrency(result.stock_summary.average_price)}</p>
                            </div>
                            <div>
                              <p><strong>Item Code:</strong> {result.item_code}</p>
                            </div>
                          </div>
                          
                          {result.stock_summary.batch_breakdown && result.stock_summary.batch_breakdown.length > 0 && (
                            <div>
                              <p className="font-medium text-xs text-gray-700 mb-1">All Active Batches:</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {result.stock_summary.batch_breakdown.map((batch, index) => (
                                  <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex justify-between">
                                    <span><strong>{batch.batch_number}</strong></span>
                                    <span>{batch.remaining_qty} @ TSh {formatCurrency(batch.unit_price)}</span>
                                    <span>{batch.date_received}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchTrackingStockReceiving;