import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Subjects from '../pages/Subjects';

const RoleAwareSubjects = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === 'admin') {
    // Admin sees full subject management interface
    return <Subjects />;
  }

  // Students and teachers see read-only view of their subjects
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h1>
        <p className="text-gray-600">
          {userRole === 'student' ? 'View your enrolled subjects' : 'View subjects you teach'}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Subject Information</h3>
          <p className="text-gray-500">Your subject details will be displayed here.</p>
          <p className="text-sm text-gray-400 mt-2">
            {userRole === 'student' ? 'View your enrolled subjects and curriculum.' : 'View subjects you teach and course materials.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleAwareSubjects;