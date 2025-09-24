import React from 'react';
import { formatCurrency } from '../../utils/currency';

const ItemHistoryModal = ({
  showHistoryModal,
  selectedItem,
  itemHistory,
  historyLoading,
  onClose
}) => {
  if (!showHistoryModal) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter to show only transactions with real data (not N/A)
  const filterRealData = (transaction) => {
    const stockBefore = transaction.stock_before || 
                       transaction.old_stock || 
                       transaction.quantity_before ||
                       (transaction.stock_after ? transaction.stock_after - (transaction.adjustment || transaction.quantity_change || 0) : null);
    
    const stockAfter = transaction.stock_after || 
                      transaction.new_stock || 
                      transaction.quantity_after ||
                      transaction.current_stock;
    
    const hasValidStock = stockBefore !== null && stockBefore !== 'N/A' && 
                         stockAfter !== null && stockAfter !== 'N/A';
    
    const hasValidDate = transaction.date || transaction.created_at || 
                        transaction.timestamp || transaction.adjustment_date;
    
    return hasValidStock && hasValidDate;
  };

  const validTransactions = itemHistory.filter(filterRealData);

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'increase':
      case 'stock_in':
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'decrease':
      case 'stock_out':
      case 'sale':
      case 'adjustment':
        return 'bg-red-100 text-red-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Stock History - {selectedItem?.name}
            </h3>
            <p className="text-sm text-gray-600">
              Code: {selectedItem?.item_code} | Current Stock: {selectedItem?.stock} {selectedItem?.unit} | Current Price: {formatCurrency(selectedItem?.unit_price || 0)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : itemHistory.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No History Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No stock adjustment history found for this item.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  History will appear here after making stock adjustments.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96 p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Before
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity After
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Before
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date After
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Before (TSh)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price After (TSh)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          No valid transaction history available
                        </td>
                      </tr>
                    ) : (
                      validTransactions.map((transaction, index) => {
                      // Handle different data structures from different endpoints
                      const stockBefore = transaction.stock_before || 
                                         transaction.old_stock || 
                                         transaction.quantity_before ||
                                         (transaction.stock_after ? transaction.stock_after - (transaction.adjustment || transaction.quantity_change || 0) : 'N/A');
                      
                      const stockAfter = transaction.stock_after || 
                                        transaction.new_stock || 
                                        transaction.quantity_after ||
                                        transaction.current_stock ||
                                        'N/A';
                      
                      const priceBefore = transaction.price_before || 
                                         transaction.old_price ||
                                         transaction.unit_price_before ||
                                         'N/A';
                      
                      const priceAfter = transaction.price_after || 
                                        transaction.new_price ||
                                        transaction.unit_price_after ||
                                        transaction.unit_price ||
                                        'N/A';

                      const transactionDate = transaction.date || 
                                            transaction.created_at || 
                                            transaction.timestamp ||
                                            transaction.adjustment_date;

                      return (
                        <tr key={transaction.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {selectedItem?.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-medium">
                              {stockBefore !== 'N/A' ? stockBefore : 'N/A'}
                            </span>
                            {stockBefore !== 'N/A' && (
                              <span className="text-xs text-gray-500 ml-1">
                                {selectedItem?.unit}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="font-medium">
                                {stockAfter !== 'N/A' ? stockAfter : 'N/A'}
                              </span>
                              {stockAfter !== 'N/A' && (
                                <span className="text-xs text-gray-500 ml-1">
                                  {selectedItem?.unit}
                                </span>
                              )}
                              {/* Show change indicator */}
                              {stockBefore !== 'N/A' && stockAfter !== 'N/A' && (
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                  stockAfter > stockBefore
                                    ? 'bg-green-100 text-green-700'
                                    : stockAfter < stockBefore
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {stockAfter > stockBefore
                                    ? `+${stockAfter - stockBefore}`
                                    : stockAfter < stockBefore
                                    ? `${stockAfter - stockBefore}`
                                    : '0'
                                  }
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">
                                {(() => {
                                  // Get the previous transaction date or use a default
                                  const prevTransaction = validTransactions[index + 1];
                                  const beforeDate = transaction.date_before || 
                                                   prevTransaction?.date || 
                                                   prevTransaction?.created_at ||
                                                   prevTransaction?.timestamp ||
                                                   selectedItem?.created_at;
                                  return beforeDate ? 
                                    new Date(beforeDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 
                                    'N/A';
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">
                                {transactionDate ? formatDate(transactionDate) : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-medium ${priceBefore !== 'N/A' ? '' : 'text-gray-400'}`}>
                              {priceBefore !== 'N/A' ? formatCurrency(priceBefore) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-medium ${
                              priceAfter !== 'N/A' && priceBefore !== 'N/A' && 
                              priceAfter !== priceBefore 
                                ? (priceAfter > priceBefore ? 'text-green-600' : 'text-red-600')
                                : priceAfter !== 'N/A' ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {priceAfter !== 'N/A' ? formatCurrency(priceAfter) : 'N/A'}
                            </span>
                            {priceAfter !== 'N/A' && priceBefore !== 'N/A' && 
                             priceAfter !== priceBefore && (
                              <div className="text-xs text-gray-500">
                                {priceAfter > priceBefore ? '↗️ Increased' : '↘️ Decreased'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={transaction.reason || transaction.notes || transaction.description || 'N/A'}>
                              {transaction.reason || transaction.notes || transaction.description || 'Stock Adjustment'}
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemHistoryModal;