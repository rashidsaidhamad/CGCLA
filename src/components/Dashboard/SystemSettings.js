import React, { useState, useEffect } from 'react';

const SystemSettings = ({ user }) => {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'CGCLA Warehouse Management System',
    systemVersion: '1.0.0',
    organizationName: 'CGCLA Laboratory',
    contactEmail: 'admin@cgcla.go.tz',
    supportPhone: '+255 123 456 789',
    timezone: 'Africa/Dar_es_Salaam',
    language: 'en',
    
    // Email Settings
    emailEnabled: true,
    smtpServer: 'smtp.cgcla.go.tz',
    smtpPort: 587,
    smtpUsername: 'noreply@cgcla.go.tz',
    smtpPassword: '',
    emailFromName: 'CGCLA System',
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load system settings (mock API call)
    const loadSettings = async () => {
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
    const confirmed = window.confirm('Are you sure you want to reset all settings to default values?');
    if (confirmed) {
      // Reset logic here
      setShowSaveMessage(false);
    }
  };

  const handleTestEmail = () => {
    alert('Test email sent successfully!');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
            <p className="text-gray-600">
              Configure system-wide settings and preferences.
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
            <TabButton id="general" label="General" isActive={activeTab === 'general'} onClick={setActiveTab} />
            <TabButton id="email" label="Email" isActive={activeTab === 'email'} onClick={setActiveTab} />
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Version</label>
                  <input
                    type="text"
                    value={settings.systemVersion}
                    onChange={(e) => setSettings({...settings, systemVersion: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={settings.organizationName}
                    onChange={(e) => setSettings({...settings, organizationName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Africa/Dar_es_Salaam">East Africa Time (UTC+3)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="Europe/London">Greenwich Mean Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
                <button
                  onClick={handleTestEmail}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Test Email
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                  <input
                    type="text"
                    value={settings.smtpServer}
                    onChange={(e) => setSettings({...settings, smtpServer: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.smtpUsername}
                    onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter SMTP password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.emailFromName}
                    onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Email Service</label>
                  <p className="text-sm text-gray-500">Allow system to send emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
