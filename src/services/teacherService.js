 import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

export const teacherService = {
  // Get all teachers (admin only)
  getAllTeachers: async () => {
    try {
      const data = await apiService.get('/api/teachers/getallteacher');
      return data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  // Get teacher by ID
  getTeacherById: async (teacherId) => {
    try {
      const data = await apiService.get(`/api/teachers/${teacherId}`);
      return data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  // Create new teacher (admin only)
  createTeacher: async (teacherData) => {
    try {
      const data = await apiService.post('/api/teachers/create-teacher', teacherData);
      return data;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  // Update teacher (admin only)
  updateTeacher: async (enrollmentNo, teacherData) => {
    try {
      const data = await apiService.put(`/api/teachers/update-teacher/${enrollmentNo}`, teacherData);
      return data;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  // Delete teacher (admin only)
  deleteTeacher: async (teacherId) => {
    try {
      const data = await apiService.delete(`/api/teachers/${teacherId}`);
      return data;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },

  // Get teacher profile
  getTeacherProfile: async () => {
    try {
      const data = await apiService.get(API_ENDPOINTS.TEACHER_PROFILE);
      return data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
  },

  // Change teacher password
  changePassword: async (passwordData) => {
    try {
      const data = await apiService.post(API_ENDPOINTS.TEACHER_CHANGE_PASSWORD, passwordData);
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Update teacher resignation status
  updateResignationStatus: async (enrollmentNo, statusData) => {
    try {
      const data = await apiService.put(API_ENDPOINTS.TEACHER_RESIGNATION_STATUS(enrollmentNo), statusData);
      return data;
    } catch (error) {
      console.error('Error updating resignation status:', error);
      throw error;
    }
  },
};
