import { create } from 'zustand';
import api from '../lib/axios';

const useAIStore = create((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  sendMessage: async (text, context = '') => {
    const userMsg = { role: 'user', content: text };
    const nextMessages = [...get().messages, userMsg];
    set({ messages: nextMessages, loading: true, error: null });
    try {
      const { data } = await api.post('/ai/chat', {
        messages: nextMessages,
        context,
      });
      const assistantMsg = { role: 'assistant', content: data.reply };
      set({ messages: [...nextMessages, assistantMsg], loading: false });
      return data.reply;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to get AI response';
      set({ loading: false, error: message });
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}));

export default useAIStore;
