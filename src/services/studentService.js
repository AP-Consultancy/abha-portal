import apiService from "./apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";
import { resolveClassId as resolveClassIdFromInput, resolveSectionId as resolveSectionIdFromInput } from "../utils/classSectionResolve";
import { resolveSectionIdForClass, sectionIdToLabel } from "../utils/studentUtils";

export const STUDENT_PAGE_SIZE = 25;

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

/** Supports Add Student form (class id + section letter) and CSV (8th, Section A). */
const resolveClassId = (student = {}) =>
  resolveClassIdFromInput(
    student.classId ?? student.class_id ?? student.className ?? ""
  );

const resolveSectionId = (student = {}, classId) =>
  resolveSectionIdFromInput(
    student.sectionId ?? student.section_id ?? student.section ?? "",
    classId
  );

const normalizeGender = (gender) => {
  const value = String(gender || "").trim().toLowerCase();
  if (value === "male") return "MALE";
  if (value === "female") return "FEMALE";
  if (value === "other") return "OTHER";
  return null;
};

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.classId) params.set("class_id", filters.classId);

  const sectionLetter = filters.section || filters.sectionLetter;
  if (sectionLetter && filters.classId) {
    const resolved = resolveSectionIdForClass(filters.classId, sectionLetter);
    if (resolved !== null) params.set("section_id", String(resolved));
  } else if (filters.sectionId) {
    params.set("section_id", filters.sectionId);
  }

  if (filters.academicYearId) {
    params.set("academic_year_id", filters.academicYearId);
  }

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : "";
};

const mapStudentForManage = (student = {}, action, identity = {}) => {
  const classId = resolveClassId(student);
  const sectionId = resolveSectionId(student, classId);

  return {
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
    class_id: classId,
    section_id: sectionId,
    student_name: student.studentName || fullName(student),
    father_name: student.fatherName || student.father?.name || null,
    mother_name: student.motherName || student.mother?.name || null,
    gender: normalizeGender(student.gender),
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
  };
};

const normalizeStudent = (student = {}) => {
  const nameParts = (student.student_name || "").trim().split(/\s+/).filter(Boolean);

  // UI expects "Male" / "Female" / "Other" (see BasicInfoForm gender options)
  const normalizeGenderForUI = (g) => {
    const v = String(g || "").trim().toLowerCase();
    if (!v) return "";
    if (v === "male") return "Male";
    if (v === "female") return "Female";
    if (v === "other") return "Other";
    return g;
  };

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
    gender: normalizeGenderForUI(student.gender),
    dob: student.dob || student.date_of_birth,
    className: student.className || student.class_name || student.class || "",
    section:
      student.section ||
      student.section_name ||
      sectionIdToLabel(
        student.section_id || student.sectionId,
        student.class_id || student.classId
      ) ||
      "",
    academicYear: student.academicYear || student.academic_year || student.academic_year_name || "",
    admissionDate: student.admissionDate || student.admission_date,
    rollNo: student.rollNo || student.roll_no || "",
    phone: student.phone || student.contact_no || "",
    alternateContactNo: student.alternateContactNo || student.alternate_contact_no || "",
    aadhaarNo: student.aadhaarNo || student.aadhaar_no || "",
    sssmid: student.sssmid || student.sssmid || null,
    panNo: student.panNo || student.pan_no || "",
    apaarId: student.apaarId || student.apaar_id || "",
    admissionNo: student.admissionNo || student.admission_no || "",
    studentName: student.studentName || student.student_name || "",
    email: student.email || student.student_email || student.user_email || "",
    userPhone: student.userPhone || student.user_phone || "",
    monthlyFee: student.monthly_fee ?? student.monthlyFee ?? "",
    yearlyFee: student.yearly_fee ?? student.yearlyFee ?? "",
    totalPaid: student.total_paid ?? student.totalPaid ?? "",
    remainingFee: student.remaining_fee ?? student.remainingFee ?? "",
    totalPresent: student.total_present ?? student.totalPresent ?? "",
    totalAbsent: student.total_absent ?? student.totalAbsent ?? "",
    attendancePercentage: student.attendance_percentage ?? student.attendancePercentage ?? "",
    totalTransactions: student.total_transactions ?? student.totalTransactions ?? "",
    lastPaymentDate: student.last_payment_date ?? student.lastPaymentDate ?? null,
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
    status:
      student.status ||
      (student.student_active === false ? "Inactive" : "Active"),
  };
};

export const studentService = {
  async getAllStudents(filters = {}) {
    try {
      const queryFilters = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || STUDENT_PAGE_SIZE,
      };

      const reportPath = `${API_ENDPOINTS.STUDENT_REPORT}${buildQueryString(queryFilters)}`;
      const data = await apiService.get(reportPath, { cache: "no-store" });

      const rows = data?.data || data?.students || [];

      return {
        students: rows.map(normalizeStudent),
        total: data?.total ?? rows.length,
        page: data?.page ?? queryFilters.page,
        limit: data?.limit ?? queryFilters.limit,
        totalPages: data?.totalPages ?? 1,
      };
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
      throw new Error(error.message || "Failed to create student. Please try again.");
    }
  },

  async updateStudent(enrollmentNo, updateData) {
    try {
      return await apiService.post(
        API_ENDPOINTS.UPDATE_STUDENT(enrollmentNo),
        mapStudentForManage(updateData, 2, {
          studentId: updateData.studentId || updateData.id,
          userId: updateData.userId,
        })
      );
    } catch (error) {
      console.error("Error updating student:", error);
      throw new Error(error.message || "Failed to update student. Please try again.");
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

  async bulkUploadStudents(fileOrRows) {
    try {
      const isFile =
        fileOrRows &&
        typeof File !== "undefined" &&
        fileOrRows instanceof File;

      if (isFile || (fileOrRows && fileOrRows.name && fileOrRows.text)) {
        const formData = new FormData();
        formData.append("csvFile", fileOrRows);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.STUDENT_BULK_UPLOAD}`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          let message = data.message || "Bulk upload failed";
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            const preview = data.errors
              .slice(0, 5)
              .map((e) => `Row ${e.row}: ${(e.errors || []).join("; ")}`)
              .join(" | ");
            message = `${message} — ${preview}`;
          }
          throw new Error(message);
        }
        return data;
      }

      const rows = Array.isArray(fileOrRows) ? fileOrRows : [];
      const data = await apiService.post(API_ENDPOINTS.STUDENT_BULK_UPLOAD, {
        students: rows,
      });
      return data || { success: true };
    } catch (error) {
      console.error("Error bulk uploading students:", error);
      throw new Error(error.message || "Failed to bulk upload students");
    }
  },

  async getStudentProfile() {
    try {
      const data = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);
      const raw = data.student || data.data;
      if (!raw) {
        throw new Error("Student profile not found");
      }
      return normalizeStudent(raw);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw new Error("Failed to load student profile. Please try again.");
    }
  },
};
