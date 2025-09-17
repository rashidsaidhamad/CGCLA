import React from 'react';

const StockAdjustmentModal = ({
  showStockModal,
  selectedItem,
  stockAdjustment,
  setStockAdjustment,
  handleStockAdjustment,
  onClose
}) => {
  if (!showStockModal) return null;

  const handleClose = () => {
    setStockAdjustment({ type: 'increase', quantity: 0, reason: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Adjust Stock - {selectedItem?.name}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Current Stock: <span className="font-semibold">{selectedItem?.stock} {selectedItem?.unit}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjustment Type
          </label>
          <select
            value={stockAdjustment.type}
            onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="increase">Increase Stock</option>
            <option value="decrease">Decrease Stock</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={stockAdjustment.quantity}
            onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter quantity"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <textarea
            value={stockAdjustment.reason}
            onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="Enter reason for adjustment"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleStockAdjustment}
            disabled={!stockAdjustment.quantity || !stockAdjustment.reason}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Adjust Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
