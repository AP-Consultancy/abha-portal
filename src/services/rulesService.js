import apiService from "./apiService";

export const rulesService = {
  async getRules() {
    const response = await apiService.get("/api/rules");
    return response.data || [];
  },

  async getRule(id) {
    const response = await apiService.get(`/api/rules/${id}`);
    return response.data?.[0] || response.data || null;
  },

  async createRule(payload) {
    return apiService.post("/api/rules", payload);
  },

  async updateRule(id, payload) {
    return apiService.put(`/api/rules/${id}`, payload);
  },

  async deleteRule(id) {
    return apiService.delete(`/api/rules/${id}`);
  },

  async setRuleStatus(id, status) {
    return apiService.patch(`/api/rules/${id}/status`, { status });
  },
};
