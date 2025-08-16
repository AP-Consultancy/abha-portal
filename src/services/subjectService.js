import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

export const subjectService = {
  // Get all subjects (admin, teacher)
  getAllSubjects: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.SUBJECTS);
      return data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get subject by ID
  getSubjectById: async (subjectId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.SUBJECTS}/${subjectId}`);
      return data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  },

  // Create new subject (admin only)
  createSubject: async (subjectData) => {
    try {
      const data = await apiService.post(API_ENDPOINTS.SUBJECTS, subjectData);
      return data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Update subject (admin only)
  updateSubject: async (subjectId, subjectData) => {
    try {
      const data = await apiService.put(`${API_ENDPOINTS.SUBJECTS}/${subjectId}`, subjectData);
      return data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete subject (admin only)
  deleteSubject: async (subjectId) => {
    try {
      const data = await apiService.delete(`${API_ENDPOINTS.SUBJECTS}/${subjectId}`);
      return data;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },

  // Get subjects by teacher
  getSubjectsByTeacher: async (teacherId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.SUBJECTS}/teacher/${teacherId}`);
      return data;
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      throw error;
    }
  },

  // Get subjects by class
  getSubjectsByClass: async (classId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.SUBJECTS}/class/${classId}`);
      return data;
    } catch (error) {
      console.error('Error fetching class subjects:', error);
      throw error;
    }
  },

  // Get teachers by subject
  getTeachersBySubject: async (subjectId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.SUBJECTS}/by-subject/${subjectId}/teachers`);
      return data;
    } catch (error) {
      console.error('Error fetching teachers for subject:', error);
      throw error;
    }
  },
};
