import React from 'react';

const SuppliersTable = ({ suppliers, onEdit, onDelete, onAddFirst }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Contact Details
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-4 py-12 text-center text-gray-500">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500 mb-4">Start by adding your first supplier</p>
                <button
                  onClick={onAddFirst}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add First Supplier
                </button>
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {supplier.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {supplier.contact_details || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(supplier)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(supplier.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersTable;
