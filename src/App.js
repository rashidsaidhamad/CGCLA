import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Mock authentication function
  const handleLogin = (credentials) => {
    // Simulate different user roles based on email
    if (credentials.email === 'admin@cgcla.go.tz' || credentials.username === 'admin') {
      setCurrentUser({ name: 'Admin User', email: 'admin@cgcla.go.tz' });
      setUserRole('warehouse_manager');
    } else if (credentials.email === 'employee@cgcla.go.tz' || credentials.username === 'employee') {
      setCurrentUser({ name: 'Jane Smith', email: 'employee@cgcla.go.tz' });
      setUserRole('employee');
    } else if (credentials.email === 'requester@cgcla.go.tz' || credentials.username === 'requester') {
      setCurrentUser({ name: 'John Doe', email: 'requester@cgcla.go.tz' });
      setUserRole('requester');
    } else {
      // Default to employee role for demo
      setCurrentUser({ name: 'User', email: credentials.email || credentials.username });
      setUserRole('employee');
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
            element={
              !currentUser ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          
          {/* Employee Dashboard Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              currentUser ? (
                <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default Route - redirect to dashboard if logged in, login if not */}
          <Route 
            path="/" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all route - redirect appropriately */}
          <Route 
            path="*" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
