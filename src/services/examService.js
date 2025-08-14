import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

export const examService = {
  // Get all exams (admin only)
  getAllExams: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.EXAMS);
      return data;
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  },

  // Get student's exams
  getStudentExams: async (studentId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.EXAMS}/student/${studentId}`);
      return data;
    } catch (error) {
      console.error("Error fetching student exams:", error);
      throw error;
    }
  },

  // Get teacher's exams
  getTeacherExams: async (teacherId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.EXAMS}/teacher/${teacherId}`);
      return data;
    } catch (error) {
      console.error("Error fetching teacher exams:", error);
      throw error;
    }
  },

  // Get exam by ID
  getExamById: async (examId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.EXAMS}/${examId}`);
      return data;
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error;
    }
  },

  // Create new exam (admin only)
  createExam: async (examData) => {
    try {
      const data = await apiService.post(API_ENDPOINTS.EXAMS, examData);
      return data;
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  },

  // Update exam (admin only)
  updateExam: async (examId, examData) => {
    try {
      const data = await apiService.put(`${API_ENDPOINTS.EXAMS}/${examId}`, examData);
      return data;
    } catch (error) {
      console.error("Error updating exam:", error);
      throw error;
    }
  },

  // Delete exam (admin only)
  deleteExam: async (examId) => {
    try {
      const data = await apiService.delete(`${API_ENDPOINTS.EXAMS}/${examId}`);
      return data;
    } catch (error) {
      console.error("Error deleting exam:", error);
      throw error;
    }
  },

  // Submit exam result (teacher only)
  submitExamResult: async (resultData) => {
    try {
      const data = await apiService.post(`${API_ENDPOINTS.EXAMS}/result`, resultData);
      return data;
    } catch (error) {
      console.error("Error submitting exam result:", error);
      throw error;
    }
  },

  // Get exam results for an exam
  getExamResults: async (examId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.EXAMS}/${examId}/results`);
      return data;
    } catch (error) {
      console.error("Error fetching exam results:", error);
      throw error;
    }
  },
};
