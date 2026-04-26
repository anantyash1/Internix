import { create } from 'zustand';
import api from '../lib/axios';

const useMeetingStore = create((set, get) => ({
  meetings: [],
  upcoming: [],
  loading: false,

  fetchMeetings: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/meetings');
      set({ meetings: data.meetings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchUpcoming: async () => {
    try {
      const { data } = await api.get('/meetings/upcoming');
      set({ upcoming: data.upcoming });
    } catch { /* silent */ }
  },

  getAllMeetings: async () => {
    const { data } = await api.get('/meetings/all');
    return data.meetings;
  },

  createMeeting: async (meetingData) => {
    const { data } = await api.post('/meetings', meetingData);
    set({ meetings: [data.meeting, ...get().meetings] });
    return data.meeting;
  },

  updateMeeting: async (id, meetingData) => {
    const { data } = await api.put(`/meetings/${id}`, meetingData);
    set({ meetings: get().meetings.map(m => m._id === id ? data.meeting : m) });
    return data.meeting;
  },

  deleteMeeting: async (id) => {
    await api.delete(`/meetings/${id}`);
    set({ meetings: get().meetings.filter(m => m._id !== id) });
  },
}));

export default useMeetingStore;