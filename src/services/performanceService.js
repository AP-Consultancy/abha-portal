import apiService from "./apiService";

export const performanceService = {
  async getMyPerformance() {
    const response = await apiService.get("/api/performance/me");
    return response.data;
  },

  async getStudentPerformance(studentId) {
    const response = await apiService.get(`/api/performance/student/${studentId}`);
    return response.data;
  },

  async getPerformanceList(filters = {}) {
    const params = new URLSearchParams();
    if (filters.classId) params.set("class_id", String(filters.classId));
    if (filters.sectionId) params.set("section_id", String(filters.sectionId));
    const query = params.toString();
    const response = await apiService.get(
      `/api/performance${query ? `?${query}` : ""}`
    );
    return response.data || [];
  },
};
