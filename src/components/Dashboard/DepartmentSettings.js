import React, { useState, useEffect } from 'react';

const DepartmentSettings = ({ user }) => {
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    requestApprovalNotifications: true,
    statusUpdateNotifications: true,
    reminderNotifications: false,
    
    // Request preferences
    defaultUrgency: 'medium',
    autoApprovalLimit: 100,
    requireJustification: true,
    allowBackorders: true,
    
    // Department info
    departmentName: user?.department || 'Research & Development',
    departmentCode: 'RND-001',
    departmentHead: 'Dr. Sarah Johnson',
    contactEmail: 'rnd@cgcla.com',
    budgetCode: 'BUD-RND-2025',
    
    // Display preferences
    itemsPerPage: 20,
    defaultView: 'grid',
    showImages: true,
    compactMode: false,
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    requireApprovalForHighValue: true,
    highValueThreshold: 1000
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user settings (mock API call)
    const loadSettings = async () => {
      // Simulate API call
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    // Reset to default values
    const confirmed = window.confirm('Are you sure you want to reset all settings to default values?');
    if (confirmed) {
      setSettings({
        emailNotifications: true,
        requestApprovalNotifications: true,
        statusUpdateNotifications: true,
        reminderNotifications: false,
        defaultUrgency: 'medium',
        autoApprovalLimit: 100,
        requireJustification: true,
        allowBackorders: true,
        departmentName: user?.department || 'Research & Development',
        departmentCode: 'RND-001',
        departmentHead: 'Dr. Sarah Johnson',
        contactEmail: 'rnd@cgcla.com',
        budgetCode: 'BUD-RND-2025',
        itemsPerPage: 20,
        defaultView: 'grid',
        showImages: true,
        compactMode: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        requireApprovalForHighValue: true,
        highValueThreshold: 1000
      });
    }
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-blue-200'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Department Settings</h2>
            <p className="text-gray-600">
              Customize your department's preferences and configuration.
            </p>
          </div>
          {showSaveMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm">✓ Settings saved successfully!</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            <TabButton 
              id="general" 
              label="General" 
              isActive={activeTab === 'general'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="notifications" 
              label="Notifications" 
              isActive={activeTab === 'notifications'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="requests" 
              label="Request Settings" 
              isActive={activeTab === 'requests'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="security" 
              label="Security" 
              isActive={activeTab === 'security'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Department Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={settings.departmentName}
                    onChange={(e) => setSettings({...settings, departmentName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={settings.departmentCode}
                    onChange={(e) => setSettings({...settings, departmentCode: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Head
                  </label>
                  <input
                    type="text"
                    value={settings.departmentHead}
                    onChange={(e) => setSettings({...settings, departmentHead: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Code
                  </label>
                  <input
                    type="text"
                    value={settings.budgetCode}
                    onChange={(e) => setSettings({...settings, budgetCode: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <hr />

              <h3 className="text-lg font-semibold text-gray-900">Display Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
            
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Show Item Images</label>
                  <p className="text-sm text-gray-500">Display product images in item listings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showImages}
                    onChange={(e) => setSettings({...settings, showImages: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Compact Mode</label>
                  <p className="text-sm text-gray-500">Use compact layout for better screen utilization</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}

          {/* Request Settings Tab */}

          {/* Security Tab */}
  
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSettings;
