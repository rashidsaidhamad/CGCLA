import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import DepartmentDashboard from './components/Dashboard/DepartmentDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ChiefDashboard from './components/Dashboard/ChiefDashboard';
import SuppliersDashboard from './components/Suppliers/SuppliersDashboard';
          {/* Suppliers Dashboard Route */}
          <Route 
            path="/suppliers/*" 
            element={<SuppliersDashboard />} 
          />

function App() {
  // Auto-login for demo purposes (remove authentication)
  const [currentUser] = useState({ 
    name: 'Demo User', 
    email: 'demo@cgcla.go.tz',
    role: 'department_user',
    department: 'Demo Department'
  });
  const [userRole] = useState('department_user');

  const handleLogout = () => {
    // Optional: can add logout functionality later
    console.log('Logout clicked');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Chief Dashboard Routes - Direct Access */}
          <Route 
            path="/chief/*" 
            element={<ChiefDashboard user={currentUser} onLogout={handleLogout} />} 
          />
          
          {/* Admin Dashboard Routes - Direct Access */}
          <Route 
            path="/admin/*" 
            element={<AdminDashboard user={currentUser} onLogout={handleLogout} />} 
          />
          
          {/* Department Dashboard Routes - Direct Access */}
          <Route 
            path="/department/*" 
            element={<DepartmentDashboard user={currentUser} onLogout={handleLogout} />} 
          />
          
          {/* Employee Dashboard Routes - Direct Access */}
          <Route 
            path="/dashboard/*" 
            element={<EmployeeDashboard user={currentUser} onLogout={handleLogout} />} 
          />
          
          {/* Login Route (Optional) */}
          <Route 
            path="/login" 
            element={<Login onLogin={() => {}} />} 
          />
          
          {/* Default Route - redirect to admin dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/admin" replace />} 
          />
          
          {/* Catch all route - redirect to admin dashboard */}
          <Route 
            path="*" 
            element={<Navigate to="/admin" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
