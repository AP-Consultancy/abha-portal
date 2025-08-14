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
  { value: "D", label: "D" },
  { value: "E", label: "E" },
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
  bloodGroup: "",
  religion: "",
  caste: "",
  nationality: "",
  photoUrl: "",
  className: "",
  section: "",
  academicYear: "",
  admissionDate: "",
  rollNo: "",
  phone: "",
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
  transportOpted: false,
  busRoute: "",
  pickupPoint: "",
  medicalConditions: "",
  status: STUDENT_STATUS.ACTIVE,
  createdBy: "",
  remarks: "",
};

export const API_BASE_URL = "http://localhost:5000";

export const API_ENDPOINTS = {
  GET_ALL_STUDENTS: "/api/student/getallstudents",
  UPDATE_STUDENT: (enrollmentNo) =>
    `/api/student/update-student/${enrollmentNo}`,
  // Auth endpoints
  LOGIN: "/api/auth/login",
  // Student endpoints
  STUDENT_PROFILE: "/api/student/profile",
  STUDENT_CHANGE_PASSWORD: "/api/student/change-password",
  STUDENT_BULK_UPLOAD: "/api/student/bulk-upload",
  // Teacher endpoints
  TEACHER_PROFILE: "/api/teachers/profile",
  TEACHER_CHANGE_PASSWORD: "/api/teachers/change-password",
  TEACHER_RESIGNATION_STATUS: (enrollmentNo) => `/api/teachers/${enrollmentNo}/resignation-status`,
  // Admin endpoints
  ADMIN_PROFILE: "/api/admin/profile",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  // Fee endpoints
  FEES: "/api/fees",
  PAYMENTS: "/api/payments",
  // Class endpoints
  CLASSES: "/api/classes",
  // Subject endpoints
  SUBJECTS: "/api/subjects",
  // Exam endpoints
  EXAMS: "/api/exams",
  EXAM_RESULTS: (examId) => `/api/exams/${examId}/results`,
  STUDENT_EXAM_RESULTS: (studentId) => `/api/exams/student/${studentId}/results`,
  // Promotion endpoints
  PROMOTION_ELIGIBILITY: (studentId) => `/api/promotions/eligibility/${studentId}`,
  PROMOTE_STUDENT: (studentId) => `/api/promotions/promote/${studentId}`,
  BULK_PROMOTE: "/api/promotions/bulk-promote",
  PROMOTION_HISTORY: (studentId) => `/api/promotions/history/${studentId}`,
  ELIGIBLE_STUDENTS: "/api/promotions/eligible-students",
};
