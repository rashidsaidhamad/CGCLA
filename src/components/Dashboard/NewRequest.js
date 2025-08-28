import React, { useState, useEffect } from 'react';

const NewRequest = ({ user }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '',
    unit: '',
    urgency: 'Medium',
    requestedDate: '',
    justification: '',
    additionalNotes: ''
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Mock available items data
    setAvailableItems([
      { id: 1, name: 'Laboratory Gloves', category: 'Safety Equipment', unit: 'pairs', available: 500 },
      { id: 2, name: 'Test Tubes (50ml)', category: 'Laboratory Equipment', unit: 'pieces', available: 200 },
      { id: 3, name: 'Safety Goggles', category: 'Safety Equipment', unit: 'pieces', available: 30 },
      { id: 4, name: 'pH Test Strips', category: 'Chemicals', unit: 'strips', available: 15 },
      { id: 5, name: 'Beakers (500ml)', category: 'Laboratory Equipment', unit: 'pieces', available: 75 },
      { id: 6, name: 'Distilled Water', category: 'Chemicals', unit: 'liters', available: 120 },
      { id: 7, name: 'Microscope Slides', category: 'Laboratory Equipment', unit: 'pieces', available: 300 },
      { id: 8, name: 'Pipettes', category: 'Laboratory Equipment', unit: 'pieces', available: 45 },
      { id: 9, name: 'Lab Coats', category: 'Safety Equipment', unit: 'pieces', available: 25 },
      { id: 10, name: 'Chemical Indicators', category: 'Chemicals', unit: 'bottles', available: 80 }
    ]);

    // Set default requested date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      requestedDate: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const categories = [
    'Laboratory Equipment',
    'Safety Equipment', 
    'Chemicals',
    'Consumables',
    'Office Supplies',
    'Cleaning Supplies'
  ];

  const units = [
    'pieces', 'pairs', 'sets', 'bottles', 'liters', 'kg', 'grams', 'meters', 'boxes', 'packs'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show suggestions when typing item name
    if (name === 'itemName') {
      setShowSuggestions(value.length > 0);
    }
  };

  const selectSuggestedItem = (item) => {
    setFormData(prev => ({
      ...prev,
      itemName: item.name,
      category: item.category,
      unit: item.unit
    }));
    setShowSuggestions(false);
  };

  const filteredSuggestions = availableItems.filter(item =>
    item.name.toLowerCase().includes(formData.itemName.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      alert('Request submitted successfully! Request ID: REQ-' + Math.random().toString(36).substr(2, 6).toUpperCase());
      
      // Reset form
      setFormData({
        itemName: '',
        category: '',
        quantity: '',
        unit: '',
        urgency: 'Medium',
        requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        justification: '',
        additionalNotes: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'border-red-300 bg-red-50';
      case 'Medium': return 'border-yellow-300 bg-yellow-50';
      case 'Low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Request</h2>
        <p className="text-gray-600">
          Submit a request for laboratory items from the warehouse. 
          Please provide accurate information to ensure quick processing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Item Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start typing item name..."
                    required
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectSuggestedItem(item)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.category} • Available: {item.available} {item.unit}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <div className="space-y-2">
                    {['High', 'Medium', 'Low'].map((urgency) => (
                      <label key={urgency} className="flex items-center">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency}
                          checked={formData.urgency === urgency}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(urgency)}`}>
                          {urgency}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Date *
                  </label>
                  <input
                    type="date"
                    name="requestedDate"
                    value={formData.requestedDate}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 1 day advance notice required
                  </p>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justification *
              </label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleInputChange}
                rows={4}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain why you need this item and how it will be used..."
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear the form?')) {
                    setFormData({
                      itemName: '',
                      category: '',
                      quantity: '',
                      unit: '',
                      urgency: 'Medium',
                      requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      justification: '',
                      additionalNotes: ''
                    });
                  }
                }}
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Tips */}
  

          {/* Department Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="text-sm font-medium text-gray-900">{user?.department || 'Chemistry Lab'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Requester:</span>
                <span className="text-sm font-medium text-gray-900">{user?.name || 'John Doe'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budget Code:</span>
                <span className="text-sm font-medium text-gray-900">CHEM-2025-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Approval Required:</span>
                <span className="text-sm font-medium text-gray-900">Yes</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
     
        </div>
      </div>
    </div>
  );
};

export default NewRequest;
