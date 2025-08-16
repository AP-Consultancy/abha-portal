import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Subjects from '../pages/Subjects';
import { classService } from '../services/classService';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const RoleAwareSubjects = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (userRole === 'admin') {
    // Admin sees full subject management interface
    return <Subjects />;
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (userRole === 'student') {
          const studentId = user?.userData?._id || user?.student?._id;
          if (studentId) {
            const resp = await classService.getStudentClass(studentId);
            const classSubjects = resp.class?.subjects || [];
            setSubjects(classSubjects);
          }
        }
        // Teachers could fetch classes and map subjects if needed later
      } catch (e) {
        console.error('Failed to load subjects', e);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    if (userRole !== 'admin') load();
  }, [userRole, user]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h1>
        <p className="text-gray-600">{userRole === 'student' ? 'View your enrolled subjects' : 'View subjects you teach'}</p>
      </div>
      {subjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">No Subjects Found</h3>
            <p className="text-gray-500">No subjects are assigned yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{s.subject?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Code: {s.subject?.code || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium text-sm">{s.teacher?.name || 'Unassigned'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{s.hoursPerWeek} hours/week</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleAwareSubjects;