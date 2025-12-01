import React, { useState, useEffect, useMemo, useCallback } from 'react';

const ItemIssuedReport = () => {
  const [reportData, setReportData] = useState(null);
  const [itemDetails, setItemDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  });

  // Fetch detailed item issued report
  const fetchItemIssuedReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all required data including damage reports for each item
      const [requestsResponse, inventoryResponse, categoriesResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_BASE}/reports/request-report/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/reports/inventory-report/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/inventory/categories/`, { headers: getHeaders() }),
        fetch(`${API_BASE}/inventory/transactions/`, { headers: getHeaders() })
      ]);

      if (!requestsResponse.ok || !inventoryResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const requestsData = await requestsResponse.json();
      const inventoryData = await inventoryResponse.json();
      const categoriesData = await categoriesResponse.json();

      // Fetch stock transactions for each item to get received quantities
      const inventoryItems = inventoryData.items || inventoryData || [];
      const stockTransactionsPromises = inventoryItems.map(async (item) => {
        try {
          const response = await fetch(`${API_BASE}/inventory/item-transactions/${item.id}/`, { headers: getHeaders() });
          if (response.ok) {
            const data = await response.json();
            return { itemId: item.id, transactions: data.transactions || [] };
          }
        } catch (error) {
          console.error(`Error fetching stock transactions for item ${item.id}:`, error);
        }
        return { itemId: item.id, transactions: [] };
      });

      const stockTransactionsData = await Promise.all(stockTransactionsPromises);

      // Fetch damage reports for all items
      const damageReportsPromises = inventoryItems.map(async (item) => {
        try {
          const response = await fetch(`${API_BASE}/inventory/damage-reports/${item.id}/`, { headers: getHeaders() });
          if (response.ok) {
            const data = await response.json();
            return { itemId: item.id, reports: data.reports || [] };
          }
        } catch (error) {
          console.error(`Error fetching damage reports for item ${item.id}:`, error);
        }
        return { itemId: item.id, reports: [] };
      });

      const damageReportsData = await Promise.all(damageReportsPromises);

      console.log('Requests Data:', requestsData);
      console.log('Inventory Data:', inventoryData);
      console.log('Categories Data:', categoriesData);

      // Set categories for filtering
      const categoriesList = categoriesData.results || categoriesData || [];
      console.log('Categories list for dropdown:', categoriesList);
      setCategories(categoriesList);

      // Process and combine the data with damage reports and stock transactions
      const processedData = processItemData(requestsData, inventoryData, damageReportsData, stockTransactionsData, categoriesList);
      setItemDetails(processedData);
      setReportData({ 
        requests: requestsData, 
        inventory: inventoryData,
        damageReports: damageReportsData,
        stockTransactions: stockTransactionsData
      });

    } catch (error) {
      console.error('Error fetching item issued report:', error);
      setError('Failed to load item issued report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process and combine request and inventory data
  const processItemData = (requestsData, inventoryData, damageReportsData = [], stockTransactionsData = [], categoriesList = []) => {
    const requests = requestsData.requests || requestsData || [];
    const inventory = inventoryData.items || inventoryData || [];

    // Create a map of categories by ID for quick lookup
    const categoriesMap = {};
    categoriesList.forEach(cat => {
      categoriesMap[cat.id] = cat.name;
    });
    
    console.log('=== Categories Map ===', categoriesMap);
    console.log('=== Sample Raw Inventory Items (first 3) ===');
    inventory.slice(0, 3).forEach(item => {
      console.log(`  Item ID ${item.id}: "${item.name}"`, {
        category: item.category,
        category_type: typeof item.category,
        category_id: item.category_id,
        has_category: !!item.category
      });
    });

    // Create a map of damage reports by item ID for quick lookup
    const damageReportsMap = {};
    damageReportsData.forEach(({ itemId, reports }) => {
      damageReportsMap[itemId] = reports;
    });

    // Create a map of stock transactions by item ID for quick lookup
    const stockTransactionsMap = {};
    stockTransactionsData.forEach(({ itemId, transactions }) => {
      stockTransactionsMap[itemId] = transactions || [];
    });

    // Create a map of inventory items for quick lookup
    const inventoryMap = {};
    inventory.forEach(item => {
      inventoryMap[item.id] = item;
    });

    // Calculate monthly data for each item
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const itemStockMap = {};

    // Initialize stock data for all inventory items
    inventory.forEach(item => {
      if (!itemStockMap[item.id]) {
        // Extract categoryId and categoryName - handle all possible formats
        let categoryId = null;
        let categoryName = 'Uncategorized';
        
        // Log the raw category data for debugging (first 3 items only)
        const debugIndex = Object.keys(itemStockMap).length;
        if (debugIndex < 3) {
          console.log(`📦 Item #${debugIndex + 1}: "${item.name}"`);
          console.log('  Raw category field:', item.category);
          console.log('  Type:', typeof item.category);
          console.log('  Is object?', typeof item.category === 'object' && item.category !== null);
          if (typeof item.category === 'object' && item.category !== null) {
            console.log('  Category.id:', item.category.id);
            console.log('  Category.name:', item.category.name);
          }
        }
        
        if (item.category) {
          if (typeof item.category === 'object' && item.category !== null) {
            // Category is an object with id and name
            categoryId = item.category.id || null;
            categoryName = item.category.name || 'Uncategorized';
            if (debugIndex < 3) {
              console.log(`  ✓ Extracted from object: categoryId=${categoryId}, categoryName="${categoryName}"`);
            }
          } else if (typeof item.category === 'number') {
            // Category is just an ID number
            categoryId = item.category;
            categoryName = categoriesMap[categoryId] || 'Uncategorized';
            if (debugIndex < 3) {
              console.log(`  ✓ Extracted from number: categoryId=${categoryId}, categoryName="${categoryName}"`);
            }
          } else if (typeof item.category === 'string') {
            // Category is a string (could be name or numeric string)
            const parsedId = parseInt(item.category);
            if (!isNaN(parsedId)) {
              categoryId = parsedId;
              categoryName = categoriesMap[categoryId] || 'Uncategorized';
              if (debugIndex < 3) {
                console.log(`  ✓ Extracted from string: categoryId=${categoryId}, categoryName="${categoryName}"`);
              }
            } else {
              categoryName = item.category;
              if (debugIndex < 3) {
                console.log(`  ✓ Using category name: "${categoryName}"`);
              }
            }
          }
        }
        
        // Also check for category_id field directly on item
        if (categoryId === null && item.category_id) {
          categoryId = typeof item.category_id === 'number' ? item.category_id : parseInt(item.category_id);
          categoryName = categoriesMap[categoryId] || categoryName;
          if (debugIndex < 3) {
            console.log(`  ✓ Extracted from category_id field: categoryId=${categoryId}`);
          }
        }
        
        // Last resort: check for categoryId field (camelCase)
        if (categoryId === null && item.categoryId) {
          categoryId = typeof item.categoryId === 'number' ? item.categoryId : parseInt(item.categoryId);
          categoryName = categoriesMap[categoryId] || categoryName;
          if (debugIndex < 3) {
            console.log(`  ✓ Extracted from categoryId field: categoryId=${categoryId}`);
          }
        }
        
        if (debugIndex < 3) {
          console.log(`  📊 Final result: categoryId=${categoryId}, categoryName="${categoryName}"`);
        }
        
        itemStockMap[item.id] = {
          id: item.id,
          itemCode: item.item_code || 'N/A',
          itemName: item.name,
          unit: item.unit || 'pcs',
          category: categoryName,
          categoryId: categoryId,
          lastMonthStock: 0,
          lastMonthDamaged: 0,
          receivedThisMonth: 0,
          issuedThisMonth: 0,
          currentStock: item.current_stock || item.stock || item.quantity || 0,
          currentDamaged: 0,
          unitPrice: item.unit_price || 0
        };
      }
    });

    // Process requests for issued items this month
    requests
      .filter(request => request.status === 'approved')
      .forEach(request => {
        const requestDate = new Date(request.created_at || request.date_requested);
        const requestMonth = requestDate.getMonth();
        const requestYear = requestDate.getFullYear();

        if (requestMonth === currentMonth && requestYear === currentYear) {
          const itemId = typeof request.item === 'object' ? request.item?.id : request.item;
          if (itemStockMap[itemId]) {
            itemStockMap[itemId].issuedThisMonth += request.approved_quantity || request.quantity || 0;
          }
        }
      });

    // Calculate damage quantities and received quantities from actual data
    Object.values(itemStockMap).forEach(item => {
      const itemDamageReports = damageReportsMap[item.id] || [];
      const itemStockTransactions = stockTransactionsMap[item.id] || [];
      
      // Calculate current month and last month damage quantities
      let currentMonthDamage = 0;
      let lastMonthDamage = 0;
      
      itemDamageReports.forEach(report => {
        const reportDate = new Date(report.date);
        const reportMonth = reportDate.getMonth();
        const reportYear = reportDate.getFullYear();
        
        if (reportMonth === currentMonth && reportYear === currentYear) {
          currentMonthDamage += report.damage_quantity || 0;
        } else if (reportMonth === lastMonth && reportYear === lastMonthYear) {
          lastMonthDamage += report.damage_quantity || 0;
        }
      });
      
      // Calculate received quantities from stock transactions
      let receivedThisMonth = 0;
      
      itemStockTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        
        // Only count transactions that add stock and are positive quantities
        const isReceivingTransaction = ['received', 'restock', 'purchase'].includes(transaction.transaction_type?.toLowerCase());
        const isCurrentMonth = transactionMonth === currentMonth && transactionYear === currentYear;
        
        if (isReceivingTransaction && isCurrentMonth && transaction.quantity > 0) {
          receivedThisMonth += transaction.quantity || 0;
        }
      });
      
      // Update quantities with actual data
      item.currentDamaged = currentMonthDamage;
      item.lastMonthDamaged = lastMonthDamage;
      item.receivedThisMonth = receivedThisMonth;
      
      // Calculate last month stock (current + issued - received)
      item.lastMonthStock = Math.max(0, item.currentStock + item.issuedThisMonth - item.receivedThisMonth);
      item.totalValue = item.currentStock * item.unitPrice;
    });

    return Object.values(itemStockMap);
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

  // Recalculate data for a specific month and year
  const recalculateDataForMonth = useCallback((targetMonth, targetYear) => {
    if (!reportData) return itemDetails;

    const requests = reportData.requests.requests || reportData.requests || [];
    const inventory = reportData.inventory.items || reportData.inventory || [];
    const damageReports = reportData.damageReports || [];
    const stockTransactions = reportData.stockTransactions || [];

    // Create a map of categories by ID for quick lookup
    const categoriesMap = {};
    categories.forEach(cat => {
      categoriesMap[cat.id] = cat.name;
    });

    console.log('=== recalculateDataForMonth ===');
    console.log('Target month:', targetMonth, 'Target year:', targetYear);
    console.log('Sample inventory items (first 2):');
    inventory.slice(0, 2).forEach(item => {
      console.log(`  Item: "${item.name}"`, {
        category: item.category,
        categoryType: typeof item.category,
        categoryId: item.category?.id
      });
    });

    const damageReportsMap = {};
    damageReports.forEach(({ itemId, reports }) => {
      damageReportsMap[itemId] = reports;
    });

    const stockTransactionsMap = {};
    stockTransactions.forEach(({ itemId, transactions }) => {
      stockTransactionsMap[itemId] = transactions || [];
    });

    const itemStockMap = {};

    // Initialize stock data for all inventory items
    inventory.forEach(item => {
      if (!itemStockMap[item.id]) {
        // Extract categoryId and categoryName - handle all possible formats
        let categoryId = null;
        let categoryName = 'Uncategorized';
        
        if (item.category) {
          if (typeof item.category === 'object' && item.category !== null) {
            // Category is an object with id and name
            categoryId = item.category.id || null;
            categoryName = item.category.name || 'Uncategorized';
          } else if (typeof item.category === 'number') {
            // Category is just an ID number
            categoryId = item.category;
            categoryName = categoriesMap[categoryId] || 'Uncategorized';
          } else if (typeof item.category === 'string') {
            // Category is a string (could be name or numeric string)
            const parsedId = parseInt(item.category);
            if (!isNaN(parsedId)) {
              categoryId = parsedId;
              categoryName = categoriesMap[categoryId] || 'Uncategorized';
            } else {
              categoryName = item.category;
            }
          }
        }
        
        // Also check for category_id field directly on item
        if (categoryId === null && item.category_id) {
          categoryId = typeof item.category_id === 'number' ? item.category_id : parseInt(item.category_id);
          categoryName = categoriesMap[categoryId] || categoryName;
        }
        
        // Last resort: check for categoryId field (camelCase)
        if (categoryId === null && item.categoryId) {
          categoryId = typeof item.categoryId === 'number' ? item.categoryId : parseInt(item.categoryId);
          categoryName = categoriesMap[categoryId] || categoryName;
        }
        
        itemStockMap[item.id] = {
          id: item.id,
          itemCode: item.item_code || 'N/A',
          itemName: item.name,
          unit: item.unit || 'pcs',
          category: categoryName,
          categoryId: categoryId,
          lastMonthStock: 0,
          lastMonthDamaged: 0,
          receivedThisMonth: 0,
          issuedThisMonth: 0,
          currentStock: item.current_stock || item.stock || item.quantity || 0,
          currentDamaged: 0,
          unitPrice: item.unit_price || 0
        };
      }
    });

    // If targetMonth is null, process entire year
    if (targetMonth === null) {
      requests
        .filter(request => request.status === 'approved')
        .forEach(request => {
          const requestDate = new Date(request.created_at || request.date_requested);
          const requestYear = requestDate.getFullYear();

          if (requestYear === targetYear) {
            const itemId = typeof request.item === 'object' ? request.item?.id : request.item;
            if (itemStockMap[itemId]) {
              itemStockMap[itemId].issuedThisMonth += request.approved_quantity || request.quantity || 0;
            }
          }
        });

      Object.values(itemStockMap).forEach(item => {
        const itemDamageReports = damageReportsMap[item.id] || [];
        const itemStockTransactions = stockTransactionsMap[item.id] || [];
        
        let yearDamage = 0;
        let receivedThisYear = 0;
        
        itemDamageReports.forEach(report => {
          const reportDate = new Date(report.date);
          const reportYear = reportDate.getFullYear();
          
          if (reportYear === targetYear) {
            yearDamage += report.damage_quantity || 0;
          }
        });
        
        itemStockTransactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date);
          const transactionYear = transactionDate.getFullYear();
          
          const isReceivingTransaction = ['received', 'restock', 'purchase'].includes(transaction.transaction_type?.toLowerCase());
          
          if (isReceivingTransaction && transactionYear === targetYear && transaction.quantity > 0) {
            receivedThisYear += transaction.quantity || 0;
          }
        });
        
        item.currentDamaged = yearDamage;
        item.receivedThisMonth = receivedThisYear;
        item.lastMonthStock = Math.max(0, item.currentStock + item.issuedThisMonth - item.receivedThisMonth);
        item.totalValue = item.currentStock * item.unitPrice;
      });
    } else {
      const previousMonth = targetMonth === 0 ? 11 : targetMonth - 1;
      const previousYear = targetMonth === 0 ? targetYear - 1 : targetYear;

      requests
        .filter(request => request.status === 'approved')
        .forEach(request => {
          const requestDate = new Date(request.created_at || request.date_requested);
          const requestMonth = requestDate.getMonth();
          const requestYear = requestDate.getFullYear();

          if (requestMonth === targetMonth && requestYear === targetYear) {
            const itemId = typeof request.item === 'object' ? request.item?.id : request.item;
            if (itemStockMap[itemId]) {
              itemStockMap[itemId].issuedThisMonth += request.approved_quantity || request.quantity || 0;
            }
          }
        });

      Object.values(itemStockMap).forEach(item => {
        const itemDamageReports = damageReportsMap[item.id] || [];
        const itemStockTransactions = stockTransactionsMap[item.id] || [];
        
        let targetMonthDamage = 0;
        let previousMonthDamage = 0;
        
        itemDamageReports.forEach(report => {
          const reportDate = new Date(report.date);
          const reportMonth = reportDate.getMonth();
          const reportYear = reportDate.getFullYear();
          
          if (reportMonth === targetMonth && reportYear === targetYear) {
            targetMonthDamage += report.damage_quantity || 0;
          } else if (reportMonth === previousMonth && reportYear === previousYear) {
            previousMonthDamage += report.damage_quantity || 0;
          }
        });
        
        let receivedThisMonth = 0;
        
        itemStockTransactions.forEach(transaction => {
          const transactionDate = new Date(transaction.date);
          const transactionMonth = transactionDate.getMonth();
          const transactionYear = transactionDate.getFullYear();
          
          const isReceivingTransaction = ['received', 'restock', 'purchase'].includes(transaction.transaction_type?.toLowerCase());
          const isTargetMonth = transactionMonth === targetMonth && transactionYear === targetYear;
          
          if (isReceivingTransaction && isTargetMonth && transaction.quantity > 0) {
            receivedThisMonth += transaction.quantity || 0;
          }
        });
        
        item.currentDamaged = targetMonthDamage;
        item.lastMonthDamaged = previousMonthDamage;
        item.receivedThisMonth = receivedThisMonth;
        item.lastMonthStock = Math.max(0, item.currentStock + item.issuedThisMonth - item.receivedThisMonth);
        item.totalValue = item.currentStock * item.unitPrice;
      });
    }

    return Object.values(itemStockMap);
  }, [reportData, itemDetails, categories]);

  // Filter and recalculate data by month, year, and category using useMemo
  const filteredData = useMemo(() => {
    console.log('=== Filtering Data ===');
    console.log('itemDetails length:', itemDetails.length);
    console.log('selectedMonth:', selectedMonth);
    console.log('selectedYear:', selectedYear);
    console.log('selectedCategory:', selectedCategory);
    
    let filtered = [...itemDetails];
    
    // If a specific month is selected or year is different from current year, recalculate the data for that period
    const currentYear = new Date().getFullYear();
    const shouldRecalculate = selectedMonth !== '' || selectedYear !== currentYear;
    
    console.log('Should recalculate?', shouldRecalculate, '(currentYear:', currentYear, ')');
    
    if (shouldRecalculate && reportData) {
      const monthIndex = selectedMonth !== '' ? parseInt(selectedMonth) : null;
      const targetYear = selectedYear;
      
      console.log('Recalculating for month:', monthIndex, 'year:', targetYear);
      filtered = recalculateDataForMonth(monthIndex, targetYear);
      console.log('After recalculation, items count:', filtered.length);
    }

    // Filter by category
    if (selectedCategory !== '') {
      const categoryId = parseInt(selectedCategory);
      console.log('=== CATEGORY FILTER ACTIVE ===');
      console.log('Selected category ID from dropdown:', categoryId);
      console.log('Before category filter:', filtered.length, 'items');
      
      // Debug: show first 5 items with their categories
      console.log('Sample items before filter (first 5):', filtered.slice(0, 5).map(item => ({
        id: item.id,
        name: item.itemName,
        categoryId: item.categoryId,
        categoryIdType: typeof item.categoryId,
        category: item.category
      })));
      
      // Count items by categoryId
      const categoryCount = {};
      filtered.forEach(item => {
        const catId = item.categoryId;
        categoryCount[catId] = (categoryCount[catId] || 0) + 1;
      });
      console.log('Items distribution by categoryId:', categoryCount);
      
      filtered = filtered.filter(item => {
        const itemCategoryId = item.categoryId;
        const matches = itemCategoryId !== null && itemCategoryId !== undefined && itemCategoryId === categoryId;
        return matches;
      });
      
      console.log('✅ After category filter:', filtered.length, 'items matched');
      if (filtered.length > 0) {
        console.log('Sample filtered items (first 3):', filtered.slice(0, 3).map(item => ({
          id: item.id,
          name: item.itemName,
          categoryId: item.categoryId,
          category: item.category
        })));
      } else {
        console.log('⚠️ NO ITEMS MATCHED - Expected category ID:', categoryId);
        console.log('Available category IDs in data:', Object.keys(categoryCount).join(', '));
      }
    }

    console.log('=== Final filtered data:', filtered.length, 'items ===');
    return filtered;
  }, [itemDetails, selectedMonth, selectedYear, selectedCategory, reportData, recalculateDataForMonth]);

  // Get paginated data
  const getPaginatedData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      currentItems: filteredData.slice(indexOfFirstItem, indexOfLastItem),
      totalItems: filteredData.length,
      totalPages: Math.ceil(filteredData.length / itemsPerPage),
      indexOfFirstItem,
      indexOfLastItem
    };
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Print Report
  const printReport = () => {
    if (filteredData.length === 0) {
      alert('No data to print');
      return;
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const periodText = selectedMonth !== '' 
      ? `${monthNames[parseInt(selectedMonth)]} ${selectedYear}`
      : `Year ${selectedYear}`;
    
    const categoryText = selectedCategory !== '' 
      ? categories.find(c => c.id === parseInt(selectedCategory))?.name || 'All Categories'
      : 'All Categories';

    // Calculate summary statistics
    const totalLastMonthStock = filteredData.reduce((sum, item) => sum + item.lastMonthStock, 0);
    const totalLastMonthDamaged = filteredData.reduce((sum, item) => sum + item.lastMonthDamaged, 0);
    const totalReceived = filteredData.reduce((sum, item) => sum + item.receivedThisMonth, 0);
    const totalIssued = filteredData.reduce((sum, item) => sum + item.issuedThisMonth, 0);
    const totalCurrentStock = filteredData.reduce((sum, item) => sum + item.currentStock, 0);
    const totalCurrentDamaged = filteredData.reduce((sum, item) => sum + item.currentDamaged, 0);
    const totalValue = filteredData.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Stock Movement Report - ${periodText}</title>
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
            border-bottom: 3px solid #4F46E5;
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
            color: #1F2937;
            font-size: 22px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .report-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 8px;
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
            font-size: 11px;
          }
          
          thead {
            background: #4F46E5;
            color: white;
          }
          
          th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          
          th.center {
            text-align: center;
          }
          
          tbody tr {
            border-bottom: 1px solid #E5E7EB;
          }
          
          tbody tr:nth-child(even) {
            background: #F9FAFB;
          }
          
          tbody tr:hover {
            background: #F3F4F6;
          }
          
          td {
            padding: 10px 8px;
            color: #374151;
          }
          
          td.center {
            text-align: center;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          }
          
          .badge-code {
            background: #EEF2FF;
            color: #4F46E5;
          }
          
          .badge-unit {
            background: #F3F4F6;
            color: #374151;
          }
          
          .badge-orange {
            background: #FEF3C7;
            color: #D97706;
          }
          
          .badge-red {
            background: #FEE2E2;
            color: #DC2626;
          }
          
          .badge-green {
            background: #D1FAE5;
            color: #059669;
          }
          
          .badge-blue {
            background: #DBEAFE;
            color: #2563EB;
          }
          
          .badge-yellow {
            background: #FEF3C7;
            color: #D97706;
          }
          
          .summary-section {
            margin-top: 30px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 8px;
            border: 2px solid #E5E7EB;
          }
          
          .summary-title {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 15px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          
          .summary-item {
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #E5E7EB;
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
          <h2>Monthly Stock Movement Report</h2>
        </div>

        <div class="report-info">
          <div class="info-item">
            <div class="info-label">Report Period</div>
            <div class="info-value">${periodText}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Category Filter</div>
            <div class="info-value">${categoryText}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Items</div>
            <div class="info-value">${filteredData.length.toLocaleString()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Generated</div>
            <div class="info-value">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th class="center">Last Month<br/>Stock</th>
              <th class="center">Last Month<br/>Damaged</th>
              <th class="center">Received<br/>This Month</th>
              <th class="center">Issued<br/>This Month</th>
              <th class="center">Current<br/>Stock</th>
              <th class="center">Current<br/>Damaged</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(item => `
              <tr>
                <td><span class="badge badge-code">${item.itemCode}</span></td>
                <td><strong>${item.itemName}</strong></td>
                <td>${item.category}</td>
                <td><span class="badge badge-unit">${item.unit}</span></td>
                <td class="center"><span class="badge badge-orange">${item.lastMonthStock.toLocaleString()}</span></td>
                <td class="center"><span class="badge badge-red">${item.lastMonthDamaged.toLocaleString()}</span></td>
                <td class="center"><span class="badge badge-green">+${item.receivedThisMonth.toLocaleString()}</span></td>
                <td class="center"><span class="badge badge-red">-${item.issuedThisMonth.toLocaleString()}</span></td>
                <td class="center"><span class="badge ${
                  item.currentStock > 10 ? 'badge-blue' : item.currentStock > 0 ? 'badge-yellow' : 'badge-red'
                }">${item.currentStock.toLocaleString()}</span></td>
                <td class="center"><span class="badge badge-red">${item.currentDamaged.toLocaleString()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="summary-title">Summary Statistics</div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Last Month Stock</div>
              <div class="summary-value">${totalLastMonthStock.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Received</div>
              <div class="summary-value" style="color: #059669;">+${totalReceived.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Issued</div>
              <div class="summary-value" style="color: #DC2626;">-${totalIssued.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Current Stock</div>
              <div class="summary-value" style="color: #2563EB;">${totalCurrentStock.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Last Month Damaged</div>
              <div class="summary-value" style="color: #DC2626;">${totalLastMonthDamaged.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Current Damaged</div>
              <div class="summary-value" style="color: #DC2626;">${totalCurrentDamaged.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Items Count</div>
              <div class="summary-value">${filteredData.length.toLocaleString()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Stock Value</div>
              <div class="summary-value" style="color: #059669;">TZS ${totalValue.toLocaleString()}</div>
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

  // Initial load
  useEffect(() => {
    fetchItemIssuedReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Monitor filter changes
  useEffect(() => {
    console.log('=== Filter Changed ===');
    console.log('selectedMonth:', selectedMonth);
    console.log('selectedYear:', selectedYear);
    console.log('selectedCategory:', selectedCategory, 'type:', typeof selectedCategory);
    console.log('categories available:', categories.length);
    if (categories.length > 0) {
      console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
    }
  }, [selectedMonth, selectedYear, selectedCategory, categories]);

  const { currentItems, totalItems, totalPages, indexOfFirstItem, indexOfLastItem } = getPaginatedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header removed as requested */}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  resetPagination();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  resetPagination();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Months</option>
                {getMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  resetPagination();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={fetchItemIssuedReport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={printReport}
              disabled={totalItems === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Report
            </button>

            {(selectedMonth !== '' || selectedCategory !== '' || selectedYear !== new Date().getFullYear()) && (
              <button
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedYear(new Date().getFullYear());
                  setSelectedCategory('');
                  resetPagination();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Stock Movement Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
            {(selectedMonth !== '' || selectedCategory !== '' || selectedYear !== new Date().getFullYear()) && (
              <span className="ml-2 text-indigo-600">
                • Filtered by {selectedYear !== new Date().getFullYear() && `year ${selectedYear}`}
                {selectedMonth !== '' && ` • ${getMonthOptions().find(m => m.value === selectedMonth)?.label || 'month'}`}
                {selectedCategory !== '' && ` • category`}
              </span>
            )}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">
                  Last Month Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received This Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued This Month
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">
                  Current Stock
                </th>
              </tr>
              <tr className="bg-gray-50 border-t">
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Quantity</th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Damaged</th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Quantity</th>
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-400">Damaged This Month</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Item Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.itemCode}
                    </span>
                  </td>

                  {/* Item Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {item.itemName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.unit}
                    </span>
                  </td>

                  {/* Last Month Stock - Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {item.lastMonthStock.toLocaleString()}
                    </span>
                  </td>

                  {/* Last Month Stock - Damaged */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.lastMonthDamaged.toLocaleString()}
                    </span>
                  </td>

                  {/* Received This Month */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +{item.receivedThisMonth.toLocaleString()}
                    </span>
                  </td>

                  {/* Issued This Month */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      -{item.issuedThisMonth.toLocaleString()}
                    </span>
                  </td>

                  {/* Current Stock - Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.currentStock > 10 
                        ? 'bg-blue-100 text-blue-800'
                        : item.currentStock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.currentStock.toLocaleString()}
                    </span>
                  </td>

                  {/* Current Stock - Damaged */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.currentDamaged.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalItems === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {(selectedMonth !== '' || selectedCategory !== '' || selectedYear !== new Date().getFullYear()) 
                  ? 'No items found for the selected filters.'
                  : 'No stock movement data found.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    
                    // Show first page, last page, current page, and pages around current
                    const showPage = page === 1 || 
                                    page === totalPages || 
                                    (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-3 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items Per Page Selector */}
      {totalItems > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemIssuedReport;