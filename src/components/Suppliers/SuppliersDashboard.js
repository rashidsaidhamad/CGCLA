
import React, { useState } from 'react';
import GoodReceivingNote from '../Suppliers/GoodReceivingNote';

const SuppliersDashboard = () => {
  const [tab, setTab] = useState('receive');
  const [submittedNotes, setSubmittedNotes] = useState([]);

  // Handler to receive submitted note from child
  const handleNoteSubmit = (note) => {
    setSubmittedNotes(prev => [...prev, note]);
    setTab('view');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
      <div className="mb-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded-t ${tab === 'receive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('receive')}
        >
          Goods Receiving Note
        </button>
        <button
          className={`px-4 py-2 rounded-t ${tab === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('view')}
        >
          View All Suppliers
        </button>
      </div>
      {tab === 'receive' && (
        <GoodReceivingNote onSubmitNote={handleNoteSubmit} />
      )}
      {tab === 'view' && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-4">All Submitted Suppliers</h2>
          {submittedNotes.length === 0 ? (
            <p className="text-gray-500">No suppliers have been submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">PO/LPO No.</th>
                    <th className="border px-2 py-1">Sender</th>
                    <th className="border px-2 py-1">Date</th>
                    <th className="border px-2 py-1">Person Delivering</th>
                    <th className="border px-2 py-1">Storekeeper</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedNotes.map((note, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{note.poNumber}</td>
                      <td className="border px-2 py-1">{note.senderDetails}</td>
                      <td className="border px-2 py-1">{note.dateReceived}</td>
                      <td className="border px-2 py-1">{note.personDelivering}</td>
                      <td className="border px-2 py-1">{note.storekeeper}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuppliersDashboard;
