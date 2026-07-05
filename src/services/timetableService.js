import apiService from "./apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";

export const timetableService = {
  getClassTimetable: async (classId) => {
    const data = await apiService.get(API_ENDPOINTS.TIMETABLE_CLASS(classId));
    return data;
  },

  getStudentTimetable: async (studentId) => {
    const data = await apiService.get(API_ENDPOINTS.TIMETABLE_STUDENT(studentId));
    return data;
  },

  getTeacherTimetable: async (teacherId) => {
    const data = await apiService.get(API_ENDPOINTS.TIMETABLE_TEACHER(teacherId));
    return data;
  },

  upsertEntry: async (payload) => {
    const data = await apiService.post(API_ENDPOINTS.TIMETABLE_UPSERT, payload);
    return data;
  },

  deleteEntry: async (payload) => {
    const data = await apiService.post(API_ENDPOINTS.TIMETABLE_DELETE, payload);
    return data;
  },

  bulkUpload: async (formData) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TIMETABLE_BULK_UPLOAD}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Timetable upload failed");
    }

    return response.json();
  },
};
