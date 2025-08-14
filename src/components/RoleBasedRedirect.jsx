import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  // Redirect all authenticated users to dashboard (role-aware)
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