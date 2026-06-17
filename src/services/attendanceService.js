import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";
import { parseClassKey, toLocalDateKey } from "../utils/attendanceUtils";
import { studentService } from "./studentService";

const STATUS_TO_API = {
  present: "PRESENT",
  absent: "ABSENT",
  leave: "LEAVE",
};

const STATUS_FROM_API = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "Leave",
};

export const normalizeStatusForApi = (status) => {
  const key = String(status || "Present")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (key === "half_day" || key === "late") return "LEAVE";
  return STATUS_TO_API[key] || "PRESENT";
};

export const normalizeStatusForUI = (status) => {
  const upper = String(status || "PRESENT").trim().toUpperCase();
  return STATUS_FROM_API[upper] || "Present";
};

const normalizeRecord = (record = {}) => ({
  ...record,
  _id: record._id || record.attendance_id || record.id,
  id: record.id || record.attendance_id,
  studentId: record.studentId || record.student_id,
  classId: record.classId || record.class_id,
  sectionId: record.sectionId || record.section_id,
  date: toLocalDateKey(record.date || record.attendance_date),
  status: normalizeStatusForUI(record.status || record.attendance_status),
  remarks: record.remarks || "",
  markedBy: record.markedBy || record.marked_by,
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

const studentRosterKey = (student) =>
  String(student._id || student.id || student.studentId || "");

export const attendanceService = {
  markAttendance: async ({
    studentId,
    classId,
    sectionId,
    date,
    status,
    markedBy,
    remarks,
    attendanceId,
    action = 1,
  }) => {
    try {
      const payload = {
        action,
        attendance_id: attendanceId || null,
        student_id: studentId || null,
        class_id: classId || null,
        section_id: sectionId || null,
        attendance_date: date || null,
        status: normalizeStatusForApi(status),
        marked_by: markedBy || null,
        remarks: remarks || null,
      };
      return await apiService.post(API_ENDPOINTS.MANAGE_ATTENDANCE, payload);
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  markBulkAttendance: async ({ classId, sectionId, date, attendanceData, markedBy }) => {
    const dateKey = toLocalDateKey(date);
    const results = [];
    for (const entry of attendanceData) {
      const attendanceId = entry.attendanceId || null;
      const action = attendanceId ? 2 : 1;
      try {
        const result = await attendanceService.markAttendance({
          studentId: entry.studentId,
          classId,
          sectionId: sectionId || entry.sectionId || null,
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
          const retry = await attendanceService.markAttendance({
            studentId: entry.studentId,
            classId,
            sectionId: sectionId || entry.sectionId || null,
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
    return { success: true, message: "Bulk attendance saved successfully", results };
  },

  updateAttendance: async (attendanceId, updateData) => {
    try {
      return await attendanceService.markAttendance({
        ...updateData,
        attendanceId,
        action: 2,
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  },

  deleteAttendance: async (attendanceId) => {
    try {
      const payload = {
        action: 3,
        attendance_id: attendanceId,
        student_id: null,
        class_id: null,
        section_id: null,
        attendance_date: null,
        status: null,
        marked_by: null,
        remarks: null,
      };
      return await apiService.post(API_ENDPOINTS.MANAGE_ATTENDANCE, payload);
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  },

  getAttendance: async ({
    attendanceId,
    studentId,
    classId,
    sectionId,
    date,
  } = {}) => {
    try {
      const endpoint = attendanceId
        ? `${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`
        : API_ENDPOINTS.ATTENDANCE;
      const params = new URLSearchParams();
      if (studentId) params.set("student_id", studentId);
      if (classId) params.set("class_id", classId);
      if (sectionId) params.set("section_id", sectionId);
      if (date) params.set("attendance_date", date);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiService.get(`${endpoint}${query}`);
      const attendance = listFromResponse(data);
      return { ...data, attendance, data: attendance };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  },

  getClassAttendance: async (classId, sectionId, date, roster = []) => {
    const rosterList = Array.isArray(roster)
      ? roster
      : roster?.students || roster?.data || [];
    const dateKey = toLocalDateKey(date);
    const rosterIds = new Set(rosterList.map((s) => studentRosterKey(s)).filter(Boolean));

    const data = await attendanceService.getAttendance({
      classId,
      date: dateKey,
    });

    const records = data.attendance.filter((record) => {
      const sameClass = !classId || String(record.classId || "") === String(classId);
      const sameDate = !dateKey || toLocalDateKey(record.date) === dateKey;
      const inRoster =
        !rosterIds.size || rosterIds.has(String(record.studentId || ""));
      return sameClass && sameDate && inRoster;
    });

    const attendanceByStudent = new Map(
      records.map((record) => [String(record.studentId), record])
    );

    const attendance = rosterList.map((student) => {
      const sid = studentRosterKey(student);
      return {
        student,
        attendance: attendanceByStudent.get(sid) || null,
      };
    });

    return { attendance, rawAttendance: records, date: dateKey };
  },

  getStudentAttendance: async (studentId, startDate, endDate) => {
    const data = await attendanceService.getAttendance({ studentId });
    const attendance = data.attendance.filter((record) =>
      isWithinDateRange(record, startDate, endDate)
    );

    return {
      ...data,
      attendance,
      statistics: calculateStatistics(attendance),
    };
  },

  getMonthlyReport: async (classKey, month, year) => {
    const parsed = parseClassKey(classKey);
    const classId = parsed?.classId ?? classKey;
    const sectionId = parsed?.sectionId ?? null;
    const academicYearId = parsed?.academicYearId ?? null;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = toLocalDateKey(new Date(Number(year), Number(month), 0));

    const rosterResponse = await studentService.getAllStudents({
      classId,
      sectionId: sectionId || undefined,
      academicYearId: academicYearId || undefined,
      limit: 500,
    });
    const roster = rosterResponse.students || [];
    const rosterIds = new Set(
      roster.map((s) => String(s._id || s.id || s.studentId)).filter(Boolean)
    );

    const data = await attendanceService.getAttendance({ classId });
    const attendance = data.attendance.filter((record) => {
      const inMonth = isWithinDateRange(record, startDate, endDate);
      const inRoster =
        !rosterIds.size || rosterIds.has(String(record.studentId || ""));
      return inMonth && inRoster;
    });

    const recordsByStudent = new Map();
    attendance.forEach((record) => {
      const sid = String(record.studentId);
      if (!recordsByStudent.has(sid)) recordsByStudent.set(sid, []);
      recordsByStudent.get(sid).push(record);
    });

    const studentAttendance = roster.map((student) => {
      const sid = String(student._id || student.id || student.studentId);
      const records = recordsByStudent.get(sid) || [];
      const statistics = calculateStatistics(records);
      const name =
        [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
        student.name ||
        "Student";
      return {
        student: {
          name,
          rollNo: student.rollNo || student.enrollmentNo || student.scholarNumber || "—",
        },
        statistics: {
          totalDays: statistics.totalDays,
          presentDays: statistics.presentDays,
          absentDays: statistics.absentDays,
          leaveDays: statistics.leaveDays,
          lateDays: 0,
          halfDays: 0,
          attendancePercentage: statistics.attendancePercentage,
        },
      };
    });

    const averageAttendance = studentAttendance.length
      ? Math.round(
          studentAttendance.reduce(
            (sum, row) => sum + (row.statistics.attendancePercentage || 0),
            0
          ) / studentAttendance.length
        )
      : 0;

    return {
      attendance,
      totalStudents: roster.length,
      averageAttendance,
      studentAttendance,
    };
  },
};
