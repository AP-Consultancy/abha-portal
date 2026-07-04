import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { teacherAttendanceService } from "../services/teacherAttendanceService";
import { teacherService } from "../services/teacherService";
import { useAuth } from "../contexts/AuthContext";

const MyTeacherAttendance = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const load = async () => {
      try {
        setLoading(true);
        setMessage("");

        const profile = await teacherService.getTeacherProfile(user);
        const teacherId =
          profile?.teacherId || profile?.id || profile?._id ||
          user?.userData?.teacherId;

        if (!teacherId) {
          setMessage("Could not find your teacher profile.");
          return;
        }

        setTeacherName(
          profile?.name ||
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
            user?.name ||
            "Teacher"
        );

        const data = await teacherAttendanceService.getTeacherAttendance(
          teacherId,
          startDate,
          endDate
        );
        setAttendance(data.attendance || []);
        setStatistics(data.statistics || {});
      } catch (error) {
        console.error("Error fetching teacher attendance:", error);
        setMessage("Error loading attendance data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [startDate, endDate, user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case "Absent":
        return <XMarkIcon className="h-4 w-4 text-red-600" />;
      case "Leave":
        return <ClockIcon className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-50 border-green-200 text-green-800";
      case "Absent":
        return "bg-red-50 border-red-200 text-red-800";
      case "Leave":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getDayName = (dateString) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date(dateString).getDay()];
  };

  const isWeekend = (dateString) => new Date(dateString).getDay() === 0;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Please log in to view attendance</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <div className="text-sm text-gray-600">Teacher: {teacherName}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {message}
        </div>
      )}

      {Object.keys(statistics).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{statistics.presentDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <XMarkIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{statistics.absentDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-amber-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Leave</p>
                <p className="text-2xl font-bold text-amber-600">{statistics.leaveDays}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {statistics.attendancePercentage !== undefined && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Percentage</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${statistics.attendancePercentage}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.attendancePercentage}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {statistics.presentDays} out of {statistics.totalDays} days
          </p>
        </div>
      )}

      {attendance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record, index) => (
                  <tr key={record._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${
                          isWeekend(record.date)
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {getDayName(record.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && attendance.length === 0 && startDate && endDate && !message && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
          <p className="text-gray-600">
            No attendance data available for the selected date range
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">Loading attendance data...</div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Attendance:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• View your attendance for any date range</li>
          <li>• Attendance is marked by the admin</li>
          <li>• Contact admin if you notice any discrepancies</li>
        </ul>
      </div>
    </div>
  );
};

export default MyTeacherAttendance;
