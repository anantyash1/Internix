import { create } from 'zustand';
import api from '../lib/axios';

const useTestStore = create((set, get) => ({
  tests: [],
  total: 0,
  loading: false,
  error: null,

  fetchTests: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/tests', { params });
      set({ tests: data.tests, total: data.total, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load tests', loading: false });
    }
  },

  createTest: async (testData) => {
    const { data } = await api.post('/tests', testData);
    set({ tests: [data.test, ...get().tests] });
    return data.test;
  },

  updateTest: async (id, testData) => {
    const { data } = await api.put(`/tests/${id}`, testData);
    set({ tests: get().tests.map(t => t._id === id ? data.test : t) });
    return data.test;
  },

  deleteTest: async (id) => {
    await api.delete(`/tests/${id}`);
    set({ tests: get().tests.filter(t => t._id !== id) });
  },

  startTest: async (id) => {
    const { data } = await api.post(`/tests/${id}/start`);
    return data;
  },

  submitTest: async (id, payload) => {
    const { data } = await api.post(`/tests/${id}/submit`, payload);
    return data;
  },

  getTestById: async (id) => {
    const { data } = await api.get(`/tests/${id}`);
    return data.test;
  },

  getTestResults: async (id) => {
    const { data } = await api.get(`/tests/${id}/results`);
    return data;
  },

  getMyResult: async (id) => {
    const { data } = await api.get(`/tests/${id}/my-result`);
    return data;
  },

  reviewSubmission: async (testId, submissionId, payload) => {
    const { data } = await api.put(`/tests/${testId}/review-submission/${submissionId}`, payload);
    return data;
  },

  importQuestions: async (testId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/tests/${testId}/import-questions`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  parseCSVForNewTest: async (file) => {
    // Parse CSV client-side for new test creation (before test exists)
    const fd = new FormData();
    fd.append('file', file);
    // We'll use a temp endpoint approach - actually parse on client
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.trim().split(/\r?\n/).filter(Boolean);
          if (lines.length < 2) { reject(new Error('CSV must have a header row and at least one question')); return; }

          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const questions = [];
          const errors = [];

          lines.slice(1).forEach((line, i) => {
            const values = parseCSVLineClient(line);
            const row = {};
            headers.forEach((h, idx) => { row[h] = (values[idx] || '').replace(/^"|"$/g, '').trim(); });

            const questionText = row['Question'] || row['question'] || '';
            const type = (row['Type'] || row['type'] || 'mcq').toLowerCase().replace(' ', '_');
            const points = parseFloat(row['Points'] || row['points'] || 1) || 1;

            if (!questionText) { errors.push(`Row ${i + 2}: Question text is required`); return; }

            const q = { questionText, type, points, order: questions.length };

            if (type === 'mcq') {
              const correctAnswer = (row['Correct Answer (A/B/C/D)'] || row['Correct Answer'] || '').toUpperCase();
              if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) { errors.push(`Row ${i + 2}: Correct Answer must be A, B, C, or D`); return; }
              q.options = {
                A: row['Option A'] || '',
                B: row['Option B'] || '',
                C: row['Option C'] || '',
                D: row['Option D'] || '',
              };
              q.correctAnswer = correctAnswer;
            }

            questions.push(q);
          });

          resolve({ questions, errors });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
}));

function parseCSVLineClient(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

export default useTestStore;