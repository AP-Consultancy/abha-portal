import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { user, loading, hasRole } = useAuth();
  
  // Set up token refresh
  useTokenRefresh();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If specific roles are required, check if user has permission
  if (requiredRoles && !hasRole(requiredRoles)) {
    const userRole = user.userRole || (user.student?.user || user.teacher?.user || user.admin?.user || '').toLowerCase();
    
    // Redirect to appropriate page based on user role
    let redirectPath = '/dashboard';
    switch (userRole) {
      case 'admin':
        redirectPath = '/dashboard';
        break;
      case 'student':
      case 'employee':
      case 'teacher':
        redirectPath = '/profile';
        break;
      default:
        redirectPath = '/dashboard';
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Navigate to={redirectPath} replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;