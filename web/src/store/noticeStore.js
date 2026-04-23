import { create } from 'zustand';
import api from '../lib/axios';

const useNoticeStore = create((set, get) => ({
  notices: [],
  loading: false,
  unreadCount: 0,

  fetchNotices: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notices');
      const notices = data.notices || [];
      const unread = notices.filter(n => !n.isRead).length;
      set({ notices, unreadCount: unread, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notices/${id}/read`);
      set({
        notices: get().notices.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch { /* ignore */ }
  },

  createNotice: async (noticeData) => {
    const { data } = await api.post('/notices', noticeData);
    set({ notices: [data.notice, ...get().notices] });
    return data.notice;
  },

  updateNotice: async (id, noticeData) => {
    const { data } = await api.put(`/notices/${id}`, noticeData);
    set({ notices: get().notices.map(n => n._id === id ? data.notice : n) });
    return data.notice;
  },

  deleteNotice: async (id) => {
    await api.delete(`/notices/${id}`);
    set({ notices: get().notices.filter(n => n._id !== id) });
  },

  getAllNotices: async () => {
    const { data } = await api.get('/notices/all');
    return data.notices;
  },
}));

export default useNoticeStore;