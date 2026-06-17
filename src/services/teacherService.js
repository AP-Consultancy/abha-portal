import apiService from "./apiService";
import { studentService } from "./studentService";
import { attendanceService } from "./attendanceService";
import { examService } from "./examService";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  ACADEMIC_YEAR_OPTIONS,
  CLASS_OPTIONS,
} from "../utils/constants";

const getClassLabel = (classId) =>
  CLASS_OPTIONS.find((c) => String(c.value) === String(classId))?.label ||
  classId ||
  "";

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const resolveClassId = (teacher = {}) => {
  const direct = toNumberOrNull(teacher.classId || teacher.class_id || teacher.className);
  if (direct !== null) return direct;

  const byLabel = CLASS_OPTIONS.find(
    (option) =>
      String(option.label).toLowerCase() ===
      String(teacher.className || "").trim().toLowerCase()
  );
  return byLabel ? toNumberOrNull(byLabel.value) : null;
};

const resolveSectionId = (teacher = {}, classId) => {
  const rawSection = teacher.sectionId || teacher.section_id || teacher.section;
  const direct = toNumberOrNull(rawSection);
  if (direct !== null) return direct;

  const normalized = String(rawSection || "").trim().toUpperCase();
  const classNum = toNumberOrNull(classId);
  if (classNum === null) return null;
  if (normalized === "A") return classNum;
  if (normalized === "B") return classNum + 15;
  if (normalized === "C") return classNum + 30;
  return null;
};

const resolveAcademicYearId = (teacher = {}) => {
  const direct = toNumberOrNull(teacher.academicYearId || teacher.academic_year_id);
  if (direct !== null) return direct;
  return toNumberOrNull(ACADEMIC_YEAR_OPTIONS[0]?.value);
};

export const sectionIdToLabel = (sectionId, classId) => {
  const sid = toNumberOrNull(sectionId);
  const cid = toNumberOrNull(classId);
  if (sid === null || cid === null) return "";
  if (sid === cid) return "A";
  if (sid === cid + 15) return "B";
  if (sid === cid + 30) return "C";
  return "";
};

const splitName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const formatDateField = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.includes("T") ? str.split("T")[0] : str;
};

const normalizeTeacher = (teacher = {}) => {
  const firstName = teacher.firstName || teacher.first_name || "";
  const lastName = teacher.lastName || teacher.last_name || "";
  const name = teacher.name || [firstName, lastName].filter(Boolean).join(" ");

  return {
    ...teacher,
    _id: teacher._id || teacher.teacher_id || teacher.id,
    id: teacher.id || teacher.teacher_id,
    teacherId: teacher.teacherId || teacher.teacher_id || teacher.id,
    firstName: teacher.firstName || teacher.first_name || "",
    lastName: teacher.lastName || teacher.last_name || "",
    userId: teacher.userId || teacher.user_id,
    enrollmentNo: teacher.enrollmentNo || teacher.employee_id || teacher.teacher_code,
    name,
    firstName,
    lastName,
    email: teacher.email || "",
    contact: teacher.contact || teacher.phone || "",
    phone: teacher.phone || teacher.contact || "",
    alternateContact: teacher.alternateContact || teacher.alternate_contact_no || "",
    dob: formatDateField(teacher.dob || teacher.date_of_birth),
    joiningDate: formatDateField(teacher.joiningDate || teacher.joining_date),
    designation: teacher.designation || teacher.specialization || "Teacher",
    department: teacher.department || teacher.qualification || "",
    qualification: teacher.qualification || teacher.department || "",
    specialization: teacher.specialization || teacher.designation || "",
    salary: teacher.salary || "",
    classId: toNumberOrNull(teacher.classId || teacher.class_id),
    className: teacher.className || teacher.class_name || "",
    section: teacher.section || teacher.section_name || "",
    sectionId: toNumberOrNull(teacher.sectionId || teacher.section_id),
    subjectId: toNumberOrNull(teacher.subjectId || teacher.subject_id),
    academicYearId: toNumberOrNull(teacher.academicYearId || teacher.academic_year_id),
    isClassTeacher: Boolean(teacher.isClassTeacher || teacher.is_class_teacher),
    address: teacher.address || {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    status: teacher.status || "Active",
    assignments: teacher.assignments || [],
    assignedClasses: teacher.assignedClasses || [],
    assignedSubjects: teacher.assignedSubjects || [],
  };
};

const buildTeacherFromRows = (rows = []) => {
  if (!rows.length) return null;

  const base = normalizeTeacher(rows[0]);
  const assignments = rows.map((row) => ({
    assignmentId: row.assignment_id || row.assignmentId,
    classId: toNumberOrNull(row.class_id || row.classId),
    className: row.class_name || row.className || getClassLabel(row.class_id),
    sectionId: toNumberOrNull(row.section_id || row.sectionId),
    sectionName:
      row.section_name ||
      row.sectionName ||
      sectionIdToLabel(row.section_id, row.class_id),
    subjectId: toNumberOrNull(row.subject_id || row.subjectId),
    subjectName: row.subject_name || row.subjectName || "",
    academicYearId: toNumberOrNull(row.academic_year_id || row.academicYearId),
    academicYear: row.academic_year || row.academicYear || "",
    isClassTeacher: Boolean(row.is_class_teacher || row.isClassTeacher),
  }));

  const assignedClasses = assignments.map((a) => ({
    name: a.className,
    section: a.sectionName,
    classId: a.classId,
    sectionId: a.sectionId,
    studentCount: 0,
    room: a.isClassTeacher ? "Class Teacher" : "—",
  }));

  const subjectMap = new Map();
  assignments.forEach((a) => {
    if (a.subjectId && !subjectMap.has(String(a.subjectId))) {
      subjectMap.set(String(a.subjectId), {
        name: a.subjectName || `Subject ${a.subjectId}`,
        code: String(a.subjectId),
        grade: a.className,
      });
    }
  });

  const classSections = [
    ...new Set(
      assignments.map((a) =>
        [a.className, a.sectionName].filter(Boolean).join(" — Section ")
      )
    ),
  ].filter(Boolean);
  const subjectNames = [...subjectMap.values()].map((s) => s.name);
  const academicYears = [
    ...new Set(assignments.map((a) => a.academicYear).filter(Boolean)),
  ];
  const classTeacherOf = assignments
    .filter((a) => a.isClassTeacher)
    .map((a) =>
      [a.className, a.sectionName].filter(Boolean).join(" — Section ")
    );

  const primary = assignments[0];
  return {
    ...base,
    firstName: base.firstName || rows[0]?.first_name || "",
    lastName: base.lastName || rows[0]?.last_name || "",
    userId: base.userId || rows[0]?.user_id,
    classId: primary?.classId ?? base.classId,
    className: primary?.className ?? base.className,
    sectionId: primary?.sectionId ?? base.sectionId,
    section: primary?.sectionName ?? base.section,
    subjectId: primary?.subjectId ?? base.subjectId,
    academicYearId: primary?.academicYearId ?? base.academicYearId,
    academicYear: primary?.academicYear || academicYears[0] || "",
    assignments,
    assignedClasses,
    assignedSubjects: [...subjectMap.values()],
    assignmentCount: assignments.length,
    classesDisplay: classSections.join("; ") || "—",
    subjectsDisplay: subjectNames.join(", ") || "—",
    academicYearsDisplay: academicYears.join(", ") || "—",
    classTeacherDisplay: classTeacherOf.length ? classTeacherOf.join("; ") : "—",
    isClassTeacherAny: classTeacherOf.length > 0,
  };
};

const groupRowsByTeacher = (rows = []) => {
  const groups = new Map();
  rows.forEach((row) => {
    const key = String(row.teacher_id || row.teacherId || row.email || "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.values()].map(buildTeacherFromRows).filter(Boolean);
};

const rowsFromResponse = (data) => {
  const rows = data?.data ?? data?.teachers ?? data;
  return Array.isArray(rows) ? rows : rows ? [rows] : [];
};

const mapTeacherForManage = (teacher = {}, action, identity = {}) => {
  const { firstName, lastName } = splitName(teacher.name);
  const employeeId = String(
    teacher.enrollmentNo || teacher.employeeId || teacher.employee_id || ""
  ).trim();
  const classId = resolveClassId(teacher);
  const sectionId = resolveSectionId(teacher, classId);

  return {
    action,
    user_id: toNumberOrNull(identity.userId || teacher.userId),
    teacher_id: toNumberOrNull(
      identity.teacherId || identity.id || teacher.teacherId || teacher.id
    ),
    first_name: teacher.firstName || firstName || null,
    last_name: teacher.lastName || lastName || null,
    email: teacher.email?.trim() || null,
    phone: teacher.phone || teacher.contact || null,
    password: teacher.password || employeeId || teacher.email || null,
    employee_id: employeeId || null,
    qualification: teacher.qualification || teacher.department || null,
    joining_date: teacher.joiningDate || teacher.joining_date || null,
    salary: toNumberOrNull(teacher.salary),
    specialization: teacher.specialization || teacher.designation || null,
    assignment_id: toNumberOrNull(teacher.assignmentId || teacher.assignment_id),
    class_id: classId,
    section_id: sectionId,
    subject_id: toNumberOrNull(teacher.subjectId || teacher.subject_id),
    academic_year_id: resolveAcademicYearId(teacher),
    is_class_teacher: Boolean(teacher.isClassTeacher || teacher.is_class_teacher),
  };
};

export const teacherService = {
  getAllTeachers: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.TEACHERS);
      const teachers = groupRowsByTeacher(rowsFromResponse(data));
      return { ...data, teachers, data: teachers };
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw error;
    }
  },

  getTeacherById: async (teacherId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.TEACHERS}/${teacherId}`);
      const rows = rowsFromResponse(data);
      if (rows.length > 1 || rows[0]?.assignment_id) {
        return buildTeacherFromRows(rows);
      }
      return buildTeacherFromRows(rows) || normalizeTeacher(data.data || data.teacher || data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      throw error;
    }
  },

  getTeacherProfile: async (currentUser) => {
    const email = currentUser?.userData?.email || currentUser?.email;
    const userId = currentUser?.userData?.id || currentUser?.userData?._id;
    const teacherId =
      currentUser?.userData?.teacherId || currentUser?.teacher?.teacherId;

    if (teacherId) {
      const byTeacherId = await teacherService.getTeacherById(teacherId);
      if (byTeacherId?.teacherId || byTeacherId?.id) return byTeacherId;
    }

    try {
      const data = await apiService.get(API_ENDPOINTS.TEACHERS);
      const rows = rowsFromResponse(data).filter(
        (row) =>
          (userId && String(row.user_id) === String(userId)) ||
          (email &&
            String(row.email || "").toLowerCase() === String(email).toLowerCase())
      );
      return buildTeacherFromRows(rows);
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      return null;
    }
  },

  getTeacherDashboard: async (currentUser) => {
    const empty = {
      teacherName: "Teacher",
      totalStudents: 0,
      assignedClasses: [],
      assignedSubjects: [],
      todaySchedule: [],
      recentAttendance: [],
      upcomingExams: [],
    };

    try {
      const teacher = await teacherService.getTeacherProfile(currentUser);
      if (!teacher) return empty;

      const teacherName = teacher.name || [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
      const academicYearId =
        teacher.academicYearId || toNumberOrNull(ACADEMIC_YEAR_OPTIONS[0]?.value);

      const assignmentKeys = new Set(
        (teacher.assignments || []).map((a) => `${a.classId}-${a.sectionId}`)
      );

      let totalStudents = 0;
      const assignedClasses = [];

      for (const cls of teacher.assignedClasses || []) {
        const students = await studentService.getAllStudents({
          classId: cls.classId,
          sectionId: cls.sectionId,
          academicYearId,
        });
        const count = students.total ?? students.students?.length ?? 0;
        totalStudents += count;
        assignedClasses.push({ ...cls, studentCount: count });
      }

      const todaySchedule = (teacher.assignments || []).map((a) => ({
        subject: a.subjectName || "Subject",
        time: "Today",
        class: `${a.className} — Section ${a.sectionName}`,
        room: a.isClassTeacher ? "Class Teacher" : "—",
      }));

      const attendanceRes = await attendanceService.getAttendance();
      const recentMap = new Map();

      (attendanceRes.attendance || []).forEach((record) => {
        const key = `${record.classId}-${record.sectionId}`;
        if (!assignmentKeys.has(key)) return;

        const dateStr = record.date
          ? (() => {
              const d = new Date(record.date);
              if (Number.isNaN(d.getTime())) return String(record.date).slice(0, 10);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            })()
          : "";
        const groupKey = `${key}-${dateStr}`;
        if (!recentMap.has(groupKey)) {
          recentMap.set(groupKey, {
            class: `${getClassLabel(record.classId)} — Section ${sectionIdToLabel(
              record.sectionId,
              record.classId
            )}`,
            date: dateStr,
            present: 0,
            total: 0,
          });
        }
        const group = recentMap.get(groupKey);
        group.total += 1;
        if (record.status === "Present") group.present += 1;
      });

      const recentAttendance = [...recentMap.values()]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 5);

      let upcomingExams = [];
      const tid = teacher.teacherId || teacher.id || teacher._id;
      if (tid) {
        try {
          const examRes = await examService.getTeacherExams(tid);
          upcomingExams = (examRes.exams || [])
            .filter((e) => e.status === "Scheduled")
            .slice(0, 5);
        } catch {
          upcomingExams = [];
        }
      }

      return {
        teacherName: teacherName || "Teacher",
        totalStudents,
        assignedClasses,
        assignedSubjects: teacher.assignedSubjects || [],
        todaySchedule,
        recentAttendance,
        upcomingExams,
      };
    } catch (error) {
      console.error("Error building teacher dashboard:", error);
      return empty;
    }
  },

  createTeacher: async (teacherData) => {
    try {
      return await apiService.post(
        API_ENDPOINTS.MANAGE_TEACHER,
        mapTeacherForManage(teacherData, 1)
      );
    } catch (error) {
      console.error("Error creating teacher:", error);
      throw error;
    }
  },

  bulkUploadTeachers: async (file) => {
    const formData = new FormData();
    formData.append("csvFile", file);

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TEACHER_BULK_UPLOAD}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      let message = result.message || "Teacher bulk upload failed";
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        const preview = result.errors
          .slice(0, 5)
          .map((e) => {
            const row = e.row ? `Row ${e.row}` : "Row ?";
            const reasons = Array.isArray(e.errors) ? e.errors.join("; ") : "Invalid row";
            return `${row}: ${reasons}`;
          })
          .join(" | ");
        const more =
          result.errors.length > 5
            ? ` (+${result.errors.length - 5} more)`
            : "";
        message = `${message} — ${preview}${more}`;
      }
      throw new Error(message);
    }

    return result;
  },

  updateTeacher: async (enrollmentNo, teacherData) => {
    try {
      const { className, section, subjectId, academicYearId, isClassTeacher, ...profile } =
        teacherData;
      return await apiService.post(
        API_ENDPOINTS.MANAGE_TEACHER,
        mapTeacherForManage(
          { ...profile, enrollmentNo: teacherData.enrollmentNo || enrollmentNo },
          2,
          teacherData
        )
      );
    } catch (error) {
      console.error("Error updating teacher:", error);
      throw error;
    }
  },

  addTeacherAssignment: async (teacherId, assignmentData) => {
    try {
      return await apiService.post(
        API_ENDPOINTS.MANAGE_TEACHER,
        mapTeacherForManage({ ...assignmentData, teacherId, id: teacherId }, 4, {
          ...assignmentData,
          teacherId,
          id: teacherId,
        })
      );
    } catch (error) {
      console.error("Error adding teacher assignment:", error);
      throw error;
    }
  },

  removeTeacherAssignment: async (assignmentId, teacher = {}) => {
    try {
      return await apiService.post(API_ENDPOINTS.MANAGE_TEACHER, {
        action: 5,
        assignment_id: assignmentId,
        teacher_id: teacher.teacherId || teacher.id,
        user_id: teacher.userId,
      });
    } catch (error) {
      console.error("Error removing teacher assignment:", error);
      throw error;
    }
  },

  deleteTeacher: async (teacher) => {
    try {
      return await apiService.post(
        API_ENDPOINTS.MANAGE_TEACHER,
        mapTeacherForManage(teacher, 3, teacher)
      );
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error;
    }
  },

  changePassword: async () => {
    throw new Error("Teacher change-password API is not available in backend yet.");
  },

  updateResignationStatus: async () => {
    throw new Error("Teacher resignation-status API is not available in backend yet.");
  },
};
