import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Attendance from '../pages/Attendance';

const RoleAwareAttendance = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === 'admin') {
    // Admin sees full attendance management interface
    return <Attendance />;
  }

  // Students and teachers see their own attendance information
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance</h1>
        <p className="text-gray-600">
          {userRole === 'student' ? 'View your attendance record' : 'View your teaching attendance'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Record</h3>
          <p className="text-gray-500">Your attendance information will be displayed here.</p>
          <p className="text-sm text-gray-400 mt-2">
            {userRole === 'student' ? 'Track your class attendance and participation.' : 'View your teaching schedule and attendance.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleAwareAttendance;