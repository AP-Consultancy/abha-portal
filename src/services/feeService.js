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
};
