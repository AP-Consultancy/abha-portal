import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";
import { toLocalDateKey } from "../utils/attendanceUtils";
import {
  normalizeStatusForApi,
  normalizeStatusForUI,
} from "./attendanceService";

const normalizeRecord = (record = {}) => ({
  ...record,
  _id: record._id || record.attendance_id || record.id,
  id: record.id || record.attendance_id,
  teacherId: record.teacherId || record.teacher_id,
  date: toLocalDateKey(record.date || record.attendance_date),
  status: normalizeStatusForUI(record.status || record.attendance_status),
  remarks: record.remarks || "",
  markedBy: record.markedBy || record.marked_by,
  teacherName:
    record.teacherName ||
    [record.first_name, record.last_name].filter(Boolean).join(" ").trim(),
  employeeId: record.employeeId || record.employee_id || record.enrollment_no,
  email: record.email || "",
});

const calculateStatistics = (attendance) => {
  const stats = attendance.reduce(
    (acc, record) => {
      acc.totalDays += 1;
      if (record.status === "Present") acc.presentDays += 1;
      if (record.status === "Absent") acc.absentDays += 1;
      if (record.status === "Leave") acc.leaveDays += 1;
      return acc;
    },
    {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      leaveDays: 0,
      attendancePercentage: 0,
    }
  );

  stats.attendancePercentage = stats.totalDays
    ? Math.round(
        ((stats.presentDays + stats.leaveDays * 0.5) / stats.totalDays) * 100
      )
    : 0;

  return stats;
};

const listFromResponse = (data) => {
  const rows = data.attendance || data.data || data || [];
  return Array.isArray(rows) ? rows.map(normalizeRecord) : [];
};

const isWithinDateRange = (record, startDate, endDate) => {
  if (!record.date || (!startDate && !endDate)) return true;
  const recordDate = toLocalDateKey(record.date);
  if (startDate && recordDate < startDate) return false;
  if (endDate && recordDate > endDate) return false;
  return true;
};

const teacherRosterKey = (teacher) =>
  String(teacher._id || teacher.id || teacher.teacherId || "");

export const teacherAttendanceService = {
  markAttendance: async ({
    teacherId,
    date,
    status,
    markedBy,
    remarks,
    attendanceId,
    action = 1,
  }) => {
    const payload = {
      action,
      attendance_id: attendanceId || null,
      teacher_id: teacherId || null,
      attendance_date: date || null,
      status: normalizeStatusForApi(status),
      marked_by: markedBy || null,
      remarks: remarks || null,
    };
    return apiService.post(API_ENDPOINTS.MANAGE_TEACHER_ATTENDANCE, payload);
  },

  markBulkAttendance: async ({ date, attendanceData, markedBy }) => {
    const dateKey = toLocalDateKey(date);
    const results = [];

    for (const entry of attendanceData) {
      const attendanceId = entry.attendanceId || null;
      const action = attendanceId ? 2 : 1;
      try {
        const result = await teacherAttendanceService.markAttendance({
          teacherId: entry.teacherId,
          date: dateKey,
          status: entry.status || "Present",
          markedBy,
          remarks: entry.remarks || null,
          attendanceId,
          action,
        });
        results.push(result);
      } catch (error) {
        const msg = String(error.message || "");
        if (/already marked/i.test(msg)) {
          const retry = await teacherAttendanceService.markAttendance({
            teacherId: entry.teacherId,
            date: dateKey,
            status: entry.status || "Present",
            markedBy,
            remarks: entry.remarks || null,
            attendanceId: attendanceId || undefined,
            action: 2,
          });
          results.push(retry);
          continue;
        }
        throw error;
      }
    }

    return {
      success: true,
      message: "Teacher attendance saved successfully",
      results,
    };
  },

  getAttendance: async ({ attendanceId, teacherId, date } = {}) => {
    const endpoint = attendanceId
      ? `${API_ENDPOINTS.TEACHER_ATTENDANCE}/${attendanceId}`
      : API_ENDPOINTS.TEACHER_ATTENDANCE;
    const params = new URLSearchParams();
    if (teacherId) params.set("teacher_id", teacherId);
    if (date) params.set("attendance_date", date);
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiService.get(`${endpoint}${query}`);
    const attendance = listFromResponse(data);
    return { ...data, attendance, data: attendance };
  },

  getDailyAttendance: async (date, roster = []) => {
    const rosterList = Array.isArray(roster) ? roster : roster?.teachers || roster?.data || [];
    const dateKey = toLocalDateKey(date);
    const rosterIds = new Set(
      rosterList.map((t) => teacherRosterKey(t)).filter(Boolean)
    );

    const data = await teacherAttendanceService.getAttendance({ date: dateKey });
    const records = data.attendance.filter((record) => {
      const sameDate = !dateKey || toLocalDateKey(record.date) === dateKey;
      const inRoster =
        !rosterIds.size || rosterIds.has(String(record.teacherId || ""));
      return sameDate && inRoster;
    });

    const attendanceByTeacher = new Map(
      records.map((record) => [String(record.teacherId), record])
    );

    const attendance = rosterList.map((teacher) => {
      const tid = teacherRosterKey(teacher);
      return {
        teacher,
        attendance: attendanceByTeacher.get(tid) || null,
      };
    });

    return { attendance, rawAttendance: records, date: dateKey };
  },

  getTeacherAttendance: async (teacherId, startDate, endDate) => {
    const data = await teacherAttendanceService.getAttendance({ teacherId });
    const attendance = data.attendance.filter((record) =>
      isWithinDateRange(record, startDate, endDate)
    );

    return {
      ...data,
      attendance,
      statistics: calculateStatistics(attendance),
    };
  },
};
