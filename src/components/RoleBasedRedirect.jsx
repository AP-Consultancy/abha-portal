import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { getUserRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const userRole = getUserRole();

  switch (userRole) {
    case 'admin':
    case 'student':
    case 'employee':
    case 'teacher':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
