import React, { useState } from 'react';

const unitOptions = [
  'Piece',
  'Box',
  'Pack',
  'Ream',
  'Liter',
  'Kilogram',
  'Gram',
  'Meter',
  'Set',
  'Dozen',
  'Bottle',
  'Bag',
  'Roll',
  'Sheet',
  'Carton',
  'Bundle',
  'Pair',
  'Each'
];

const initialRows = [
  { sn: 1, description: '', unit: 'Piece', totalReceived: '', accepted: '', rejected: '', amount: '0.00', unitPrice: '', reason: '' }
];


const GoodReceivingNote = ({ onSubmitNote, onSaveDraft, suppliers = [] }) => {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState({
    poNumber: '',
    deliveryNumber: '',
    supplierName: '',
    senderDetails: '',
    transport: '',
    dateReceived: '',
    timeReceived: '',
    registrationPlate: '',
    personDelivering: '',
    storekeeper: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  // Load drafts from localStorage on component mount
  React.useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('grn_drafts') || '[]');
      setSavedDrafts(drafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const handleLoadDraft = (draft) => {
    // Load the draft data into the form
    setForm({
      poNumber: draft.poNumber || '',
      deliveryNumber: draft.deliveryNumber || '',
      supplierName: draft.supplierName || '',
      senderDetails: draft.senderDetails || '',
      transport: draft.transport || '',
      dateReceived: draft.dateReceived || '',
      timeReceived: draft.timeReceived || '',
      registrationPlate: draft.registrationPlate || '',
      personDelivering: draft.personDelivering || '',
      storekeeper: draft.storekeeper || ''
    });
    
    // Load the items
    if (draft.items && draft.items.length > 0) {
      setRows(draft.items);
    }
    
    setShowDraftsModal(false);
    setIsSaved(true);
    alert('Draft loaded successfully! You can continue editing.');
  };

  const handleDeleteDraft = (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        const drafts = JSON.parse(localStorage.getItem('grn_drafts') || '[]');
        const updatedDrafts = drafts.filter(d => d.id !== draftId);
        localStorage.setItem('grn_drafts', JSON.stringify(updatedDrafts));
        setSavedDrafts(updatedDrafts);
        alert('Draft deleted successfully!');
      } catch (error) {
        console.error('Error deleting draft:', error);
        alert('Error deleting draft');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRowChange = (idx, field, value) => {
    setIsSaved(false); // Mark as unsaved when data changes
    const updatedRows = rows.map((row, i) => {
      if (i === idx) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-calculate amount when unitPrice or accepted quantity changes
        if (field === 'unitPrice' || field === 'accepted') {
          const unitPrice = parseFloat(field === 'unitPrice' ? value : row.unitPrice) || 0;
          const accepted = parseFloat(field === 'accepted' ? value : row.accepted) || 0;
          updatedRow.amount = (unitPrice * accepted).toFixed(2);
        }
        
        return updatedRow;
      }
      return row;
    });
    
    setRows(updatedRows);

    // Validate accepted + rejected <= totalReceived
    if (['accepted', 'rejected', 'totalReceived'].includes(field)) {
      validateRowQuantities(idx, updatedRows);
    }
  };

  const validateRowQuantities = (idx, currentRows) => {
    const row = currentRows[idx];
    const totalReceived = parseFloat(row.totalReceived) || 0;
    const accepted = parseFloat(row.accepted) || 0;
    const rejected = parseFloat(row.rejected) || 0;
    const sum = accepted + rejected;

    const newErrors = { ...validationErrors };
    
    if (sum > totalReceived && totalReceived > 0) {
      newErrors[`row_${idx}`] = `Accepted (${accepted}) + Rejected (${rejected}) = ${sum} cannot exceed Total Received (${totalReceived})`;
    } else {
      delete newErrors[`row_${idx}`];
    }

    setValidationErrors(newErrors);
  };

  const validateAllRows = () => {
    const errors = {};
    let hasErrors = false;

    rows.forEach((row, idx) => {
      const totalReceived = parseFloat(row.totalReceived) || 0;
      const accepted = parseFloat(row.accepted) || 0;
      const rejected = parseFloat(row.rejected) || 0;
      const sum = accepted + rejected;

      if (sum > totalReceived && totalReceived > 0) {
        errors[`row_${idx}`] = `Row ${idx + 1}: Accepted + Rejected (${sum}) cannot exceed Total Received (${totalReceived})`;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const addRow = () => {
    setRows(rows => [...rows, { sn: rows.length + 1, description: '', unit: 'Piece', totalReceived: '', accepted: '', rejected: '', amount: '0.00', unitPrice: '', reason: '' }]);
  };

  const handleFormChange = (e) => {
    setIsSaved(false); // Mark as unsaved when data changes
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSupplierChange = (e) => {
    setIsSaved(false); // Mark as unsaved when data changes
    const selectedSupplierId = e.target.value;
    const selectedSupplier = suppliers.find(s => s.id.toString() === selectedSupplierId);
    
    if (selectedSupplier) {
      setForm(prev => ({
        ...prev,
        supplierName: selectedSupplier.name,
        senderDetails: `${selectedSupplier.name} - ${selectedSupplier.contact_person || 'Contact Person'}`
      }));
    } else {
      setForm(prev => ({
        ...prev,
        supplierName: '',
        senderDetails: ''
      }));
    }
  };

  const handleRegistrationPlateChange = (e) => {
    setIsSaved(false); // Mark as unsaved when data changes
    const value = e.target.value;
    // Allow only alphanumeric characters, spaces, and common plate separators (-, /)
    const validPattern = /^[A-Za-z0-9\s\-\/]*$/;
    if (validPattern.test(value)) {
      setForm({ ...form, registrationPlate: value.toUpperCase() });
    }
  };

  const handleSaveDraft = () => {
    // Save draft without validation
    if (onSaveDraft) {
      onSaveDraft({ ...form, items: rows, status: 'draft' });
      setIsSaved(true);
      loadDrafts(); // Reload drafts to update the count
      alert('GRN draft saved successfully! You can continue adding items or submit when ready.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all rows before submission
    if (!validateAllRows()) {
      alert('Please fix the validation errors before submitting the form.');
      return;
    }

    if (onSubmitNote) {
      onSubmitNote({ ...form, items: rows, status: 'submitted' });
    }
    
    // Reset form after submission
    setForm({
      poNumber: '',
      deliveryNumber: '',
      supplierName: '',
      senderDetails: '',
      transport: '',
      dateReceived: '',
      timeReceived: '',
      registrationPlate: '',
      personDelivering: '',
      storekeeper: ''
    });
    setRows([{ sn: 1, description: '', unit: 'Piece', totalReceived: '', accepted: '', rejected: '', amount: '0.00', unitPrice: '', reason: '' }]);
    setIsSaved(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Goods Receiving Note</h2>
        <div className="flex items-center gap-3">
          {savedDrafts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Load Draft ({savedDrafts.length})
            </button>
          )}
          {isSaved && (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Draft Saved</span>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">PO Number</label>
            <input 
              name="poNumber" 
              value={form.poNumber} 
              onChange={handleFormChange} 
              className="w-full border rounded px-2 py-1" 
              placeholder="Enter PO Number"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery Number</label>
            <input 
              name="deliveryNumber" 
              value={form.deliveryNumber} 
              onChange={handleFormChange} 
              className="w-full border rounded px-2 py-1" 
              placeholder="Enter Delivery Number"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Supplier Name</label>
            <select 
              name="supplierName" 
              value={suppliers.find(s => s.name === form.supplierName)?.id || ''} 
              onChange={handleSupplierChange} 
              className="w-full border rounded px-2 py-1" 
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Sender Details</label>
            <input 
              name="senderDetails" 
              value={form.senderDetails} 
              onChange={handleFormChange}
              className="w-full border rounded px-2 py-1 bg-gray-50" 
              placeholder="Auto-populated from supplier selection"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Transport (Optional)</label>
            <input name="transport" value={form.transport} onChange={handleFormChange} className="w-full border rounded px-2 py-1" placeholder="e.g., Truck, Van, Motorcycle" />
          </div>
          <div>
            <label className="block text-sm font-medium">Date Received</label>
            <input type="date" name="dateReceived" value={form.dateReceived} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Time Received</label>
            <input type="time" name="timeReceived" value={form.timeReceived} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Registration Plate No. (Optional)</label>
            <input 
              name="registrationPlate" 
              value={form.registrationPlate} 
              onChange={handleRegistrationPlateChange}
              pattern="[A-Za-z0-9\s\-\/]+"
              title="Registration plate should contain only letters, numbers, spaces, hyphens, and forward slashes"
              placeholder="e.g., ABC-123, T456DEF, KAA-001B"
              className="w-full border rounded px-2 py-1" 
            />
          </div>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">S/N</th>
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">Unit</th>
                <th className="border px-2 py-1">Total Item Received</th>
                <th className="border px-2 py-1">Accepted</th>
                <th className="border px-2 py-1">Rejected</th>
                <th className="border px-2 py-1">Unit Price (TSh)</th>
                <th className="border px-2 py-1">Amount (Auto-calculated)</th>
                <th className="border px-2 py-1">Rejected Reason/Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const hasError = validationErrors[`row_${idx}`];
                return (
                <tr key={idx} className={hasError ? 'bg-red-50 border-red-300' : ''}>
                  <td className="border px-2 py-1 text-center">{row.sn}</td>
                  <td className="border px-2 py-1"><input value={row.description} onChange={e => handleRowChange(idx, 'description', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1">
                    <select 
                      value={row.unit}
                      onChange={e => handleRowChange(idx, 'unit', e.target.value)} 
                      className="w-full border rounded px-1 py-1"
                    >
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input 
                      type="number" 
                      min="0"
                      value={row.totalReceived} 
                      onChange={e => handleRowChange(idx, 'totalReceived', e.target.value)} 
                      className={`w-full ${hasError ? 'border-red-500 bg-red-50' : ''}`} 
                      placeholder="0"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input 
                      type="number" 
                      min="0"
                      value={row.accepted} 
                      onChange={e => handleRowChange(idx, 'accepted', e.target.value)} 
                      className={`w-full ${hasError ? 'border-red-500 bg-red-50' : ''}`} 
                      placeholder="0"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input 
                      type="number" 
                      min="0"
                      value={row.rejected} 
                      onChange={e => handleRowChange(idx, 'rejected', e.target.value)} 
                      className={`w-full ${hasError ? 'border-red-500 bg-red-50' : ''}`} 
                      placeholder="0"
                    />
                  </td>
                  <td className="border px-2 py-1"><input type="number" step="0.01" min="0" value={row.unitPrice} onChange={e => handleRowChange(idx, 'unitPrice', e.target.value)} className="w-full" placeholder="0.00" /></td>
                  <td className="border px-2 py-1">
                    <input 
                      value={row.amount} 
                      readOnly 
                      className="w-full bg-gray-100 text-gray-700 cursor-not-allowed" 
                      placeholder="Auto-calculated"
                      title="Automatically calculated from Unit Price × Accepted Quantity"
                    />
                  </td>
                  <td className="border px-2 py-1"><input value={row.reason} onChange={e => handleRowChange(idx, 'reason', e.target.value)} className="w-full" /></td>
                </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Validation Error Messages */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
              <h4 className="text-red-800 font-medium mb-2">⚠️ Please fix the following errors:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-sm text-red-600">
                <strong>Note:</strong> The sum of Accepted and Rejected items should not exceed the Total Received for each row.
              </div>
            </div>
          )}
          
          <button type="button" onClick={addRow} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add Row</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Name of Person Delivering</label>
            <input name="personDelivering" value={form.personDelivering} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Name of Storekeeper</label>
            <input name="storekeeper" value={form.storekeeper} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={handleSaveDraft}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Draft
          </button>
          <button 
            type="submit" 
            className={`px-6 py-2 text-white rounded transition-colors flex items-center ${
              Object.keys(validationErrors).length > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={Object.keys(validationErrors).length > 0}
          >
            {Object.keys(validationErrors).length > 0 ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Fix Errors to Submit
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit GRN
              </>
            )}
          </button>
        </div>
      </form>

      {/* Load Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Saved Drafts</h3>
                <button
                  onClick={() => setShowDraftsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Select a draft to continue working on it
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No saved drafts</p>
                  <p className="text-gray-400 text-sm mt-2">Your saved GRN drafts will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedDrafts.map((draft) => (
                    <div 
                      key={draft.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {draft.supplierName || 'No Supplier Selected'}
                            </h4>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Draft
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">PO Number:</span> {draft.poNumber || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Delivery No:</span> {draft.deliveryNumber || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Date Received:</span> {draft.dateReceived || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Items Count:</span> {draft.items?.length || 0}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Saved: {formatDate(draft.savedAt)}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadDraft(draft)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Preview items */}
                      {draft.items && draft.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Items Preview:</p>
                          <div className="space-y-1">
                            {draft.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                <span>{item.description || 'No description'}</span>
                                <span className="text-gray-500">
                                  {item.accepted || 0} {item.unit}
                                </span>
                              </div>
                            ))}
                            {draft.items.length > 3 && (
                              <p className="text-xs text-gray-400 italic">
                                ... and {draft.items.length - 3} more item(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodReceivingNote;
