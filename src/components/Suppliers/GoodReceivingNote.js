import React, { useState } from 'react';

const initialRows = [
  { sn: 1, description: '', unit: '', totalReceived: '', accepted: '', rejected: '', amount: '', reason: '' }
];


const GoodReceivingNote = ({ onSubmitNote }) => {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState({
    poNumber: '',
    lpoDeliveryNumber: '',
    senderDetails: '',
    deliveryMethod: '',
    transport: '',
    dateReceived: '',
    timeReceived: '',
    registrationPlate: '',
    containerSealNo: '',
    personDelivering: '',
    personDeliveringSignature: '',
    storekeeper: '',
    storekeeperSignature: ''
  });

  const handleRowChange = (idx, field, value) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const addRow = () => {
    setRows(rows => [...rows, { sn: rows.length + 1, description: '', unit: '', totalReceived: '', accepted: '', rejected: '', amount: '', reason: '' }]);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitNote) {
      onSubmitNote({ ...form, items: rows });
    }
    setForm({
      poNumber: '',
      lpoDeliveryNumber: '',
      senderDetails: '',
      deliveryMethod: '',
      transport: '',
      dateReceived: '',
      timeReceived: '',
      registrationPlate: '',
      containerSealNo: '',
      personDelivering: '',
      personDeliveringSignature: '',
      storekeeper: '',
      storekeeperSignature: ''
    });
    setRows(initialRows);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Goods Receiving Note</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">PO Number / L.P.O Delivery Number</label>
            <input name="poNumber" value={form.poNumber} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Sender Details</label>
            <input name="senderDetails" value={form.senderDetails} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery Method</label>
            <input name="deliveryMethod" value={form.deliveryMethod} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Transport</label>
            <input name="transport" value={form.transport} onChange={handleFormChange} className="w-full border rounded px-2 py-1" />
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
            <label className="block text-sm font-medium">Registration Plate No.</label>
            <input name="registrationPlate" value={form.registrationPlate} onChange={handleFormChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Container / Seal No. (If Applicable)</label>
            <input name="containerSealNo" value={form.containerSealNo} onChange={handleFormChange} className="w-full border rounded px-2 py-1" />
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
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Rejected Reason/Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{row.sn}</td>
                  <td className="border px-2 py-1"><input value={row.description} onChange={e => handleRowChange(idx, 'description', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.unit} onChange={e => handleRowChange(idx, 'unit', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.totalReceived} onChange={e => handleRowChange(idx, 'totalReceived', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.accepted} onChange={e => handleRowChange(idx, 'accepted', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.rejected} onChange={e => handleRowChange(idx, 'rejected', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.amount} onChange={e => handleRowChange(idx, 'amount', e.target.value)} className="w-full" /></td>
                  <td className="border px-2 py-1"><input value={row.reason} onChange={e => handleRowChange(idx, 'reason', e.target.value)} className="w-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addRow} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add Row</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Name of Person Delivering</label>
            <input name="personDelivering" value={form.personDelivering} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Signature</label>
            <input name="personDeliveringSignature" value={form.personDeliveringSignature} onChange={handleFormChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Name of Storekeeper</label>
            <input name="storekeeper" value={form.storekeeper} onChange={handleFormChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Signature</label>
            <input name="storekeeperSignature" value={form.storekeeperSignature} onChange={handleFormChange} className="w-full border rounded px-2 py-1" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default GoodReceivingNote;
