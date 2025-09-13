import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, allowedRoles, redirectTo = '/' }) => {
  // Check if user exists
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed
  const userRole = user.role?.name?.toLowerCase();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect unauthorized users to their appropriate dashboard
    const redirectPath = getDashboardForRole(userRole);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Helper function to determine dashboard route based on role
const getDashboardForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'chief':
      return '/chief';
    case 'storekeeper':
      return '/dashboard'; // Storekeepers go to EmployeeDashboard
    case 'requester':
      return '/department'; // Requesters go to DepartmentDashboard
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;
