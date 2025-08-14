import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

export const classService = {
  // Get all classes (admin only)
  getAllClasses: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.CLASSES);
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  // Get student's class information
  getStudentClass: async (studentId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.CLASSES}/student/${studentId}`);
      return data;
    } catch (error) {
      console.error('Error fetching student class:', error);
      throw error;
    }
  },

  // Get teacher's classes
  getTeacherClasses: async (teacherId) => {
    try {
      const data = await apiService.get(`${API_ENDPOINTS.CLASSES}/teacher/${teacherId}`);
      return data;
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      throw error;
    }
  },

  // Create new class (admin only)
  createClass: async (classData) => {
    try {
      const data = await apiService.post(API_ENDPOINTS.CLASSES, classData);
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  // Update class (admin only)
  updateClass: async (classId, classData) => {
    try {
      const data = await apiService.put(`${API_ENDPOINTS.CLASSES}/${classId}`, classData);
      return data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  // Assign class teacher (admin only)
  assignClassTeacher: async (classId, teacherId) => {
    try {
      const data = await apiService.patch(`${API_ENDPOINTS.CLASSES}/${classId}/class-teacher`, { teacherId });
      return data;
    } catch (error) {
      console.error('Error assigning class teacher:', error);
      throw error;
    }
  },

  // Set class subjects (admin only)
  setClassSubjects: async (classId, subjects) => {
    try {
      const data = await apiService.put(`${API_ENDPOINTS.CLASSES}/${classId}/subjects`, { subjects });
      return data;
    } catch (error) {
      console.error('Error setting class subjects:', error);
      throw error;
    }
  },

  // Generate default classes (admin only)
  generateDefaultClasses: async (payload = {}) => {
    try {
      const data = await apiService.post(`${API_ENDPOINTS.CLASSES}/generate-default`, payload);
      return data;
    } catch (error) {
      console.error('Error generating default classes:', error);
      throw error;
    }
  },

  // Delete class (admin only)
  deleteClass: async (classId) => {
    try {
      const data = await apiService.delete(`${API_ENDPOINTS.CLASSES}/${classId}`);
      return data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Add student to class
  addStudentToClass: async (classId, studentId) => {
    try {
      const data = await apiService.post(`${API_ENDPOINTS.CLASSES}/add-student`, { classId, studentId });
      return data;
    } catch (error) {
      console.error('Error adding student to class:', error);
      throw error;
    }
  },

  // Remove student from class
  removeStudentFromClass: async (classId, studentId) => {
    try {
      const data = await apiService.post(`${API_ENDPOINTS.CLASSES}/remove-student`, { classId, studentId });
      return data;
    } catch (error) {
      console.error('Error removing student from class:', error);
      throw error;
    }
  },
}; 