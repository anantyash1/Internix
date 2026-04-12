import { create } from 'zustand';
import api from '../lib/axios';

const useDashboardStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/dashboard');
      set({ data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load dashboard', loading: false });
    }
  },
}));

export default useDashboardStore;
