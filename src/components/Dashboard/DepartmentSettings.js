import React, { useState, useEffect } from 'react';

const DepartmentSettings = ({ user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      applyDarkMode(true);
    } else {
      setIsDarkMode(false);
      applyDarkMode(false);
    }
  }, []);

  // Apply dark mode styles
  const applyDarkMode = (isDark) => {
    const body = document.body;
    const html = document.documentElement;
    
    if (isDark) {
      body.style.backgroundColor = '#1f2937';
      body.style.color = '#f9fafb';
      html.style.backgroundColor = '#1f2937';
      body.classList.add('dark-mode');
    } else {
      body.style.backgroundColor = '#f9fafb';
      body.style.color = '#111827';
      html.style.backgroundColor = '#f9fafb';
      body.classList.remove('dark-mode');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
    
    if (newDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  };

  const themeStyles = isDarkMode ? {
    container: { backgroundColor: '#374151', borderColor: '#4b5563', color: '#f9fafb' },
    card: { backgroundColor: '#374151', borderColor: '#4b5563', color: '#f9fafb' },
    text: { color: '#f9fafb' },
    subtext: { color: '#d1d5db' },
    infoCard: { backgroundColor: '#1e3a8a', borderColor: '#3b82f6' }
  } : {
    container: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' },
    card: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' },
    text: { color: '#111827' },
    subtext: { color: '#6b7280' },
    infoCard: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Department Settings</h1>
        <p className="text-blue-100 text-lg">
          Customize your workspace preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div 
        className="rounded-xl shadow-sm border p-6"
        style={themeStyles.card}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {isDarkMode ? (
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={themeStyles.text}>Theme Preference</h3>
              <p className="text-sm" style={themeStyles.subtext}>
                Switch between light and dark mode for better viewing experience
              </p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${!isDarkMode ? 'text-blue-600' : 'text-gray-400'}`}>
              Light
            </span>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-600' : 'text-gray-400'}`}>
              Dark
            </span>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium" style={themeStyles.text}>Preview</h4>
              <p className="text-sm" style={themeStyles.subtext}>
                Current theme: <span className="font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#ffffff' }}
              ></div>
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: isDarkMode ? '#4b5563' : '#f9fafb' }}
              ></div>
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: isDarkMode ? '#6b7280' : '#f3f4f6' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Information */}
      <div 
        className="border rounded-xl p-6"
        style={themeStyles.infoCard}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Theme Settings</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Light Mode:</strong> Default bright theme for daytime use</li>
                <li><strong>Dark Mode:</strong> Easier on the eyes for low-light environments</li>
                <li>Your preference is automatically saved and will persist across sessions</li>
                <li>The theme applies to the entire department dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div 
        className="rounded-lg p-4 border"
        style={themeStyles.card}
      >
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          <span className="font-medium" style={themeStyles.text}>
            {isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSettings;
