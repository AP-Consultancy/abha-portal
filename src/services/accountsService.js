import { API_BASE_URL } from '../utils/constants';

export const accountsService = {
  async getTransactions(params = {}) {
    const token = localStorage.getItem('token');
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/accounts/transactions${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let data = {};
      try { data = await res.json(); } catch (_) {}
      throw new Error(data?.message || 'Failed to fetch transactions');
    }
    const data = await res.json();
    return data?.transactions || [];
  },
};


