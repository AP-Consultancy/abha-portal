import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teachers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacherData(data.teacher);
        setAssignedClasses(data.assignedClasses || []);
        setAssignedSubjects(data.assignedSubjects || []);
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const teacher = teacherData || user?.userData || user?.teacher || {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-3">
              <UserIcon className="h-12 w-12 text-green-600" />
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-2xl font-bold">
                {teacher.name || 'Teacher'}
              </h1>
              <p className="text-green-100">Teacher Profile</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-green-600" />
                Personal Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Enrollment No.</label>
                  <p className="font-medium">{teacher.enrollmentNo || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{teacher.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium">{teacher.gender || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p className="font-medium">
                    {teacher.dob ? new Date(teacher.dob).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-green-600" />
                Professional Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Designation</label>
                  <p className="font-medium">{teacher.designation || 'Teacher'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Department</label>
                  <p className="font-medium">{teacher.department || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Joining Date</label>
                  <p className="font-medium">
                    {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teacher.status || 'Active'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-green-600" />
                Contact Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{teacher.contact || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Alternate Phone</label>
                  <p className="font-medium">{teacher.alternateContact || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{teacher.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium">
                    {teacher.address ? 
                      `${teacher.address.street || ''}, ${teacher.address.city || ''}, ${teacher.address.state || ''} ${teacher.address.zip || ''}`.trim() 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Teaching Assignments */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-green-600" />
                Teaching Assignments
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Assigned Classes</label>
                  <div className="space-y-1">
                    {assignedClasses.length > 0 ? (
                      assignedClasses.map((cls, index) => (
                        <p key={index} className="font-medium text-sm bg-blue-50 px-2 py-1 rounded">
                          {cls.name} - {cls.section}
                        </p>
                      ))
                    ) : (
                      <p className="font-medium text-gray-500">No classes assigned</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Assigned Subjects</label>
                  <div className="space-y-1">
                    {assignedSubjects.length > 0 ? (
                      assignedSubjects.map((subject, index) => (
                        <p key={index} className="font-medium text-sm bg-green-50 px-2 py-1 rounded">
                          {subject.name} ({subject.code})
                        </p>
                      ))
                    ) : (
                      <p className="font-medium text-gray-500">No subjects assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/students"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <UserIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">My Students</span>
              </a>
              
              <a
                href="/attendance"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Mark Attendance</span>
              </a>
              
              <a
                href="/timetable"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CalendarIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">My Timetable</span>
              </a>
              
              <a
                href="/subjects"
                className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <IdentificationIcon className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-yellow-900">My Subjects</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;