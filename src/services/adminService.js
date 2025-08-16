import apiService from './apiService';

export const adminService = {
  async changeOwnPassword(currentPassword, newPassword) {
    return apiService.post('/api/admin/change-password', { currentPassword, newPassword });
  },

  async changeUserPassword(payload) {
    return apiService.post('/api/admin/change-user-password', payload);
  },
};


