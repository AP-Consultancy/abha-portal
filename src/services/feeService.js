import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

export const feeService = {
  async getFeeDetails(studentId) {
    try {
      return await apiService.get(`${API_ENDPOINTS.FEES}/${studentId}`);
    } catch (error) {
      console.error("Error fetching fee details:", error);
      throw new Error("Failed to fetch fee details. Please try again.");
    }
  },

  async generateFeeCollection(feeData) {
    try {
      return await apiService.post(`${API_ENDPOINTS.FEES}/generate`, feeData);
    } catch (error) {
      console.error("Error generating fee collection:", error);
      throw new Error("Failed to generate fee collection. Please try again.");
    }
  },

  async updateLateFees(updateData) {
    try {
      return await apiService.put(`${API_ENDPOINTS.FEES}/update-late-fees`, updateData);
    } catch (error) {
      console.error("Error updating late fees:", error);
      throw new Error("Failed to update late fees. Please try again.");
    }
  },

  async upsertFeeStructure(payload) {
    try {
      return await apiService.post(`${API_ENDPOINTS.FEES}/structure`, payload);
    } catch (error) {
      console.error("Error saving fee structure:", error);
      throw new Error("Failed to save fee structure. Please try again.");
    }
  },

  async assignFeesToClass(payload) {
    try {
      return await apiService.post(`${API_ENDPOINTS.FEES}/assign`, payload);
    } catch (error) {
      console.error("Error assigning fees:", error);
      throw new Error("Failed to assign fees. Please try again.");
    }
  },

  async resetStudentToLatestStructure(scholarNumber) {
    try {
      return await apiService.post(`${API_ENDPOINTS.FEES}/reset-student/${encodeURIComponent(scholarNumber)}`, {});
    } catch (error) {
      console.error("Error resetting student fee data:", error);
      throw new Error("Failed to reset student fee data. Please try again.");
    }
  },
};
