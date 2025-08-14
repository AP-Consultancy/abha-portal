import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    assignedClasses: [],
    assignedSubjects: [],
    todaySchedule: [],
    recentAttendance: [],
    upcomingExams: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch teacher-specific dashboard data
      const response = await fetch(
        "http://localhost:5000/api/teachers/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const teacherData = user?.userData || user?.teacher;

  const quickActions = [
    {
      name: "View Students",
      href: "/students",
      icon: UsersIcon,
      color: "bg-blue-500",
    },
    {
      name: "Mark Attendance",
      href: "/attendance",
      icon: ClockIcon,
      color: "bg-green-500",
    },
    {
      name: "Check Timetable",
      href: "/timetable",
      icon: CalendarIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Manage Subjects",
      href: "/subjects",
      icon: BookOpenIcon,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {teacherData?.name || "Teacher"}!
        </h1>
        <p className="text-gray-600">Here's your teaching overview for today</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.assignedSubjects?.length || 0}
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
              <p className="text-sm text-gray-500">Classes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.assignedClasses?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.upcomingExams?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}
              >
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {dashboardData.todaySchedule?.length > 0 ? (
              dashboardData.todaySchedule.map((period, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {period.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      {period.time} - {period.class}
                    </p>
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

        {/* Assigned Classes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Classes
          </h2>
          <div className="space-y-3">
            {dashboardData.assignedClasses?.length > 0 ? (
              dashboardData.assignedClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {cls.name} - {cls.section}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cls.studentCount} students
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">{cls.room}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No classes assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Subjects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Subjects
          </h2>
          <div className="space-y-3">
            {dashboardData.assignedSubjects?.length > 0 ? (
              dashboardData.assignedSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-500">
                      Code: {subject.code}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">{subject.grade}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No subjects assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Attendance
          </h2>
          <div className="space-y-3">
            {dashboardData.recentAttendance?.length > 0 ? (
              dashboardData.recentAttendance
                .slice(0, 5)
                .map((attendance, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {attendance.class}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(attendance.date).toLocaleDateString()} -{" "}
                        {attendance.present}/{attendance.total} present
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {Math.round(
                        (attendance.present / attendance.total) * 100
                      )}
                      %
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent attendance records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
