import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentProfile from './StudentProfile';
import TeacherProfile from './TeacherProfile';

const RoleAwareProfile = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  switch (userRole) {
    case 'student':
      return <StudentProfile />;
    case 'teacher':
    case 'employee':
      return <TeacherProfile />;
    case 'admin':
      // Admin can have their own profile or redirect to dashboard
      return <TeacherProfile />; // For now, use teacher profile for admin
    default:
      return <div>Access denied</div>;
  }
};

export default RoleAwareProfile;