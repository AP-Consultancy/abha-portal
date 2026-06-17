import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { teacherService } from "../services/teacherService";
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
    teacherName: "Teacher",
    totalStudents: 0,
    assignedClasses: [],
    assignedSubjects: [],
    todaySchedule: [],
    recentAttendance: [],
    upcomingExams: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await teacherService.getTeacherDashboard(user);
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: "My Classes",
      href: "/classes",
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
      name: "My Subjects",
      href: "/subjects",
      icon: BookOpenIcon,
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {dashboardData.teacherName}!
        </h1>
        <p className="text-gray-600">Here&apos;s your teaching overview for today</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalStudents}
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today&apos;s Teaching
          </h2>
          <div className="space-y-3">
            {dashboardData.todaySchedule?.length > 0 ? (
              dashboardData.todaySchedule.map((period, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{period.subject}</p>
                    <p className="text-sm text-gray-500">{period.class}</p>
                  </div>
                  <div className="text-sm text-gray-400">{period.room}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No class assignments found</p>
                <p className="text-xs mt-1">Contact admin to assign classes</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>
          <div className="space-y-3">
            {dashboardData.assignedClasses?.length > 0 ? (
              dashboardData.assignedClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {cls.name} — Section {cls.section}
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h2>
          <div className="space-y-3">
            {dashboardData.assignedSubjects?.length > 0 ? (
              dashboardData.assignedSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{subject.name}</p>
                    <p className="text-sm text-gray-500">Class: {subject.grade}</p>
                  </div>
                  <div className="text-sm text-gray-400">ID {subject.code}</div>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Attendance
          </h2>
          <div className="space-y-3">
            {dashboardData.recentAttendance?.length > 0 ? (
              dashboardData.recentAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{record.class}</p>
                    <p className="text-sm text-gray-500">
                      {record.date
                        ? new Date(record.date).toLocaleDateString("en-IN")
                        : "—"}{" "}
                      — {record.present}/{record.total} present
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {record.total
                      ? Math.round((record.present / record.total) * 100)
                      : 0}
                    %
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent attendance records</p>
                <Link
                  to="/attendance"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  Mark attendance
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
