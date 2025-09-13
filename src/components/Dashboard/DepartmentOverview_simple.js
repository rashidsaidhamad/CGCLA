import React from 'react';

const DepartmentOverview = ({ user }) => {
  console.log('User object:', user); // Debug log

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {user?.first_name && user?.last_name ? 
            `${user.first_name} ${user.last_name}` : 
            user?.username || 'Department User'}!
        </h2>
        <p className="text-blue-100">
          Department: {user?.department?.name || 'Chemistry Lab'} | 
          Manage your laboratory item requests efficiently
        </p>
      </div>

      {/* Simple content for testing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Department Dashboard</h3>
        <p>User ID: {user?.id}</p>
        <p>Username: {user?.username}</p>
        <p>Role: {user?.role?.name || 'No role'}</p>
        <p>Department: {user?.department?.name || 'No department'}</p>
      </div>
    </div>
  );
};

export default DepartmentOverview;
