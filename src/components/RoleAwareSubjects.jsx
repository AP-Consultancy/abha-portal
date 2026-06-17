import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Subjects from '../pages/Subjects';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { teacherService } from '../services/teacherService';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const SubjectCards = ({ subjects, subtitle }) => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h1>
      <p className="text-gray-600">{subtitle}</p>
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
          <div key={s._id || s.id || idx} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <p className="font-medium text-gray-900">{s.name || s.subject?.name || 'Subject'}</p>
            <p className="text-sm text-gray-600">Code: {s.code || s.subject?.code || 'N/A'}</p>
            {s.teacher?.name && (
              <p className="text-sm text-gray-500 mt-2">Teacher: {s.teacher.name}</p>
            )}
            {(s.hoursPerWeek || s.hours_per_week) && (
              <p className="text-xs text-gray-500 mt-1">{s.hoursPerWeek || s.hours_per_week} hrs/week</p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const RoleAwareSubjects = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(userRole !== 'admin');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userRole === 'admin') return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userRole === 'student') {
          const studentId = user?.userData?.id || user?.userData?._id || user?.student?._id;
          if (studentId) {
            const resp = await classService.getStudentClass(studentId);
            setSubjects(resp.class?.subjects || []);
          }
        } else if (userRole === 'teacher' || userRole === 'employee') {
          const profile = await teacherService.getTeacherProfile(user);
          const teacherId = profile?.teacherId || profile?.id || profile?._id;
          if (teacherId) {
            const resp = await subjectService.getSubjectsByTeacher(teacherId);
            setSubjects(resp.subjects || []);
          } else {
            setSubjects(profile?.assignedSubjects || []);
          }
        }
      } catch (e) {
        console.error('Failed to load subjects', e);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userRole, user]);

  if (userRole === 'admin') {
    return <Subjects />;
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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

  const subtitle =
    userRole === 'student'
      ? 'Subjects for your class from school assignments'
      : 'Subjects you teach across your assigned classes';

  return <SubjectCards subjects={subjects} subtitle={subtitle} />;
};

export default RoleAwareSubjects;
