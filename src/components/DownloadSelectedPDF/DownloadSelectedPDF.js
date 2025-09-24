import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadSelectedPDF = ({ selectedRequests, onDownload, inventoryItems, departments }) => {
  
  // Helper function to get item name
  const getItemName = (item) => {
    if (!item) return 'Unknown Item';
    if (typeof item === 'string') return item;
    return item.name || item.item_name || `Item #${item.id || 'Unknown'}`;
  };

  // Helper function to get department name
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Unknown Department';
    const dept = departments?.find(d => d.id === parseInt(departmentId));
    return dept ? dept.name : 'Unknown Department';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Function to generate and download PDF
  const generatePDF = () => {
    if (!selectedRequests || selectedRequests.length === 0) {
      alert('Please select at least one request to download.');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Company Header
      doc.setFontSize(20);
      doc.text('CGCLA WAREHOUSE', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('ISSUED VOUCHER', 105, 35, { align: 'center' });
      
      // Reset font to normal
      doc.setFont(undefined, 'normal');
      
      // Date and summary info
      doc.setFontSize(10);
      doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Total Items: ${selectedRequests.length}`, 20, 57);
      
      // Issued by and Approved by section (right side)
      doc.text('Issued by: ____________________', 120, 50);
      doc.text('Date: ____________________', 120, 57);
      
      doc.text('Approved by: ____________________', 120, 70);
      doc.text('Date: ____________________', 120, 77);
      
      // Add a horizontal line to separate header from content
      doc.setLineWidth(0.5);
      doc.line(20, 82, 190, 82);

      // Try to use autoTable, fallback to basic text if it fails
      try {
        // Prepare table data with better error handling
        const tableData = selectedRequests.map((request, index) => {
          const user = request.requester || request.user || {};
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || user.email || 'Unknown User';
          
          let departmentName = 'Unknown Department';
          if (user.department) {
            if (typeof user.department === 'object') {
              departmentName = user.department.name || getDepartmentName(user.department.id) || 'Unknown Department';
            } else {
              departmentName = getDepartmentName(user.department) || 'Unknown Department';
            }
          }
          
          // Get quantity information - show approved quantity for approved requests
          let quantityDisplay = request.quantity || 'N/A';
          if (request.status === 'approved' && request.approved_quantity) {
            quantityDisplay = `${request.approved_quantity} (approved) / ${request.quantity} (requested)`;
          } else if (request.quantity) {
            quantityDisplay = `${request.quantity} (requested)`;
          }
          
          return [
            (index + 1).toString(),
            userName.toString(),
            departmentName.toString(),
            getItemName(request.item).toString(),
            quantityDisplay.toString(),
            (request.status || 'N/A').toString(),
            formatDate(request.created_at),
            request.status === 'pending' ? 'N/A' : formatDate(request.updated_at)
          ];
        });

        // Generate table using autoTable
        autoTable(doc, {
          head: [['#', 'Requester', 'Department', 'Item', 'Quantity Details', 'Status', 'Request Date', 'Action Date']],
          body: tableData,
          startY: 85,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          }
        });
      } catch (tableError) {
        console.error('AutoTable failed, using basic text:', tableError);
        
        // Fallback to basic text layout
        doc.setFontSize(10);
        let yPosition = 90;
        
        selectedRequests.forEach((request, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          const user = request.requester || request.user || {};
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || user.email || 'Unknown User';
          
          // Enhanced quantity display
          let quantityDisplay = request.quantity || 'N/A';
          if (request.status === 'approved' && request.approved_quantity) {
            quantityDisplay = `${request.approved_quantity} approved / ${request.quantity} requested`;
          } else if (request.quantity) {
            quantityDisplay = `${request.quantity} requested`;
          }
          
          doc.text(`${index + 1}. ${userName}`, 20, yPosition);
          doc.text(`Item: ${getItemName(request.item)}`, 30, yPosition + 7);
          doc.text(`Quantity: ${quantityDisplay}`, 30, yPosition + 14);
          doc.text(`Status: ${request.status || 'N/A'}`, 30, yPosition + 21);
          doc.text(`Date: ${formatDate(request.created_at)}`, 30, yPosition + 28);
          
          yPosition += 40;
        });
      }
      
      // Add footer with signature lines
      const pageHeight = doc.internal.pageSize.height;
      const footerY = pageHeight - 50;
      
      // Add signature section at bottom
      doc.setFontSize(10);
      doc.text('Received by:', 20, footerY);
      doc.text('Name: ____________________', 20, footerY + 10);
      doc.text('Signature: ____________________', 20, footerY + 20);
      doc.text('Date: ____________________', 20, footerY + 30);
      
      doc.text('Store Keeper:', 120, footerY);
      doc.text('Name: ____________________', 120, footerY + 10);
      doc.text('Signature: ____________________', 120, footerY + 20);
      doc.text('Date: ____________________', 120, footerY + 30);

      // Save the PDF
      const fileName = `Issued_Voucher_${new Date().toISOString().split('T')[0]}_${selectedRequests.length}_items.pdf`;
      doc.save(fileName);

      // Call onDownload callback if provided
      if (onDownload) {
        onDownload(selectedRequests.length);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={!selectedRequests || selectedRequests.length === 0}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        selectedRequests && selectedRequests.length > 0
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      title={`Generate Issued Voucher for ${selectedRequests?.length || 0} selected request(s)`}
    >
      📄 Generate Voucher ({selectedRequests?.length || 0})
    </button>
  );
};

export default DownloadSelectedPDF;