import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import DepartmentDashboard from './components/Dashboard/DepartmentDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ChiefDashboard from './components/Dashboard/ChiefDashboard';
import SuppliersDashboard from './components/Suppliers/SuppliersDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Validate token and get user profile
      fetch('http://127.0.0.1:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Token invalid');
      })
      .then(userData => {
        setCurrentUser(userData);
        setUserRole(userData.role?.name?.toLowerCase() || 'employee');
        setIsLoading(false);
      })
      .catch(() => {
        // Token is invalid, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (loginData) => {
    // TEMPORARY DEBUG - REMOVE AFTER FIXING
    console.log('=== DEBUGGING LOGIN ===');
    console.log('Full loginData:', loginData);
    console.log('User data:', loginData.user);
    console.log('User role object:', loginData.user.role);
    console.log('User role name:', loginData.user.role?.name);
    console.log('========================');
    
    setCurrentUser(loginData.user);
    setUserRole(loginData.user.role?.name?.toLowerCase() || 'employee');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setUserRole(null);
  };

  const getDashboardRoute = (role) => {
    console.log('=== DEBUGGING ROUTE SELECTION ===');
    console.log('Input role:', role);
    console.log('Type of role:', typeof role);
    
    // Handle both string and object roles
    const roleName = typeof role === 'string' ? role : role?.name?.toLowerCase() || 'employee';
    
    console.log('Processed roleName:', roleName);
    console.log('Type of roleName:', typeof roleName);
    
    switch (roleName) {
      case 'admin':
        console.log('✅ ADMIN: REDIRECTING TO: /admin');
        return '/admin';
      case 'chief':
        console.log('✅ CHIEF: REDIRECTING TO: /chief');
        return '/chief';
      case 'storekeeper':
        console.log('✅ STOREKEEPER: REDIRECTING TO: /dashboard (EmployeeDashboard)');
        return '/dashboard';
      case 'requester':
        console.log('✅ REQUESTER: REDIRECTING TO: /department (DepartmentDashboard)');
        return '/department';
      default:
        console.log('⚠️  UNKNOWN ROLE: REDIRECTING TO: /dashboard (default)');
        console.log('Available roles should be: admin, chief, storekeeper, requester');
        return '/dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Dashboard Routes - Only for Admins */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['admin']}>
                <AdminDashboard user={currentUser} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Chief Dashboard Routes - Only for Chiefs */}
          <Route 
            path="/chief/*" 
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['chief']}>
                <ChiefDashboard user={currentUser} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Department Dashboard Routes - Only for Requesters */}
          <Route 
            path="/department/*" 
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['requester']}>
                <DepartmentDashboard user={currentUser} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Employee Dashboard Routes - Only for Storekeepers */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['storekeeper']}>
                <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          {/* Suppliers Dashboard Route */}
          <Route 
            path="/suppliers/*" 
            element={<SuppliersDashboard />} 
          />
          
          {/* Default Route - redirect based on user role */}
          <Route 
            path="/" 
            element={<Navigate to={getDashboardRoute(userRole)} replace />} 
          />
          
          {/* Catch all route - redirect based on user role */}
          <Route 
            path="*" 
            element={<Navigate to={getDashboardRoute(userRole)} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
