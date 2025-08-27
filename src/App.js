import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Mock authentication function
  const handleLogin = (credentials) => {
    // Simulate different user roles based on email
    if (credentials.email === 'admin@cgcla.go.tz' || credentials.username === 'admin') {
      setCurrentUser({ name: 'Admin User', email: 'admin@cgcla.go.tz' });
      setUserRole('warehouse_manager');
    } else if (credentials.email === 'requester@cgcla.go.tz' || credentials.username === 'requester') {
      setCurrentUser({ name: 'John Doe', email: 'requester@cgcla.go.tz' });
      setUserRole('requester');
    } else {
      // Default to requester role for demo
      setCurrentUser({ name: 'User', email: credentials.email || credentials.username });
      setUserRole('requester');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          
          {/* Default Route - redirect to login */}
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
          
          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
