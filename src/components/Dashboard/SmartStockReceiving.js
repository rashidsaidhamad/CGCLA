import React, { useState } from 'react';

const SmartStockReceiving = () => {
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
    max_stock: '100'
  });
  
  const [itemCheck, setItemCheck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Check if item exists when name changes
  const checkItemExists = async (name) => {
    if (!name.trim()) {
      setItemCheck(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/inventory/check-item/?name=${encodeURIComponent(name)}`, {
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
      const response = await fetch(`${API_BASE}/inventory/create-or-restock/`, {
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
          max_stock: '100'
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Smart Stock Receiving</h2>
          <p className="text-sm text-gray-600">Add new items or restock existing ones with automatic price calculation</p>
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
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${
                    itemCheck.exists ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {itemCheck.exists ? '⚠️' : '✅'}
                  </div>
                  <div className="ml-2">
                    <p className={`text-sm font-medium ${
                      itemCheck.exists ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {itemCheck.message}
                    </p>
                    {itemCheck.exists && itemCheck.item && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p><strong>Current Stock:</strong> {itemCheck.item.current_stock} units</p>
                        <p><strong>Current Price:</strong> TSh {formatCurrency(itemCheck.item.current_unit_price)}</p>
                        <p><strong>Code:</strong> {itemCheck.item.item_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Two column layout for form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Enter quantity to receive"
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

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price Calculation Preview */}
          {itemCheck && itemCheck.exists && formData.quantity && formData.unit_price && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Price Calculation Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-800">
                <div>
                  <p><strong>Current Stock:</strong> {itemCheck.item.current_stock} units</p>
                  <p><strong>Current Price:</strong> TSh {formatCurrency(itemCheck.item.current_unit_price)}</p>
                  <p><strong>Current Value:</strong> TSh {formatCurrency(itemCheck.item.current_stock * itemCheck.item.current_unit_price)}</p>
                </div>
                <div>
                  <p><strong>Adding:</strong> {formData.quantity} units</p>
                  <p><strong>New Price:</strong> TSh {formatCurrency(parseFloat(formData.unit_price))}</p>
                  <p><strong>New Value:</strong> TSh {formatCurrency(parseInt(formData.quantity) * parseFloat(formData.unit_price))}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <p className="text-sm font-medium text-blue-900">
                  <strong>Weighted Average Price:</strong> TSh {formatCurrency(
                    ((itemCheck.item.current_stock * itemCheck.item.current_unit_price) + 
                     (parseInt(formData.quantity || 0) * parseFloat(formData.unit_price || 0))) /
                    (itemCheck.item.current_stock + parseInt(formData.quantity || 0))
                  )}
                </p>
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
              {isLoading ? 'Processing...' : (itemCheck?.exists ? 'Restock Item' : 'Add New Item')}
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
            <div className={`flex items-start ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              <div className="flex-shrink-0">
                {result.success ? '✅' : '❌'}
              </div>
              <div className="ml-2">
                <p className="font-medium">
                  {result.success ? result.message : `Error: ${result.error}`}
                </p>
                
                {result.success && result.stock_summary && (
                  <div className="mt-3 text-sm">
                    {result.action === 'restocked' ? (
                      <div className="space-y-1">
                        <p><strong>Stock Updated:</strong> {result.stock_summary.old_stock} → {result.stock_summary.new_stock} units</p>
                        <p><strong>Quantity Added:</strong> {result.stock_summary.quantity_added} units</p>
                        <p><strong>Old Price:</strong> TSh {formatCurrency(result.stock_summary.old_unit_price)}</p>
                        <p><strong>New Price Received:</strong> TSh {formatCurrency(result.stock_summary.new_unit_price_received)}</p>
                        <p><strong>Weighted Average Price:</strong> TSh {formatCurrency(result.stock_summary.weighted_avg_price)}</p>
                        <p><strong>Price Difference:</strong> {result.stock_summary.price_difference >= 0 ? '+' : ''}TSh {formatCurrency(result.stock_summary.price_difference)}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p><strong>Initial Stock:</strong> {result.stock_summary.initial_stock} units</p>
                        <p><strong>Unit Price:</strong> TSh {formatCurrency(result.stock_summary.unit_price)}</p>
                        <p><strong>Total Value:</strong> TSh {formatCurrency(result.stock_summary.total_value)}</p>
                      </div>
                    )}
                    <p className="mt-2"><strong>Item Code:</strong> {result.item_code}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartStockReceiving;