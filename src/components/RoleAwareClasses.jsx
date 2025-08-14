import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { classService } from '../services/classService';
import Classes from '../pages/Classes';
import { AcademicCapIcon, UserIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const RoleAwareClasses = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        let data;
        
        if (userRole === 'student') {
          const studentId = user?.userData?._id || user?.student?._id;
          if (studentId) {
            const response = await classService.getStudentClass(studentId);
            data = response.class ? [response.class] : [];
          }
        } else if (userRole === 'teacher' || userRole === 'employee') {
          const teacherId = user?.userData?._id || user?.teacher?._id;
          if (teacherId) {
            const response = await classService.getTeacherClasses(teacherId);
            data = response.classes || [];
          }
        }
        
        setClasses(data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load class information');
      } finally {
        setLoading(false);
      }
    };

    if (userRole !== 'admin') {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  if (userRole === 'admin') {
    // Admin sees full class management interface
    return <Classes />;
  }

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600">
          {userRole === 'student' ? 'View your enrolled classes and schedules' : 'View classes you teach and manage'}
        </p>
      </div>
      
      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AcademicCapIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
            <p className="text-gray-500">
              {userRole === 'student' 
                ? 'You are not enrolled in any classes yet.' 
                : 'You are not assigned to any classes yet.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((classData) => (
            <div key={classData._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {classData.name} - Section {classData.section}
                  </h2>
                  <p className="text-gray-600">Academic Year: {classData.academicYear}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Room</p>
                  <p className="font-medium">{classData.room}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Class Teacher */}
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Class Teacher</p>
                    <p className="font-medium">{classData.classTeacher?.name || 'Not assigned'}</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="flex items-center space-x-3">
                  <BookOpenIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Subjects</p>
                    <p className="font-medium">{classData.subjects?.length || 0} subjects</p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Schedule</p>
                    <p className="font-medium">{classData.schedule}</p>
                  </div>
                </div>
              </div>

              {/* Subjects List */}
              {classData.subjects && classData.subjects.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classData.subjects.map((subjectData, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {subjectData.subject?.name || 'Unknown Subject'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Code: {subjectData.subject?.code || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Teacher</p>
                            <p className="font-medium text-sm">
                              {subjectData.teacher?.name || 'Not assigned'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            {subjectData.hoursPerWeek} hours/week
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students List (for teachers) */}
              {userRole === 'teacher' && classData.students && classData.students.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Students ({classData.students.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classData.students.map((student) => (
                      <div key={student._id} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Roll No: {student.rollNo || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.enrollmentNo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleAwareClasses;