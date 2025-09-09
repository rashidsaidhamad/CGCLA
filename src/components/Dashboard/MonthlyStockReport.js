import React, { useState, useEffect } from 'react';

const MonthlyStockReport = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2023, 2024, 2025];

  // Mock report data
  const generateReportData = (month, year) => {
    return {
      summary: {
        totalItemsAvailable: 8750,
        totalItemsIssued: 1250,
        totalStockValue: 2500000,
        issuePercentage: 12.5,
        topCategory: 'Laboratory Equipment'
      },
      departmentBreakdown: [
        { 
          department: 'Chemistry Lab', 
          issued: 320, 
          percentage: 25.6,
          topItems: ['Test Tubes', 'Beakers', 'Laboratory Gloves']
        },
        { 
          department: 'Physics Lab', 
          issued: 280, 
          percentage: 22.4,
          topItems: ['Multimeters', 'Resistors', 'Safety Goggles']
        },
        { 
          department: 'Biology Lab', 
          issued: 250, 
          percentage: 20.0,
          topItems: ['Microscope Slides', 'Petri Dishes', 'Pipettes']
        },
        { 
          department: 'Engineering', 
          issued: 200, 
          percentage: 16.0,
          topItems: ['Tools', 'Safety Equipment', 'Measuring Devices']
        },
        { 
          department: 'Research', 
          issued: 120, 
          percentage: 9.6,
          topItems: ['Specialized Equipment', 'Chemicals', 'Safety Gear']
        },
        { 
          department: 'Administration', 
          issued: 80, 
          percentage: 6.4,
          topItems: ['Office Supplies', 'Stationery', 'Equipment']
        }
      ],
      categoryBreakdown: [
        { 
          category: 'Laboratory Equipment', 
          available: 3200, 
          issued: 480, 
          value: 960000,
          percentage: 38.4
        },
        { 
          category: 'Safety Equipment', 
          available: 2100, 
          issued: 350, 
          value: 525000,
          percentage: 28.0
        },
        { 
          category: 'Chemicals', 
          available: 1800, 
          issued: 220, 
          value: 720000,
          percentage: 17.6
        },
        { 
          category: 'Tools & Instruments', 
          available: 1200, 
          issued: 140, 
          value: 240000,
          percentage: 11.2
        },
        { 
          category: 'Office Supplies', 
          available: 450, 
          issued: 60, 
          value: 55000,
          percentage: 4.8
        }
      ],
      monthlyComparison: [
        { month: 'Jan', issued: 980, available: 9020 },
        { month: 'Feb', issued: 1100, available: 8900 },
        { month: 'Mar', issued: 1200, available: 8800 },
        { month: 'Apr', issued: 1150, available: 8850 },
        { month: 'May', issued: 1300, available: 8700 },
        { month: 'Jun', issued: 1180, available: 8820 },
        { month: 'Jul', issued: 1220, available: 8780 },
        { month: 'Aug', issued: 1250, available: 8750 }
      ]
    };
  };

  useEffect(() => {
    setReportData(generateReportData(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  const handleExport = () => {
    alert(`Exporting report for ${monthNames[selectedMonth]} ${selectedYear}...`);
  };

  if (!reportData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly Stock Report</h2>
            <p className="text-gray-600 mt-1">
              Detailed analysis of stock issued and available
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Available</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.summary.totalItemsAvailable.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Items in stock</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalItemsIssued.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Items distributed</p>
            </div>
            <div className="text-3xl">📤</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-2xl font-bold text-green-600">TZS {reportData.summary.totalStockValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total inventory value</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issue Rate</p>
              <p className="text-2xl font-bold text-orange-600">{reportData.summary.issuePercentage}%</p>
              <p className="text-xs text-gray-500">Of total stock</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Department Breakdown - {monthNames[selectedMonth]} {selectedYear}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Items Issued</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Percentage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Top Items</th>
              </tr>
            </thead>
            <tbody>
              {reportData.departmentBreakdown.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                  <td className="py-3 px-4 text-gray-700">{dept.issued.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{dept.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {dept.topItems.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Analysis</h3>
          <div className="space-y-4">
            {reportData.categoryBreakdown.map((category, index) => (
              <div key={index} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Available:</span>
                    <span className="font-medium text-purple-600 ml-1">{category.available}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Issued:</span>
                    <span className="font-medium text-blue-600 ml-1">{category.issued}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className="font-medium text-green-600 ml-1">TZS {category.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                    style={{ width: `${(category.issued / (category.issued + category.available)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison ({selectedYear})</h3>
          <div className="space-y-3">
            {reportData.monthlyComparison.map((month, index) => {
              const isCurrentMonth = index === selectedMonth;
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${isCurrentMonth ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isCurrentMonth ? 'text-blue-900' : 'text-gray-900'}`}>
                      {month.month}
                      {isCurrentMonth && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Current</span>}
                    </span>
                    <span className="text-sm text-gray-600">
                      {((month.issued / (month.issued + month.available)) * 100).toFixed(1)}% issued
                    </span>
                  </div>
                  <div className="flex h-6 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(month.issued / (month.issued + month.available)) * 100}%` }}
                    >
                      {month.issued}
                    </div>
                    <div 
                      className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(month.available / (month.issued + month.available)) * 100}%` }}
                    >
                      {month.available}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-gray-600">Issued</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStockReport;
