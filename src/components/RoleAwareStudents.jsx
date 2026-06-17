import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Students from '../pages/Students';
import StudentDashboard from './StudentDashboard';

const RoleAwareStudents = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  switch (userRole) {
    case 'admin':
      return <Students />;
    
    case 'student':
      return <StudentDashboard />;
    
    case 'employee':
    case 'teacher':
      return <Navigate to="/dashboard" replace />;
    
    default:
      return (
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
  }
};

export default RoleAwareStudents;