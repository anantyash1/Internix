import { create } from 'zustand';
import api from '../lib/axios';

const useUserStore = create((set, get) => ({
  users: [],
  total: 0,
  loading: false,

  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/users', { params });
      set({ users: data.users, total: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  assignMentor: async (studentId, mentorId) => {
    const { data } = await api.post('/users/assign-mentor', { studentId, mentorId });
    set({
      users: get().users.map((u) => (u._id === studentId ? data.student : u)),
    });
    return data;
  },

  resetStudentPassword: async (id, newPassword) => {
    const { data } = await api.put(`/users/${id}/reset-password`, { newPassword });
    return data;
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}`);
    set({ users: get().users.filter((u) => u._id !== id) });
  },
}));

export default useUserStore;
