import apiService from './apiService';
import { API_ENDPOINTS } from '../utils/constants';

export const attendanceService = {
  // Mark attendance for a single student
  markAttendance: async (attendanceData) => {
    try {
      const data = await apiService.post('/api/attendance/mark', attendanceData);
      return data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Mark attendance for multiple students (bulk)
  markBulkAttendance: async (bulkData) => {
    try {
      const data = await apiService.post('/api/attendance/bulk-mark', bulkData);
      return data;
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      throw error;
    }
  },

  // Get attendance for a class on a specific date
  getClassAttendance: async (classId, date) => {
    try {
      const data = await apiService.get(`/api/attendance/class/${classId}/date/${date}`);
      return data;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      throw error;
    }
  },

  // Get student attendance for a date range
  getStudentAttendance: async (studentId, startDate, endDate) => {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const data = await apiService.get(`/api/attendance/student/${studentId}?${params}`);
      return data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  },

  // Get monthly attendance report for a class
  getMonthlyReport: async (classId, month, year) => {
    try {
      const data = await apiService.get(`/api/attendance/class/${classId}/monthly/${month}/${year}`);
      return data;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  }
};
