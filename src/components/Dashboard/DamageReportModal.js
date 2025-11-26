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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');

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
      setSelectedYear(new Date().getFullYear());
      setSelectedMonth('');
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

  // Generate month options
  const getMonthOptions = () => {
    const months = [
      { value: '0', label: 'January' },
      { value: '1', label: 'February' },
      { value: '2', label: 'March' },
      { value: '3', label: 'April' },
      { value: '4', label: 'May' },
      { value: '5', label: 'June' },
      { value: '6', label: 'July' },
      { value: '7', label: 'August' },
      { value: '8', label: 'September' },
      { value: '9', label: 'October' },
      { value: '10', label: 'November' },
      { value: '11', label: 'December' }
    ];
    return months;
  };

  // Filter damage reports by year and month
  const filteredReports = damageReports.filter(report => {
    const reportDate = new Date(report.date);
    const reportYear = reportDate.getFullYear();
    const reportMonth = reportDate.getMonth();

    const yearMatch = reportYear === selectedYear;
    const monthMatch = selectedMonth === '' || reportMonth === parseInt(selectedMonth);

    return yearMatch && monthMatch;
  });

  // Calculate totals for filtered reports
  const totalGoodQuantity = filteredReports.reduce((sum, report) => sum + (report.good_quantity || 0), 0);
  const totalDamageQuantity = filteredReports.reduce((sum, report) => sum + (report.damage_quantity || 0), 0);

  // Print damage reports
  const printDamageReports = () => {
    if (filteredReports.length === 0) {
      alert('No damage reports to print');
      return;
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const periodText = selectedMonth !== '' 
      ? `${monthNames[parseInt(selectedMonth)]} ${selectedYear}`
      : `Year ${selectedYear}`;

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Damage Report - ${selectedItem.name} - ${periodText}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
          }
          
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-bottom: 3px solid #DC2626;
            margin-bottom: 30px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
          }
          
          .company-info h1 {
            color: #1F2937;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .company-info p {
            color: #6B7280;
            font-size: 14px;
          }
          
          .report-title {
            text-align: center;
            margin: 30px 0;
          }
          
          .report-title h2 {
            color: #DC2626;
            font-size: 22px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .item-info {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .item-info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          
          .info-item {
            padding: 10px;
          }
          
          .info-label {
            font-size: 12px;
            color: #6B7280;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 14px;
            color: #1F2937;
            font-weight: 500;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          thead {
            background: #DC2626;
            color: white;
          }
          
          th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          
          tbody tr {
            border-bottom: 1px solid #E5E7EB;
          }
          
          tbody tr:nth-child(even) {
            background: #F9FAFB;
          }
          
          tbody tr:hover {
            background: #FEE2E2;
          }
          
          td {
            padding: 10px 8px;
            color: #374151;
            font-size: 13px;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          
          .badge-green {
            background: #D1FAE5;
            color: #059669;
          }
          
          .badge-red {
            background: #FEE2E2;
            color: #DC2626;
          }
          
          .summary-section {
            margin-top: 30px;
            padding: 20px;
            background: #FEF2F2;
            border-radius: 8px;
            border: 2px solid #FCA5A5;
          }
          
          .summary-title {
            font-size: 16px;
            font-weight: 700;
            color: #991B1B;
            margin-bottom: 15px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          
          .summary-item {
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #FCA5A5;
          }
          
          .summary-label {
            font-size: 11px;
            color: #6B7280;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .summary-value {
            font-size: 20px;
            color: #1F2937;
            font-weight: 700;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .header {
              page-break-after: avoid;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            thead {
              display: table-header-group;
            }
            
            .summary-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <img src="/cgcla.jpg" alt="Company Logo" class="logo" onerror="this.style.display='none'">
            <div class="company-info">
              <h1>CGCLA Warehouse</h1>
              <p>Inventory Management System</p>
            </div>
          </div>
        </div>

        <div class="report-title">
          <h2>Damage Report</h2>
        </div>

        <div class="item-info">
          <div class="item-info-grid">
            <div class="info-item">
              <div class="info-label">Item Name</div>
              <div class="info-value">${selectedItem.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Item Code</div>
              <div class="info-value">${selectedItem.item_code}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Report Period</div>
              <div class="info-value">${periodText}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Generated</div>
              <div class="info-value">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Good Quantity</th>
              <th>Damage Quantity</th>
              <th>Total Reported</th>
            </tr>
          </thead>
          <tbody>
            ${filteredReports.map(report => `
              <tr>
                <td>${new Date(report.date).toLocaleDateString()}</td>
                <td><span class="badge badge-green">${report.good_quantity} ${selectedItem.unit}</span></td>
                <td><span class="badge badge-red">${report.damage_quantity} ${selectedItem.unit}</span></td>
                <td>${(report.good_quantity + report.damage_quantity)} ${selectedItem.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-title">Summary Statistics</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Good Quantity</div>
              <div class="summary-value" style="color: #059669;">${totalGoodQuantity.toLocaleString()} ${selectedItem.unit}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Damage Quantity</div>
              <div class="summary-value" style="color: #DC2626;">${totalDamageQuantity.toLocaleString()} ${selectedItem.unit}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Reports</div>
              <div class="summary-value">${filteredReports.length}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This report was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>CGCLA Warehouse Management System © ${new Date().getFullYear()}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Damage History
                </h4>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Months</option>
                    {getMonthOptions().map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={printDamageReports}
                    disabled={filteredReports.length === 0}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    title="Print Report"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              {filteredReports.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 font-medium">Total Good</div>
                    <div className="text-lg font-bold text-green-600">{totalGoodQuantity} {selectedItem.unit}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 font-medium">Total Damage</div>
                    <div className="text-lg font-bold text-red-600">{totalDamageQuantity} {selectedItem.unit}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 font-medium">Reports</div>
                    <div className="text-lg font-bold text-blue-600">{filteredReports.length}</div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-80">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Good</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.length > 0 ? filteredReports.map((report, index) => (
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
                              <p className="text-sm text-gray-400 mt-1">
                                {selectedMonth !== '' || selectedYear !== new Date().getFullYear()
                                  ? 'No reports for the selected period'
                                  : 'Damage reports will appear here once submitted'}
                              </p>
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