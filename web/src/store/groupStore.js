import { create } from 'zustand';
import api from '../lib/axios';

const useGroupStore = create((set, get) => ({
  groups: [],
  loading: false,

  fetchGroups: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/groups', { params });
      set({ groups: data.groups, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createGroup: async (groupData) => {
    const { data } = await api.post('/groups', groupData);
    set({ groups: [data.group, ...get().groups] });
    return data.group;
  },

  updateGroup: async (id, groupData) => {
    const { data } = await api.put(`/groups/${id}`, groupData);
    set({ groups: get().groups.map(g => g._id === id ? data.group : g) });
    return data.group;
  },

  addStudent: async (groupId, studentId) => {
    const { data } = await api.post(`/groups/${groupId}/add-student`, { studentId });
    set({ groups: get().groups.map(g => g._id === groupId ? data.group : g) });
    return data.group;
  },

  removeStudent: async (groupId, studentId) => {
    await api.delete(`/groups/${groupId}/remove-student/${studentId}`);
    set({
      groups: get().groups.map(g => g._id === groupId
        ? { ...g, students: g.students.filter(s => (s._id || s) !== studentId) }
        : g
      ),
    });
  },

  deleteGroup: async (id) => {
    await api.delete(`/groups/${id}`);
    set({ groups: get().groups.filter(g => g._id !== id) });
  },
}));

export default useGroupStore;