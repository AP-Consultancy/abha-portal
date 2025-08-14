import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedContent = ({ allowedRoles, children, fallback = null }) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return fallback;
  }

  return children;
};

export default RoleBasedContent;