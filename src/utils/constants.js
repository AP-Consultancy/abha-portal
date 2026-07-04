export const STUDENT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  TRANSFERRED: "Transferred",
  GRADUATED: "Graduated",
  DROPPED: "Dropped",
};

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const BLOOD_GROUP_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const SECTION_OPTIONS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
];

export const SUBJECT_OPTIONS = [
  { value: "1", label: "Mathematics" },
  { value: "2", label: "Science" },
  { value: "3", label: "English" },
  { value: "4", label: "Hindi" },
  { value: "5", label: "Computer" },
];

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "1", label: "2026-27", isActive: true },
];

// Mirrors your PostgreSQL `classes` master table (class_id -> class_name)
export const CLASS_OPTIONS = [
  { value: "1", label: "Nursery" },
  { value: "2", label: "KG1" },
  { value: "3", label: "KG2" },
  { value: "4", label: "1st" },
  { value: "5", label: "2nd" },
  { value: "6", label: "3rd" },
  { value: "7", label: "4th" },
  { value: "8", label: "5th" },
  { value: "9", label: "6th" },
  { value: "10", label: "7th" },
  { value: "11", label: "8th" },
  { value: "12", label: "9th" },
  { value: "13", label: "10th" },
  { value: "14", label: "11th" },
  { value: "15", label: "12th" },
];

export const STATUS_OPTIONS = [
  { value: STUDENT_STATUS.ACTIVE, label: "Active" },
  { value: STUDENT_STATUS.INACTIVE, label: "Inactive" },
  { value: STUDENT_STATUS.TRANSFERRED, label: "Transferred" },
  { value: STUDENT_STATUS.GRADUATED, label: "Graduated" },
  { value: STUDENT_STATUS.DROPPED, label: "Dropped" },
];

export const FORM_STYLES = {
  labelClasses: "block text-sm font-medium text-gray-700 mb-2",
  inputClasses:
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm",
};

export const INITIAL_FORM_DATA = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dob: "",
  aadhaarNo: "",
  sssmid: "",
  panNo: "",
  apaarId: "",
  className: "",
  section: "",
  admissionDate: "",
  admissionNo: "",
  rollNo: "",
  phone: "",
  alternateContactNo: "",
  email: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  father: {
    name: "",
    phone: "",
    email: "",
    relation: "Father",
  },
  mother: {
    name: "",
    phone: "",
    email: "",
    relation: "Mother",
  },
  guardian: {
    name: "",
    phone: "",
    email: "",
    relation: "",
  },
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  GET_ALL_STUDENTS: "/api/students",
  STUDENT_REPORT: "/api/students/report",
  MANAGE_STUDENT: "/api/students/manage",
  UPDATE_STUDENT: () => "/api/students/manage",
  DELETE_STUDENT: () => "/api/students/manage",
  // Auth endpoints
  LOGIN: "/api/auth/login",
  // Student endpoints
  STUDENT_PROFILE: "/api/students/profile",
  STUDENT_CHANGE_PASSWORD: "/api/students/change-password",
  STUDENT_BULK_UPLOAD: "/api/students/bulk-upload",
  // Teacher endpoints
  TEACHERS: "/api/teachers",
  MANAGE_TEACHER: "/api/teachers/manage",
  TEACHER_BULK_UPLOAD: "/api/teachers/bulk-upload",
  // Admin endpoints
  ADMIN_PROFILE: "/api/admin/profile",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  // Attendance endpoints
  ATTENDANCE: "/api/attendance",
  MANAGE_ATTENDANCE: "/api/attendance/manage",
  TEACHER_ATTENDANCE: "/api/teacher-attendance",
  MANAGE_TEACHER_ATTENDANCE: "/api/teacher-attendance/manage",
  // Salary endpoints
  SALARY: "/api/salary",
  MANAGE_SALARY: "/api/salary/manage",
  SALARY_GENERATE: "/api/salary/generate",
  // Fee endpoints
  FEES: "/api/fees",
  FEES_ME: "/api/fees/me",
  PAYMENTS: "/api/payments",
  MANAGE_PAYMENT: "/api/payments/manage",
  // Class endpoints
  CLASSES: "/api/classes",
  // Subject endpoints
  SUBJECTS: "/api/subjects",
  // Exam endpoints
  EXAMS: "/api/exams",
  EXAM_RESULTS: (examId) => `/api/exams/${examId}/results`,
  STUDENT_EXAM_RESULTS: (studentId) => `/api/exams/student/${studentId}/results`,
  TIMETABLE_CLASS: (classId) => `/api/timetable/class/${classId}`,
  TIMETABLE_STUDENT: (id) => `/api/timetable/student/${id}`,
  TIMETABLE_TEACHER: (id) => `/api/timetable/teacher/${id}`,
  STUDENT_DASHBOARD: "/api/students/dashboard",
  // Homework endpoints
  HOMEWORK: "/api/homework",
  PERFORMANCE: "/api/performance",
  PERFORMANCE_STUDENT: (studentId) => `/api/performance/student/${studentId}`,
  PERFORMANCE_ME: "/api/performance/me",
  RULES: "/api/rules",
  RULE_STATUS: (id) => `/api/rules/${id}/status`,
  // Promotion endpoints
  PROMOTION_ELIGIBILITY: (studentId) => `/api/promotions/eligibility/${studentId}`,
  PROMOTE_STUDENT: (studentId) => `/api/promotions/promote/${studentId}`,
  BULK_PROMOTE: "/api/promotions/bulk-promote",
  PROMOTION_HISTORY: (studentId) => `/api/promotions/history/${studentId}`,
  ELIGIBLE_STUDENTS: "/api/promotions/eligible-students",
};
