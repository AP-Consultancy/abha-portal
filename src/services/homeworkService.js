import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

const HOMEWORK_API_BASE = API_ENDPOINTS.HOMEWORK;

export const homeworkService = {
  // Create new homework
  async createHomework(homeworkData) {
    try {
      const response = await apiService.post(HOMEWORK_API_BASE, homeworkData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create homework');
    }
  },

  // Get all homework
  async getAllHomework() {
    try {
      const response = await apiService.get(HOMEWORK_API_BASE);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch homework');
    }
  },

  // Get homework by ID
  async getHomework(homeworkId) {
    try {
      const response = await apiService.get(`${HOMEWORK_API_BASE}/${homeworkId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch homework');
    }
  },

  // Update homework
  async updateHomework(homeworkId, homeworkData) {
    try {
      const response = await apiService.put(`${HOMEWORK_API_BASE}/${homeworkId}`, homeworkData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update homework');
    }
  },

  // Delete homework
  async deleteHomework(homeworkId) {
    try {
      const response = await apiService.delete(`${HOMEWORK_API_BASE}/${homeworkId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete homework');
    }
  },

  // Get homework by class
  async getHomeworkByClass(classId) {
    try {
      const response = await apiService.get(`${HOMEWORK_API_BASE}/class/${classId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch class homework');
    }
  },



  // Get homework by teacher
  async getHomeworkByTeacher(teacherId) {
    try {
      const response = await apiService.get(`${HOMEWORK_API_BASE}/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teacher homework');
    }
  },

  // Get homework for a student by class name and section
  async getHomeworkForStudent(className, section) {
    try {
      const response = await apiService.get(`${HOMEWORK_API_BASE}/student/${className}/${section}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student homework');
    }
  }
};

export default homeworkService;