import React, { useState, useEffect } from 'react';

const ItemBatchDetails = ({ itemId, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [itemInfo, setItemInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    if (itemId) {
      fetchItemBatches();
    }
  }, [itemId]);

  const fetchItemBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/inventory/items/${itemId}/batches/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setItemInfo({
        name: data.item_name,
        code: data.item_code,
        totalStock: data.total_stock,
        currentFifoPrice: data.current_fifo_price,
        averagePrice: data.average_price,
        totalBatches: data.total_batches,
        activeBatches: data.active_batches
      });
      setBatches(data.batches || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching item batches:', error);
      setError('Failed to load batch information. Please try again.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBatchStatus = (batch) => {
    if (batch.is_expired) {
      return { status: 'Expired', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' };
    } else if (batch.remaining_quantity === 0) {
      return { status: 'Used Up', color: 'text-gray-600', bg: 'bg-gray-100', icon: '📭' };
    } else if (batch.remaining_quantity < batch.original_quantity * 0.2) {
      return { status: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' };
    } else {
      return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' };
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading batch information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Batch Details</h2>
            {itemInfo && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">{itemInfo.name}</p>
                  <p>Code: {itemInfo.code}</p>
                </div>
                <div>
                  <p><strong>Total Stock:</strong> {itemInfo.totalStock}</p>
                  <p><strong>Active Batches:</strong> {itemInfo.activeBatches}</p>
                </div>
                <div>
                  <p><strong>FIFO Price:</strong> TSh {formatCurrency(itemInfo.currentFifoPrice)}</p>
                  <p><strong>Avg Price:</strong> TSh {formatCurrency(itemInfo.averagePrice)}</p>
                </div>
                <div>
                  <p><strong>Price Difference:</strong></p>
                  <p className={itemInfo.averagePrice >= itemInfo.currentFifoPrice ? 'text-green-600' : 'text-red-600'}>
                    {itemInfo.averagePrice >= itemInfo.currentFifoPrice ? '+' : ''}
                    TSh {formatCurrency(itemInfo.averagePrice - itemInfo.currentFifoPrice)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg m-6 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Batch List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {batches.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500">No batches found for this item</p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch, index) => {
                  const status = getBatchStatus(batch);
                  return (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{status.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{batch.batch_number}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                              {status.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Received: {formatDate(batch.date_received)}</p>
                          {batch.expiry_date && (
                            <p className={batch.is_expired ? 'text-red-600' : ''}>
                              Expires: {formatDate(batch.expiry_date)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Quantity</p>
                          <p className="text-gray-900">
                            <span className="font-bold text-lg">{batch.remaining_quantity}</span>
                            <span className="text-gray-500">/{batch.original_quantity}</span>
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(batch.remaining_quantity / batch.original_quantity) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-600 font-medium">Unit Price</p>
                          <p className="text-gray-900 font-bold">TSh {formatCurrency(batch.unit_price)}</p>
                        </div>

                        <div>
                          <p className="text-gray-600 font-medium">Remaining Value</p>
                          <p className="text-gray-900 font-bold">TSh {formatCurrency(batch.remaining_value)}</p>
                          <p className="text-xs text-gray-500">
                            Original: TSh {formatCurrency(batch.total_original_value)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600 font-medium">Supplier</p>
                          <p className="text-gray-900">{batch.supplier || 'N/A'}</p>
                          {batch.po_number && (
                            <p className="text-xs text-gray-500">PO: {batch.po_number}</p>
                          )}
                        </div>
                      </div>

                      {(batch.grn_reference || batch.received_by) && (
                        <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                          {batch.grn_reference && <span>GRN: {batch.grn_reference} • </span>}
                          {batch.received_by && <span>Received by: {batch.received_by}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {itemInfo && batches.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Batches</p>
                <p className="font-bold text-gray-900">{itemInfo.totalBatches}</p>
              </div>
              <div>
                <p className="text-gray-600">Active Batches</p>
                <p className="font-bold text-green-600">{itemInfo.activeBatches}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Remaining Stock</p>
                <p className="font-bold text-blue-600">{itemInfo.totalStock} units</p>
              </div>
              <div>
                <p className="text-gray-600">Total Remaining Value</p>
                <p className="font-bold text-purple-600">
                  TSh {formatCurrency(
                    batches
                      .filter(b => b.remaining_quantity > 0)
                      .reduce((sum, b) => sum + b.remaining_value, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemBatchDetails;