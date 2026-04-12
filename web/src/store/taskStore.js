import { create } from 'zustand';
import api from '../lib/axios';

const useTaskStore = create((set, get) => ({
  tasks: [],
  total: 0,
  loading: false,
  error: null,

  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/tasks', { params });
      set({ tasks: data.tasks, total: data.total, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load tasks', loading: false });
    }
  },

  createTask: async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    set({ tasks: [data.task, ...get().tasks] });
    return data.task;
  },

  updateTask: async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    set({
      tasks: get().tasks.map((t) => (t._id === id ? data.task : t)),
    });
    return data.task;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set({ tasks: get().tasks.filter((t) => t._id !== id) });
  },
}));

export default useTaskStore;
