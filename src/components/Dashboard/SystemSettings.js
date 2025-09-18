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
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const getAuthToken = () => localStorage.getItem('access_token');
  
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    // Load system settings from localStorage
    const loadSettings = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Try to load from localStorage first
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          setOriginalSettings(parsedSettings);
          console.log('Loaded settings from localStorage:', parsedSettings);
        } else {
          // Use default settings if nothing in localStorage
          console.log('Using default settings');
          const defaultSettings = {
            systemName: 'CGCLA Warehouse Management System',
            systemVersion: '1.0.0',
            organizationName: 'CGCLA Laboratory',
            contactEmail: 'admin@cgcla.go.tz',
            supportPhone: '+255 123 456 789',
            timezone: 'Africa/Dar_es_Salaam',
            language: 'en',
          };
          setSettings(defaultSettings);
          setOriginalSettings(defaultSettings);
          // Save defaults to localStorage
          localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings. Using default values.');
        const defaultSettings = {
          systemName: 'CGCLA Warehouse Management System',
          systemVersion: '1.0.0',
          organizationName: 'CGCLA Laboratory',
          contactEmail: 'admin@cgcla.go.tz',
          supportPhone: '+255 123 456 789',
          timezone: 'Africa/Dar_es_Salaam',
          language: 'en',
        };
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
        // Save defaults to localStorage as fallback
        localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []); // Empty dependency array to run only once

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setShowSaveMessage(false);
    
    try {
      // Validate required fields
      if (!settings.systemName.trim()) {
        throw new Error('System name is required');
      }
      if (!settings.organizationName.trim()) {
        throw new Error('Organization name is required');
      }
      if (!settings.contactEmail.trim()) {
        throw new Error('Contact email is required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.contactEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage instead of API
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      // Update original settings to reflect saved state
      setOriginalSettings({ ...settings });
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
      
      console.log('Settings saved to localStorage:', settings);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm('Are you sure you want to reset all settings to their last saved values?');
    if (confirmed) {
      setSettings({ ...originalSettings });
      setError('');
      setShowSaveMessage(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log('handleInputChange called:', field, '=', value);
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [field]: value
      };
      console.log('Updated settings:', field, '=', newSettings[field]);
      return newSettings;
    });
    // Clear error when user starts making changes
    if (error) setError('');
  };

  // Check if settings have been modified
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

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
              Configure system-wide settings and preferences. Settings are saved locally.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {showSaveMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-green-700 text-sm">✓ Settings saved successfully!</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">⚠ {error}</p>
              </div>
            )}
            {hasChanges && !isLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                <p className="text-yellow-700 text-xs">Unsaved changes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            <TabButton id="general" label="General" isActive={activeTab === 'general'} onClick={setActiveTab} />
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.systemName || ''}
                        onChange={(e) => {
                          console.log('Input onChange fired:', e.target.value);
                          handleInputChange('systemName', e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter system name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">System Version</label>
                      <input
                        type="text"
                        value={settings.systemVersion || ''}
                        onChange={(e) => handleInputChange('systemVersion', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="System version"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Version is automatically managed</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.organizationName || ''}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter organization name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={settings.contactEmail || ''}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter contact email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                      <input
                        type="tel"
                        value={settings.supportPhone || ''}
                        onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter support phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.timezone || 'Africa/Dar_es_Salaam'}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Africa/Dar_es_Salaam">East Africa Time (UTC+3)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="Europe/London">Greenwich Mean Time</option>
                        <option value="Asia/Dubai">Gulf Standard Time (UTC+4)</option>
                        <option value="Africa/Cairo">Egypt Standard Time (UTC+2)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.language || 'en'}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                        <option value="ar">العربية (Arabic)</option>
                        <option value="fr">Français (French)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
