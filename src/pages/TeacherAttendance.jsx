import React, { useState, useEffect, useCallback } from "react";
import { CalendarIcon, CheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { teacherAttendanceService } from "../services/teacherAttendanceService";
import { teacherService } from "../services/teacherService";
import { useAuth } from "../contexts/AuthContext";
import { ATTENDANCE_STATUS_OPTIONS } from "../utils/attendanceUtils";

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeacherAttendance = useCallback(async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      setMessage("");

      const rosterResponse = await teacherService.getAllTeachers();
      const roster = rosterResponse.teachers || [];

      if (!roster.length) {
        setTeachers([]);
        setAttendance({});
        setExistingAttendance({});
        setMessage("No employees found. Add staff from the Employees page first.");
        return;
      }

      let dailyData = { attendance: roster.map((teacher) => ({ teacher, attendance: null })) };

      try {
        dailyData = await teacherAttendanceService.getDailyAttendance(
          selectedDate,
          roster
        );
      } catch (attendanceError) {
        console.warn("Could not load saved attendance:", attendanceError);
        setMessage(
          "Employee list loaded. Saved attendance for this date could not be fetched — you can still mark and save."
        );
      }

      setTeachers(dailyData.attendance || []);

      const attendanceMap = {};
      const existingMap = {};
      dailyData.attendance?.forEach((item) => {
        const tid =
          item.teacher._id || item.teacher.id || item.teacher.teacherId;
        if (item.attendance) {
          attendanceMap[tid] = item.attendance.status;
          existingMap[tid] =
            item.attendance.id ||
            item.attendance._id ||
            item.attendance.attendance_id;
        }
      });
      setAttendance(attendanceMap);
      setExistingAttendance(existingMap);
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      setMessage(error.message || "Error loading employee attendance");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTeacherAttendance();
  }, [fetchTeacherAttendance]);

  const handleAttendanceChange = (teacherId, status) => {
    setAttendance((prev) => ({ ...prev, [teacherId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    teachers.forEach((item) => {
      const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
      next[tid] = status;
    });
    setAttendance(next);
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setMessage("");

      const markedBy = user?.userData?.id || user?.userData?._id || user?.id || null;
      const attendanceData = teachers.map((item) => {
        const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
        return {
          teacherId: tid,
          status: attendance[tid] || item.attendance?.status || "Present",
          remarks: item.attendance?.remarks || "",
          attendanceId:
            existingAttendance[tid] ||
            item.attendance?.id ||
            item.attendance?._id ||
            null,
        };
      });

      await teacherAttendanceService.markBulkAttendance({
        date: selectedDate,
        attendanceData,
        markedBy,
      });

      setMessage("Teacher attendance saved successfully!");
      await fetchTeacherAttendance();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error saving teacher attendance:", error);
      setMessage(error.message || "Error saving teacher attendance.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Leave":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isSunday = (dateString) => new Date(dateString).getDay() === 0;

  const summary = teachers.reduce(
    (acc, item) => {
      const tid = item.teacher._id || item.teacher.id || item.teacher.teacherId;
      const status = attendance[tid] || "Present";
      if (status === "Present") acc.present += 1;
      else if (status === "Absent") acc.absent += 1;
      else if (status === "Leave") acc.leave += 1;
      return acc;
    },
    { present: 0, absent: 0, leave: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Employee Attendance</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select a date and mark attendance for all employees (teaching staff).
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          School days: Mon – Sat
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-blue-600" />
          Select date
        </h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {isSunday(selectedDate) && (
            <p className="text-sm text-orange-600 mt-1">Sunday — school is usually closed.</p>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("failed")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
              <p className="text-sm text-gray-600">
                {new Date(selectedDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Present: {summary.present} · Absent: {summary.absent} · Leave:{" "}
                {summary.leave} · Total: {teachers.length}
                {Object.keys(existingAttendance).length > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-green-700 font-medium">
                      {Object.keys(existingAttendance).length} already saved for this date
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => markAll("Present")}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAll("Absent")}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
              >
                All Absent
              </button>
              <button
                type="button"
                onClick={saveAttendance}
                disabled={saving || teachers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading teachers...</div>
          </div>
        ) : teachers.length === 0 ? (
            <div className="text-center py-12">
            <p className="text-gray-500">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((item, index) => {
                  const teacherId =
                    item.teacher._id || item.teacher.id || item.teacher.teacherId;
                  const teacherName =
                    item.teacher.name ||
                    `${item.teacher.firstName || ""} ${item.teacher.lastName || ""}`.trim();
                  const saved = item.attendance || existingAttendance[teacherId];
                  const currentStatus =
                    attendance[teacherId] || item.attendance?.status || "Present";

                  return (
                    <tr
                      key={teacherId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <span>{teacherName}</span>
                        {saved && (
                          <span className="ml-2 text-xs font-normal text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                            Saved
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.teacher.enrollmentNo ||
                          item.teacher.employee_id ||
                          item.teacher.employeeId ||
                          "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {teacherId || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.teacher.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleAttendanceChange(teacherId, e.target.value)
                          }
                          className={`border rounded-lg px-3 py-2 text-sm font-medium ${getStatusColor(
                            currentStatus
                          )}`}
                        >
                          {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pick a date — saved attendance for that day loads automatically.</li>
          <li>• Mark each employee as Present, Absent, or Leave, then save.</li>
          <li>• Saving again on the same date updates existing records.</li>
          <li>• Only admins can mark employee attendance from this page.</li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherAttendance;
