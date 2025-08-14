import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Timetable from '../pages/Timetable';

const RoleAwareTimetable = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === 'admin') {
    // Admin sees full timetable management interface
    return <Timetable />;
  }

  // Students and teachers see their own timetable
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
        <p className="text-gray-600">
          {userRole === 'student' ? 'View your class schedule' : 'View your teaching schedule'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Information</h3>
          <p className="text-gray-500">Your timetable will be displayed here.</p>
          <p className="text-sm text-gray-400 mt-2">
            {userRole === 'student' ? 'View your daily class schedule and timings.' : 'View your teaching schedule and class timings.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleAwareTimetable;