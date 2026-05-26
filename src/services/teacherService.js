import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

const splitName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeTeacher = (teacher = {}) => {
  const firstName = teacher.firstName || teacher.first_name || "";
  const lastName = teacher.lastName || teacher.last_name || "";
  const name = teacher.name || [firstName, lastName].filter(Boolean).join(" ");

  return {
    ...teacher,
    _id: teacher._id || teacher.teacher_id || teacher.id,
    id: teacher.id || teacher.teacher_id,
    teacherId: teacher.teacherId || teacher.teacher_id,
    userId: teacher.userId || teacher.user_id,
    enrollmentNo: teacher.enrollmentNo || teacher.employee_id || teacher.teacher_code,
    name,
    firstName,
    lastName,
    email: teacher.email || "",
    contact: teacher.contact || teacher.phone || "",
    phone: teacher.phone || teacher.contact || "",
    alternateContact: teacher.alternateContact || teacher.alternate_contact_no || "",
    dob: teacher.dob || teacher.date_of_birth || "",
    joiningDate: teacher.joiningDate || teacher.joining_date || "",
    designation: teacher.designation || teacher.specialization || "Teacher",
    department: teacher.department || teacher.qualification || "",
    qualification: teacher.qualification || teacher.department || "",
    specialization: teacher.specialization || teacher.designation || "",
    salary: teacher.salary || "",
    address: teacher.address || {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    status: teacher.status || "Active",
  };
};

const mapTeacherForManage = (teacher = {}, action, identity = {}) => {
  const { firstName, lastName } = splitName(teacher.name);

  return {
    action,
    user_id: identity.userId || teacher.userId || null,
    teacher_id: identity.teacherId || identity.id || teacher.teacherId || teacher.id || null,
    first_name: teacher.firstName || firstName || null,
    last_name: teacher.lastName || lastName || null,
    email: teacher.email || null,
    phone: teacher.phone || teacher.contact || null,
    password: teacher.password || teacher.enrollmentNo || teacher.email || "teacher@123",
    employee_id: teacher.enrollmentNo || teacher.employeeId || teacher.employee_id || null,
    qualification: teacher.qualification || teacher.department || null,
    joining_date: teacher.joiningDate || teacher.joining_date || null,
    salary: teacher.salary || null,
    specialization: teacher.specialization || teacher.designation || null,
    assignment_id: teacher.assignmentId || teacher.assignment_id || null,
    class_id: teacher.classId || teacher.class_id || null,
    section_id: teacher.sectionId || teacher.section_id || null,
    subject_id: teacher.subjectId || teacher.subject_id || null,
    academic_year_id: teacher.academicYearId || teacher.academic_year_id || null,
    is_class_teacher: Boolean(teacher.isClassTeacher || teacher.is_class_teacher),
  };
};

const listFromResponse = (data) => {
  const teachers = data.teachers || data.data || data || [];
  return Array.isArray(teachers) ? teachers.map(normalizeTeacher) : [];
};

export const teacherService = {
  getAllTeachers: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.TEACHERS);
      const teachers = listFromResponse(data);
      return { ...data, teachers, data: teachers };
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw error;
    }
  },

  getTeacherById: async (teacherId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.TEACHERS}/${teacherId}`);
      const teachers = listFromResponse(data);
      return teachers[0] || normalizeTeacher(data.data || data.teacher || data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      throw error;
    }
  },

  getTeacherProfile: async (currentUser) => {
    const teacherId =
      currentUser?.userData?.teacherId ||
      currentUser?.teacher?.teacherId ||
      currentUser?.userData?._id ||
      currentUser?.teacher?._id;

    if (teacherId) {
      return teacherService.getTeacherById(teacherId);
    }

    const allTeachers = await teacherService.getAllTeachers();
    const email = currentUser?.userData?.email || currentUser?.email;
    return allTeachers.teachers.find((teacher) => teacher.email === email) || null;
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

  updateTeacher: async (enrollmentNo, teacherData) => {
    try {
      return await apiService.post(
        API_ENDPOINTS.MANAGE_TEACHER,
        mapTeacherForManage(
          { ...teacherData, enrollmentNo: teacherData.enrollmentNo || enrollmentNo },
          2,
          teacherData
        )
      );
    } catch (error) {
      console.error("Error updating teacher:", error);
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
