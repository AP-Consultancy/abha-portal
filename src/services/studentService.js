import apiService from "./apiService";
import { API_ENDPOINTS } from "../utils/constants";

export const studentService = {
  async getAllStudents() {
    try {
      const data = await apiService.get(API_ENDPOINTS.GET_ALL_STUDENTS);
      return data.students;
    } catch (error) {
      console.error("Error fetching all students:", error);
      throw new Error(
        "Failed to load students. Please check your server connection."
      );
    }
  },

  async updateStudent(enrollmentNo, updateData) {
    try {
      return await apiService.put(API_ENDPOINTS.UPDATE_STUDENT(enrollmentNo), updateData);
    } catch (error) {
      console.error("Error updating student:", error);
      throw new Error("Failed to update student. Please try again.");
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
