import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Students from '../pages/Students';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const RoleAwareStudents = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  // Show role-specific content
  switch (userRole) {
    case 'admin':
      // Admin sees full student management interface
      return <Students />;
    
    case 'student':
      // Students see their personal dashboard/profile
      return <StudentDashboard />;
    
    case 'employee':
    case 'teacher':
      // Teachers see their profile/dashboard
      return <TeacherDashboard />;
    
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