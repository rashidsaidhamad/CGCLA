import React, { useState, useEffect } from 'react';

const AddStockModal = ({ isOpen, onClose, selectedItem, onSuccess }) => {
  const [addStockData, setAddStockData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unitPrice: '',
    totalPrice: 0
  });

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddStockData({
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unitPrice: '',
        totalPrice: 0
      });
    }
  }, [isOpen]);

  // Calculate total price
  const calculateTotalPrice = (quantity, unitPrice) => {
    const total = parseFloat(quantity || 0) * parseFloat(unitPrice || 0);
    return isNaN(total) ? 0 : total;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    const newData = { ...addStockData, [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newData.totalPrice = calculateTotalPrice(newData.quantity, newData.unitPrice);
    }
    setAddStockData(newData);
  };

  // Submit add stock
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE}/inventory/add-stock/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          item_id: selectedItem.id,
          quantity: parseFloat(addStockData.quantity),
          unit_price: parseFloat(addStockData.unitPrice),
          date: addStockData.date
        }),
      });

      if (response.ok) {
        alert('Stock added successfully!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock. Please try again.');
    }
  };

  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Stock</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
              <input
                type="text"
                value={selectedItem.item_code}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={selectedItem.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity</label>
              <input
                type="text"
                value={`${selectedItem.total_stock || selectedItem.stock} ${selectedItem.unit}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={addStockData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity</label>
              <input
                type="number"
                value={addStockData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity to add"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (TSh)</label>
              <input
                type="number"
                value={addStockData.unitPrice}
                onChange={(e) => handleChange('unitPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter unit price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (TSh)</label>
              <input
                type="text"
                value={addStockData.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={!addStockData.quantity || !addStockData.unitPrice}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Stock
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;