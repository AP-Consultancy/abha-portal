import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    upcomingExams: [],
    recentAttendance: null,
    pendingFees: null,
    todayTimetable: [],
    announcements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch student-specific dashboard data
      const response = await fetch('http://localhost:5000/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const studentData = user?.userData || user?.student;

  const quickActions = [
    {
      name: 'View Subjects',
      href: '/subjects',
      icon: BookOpenIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Check Timetable',
      href: '/timetable',
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Fee Details',
      href: '/fees',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Exam Results',
      href: '/exams',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {studentData?.firstName || 'Student'}!
        </h1>
        <p className="text-gray-600">Here's your academic overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.recentAttendance?.percentage || '0'}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.upcomingExams?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Fees</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{dashboardData.pendingFees?.amount || '0'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Class</p>
              <p className="text-2xl font-semibold text-gray-900">
                {studentData?.className || 'N/A'} - {studentData?.section || ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">{action.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {dashboardData.todayTimetable?.length > 0 ? (
              dashboardData.todayTimetable.map((period, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{period.subject}</p>
                    <p className="text-sm text-gray-500">{period.time} - {period.teacher}</p>
                  </div>
                  <div className="text-sm text-gray-400">{period.room}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Exams</h2>
          <div className="space-y-3">
            {dashboardData.upcomingExams?.length > 0 ? (
              dashboardData.upcomingExams.slice(0, 5).map((exam, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exam.subject}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exam.date).toLocaleDateString()} - {exam.time}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">{exam.type}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming exams</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(dashboardData.pendingFees?.amount > 0 || dashboardData.recentAttendance?.percentage < 75) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Alerts</h2>
          <div className="space-y-3">
            {dashboardData.pendingFees?.amount > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">Pending Fee Payment</p>
                  <p className="text-sm text-yellow-600">
                    You have ₹{dashboardData.pendingFees.amount} pending fees. Please pay by {dashboardData.pendingFees.dueDate}
                  </p>
                </div>
              </div>
            )}
            
            {dashboardData.recentAttendance?.percentage < 75 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Low Attendance Warning</p>
                  <p className="text-sm text-red-600">
                    Your attendance is {dashboardData.recentAttendance.percentage}%. Minimum required is 75%.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;