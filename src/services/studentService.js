import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

const compact = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || null;
};

const fullName = (student) =>
  compact([student.firstName, student.middleName, student.lastName]);

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.classId) params.set("class_id", filters.classId);
  if (filters.sectionId) params.set("section_id", filters.sectionId);
  if (filters.academicYearId) {
    params.set("academic_year_id", filters.academicYearId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const mapStudentForManage = (student = {}, action, identity = {}) => ({
  action,
  student_id: toNumberOrNull(identity.studentId || identity.id || student.studentId || student.id),
  user_id: toNumberOrNull(identity.userId || student.userId),
  first_name: student.firstName || null,
  last_name: compact([student.middleName, student.lastName]) || student.lastName || null,
  email: student.email || null,
  phone: student.phone || student.father?.phone || null,
  password: student.password || student.scholarNumber || student.enrollmentNo || "student@123",
  admission_no: student.admissionNo || student.enrollmentNo || student.scholarNumber || null,
  scholar_no: student.scholarNo || student.scholarNumber || student.enrollmentNo || null,
  roll_no: student.rollNo || null,
  class_id: toNumberOrNull(student.classId || student.class_id || student.className),
  section_id: toNumberOrNull(student.sectionId || student.section_id || student.section),
  student_name: student.studentName || fullName(student),
  father_name: student.fatherName || student.father?.name || null,
  mother_name: student.motherName || student.mother?.name || null,
  gender: student.gender || null,
  date_of_birth: student.dateOfBirth || student.dob || null,
  aadhaar_no: student.aadhaarNo || null,
  sssmid: student.sssmid || null,
  pan_no: student.panNo || null,
  apaar_id: student.apaarId || null,
  contact_no: student.contactNo || student.phone || student.father?.phone || null,
  alternate_contact_no:
    student.alternateContactNo || student.mother?.phone || student.guardian?.phone || null,
  address:
    typeof student.address === "string"
      ? student.address
      : compact([
          student.address?.street,
          student.address?.city,
          student.address?.state,
          student.address?.postalCode,
          student.address?.country,
        ]),
  city: student.city || student.address?.city || null,
  state: student.state || student.address?.state || null,
  pincode: student.pincode || student.address?.postalCode || null,
  admission_date: student.admissionDate || null,
});

const normalizeStudent = (student = {}) => {
  const nameParts = (student.student_name || "").trim().split(/\s+/).filter(Boolean);
  return {
    ...student,
    _id: student._id || student.student_id || student.id || student.scholar_no,
    id: student.id || student.student_id,
    studentId: student.studentId || student.student_id,
    userId: student.userId || student.user_id,
    classId: student.classId || student.class_id,
    sectionId: student.sectionId || student.section_id,
    academicYearId: student.academicYearId || student.academic_year_id,
    enrollmentNo: student.enrollmentNo || student.admission_no || student.scholar_no,
    scholarNumber: student.scholarNumber || student.scholar_no || student.admission_no,
    firstName: student.firstName || student.first_name || nameParts[0] || "",
    middleName: student.middleName || "",
    lastName:
      student.lastName ||
      student.last_name ||
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""),
    gender: student.gender || "",
    dob: student.dob || student.date_of_birth,
    className: student.className || student.class_name || student.class || student.class_id || "",
    section: student.section || student.section_name || student.section_id || "",
    academicYear: student.academicYear || student.academic_year || student.academic_year_name || "",
    admissionDate: student.admissionDate || student.admission_date,
    rollNo: student.rollNo || student.roll_no || "",
    phone: student.phone || student.contact_no || "",
    email: student.email || "",
    address: {
      street: student.address?.street || student.address || "",
      city: student.address?.city || student.city || "",
      state: student.address?.state || student.state || "",
      postalCode: student.address?.postalCode || student.pincode || "",
      country: student.address?.country || "India",
    },
    father: {
      name: student.father?.name || student.father_name || "",
      phone: student.father?.phone || "",
      email: student.father?.email || "",
      relation: "Father",
    },
    mother: {
      name: student.mother?.name || student.mother_name || "",
      phone: student.mother?.phone || student.alternate_contact_no || "",
      email: student.mother?.email || "",
      relation: "Mother",
    },
    guardian: student.guardian || { name: "", phone: "", email: "", relation: "" },
    transportOpted: Boolean(student.transportOpted || student.transport_opted),
    busRoute: student.busRoute || student.bus_route || "",
    pickupPoint: student.pickupPoint || student.pickup_point || "",
    medicalConditions: Array.isArray(student.medicalConditions)
      ? student.medicalConditions
      : compact(student.medical_conditions)?.split(",").map((item) => item.trim()).filter(Boolean) || [],
    status: student.status || "Active",
  };
};

export const studentService = {
  async getAllStudents(filters = {}) {
    try {
      const data = await apiService.get(
        `${API_ENDPOINTS.STUDENT_REPORT}${buildQueryString(filters)}`
      );
      const students = data.students || data.data || [];
      console.log("Fetched Students:", students);
      return students.map(normalizeStudent);
    } catch (error) {
      console.error("Error fetching all students:", error);
      throw new Error(
        "Failed to load students. Please check your server connection."
      );
    }
  },

  async createStudent(studentData) {
    try {
      return await apiService.post(
        API_ENDPOINTS.MANAGE_STUDENT,
        mapStudentForManage(studentData, 1)
      );
    } catch (error) {
      console.error("Error creating student:", error);
      throw new Error("Failed to create student. Please try again.");
    }
  },

  async updateStudent(enrollmentNo, updateData) {
    try {
      return await apiService.post(
        API_ENDPOINTS.UPDATE_STUDENT(enrollmentNo),
        mapStudentForManage(updateData, 2, {
          id: updateData.studentId || updateData.id,
          userId: updateData.userId,
        })
      );
    } catch (error) {
      console.error("Error updating student:", error);
      throw new Error("Failed to update student. Please try again.");
    }
  },

  async deleteStudent(student) {
    try {
      return await apiService.post(
        API_ENDPOINTS.DELETE_STUDENT(student.enrollmentNo || student.id),
        mapStudentForManage(student, 3, student)
      );
    } catch (error) {
      console.error("Error deleting student:", error);
      throw new Error("Failed to delete student. Please try again.");
    }
  },

  async getStudentProfile() {
    try {
      return await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw new Error("Failed to load student profile. Please try again.");
    }
  },
};
