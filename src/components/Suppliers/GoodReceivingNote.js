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
  { sn: 1, description: '', unit: 'Piece', totalReceived: '', accepted: '', rejected: '', amount: '', unitPrice: '', reason: '' }
];


const GoodReceivingNote = ({ onSubmitNote, suppliers = [] }) => {
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

  const handleRowChange = (idx, field, value) => {
    const updatedRows = rows.map((row, i) => i === idx ? { ...row, [field]: value } : row);
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
    setRows(rows => [...rows, { sn: rows.length + 1, description: '', unit: 'Piece', totalReceived: '', accepted: '', rejected: '', amount: '', unitPrice: '', reason: '' }]);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSupplierChange = (e) => {
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
    const value = e.target.value;
    // Allow only alphanumeric characters, spaces, and common plate separators (-, /)
    const validPattern = /^[A-Za-z0-9\s\-\/]*$/;
    if (validPattern.test(value)) {
      setForm({ ...form, registrationPlate: value.toUpperCase() });
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
      onSubmitNote({ ...form, items: rows });
    }
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
    setRows(initialRows);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Goods Receiving Note</h2>
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
                <th className="border px-2 py-1">Amount</th>
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
                  <td className="border px-2 py-1"><input value={row.amount} onChange={e => handleRowChange(idx, 'amount', e.target.value)} className="w-full" /></td>
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
        <div className="flex justify-end">
          <button 
            type="submit" 
            className={`px-6 py-2 text-white rounded transition-colors ${
              Object.keys(validationErrors).length > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={Object.keys(validationErrors).length > 0}
          >
            {Object.keys(validationErrors).length > 0 ? 'Fix Errors to Submit' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoodReceivingNote;
