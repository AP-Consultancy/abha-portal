import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  CalendarIcon,
  IdentificationIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const StudentProfile = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have user data from auth context, use it first
    if (user?.userData) {
      console.log('Using auth context data:', user.userData);
      setStudentData(user.userData);
      setLoading(false);
    } else if (user) {
      // Otherwise fetch from API
      console.log('Fetching from API because no userData in context');
      fetchStudentProfile();
    } else {
      console.log('No user in context yet');
      setLoading(false);
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token); // Debug log
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Profile API response status:', response.status); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched student profile:', data); // Debug log
        setStudentData(data.student); // Extract the student object
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch profile:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
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

  // Try multiple sources for student data
  const student = studentData || user?.userData || user?.student || {};
  
  // Debug log (can be removed later)
  if (Object.keys(student).length === 0) {
    console.log('No student data found. User:', user);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-3">
              <UserIcon className="h-12 w-12 text-blue-600" />
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-2xl font-bold">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-blue-100">Student Profile</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Student ID</label>
                  <p className="font-medium">{student.studentId || student.enrollmentNo || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Scholar Number</label>
                  <p className="font-medium">{student.scholarNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium">{student.gender || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p className="font-medium">
                    {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Blood Group</label>
                  <p className="font-medium">{student.bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
                Academic Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Class</label>
                  <p className="font-medium">{student.className || student.class || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Section</label>
                  <p className="font-medium">{student.section || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Roll Number</label>
                  <p className="font-medium">{student.rollNo || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Academic Year</label>
                  <p className="font-medium">{student.academicYear || '2024-2025'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Admission Date</label>
                  <p className="font-medium">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{student.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{student.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium">
                    {student.address ? 
                      `${student.address.street || ''}, ${student.address.city || ''}, ${student.address.state || ''} ${student.address.postalCode || ''}`.trim() 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Parent Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Father's Name</label>
                  <p className="font-medium">{student.father?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Father's Phone</label>
                  <p className="font-medium">{student.father?.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Mother's Name</label>
                  <p className="font-medium">{student.mother?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Mother's Phone</label>
                  <p className="font-medium">{student.mother?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/attendance"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CalendarIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">My Attendance</span>
              </a>
              
              <a
                href="/fees"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BanknotesIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Fee Details</span>
              </a>
              
              <a
                href="/timetable"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CalendarIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Timetable</span>
              </a>
              
              <a
                href="/exams"
                className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <IdentificationIcon className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-yellow-900">Exams</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;