import React, { useState, useEffect, useCallback } from "react";
import { CalendarIcon, CheckIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { attendanceService } from "../services/attendanceService";
import { studentService } from "../services/studentService";
import { teacherService, sectionIdToLabel } from "../services/teacherService";
import { useAuth } from "../contexts/AuthContext";
import {
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../utils/constants";
import {
  ATTENDANCE_STATUS_OPTIONS,
  getClassLabel,
  getDefaultAcademicYearId,
  getSectionLabel,
  resolveClassId,
  resolveSectionId,
} from "../utils/attendanceUtils";

const Attendance = () => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState(getDefaultAcademicYearId());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filtersReady, setFiltersReady] = useState(false);

  const resolvedClassId = resolveClassId(selectedClass);
  const resolvedSectionId = resolveSectionId(selectedSection, resolvedClassId);

  const loadTeacherDefaults = useCallback(async () => {
    if (userRole !== "teacher") return;
    try {
      const profile = await teacherService.getTeacherProfile(user);
      if (profile?.classId) {
        setSelectedClass(String(profile.classId));
      }
      const sectionLabel =
        sectionIdToLabel(profile.sectionId, profile.classId) ||
        (["A", "B", "C"].includes(String(profile.section || "").toUpperCase())
          ? String(profile.section).toUpperCase()
          : "");
      if (sectionLabel) setSelectedSection(sectionLabel);
    } catch (error) {
      console.warn("Could not load teacher class assignment:", error);
    }
  }, [user, userRole]);

  useEffect(() => {
    loadTeacherDefaults();
  }, [loadTeacherDefaults]);

  const canLoadRoster =
    Boolean(resolvedClassId) &&
    Boolean(resolvedSectionId) &&
    Boolean(selectedDate) &&
    Boolean(selectedYear);

  const fetchClassAttendance = useCallback(async () => {
    if (!canLoadRoster) {
      setStudents([]);
      setAttendance({});
      setExistingAttendance({});
      setFiltersReady(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const rosterResponse = await studentService.getAllStudents({
        classId: resolvedClassId,
        sectionId: resolvedSectionId,
        academicYearId: selectedYear,
        limit: 500,
      });

      const data = await attendanceService.getClassAttendance(
        resolvedClassId,
        resolvedSectionId,
        selectedDate,
        rosterResponse.students
      );

      setStudents(data.attendance || []);
      setFiltersReady(true);

      const attendanceMap = {};
      const existingMap = {};
      data.attendance?.forEach((item) => {
        const sid = item.student._id || item.student.id || item.student.studentId;
        if (item.attendance) {
          attendanceMap[sid] = item.attendance.status;
          existingMap[sid] =
            item.attendance.id ||
            item.attendance._id ||
            item.attendance.attendance_id;
        }
      });
      setAttendance(attendanceMap);
      setExistingAttendance(existingMap);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setMessage(error.message || "Error loading attendance data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [canLoadRoster, resolvedClassId, resolvedSectionId, selectedDate, selectedYear]);

  useEffect(() => {
    fetchClassAttendance();
  }, [fetchClassAttendance]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach((item) => {
      const sid = item.student._id || item.student.id || item.student.studentId;
      next[sid] = status;
    });
    setAttendance(next);
  };

  const saveAttendance = async () => {
    if (!canLoadRoster) {
      setMessage("Please select class, section, academic year, and date.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const markedBy = user?.userData?.id || user?.userData?._id || user?.id || null;
      const attendanceData = students.map((item) => {
        const sid = item.student._id || item.student.id || item.student.studentId;
        return {
          studentId: sid,
          sectionId:
            item.student.sectionId || resolvedSectionId,
          status: attendance[sid] || item.attendance?.status || "Present",
          remarks: item.attendance?.remarks || "",
          attendanceId:
            existingAttendance[sid] ||
            item.attendance?.id ||
            item.attendance?._id ||
            null,
        };
      });

      await attendanceService.markBulkAttendance({
        classId: resolvedClassId,
        sectionId: resolvedSectionId,
        date: selectedDate,
        attendanceData,
        markedBy,
      });

      setMessage("Attendance saved successfully!");
      await fetchClassAttendance();
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      setMessage(error.message || "Error saving attendance. Please try again.");
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

  const summary = students.reduce(
    (acc, item) => {
      const sid = item.student._id || item.student.id || item.student.studentId;
      const status = attendance[sid] || "Present";
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
          <h1 className="text-2xl font-bold text-gray-900">Mark Student Attendance</h1>
          <p className="text-sm text-gray-600 mt-1">
            {userRole === "teacher"
              ? "Select your class and section, then mark attendance for the chosen date."
              : "Admin: mark attendance for any class and section."}
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          School days: Mon – Sat
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5 text-blue-600" />
          Select class & date
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic year *
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                  {year.isActive ? " (current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose class</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Choose section</option>
              {SECTION_OPTIONS.map((sec) => (
                <option key={sec.value} value={sec.value}>
                  Section {sec.label}
                </option>
              ))}
            </select>
          </div>

          <div>
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

        {!canLoadRoster && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Select academic year, class, section, and date to load the student list.
          </p>
        )}
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

      {filtersReady && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getClassLabel(selectedClass)} — Section {getSectionLabel(selectedSection)}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {ACADEMIC_YEAR_OPTIONS.find((y) => y.value === selectedYear)?.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Present: {summary.present} · Absent: {summary.absent} · Leave:{" "}
                  {summary.leave} · Total: {students.length}
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
                  disabled={saving || students.length === 0}
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
              <div className="text-lg text-gray-600">Loading students...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found for this class, section, and year.</p>
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
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Scholar No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((item, index) => {
                    const studentId =
                      item.student._id || item.student.id || item.student.studentId;
                    const studentName =
                      `${item.student.firstName || ""} ${item.student.lastName || ""}`.trim() ||
                      item.student.name;
                    const saved = item.attendance || existingAttendance[studentId];
                    const currentStatus =
                      attendance[studentId] || item.attendance?.status || "Present";

                    return (
                      <tr
                        key={studentId}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <span>{studentName}</span>
                          {saved && (
                            <span className="ml-2 text-xs font-normal text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                              Saved
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.student.rollNo || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.student.scholarNumber || item.student.enrollmentNo || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              handleAttendanceChange(studentId, e.target.value)
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
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Academic year defaults to the current session; choose a previous year to view or edit past records.</li>
          <li>• Pick class, section, and date — saved attendance for that day loads automatically.</li>
          <li>• Change the date to view or edit attendance for any previous day.</li>
          <li>• Mark each student as Present, Absent, or Leave, then save.</li>
          <li>• Saving again on the same date updates existing records (no duplicate error).</li>
          <li>• Teachers and admins can both mark attendance from this page.</li>
        </ul>
      </div>
    </div>
  );
};

export default Attendance;
