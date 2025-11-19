import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GRNPdfDownload = ({ grn, onDownload }) => {
  const generatePDF = async () => {
    if (!grn) {
      alert('No GRN data available for download');
      return;
    }

    const doc = new jsPDF();

    // Try to load logo from public folder
    let logoDataUrl = null;
    try {
      const res = await fetch('/cgcla.jpg');
      if (res.ok) {
        const blob = await res.blob();
        logoDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn('Could not load logo for GRN PDF:', err);
    }

    // Company Header: logo (left) + contact info (right)
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'JPEG', 20, 12, 30, 30);
      } catch (e) {
        try { doc.addImage(logoDataUrl, 'PNG', 20, 12, 30, 30); } catch (e2) { /* ignore */ }
      }
    }

    // Contact / agency block
    const contactX = 60;
    let contactY = 14;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CGCLA WAREHOUSE MANAGEMENT', contactX, contactY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    contactY += 6;
    doc.text('146 Bububu Road, 70403 Urban West, Zanzibar, Maruhubi S.L.P 759', contactX, contactY);
    contactY += 5;
    doc.text('Email: info@cgcla.go.tz', contactX, contactY);
    contactY += 5;
    doc.text('Tel. No: +255-24-2238123', contactX, contactY);
    contactY += 5;
    doc.text('Fax: +255-24-2238124', contactX, contactY);

    // Title centered below header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GOODS RECEIVING NOTE', 105, 52, { align: 'center' });
    
  // GRN ID and Date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`GRN #${grn.id}`, 20, 62);
  doc.text(`Date: ${new Date(grn.date_received).toLocaleDateString()}`, 150, 62);

  // Horizontal line
  doc.line(20, 66, 190, 66);
    
    // GRN Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('GRN Details', 20, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Left column details
    const leftColumnY = 70;
    doc.text('PO Number:', 20, leftColumnY);
    doc.text(grn.po_number || 'N/A', 55, leftColumnY);
    
    doc.text('Delivery Number:', 20, leftColumnY + 8);
    doc.text(grn.delivery_number || 'N/A', 55, leftColumnY + 8);
    
    doc.text('Sender Details:', 20, leftColumnY + 16);
    doc.text(grn.sender_details || 'N/A', 55, leftColumnY + 16);
    
    doc.text('Transport:', 20, leftColumnY + 24);
    doc.text(grn.transport || 'N/A', 55, leftColumnY + 24);
    
    doc.text('Registration Plate:', 20, leftColumnY + 32);
    doc.text(grn.registration_plate || 'N/A', 55, leftColumnY + 32);
    
    // Right column details
    const rightColumnY = 70;
    doc.text('Date Received:', 110, rightColumnY);
    doc.text(new Date(grn.date_received).toLocaleDateString(), 145, rightColumnY);
    
    doc.text('Time Received:', 110, rightColumnY + 8);
    doc.text(grn.time_received || 'N/A', 145, rightColumnY + 8);
    
    doc.text('Person Delivering:', 110, rightColumnY + 16);
    doc.text(grn.person_delivering || 'N/A', 145, rightColumnY + 16);
    
    doc.text('Storekeeper:', 110, rightColumnY + 24);
    doc.text(grn.storekeeper || 'N/A', 145, rightColumnY + 24);
    
    doc.text('Status:', 110, rightColumnY + 32);
    doc.text(grn.status || 'Pending', 145, rightColumnY + 32);
    
  // Items Table
  const tableStartY = 130;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Items Received', 20, tableStartY);
    
    // Prepare table data
    const tableColumns = [
      'S/N', 
      'Description', 
      'Unit', 
      'Total Received', 
      'Accepted', 
      'Rejected', 
      'Unit Price (TSh)', 
      'Amount', 
      'Remarks'
    ];
    
    const tableRows = grn.items?.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.unit,
      item.total_received?.toString() || '0',
      item.accepted?.toString() || '0',
      item.rejected?.toString() || '0',
      item.unit_price ? parseFloat(item.unit_price).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }) : 'N/A',
      item.amount?.toString() || '0',
      item.rejected_reason || '-'
    ]) || [];
    
    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: tableStartY + 10,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 85, 105], // Gray-700
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gray-50
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // S/N
        1: { cellWidth: 35 }, // Description
        2: { halign: 'center', cellWidth: 20 }, // Unit
        3: { halign: 'center', cellWidth: 25 }, // Total Received
        4: { halign: 'center', cellWidth: 20 }, // Accepted
        5: { halign: 'center', cellWidth: 20 }, // Rejected
        6: { halign: 'right', cellWidth: 25 }, // Unit Price
        7: { halign: 'right', cellWidth: 20 }, // Amount
        8: { cellWidth: 25 } // Remarks
      }
    });
    
  // Summary Section
  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : tableStartY + 60) + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('Summary', 20, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const totalItems = grn.items?.length || 0;
    const totalAccepted = grn.items?.reduce((sum, item) => sum + (parseInt(item.accepted) || 0), 0) || 0;
    const totalRejected = grn.items?.reduce((sum, item) => sum + (parseInt(item.rejected) || 0), 0) || 0;
    const totalAmount = grn.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
    
    doc.text(`Total Items: ${totalItems}`, 20, finalY + 10);
    doc.text(`Total Accepted: ${totalAccepted}`, 20, finalY + 18);
    doc.text(`Total Rejected: ${totalRejected}`, 20, finalY + 26);
    doc.text(`Total Amount: TSh ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, finalY + 34);
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
    doc.text(`Generated by: CGCLA Warehouse Management System`, 20, pageHeight - 15);
    
    // Save the PDF
    const fileName = `GRN_${grn.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    // Callback if provided
    if (onDownload) {
      onDownload(fileName);
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
      title="Download GRN as PDF"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download PDF
    </button>
  );
};

export default GRNPdfDownload;