import { create } from 'zustand';
import api from '../lib/axios';

const useVideoStore = create((set, get) => ({
  videos: [],
  loading: false,

  fetchVideos: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/videos', { params });
      set({ videos: data.videos, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createVideoLink: async (formData) => {
    const { data } = await api.post('/videos/link', formData);
    set({ videos: [data.video, ...get().videos] });
    return data.video;
  },

  uploadVideo: async (formData) => {
    const { data } = await api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set({ videos: [data.video, ...get().videos] });
    return data.video;
  },

  deleteVideo: async (id) => {
    await api.delete(`/videos/${id}`);
    set({ videos: get().videos.filter((v) => v._id !== id) });
  },

  markComplete: async (videoId) => {
    await api.post(`/videos/${videoId}/complete`);
    set({
      videos: get().videos.map((v) =>
        v._id === videoId
          ? { ...v, progress: { completed: true, completedAt: new Date() } }
          : v
      ),
    });
  },
}));

export default useVideoStore;