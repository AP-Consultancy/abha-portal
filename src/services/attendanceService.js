import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

const normalizeStatus = (status) => {
  const normalized = String(status || "Present").toLowerCase();
  if (normalized === "absent") return "Absent";
  if (normalized === "late") return "Late";
  if (normalized === "half day" || normalized === "half_day") return "Half Day";
  return "Present";
};

const normalizeRecord = (record = {}) => ({
  ...record,
  _id: record._id || record.attendance_id || record.id,
  id: record.id || record.attendance_id,
  studentId: record.studentId || record.student_id,
  classId: record.classId || record.class_id,
  sectionId: record.sectionId || record.section_id,
  date: record.date || record.attendance_date,
  status: normalizeStatus(record.status || record.attendance_status),
  remarks: record.remarks || "",
  markedBy: record.markedBy || record.marked_by,
});

const calculateStatistics = (attendance) => {
  const stats = attendance.reduce(
    (acc, record) => {
      acc.totalDays += 1;
      if (record.status === "Present") acc.presentDays += 1;
      if (record.status === "Absent") acc.absentDays += 1;
      if (record.status === "Late") acc.lateDays += 1;
      if (record.status === "Half Day") acc.halfDays += 1;
      return acc;
    },
    {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      attendancePercentage: 0,
    }
  );

  stats.attendancePercentage = stats.totalDays
    ? Math.round(((stats.presentDays + stats.lateDays * 0.5 + stats.halfDays * 0.5) / stats.totalDays) * 100)
    : 0;

  return stats;
};

const listFromResponse = (data) => {
  const rows = data.attendance || data.data || data || [];
  return Array.isArray(rows) ? rows.map(normalizeRecord) : [];
};

const isWithinDateRange = (record, startDate, endDate) => {
  if (!record.date || (!startDate && !endDate)) return true;
  const recordDate = new Date(record.date).toISOString().split("T")[0];
  if (startDate && recordDate < startDate) return false;
  if (endDate && recordDate > endDate) return false;
  return true;
};

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
        status: status || "Present",
        marked_by: markedBy || null,
        remarks: remarks || null,
      };
      const data = await apiService.post(API_ENDPOINTS.MANAGE_ATTENDANCE, payload);
      return data;
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  markBulkAttendance: async ({ classId, sectionId, date, attendanceData, markedBy }) => {
    try {
      const results = await Promise.all(
        attendanceData.map((entry) =>
          attendanceService.markAttendance({
            studentId: entry.studentId,
            classId,
            sectionId: sectionId || entry.sectionId || null,
            date,
            status: entry.status || "Present",
            markedBy,
            remarks: entry.remarks || null,
            attendanceId: entry.attendanceId || null,
            action: entry.attendanceId ? 2 : 1,
          })
        )
      );
      return { success: true, message: "Bulk attendance saved successfully", results };
    } catch (error) {
      console.error("Error marking bulk attendance:", error);
      throw error;
    }
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

  getAttendance: async ({ attendanceId, studentId } = {}) => {
    try {
      const endpoint = attendanceId
        ? `${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`
        : API_ENDPOINTS.ATTENDANCE;
      const query = studentId ? `?${new URLSearchParams({ student_id: studentId })}` : "";
      const data = await apiService.get(`${endpoint}${query}`);
      const attendance = listFromResponse(data);
      return { ...data, attendance, data: attendance };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  },

  getClassAttendance: async (classId, date, roster = []) => {
    const data = await attendanceService.getAttendance();
    const records = data.attendance.filter((record) => {
      const sameClass = !classId || String(record.classId || "") === String(classId);
      const recordDate = record.date
        ? new Date(record.date).toISOString().split("T")[0]
        : "";
      const sameDate = !date || recordDate === date;
      return sameClass && sameDate;
    });

    const attendanceByStudent = new Map(
      records.map((record) => [String(record.studentId), record])
    );

    const attendance = roster.map((student) => ({
      student,
      attendance: attendanceByStudent.get(String(student._id || student.id || student.studentId)) || null,
    }));

    return { attendance, rawAttendance: records };
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

  getMonthlyReport: async (classId, month, year) => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(Number(year), Number(month), 0)
      .toISOString()
      .split("T")[0];
    const data = await attendanceService.getAttendance();
    const attendance = data.attendance.filter(
      (record) =>
        String(record.classId || "") === String(classId) &&
        isWithinDateRange(record, startDate, endDate)
    );

    return {
      attendance,
      totalStudents: new Set(attendance.map((record) => record.studentId)).size,
      studentAttendance: [],
    };
  },
};
