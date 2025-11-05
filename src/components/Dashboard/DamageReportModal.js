import React, { useState, useEffect } from 'react';

const DamageReportModal = ({ isOpen, onClose, selectedItem, onSuccess }) => {
  const [damageReportData, setDamageReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    goodQuantity: '',
    damageQuantity: ''
  });
  const [damageReports, setDamageReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setDamageReportData({
        date: new Date().toISOString().split('T')[0],
        goodQuantity: '',
        damageQuantity: ''
      });
      if (selectedItem) {
        fetchDamageReports(selectedItem.id);
      }
    }
  }, [isOpen, selectedItem]);

  // Fetch existing damage reports
  const fetchDamageReports = async (itemId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/inventory/damage-reports/${itemId}/`, {
        headers: getHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDamageReports(data.reports || []);
      } else {
        setDamageReports([]);
      }
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setDamageReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setDamageReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit damage report
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/inventory/damage-reports/${selectedItem.id}/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          item_id: selectedItem.id,
          good_quantity: parseFloat(damageReportData.goodQuantity),
          damage_quantity: parseFloat(damageReportData.damageQuantity),
          date: damageReportData.date
        }),
      });

      if (response.ok) {
        alert('Damage report submitted successfully!');
        
        // Reset form
        setDamageReportData({
          date: new Date().toISOString().split('T')[0],
          goodQuantity: '',
          damageQuantity: ''
        });
        
        // Fetch updated damage reports from server
        await fetchDamageReports(selectedItem.id);
        
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Failed to submit damage report');
      }
    } catch (error) {
      console.error('Error submitting damage report:', error);
      alert('Error submitting damage report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-5xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Damage Report - {selectedItem.name} ({selectedItem.item_code})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Damage Report Form */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.634 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Report New Damage
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={damageReportData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Good Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  value={damageReportData.goodQuantity}
                  onChange={(e) => handleChange('goodQuantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter good quantity"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  value={damageReportData.damageQuantity}
                  onChange={(e) => handleChange('damageQuantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter damage quantity"
                  min="0"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!damageReportData.goodQuantity || !damageReportData.damageQuantity || isSubmitting}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Damage Report'
                )}
              </button>
            </div>

            {/* Damage History Table */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Damage History
              </h4>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Good</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {damageReports.length > 0 ? damageReports.map((report, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(report.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                            {report.good_quantity} {selectedItem.unit}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                            {report.damage_quantity} {selectedItem.unit}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p>No damage reports found</p>
                              <p className="text-sm text-gray-400 mt-1">Damage reports will appear here once submitted</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageReportModal;