import { useEffect, useState, useRef, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import useTestStore from '../store/testStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import {
  ClipboardList, Plus, Trash2, Eye, Play, CheckCircle, Clock, Users,
  Download, Upload, RefreshCw, X, ChevronRight, ChevronLeft, AlertCircle,
  FileText, BarChart2, Lock, Edit3, Award, BookOpen, Timer,
  Check, XCircle, Star,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  draft:  { label: 'Draft',  bg: 'var(--slate-100)', color: 'var(--slate-600)', border: 'var(--slate-200)' },
  active: { label: 'Active', bg: 'var(--emerald-100)', color: 'var(--emerald-700)', border: 'rgba(16,185,129,0.2)' },
  closed: { label: 'Closed', bg: 'var(--rose-100)', color: 'var(--rose-700)', border: 'rgba(244,63,94,0.2)' },
};

const SUB_STATUS_CFG = {
  not_started: { label: 'Not Started', cls: 'badge-gray' },
  in_progress: { label: 'In Progress', cls: 'badge-blue' },
  submitted:   { label: 'Submitted',   cls: 'badge-amber' },
  reviewed:    { label: 'Reviewed',    cls: 'badge-green' },
};

const fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─── Empty Question Template ───────────────────────────────────────────────────
const emptyMCQ = () => ({
  questionText: '', type: 'mcq', points: 1,
  options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', order: 0,
  _key: Math.random().toString(36).slice(2),
});
const emptyShort = () => ({
  questionText: '', type: 'short_answer', points: 5, options: {}, correctAnswer: '', order: 0,
  _key: Math.random().toString(36).slice(2),
});

// ─── Question Builder ─────────────────────────────────────────────────────────
function QuestionBuilder({ question, index, onChange, onDelete }) {
  const set = (k, v) => onChange({ ...question, [k]: v });
  const setOpt = (opt, v) => onChange({ ...question, options: { ...question.options, [opt]: v } });

  return (
    <div style={{
      background: 'var(--slate-50)', border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-md)', padding: '1rem',
      marginBottom: '0.75rem',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', letterSpacing: '0.06em' }}>
            Q{index + 1}
          </span>
          <select
            value={question.type}
            onChange={e => set('type', e.target.value)}
            style={{
              fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              border: '1px solid var(--slate-200)', background: '#fff', cursor: 'pointer',
              color: question.type === 'mcq' ? 'var(--blue-600)' : 'var(--violet-600)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <option value="mcq">Multiple Choice</option>
            <option value="short_answer">Short Answer</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Points:</span>
            <input
              type="number" min={0} max={100} value={question.points}
              onChange={e => set('points', parseFloat(e.target.value) || 0)}
              style={{
                width: 52, textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600,
                border: '1px solid var(--slate-200)', borderRadius: 6, padding: '2px 6px',
                fontFamily: 'var(--font-body)', background: '#fff',
              }}
            />
          </div>
          <button onClick={onDelete} className="btn-icon danger" style={{ width: 26, height: 26 }}>
            <X size={13} />
          </button>
        </div>
      </div>

      <textarea
        value={question.questionText}
        onChange={e => set('questionText', e.target.value)}
        placeholder={`Enter question ${index + 1}…`}
        rows={2}
        className="input-field"
        style={{ marginBottom: '0.625rem', fontSize: '0.875rem' }}
      />

      {question.type === 'mcq' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <div key={opt} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => set('correctAnswer', opt)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: 'none', flexShrink: 0,
                    background: question.correctAnswer === opt ? 'var(--emerald-500)' : 'var(--slate-200)',
                    color: '#fff', cursor: 'pointer', fontSize: '0.625rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms',
                  }}
                  title={`Set option ${opt} as correct`}
                >
                  {question.correctAnswer === opt ? <Check size={10} /> : opt}
                </button>
                <input
                  value={question.options?.[opt] || ''}
                  onChange={e => setOpt(opt, e.target.value)}
                  placeholder={`Option ${opt}`}
                  className="input-field"
                  style={{ fontSize: '0.8125rem', padding: '0.3125rem 0.625rem' }}
                />
              </div>
            </div>
          ))}
          <div style={{ gridColumn: '1/-1', fontSize: '0.6875rem', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={10} /> Correct answer: Option {question.correctAnswer}
          </div>
        </div>
      )}

      {question.type === 'short_answer' && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--violet-600)', background: 'var(--violet-50)', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
          📝 Students type their answer. Mentor reviews and awards points manually.
        </div>
      )}
    </div>
  );
}

// ─── Create / Edit Test Modal ─────────────────────────────────────────────────
function TestFormModal({ isOpen, onClose, onSuccess, editTest = null }) {
  const { createTest, updateTest } = useTestStore();
  const [form, setForm] = useState({
    title: '', description: '', instructions: '',
    duration: 30, dueDate: '', startDate: '',
    status: 'draft', passingScore: 60,
    showResultsToStudent: true, allowedAttempts: 1,
  });
  const [questions, setQuestions] = useState([emptyMCQ()]);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editTest) {
      setForm({
        title: editTest.title || '',
        description: editTest.description || '',
        instructions: editTest.instructions || '',
        duration: editTest.duration || 30,
        dueDate: editTest.dueDate ? editTest.dueDate.substring(0, 16) : '',
        startDate: editTest.startDate ? editTest.startDate.substring(0, 16) : '',
        status: editTest.status || 'draft',
        passingScore: editTest.passingScore ?? 60,
        showResultsToStudent: editTest.showResultsToStudent !== false,
        allowedAttempts: editTest.allowedAttempts || 1,
      });
      setQuestions(editTest.questions?.length > 0
        ? editTest.questions.map(q => ({ ...q, _key: Math.random().toString(36).slice(2) }))
        : [emptyMCQ()]);
    } else {
      setForm({
        title: '', description: '', instructions: '',
        duration: 30, dueDate: '', startDate: '',
        status: 'draft', passingScore: 60,
        showResultsToStudent: true, allowedAttempts: 1,
      });
      setQuestions([emptyMCQ()]);
    }
  }, [editTest, isOpen]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'object' && e.target ? e.target.value : e }));

  const addQuestion = (type) => {
    setQuestions(qs => [...qs, type === 'mcq' ? emptyMCQ() : emptyShort()]);
  };

  const updateQuestion = (index, updated) => {
    setQuestions(qs => qs.map((q, i) => i === index ? updated : q));
  };

  const deleteQuestion = (index) => {
    setQuestions(qs => qs.filter((_, i) => i !== index));
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const { parseCSVForNewTest } = useTestStore.getState();
      const { questions: parsed, errors } = await parseCSVForNewTest(file);
      if (errors.length > 0) {
        toast.error(`Import issues:\n${errors.slice(0, 3).join('\n')}`);
      }
      if (parsed.length > 0) {
        setQuestions(prev => [
          ...prev.filter(q => q.questionText),
          ...parsed.map(q => ({ ...q, _key: Math.random().toString(36).slice(2) })),
        ]);
        toast.success(`${parsed.length} question(s) imported!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to parse CSV');
    }
    setImporting(false);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    window.open('/api/tests/template/csv', '_blank');
  };

  const totalPoints = questions.reduce((s, q) => s + (parseFloat(q.points) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validQs = questions.filter(q => q.questionText.trim());
    if (validQs.length === 0) return toast.error('Add at least one question');

    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: parseInt(form.duration),
        passingScore: parseInt(form.passingScore),
        allowedAttempts: parseInt(form.allowedAttempts),
        questions: validQs.map((q, i) => ({ ...q, order: i })),
        dueDate: form.dueDate || null,
        startDate: form.startDate || null,
      };

      if (editTest) {
        await updateTest(editTest._id, payload);
        toast.success('Test updated!');
      } else {
        await createTest(payload);
        toast.success('Test created!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTest ? 'Edit Test' : 'Create New Test'} width={720}>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Test Title *</label>
            <input value={form.title} onChange={set('title')} className="input-field" placeholder="e.g. JavaScript Fundamentals Quiz" required />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set('description')} className="input-field" rows={2} placeholder="Brief description of the test…" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Instructions for Students</label>
            <textarea value={form.instructions} onChange={set('instructions')} className="input-field" rows={2} placeholder="Read all questions carefully. You have one attempt…" />
          </div>
          <div>
            <label style={labelStyle}>Duration (minutes) *</label>
            <input type="number" min={1} max={480} value={form.duration} onChange={set('duration')} className="input-field" required />
          </div>
          <div>
            <label style={labelStyle}>Passing Score (%)</label>
            <input type="number" min={0} max={100} value={form.passingScore} onChange={set('passingScore')} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Available From</label>
            <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={set('status')} className="input-field">
              <option value="draft">Draft</option>
              <option value="active">Active (visible to students)</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Show Results to Students</label>
            <select value={form.showResultsToStudent ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, showResultsToStudent: e.target.value === 'yes' }))} className="input-field">
              <option value="yes">Yes — students can see their score</option>
              <option value="no">No — mentor only</option>
            </select>
          </div>
        </div>

        {/* Questions Section */}
        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                Questions <span style={{ color: 'var(--slate-400)', fontWeight: 400, fontSize: '0.8125rem' }}>({questions.filter(q => q.questionText).length} · {totalPoints} pts total)</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button type="button" onClick={handleDownloadTemplate} className="btn-ghost" style={{ fontSize: '0.75rem', gap: '0.25rem' }}>
                <Download size={12} /> Template
              </button>
              <label style={{ cursor: 'pointer' }}>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {importing ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={12} />}
                  Import CSV
                </span>
              </label>
            </div>
          </div>

          {/* Question list */}
          <div style={{ maxHeight: 360, overflowY: 'auto', marginBottom: '0.75rem' }}>
            {questions.map((q, i) => (
              <QuestionBuilder
                key={q._key || i}
                question={q}
                index={i}
                onChange={updated => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)}
              />
            ))}
          </div>

          {/* Add question buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => addQuestion('mcq')} className="btn-secondary" style={{ gap: '0.25rem', fontSize: '0.8125rem' }}>
              <Plus size={13} /> MCQ
            </button>
            <button type="button" onClick={() => addQuestion('short_answer')} className="btn-secondary" style={{ gap: '0.25rem', fontSize: '0.8125rem' }}>
              <Plus size={13} /> Short Answer
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><CheckCircle size={14} /> {editTest ? 'Save Changes' : 'Create Test'}</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Results Modal (Mentor/Admin) ─────────────────────────────────────────────
function ResultsModal({ isOpen, onClose, testId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewSub, setReviewSub] = useState(null);
  const [reviewForm, setReviewForm] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const { getTestResults, reviewSubmission } = useTestStore();

  useEffect(() => {
    if (isOpen && testId) fetchResults();
  }, [isOpen, testId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const result = await getTestResults(testId);
      setData(result);
    } catch { toast.error('Failed to load results'); }
    setLoading(false);
  };

  const openReview = (sub) => {
    setReviewSub(sub);
    const initial = {};
    sub.answers?.forEach(ans => {
      initial[ans.questionId] = { pointsAwarded: ans.pointsAwarded || 0, mentorNote: ans.mentorNote || '' };
    });
    setReviewForm(initial);
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      const answers = Object.entries(reviewForm).map(([qId, v]) => ({
        questionId: qId, pointsAwarded: parseFloat(v.pointsAwarded) || 0, mentorNote: v.mentorNote,
      }));
      await reviewSubmission(testId, reviewSub._id, { answers });
      toast.success('Submission reviewed!');
      setReviewSub(null);
      fetchResults();
    } catch { toast.error('Review failed'); }
    setReviewing(false);
  };

  if (!isOpen) return null;

  const shortAnswerQs = data?.test?.questions?.filter(q => q.type === 'short_answer') || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Results: ${data?.test?.title || '…'}`} width={860}>
      {loading ? <LoadingSpinner label="Loading results…" /> : !data ? null : (
        <>
          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Total Students', value: data.stats.total, color: 'var(--blue-600)', bg: 'var(--blue-50)' },
              { label: 'Submitted', value: data.stats.submitted, color: 'var(--emerald-600)', bg: 'var(--emerald-50)' },
              { label: 'Avg Score', value: `${data.stats.avgScore}%`, color: 'var(--violet-600)', bg: 'var(--violet-50)' },
              { label: 'Not Submitted', value: data.stats.notSubmitted, color: 'var(--rose-600)', bg: 'var(--rose-50)' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Submissions table */}
          {data.submissions.length > 0 && (
            <div style={{ maxHeight: 380, overflowY: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1rem' }}>
              <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem 0.625rem' }}>Student</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Time Taken</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.submissions.map(sub => {
                    const statusCfg = SUB_STATUS_CFG[sub.status] || SUB_STATUS_CFG.submitted;
                    const needsReview = shortAnswerQs.length > 0 && sub.status === 'submitted';
                    return (
                      <tr key={sub._id}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{sub.student?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{sub.student?.email}</div>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: sub.percentage >= 60 ? 'var(--emerald-600)' : 'var(--rose-600)' }}>
                            {sub.score}/{sub.totalPoints}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{sub.percentage}%</div>
                        </td>
                        <td>
                          <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                          {sub.autoSubmitted && <span style={{ fontSize: '0.625rem', color: 'var(--amber-600)', display: 'block' }}>auto-submitted</span>}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                          {sub.timeTakenSeconds ? fmtTime(sub.timeTakenSeconds) : '—'}
                        </td>
                        <td>
                          {needsReview ? (
                            <button onClick={() => openReview(sub)} className="btn-primary" style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem' }}>
                              Review
                            </button>
                          ) : (
                            <button onClick={() => openReview(sub)} className="btn-secondary" style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem' }}>
                              <Eye size={12} /> View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Not submitted */}
          {data.notSubmitted.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                ⚠ Not Submitted ({data.notSubmitted.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {data.notSubmitted.map(s => (
                  <span key={s._id} className="badge badge-red">{s.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Review sub-modal */}
          {reviewSub && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
              onClick={() => setReviewSub(null)}>
              <div onClick={e => e.stopPropagation()} style={{
                background: '#fff', borderRadius: 'var(--radius-xl)', maxWidth: 640, width: '100%',
                maxHeight: '85vh', overflow: 'auto', padding: '1.5rem',
                boxShadow: 'var(--shadow-xl)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--slate-900)' }}>
                    {reviewSub.student?.name}'s Answers
                  </h3>
                  <button onClick={() => setReviewSub(null)} className="btn-icon"><X size={15} /></button>
                </div>

                {data.test.questions?.map((q, qi) => {
                  const ans = reviewSub.answers?.find(a => a.questionId === q._id);
                  const isShort = q.type === 'short_answer';
                  return (
                    <div key={q._id} style={{
                      marginBottom: '1rem', padding: '0.875rem', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${ans?.isCorrect === true ? 'rgba(16,185,129,0.3)' : ans?.isCorrect === false ? 'rgba(244,63,94,0.2)' : 'var(--slate-200)'}`,
                      background: ans?.isCorrect === true ? 'var(--emerald-50)' : ans?.isCorrect === false ? 'var(--rose-50)' : 'var(--slate-50)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                        Q{qi + 1}: {q.questionText}
                        <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>({q.points} pts)</span>
                      </div>
                      {q.type === 'mcq' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '0.5rem' }}>
                          {['A', 'B', 'C', 'D'].map(opt => q.options?.[opt] ? (
                            <div key={opt} style={{
                              padding: '0.3125rem 0.625rem', borderRadius: 6, fontSize: '0.8125rem',
                              background: q.correctAnswer === opt ? 'var(--emerald-100)' : ans?.answer === opt && q.correctAnswer !== opt ? 'var(--rose-100)' : '#fff',
                              border: `1px solid ${q.correctAnswer === opt ? 'rgba(16,185,129,0.3)' : 'var(--slate-200)'}`,
                              fontWeight: (q.correctAnswer === opt || ans?.answer === opt) ? 600 : 400,
                              color: q.correctAnswer === opt ? 'var(--emerald-700)' : ans?.answer === opt ? 'var(--rose-700)' : 'var(--slate-700)',
                            }}>
                              {opt}: {q.options[opt]}
                              {q.correctAnswer === opt && ' ✓'}
                              {ans?.answer === opt && q.correctAnswer !== opt && ' ✗'}
                            </div>
                          ) : null)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--slate-200)', marginBottom: '0.5rem' }}>
                          {ans?.answer || <span style={{ color: 'var(--slate-400)' }}>No answer provided</span>}
                        </div>
                      )}
                      {isShort && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Award points:</span>
                          <input
                            type="number" min={0} max={q.points} step={0.5}
                            value={reviewForm[q._id]?.pointsAwarded ?? 0}
                            onChange={e => setReviewForm(f => ({ ...f, [q._id]: { ...f[q._id], pointsAwarded: parseFloat(e.target.value) || 0 } }))}
                            style={{ width: 60, padding: '3px 8px', border: '1px solid var(--slate-200)', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>/ {q.points}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {shortAnswerQs.length > 0 && reviewSub.status === 'submitted' && (
                  <button onClick={handleReview} disabled={reviewing} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {reviewing ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving review…</> : <><Check size={14} /> Submit Review</>}
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

// ─── Test Taking Interface ────────────────────────────────────────────────────
function TestTakingModal({ isOpen, onClose, testId, onComplete }) {
  const { startTest, submitTest } = useTestStore();
  const [phase, setPhase] = useState('loading'); // loading | start | taking | submitting | done
  const [testData, setTestData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isOpen && testId) {
      setPhase('loading');
      setAnswers({});
      setCurrentQ(0);
      setResult(null);
      startTimeRef.current = null;
      loadTest();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen, testId]);

  const loadTest = async () => {
    try {
      const { test, submission: sub, message } = await startTest(testId);
      setTestData(test);
      setSubmission(sub);
      // Pre-fill existing answers if resuming
      if (sub.answers?.length > 0) {
        const existing = {};
        sub.answers.forEach(a => { existing[a.questionId] = a.answer; });
        setAnswers(existing);
      }
      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - new Date(sub.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, test.duration * 60 - elapsed);
      setTimeLeft(remaining);
      startTimeRef.current = new Date(sub.startedAt);
      setPhase('taking');
      startTimer(remaining);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start test');
      setPhase('error');
    }
  };

  const startTimer = (initial) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(initial);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (auto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('submitting');
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId, answer,
      }));
      const timeTaken = Math.floor((Date.now() - new Date(startTimeRef.current).getTime()) / 1000);
      const res = await submitTest(testId, { answers: answerArray, timeTakenSeconds: timeTaken, autoSubmitted: auto });
      setResult(res.submission);
      setPhase('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setPhase('taking');
    }
  };

  if (!isOpen) return null;

  const questions = testData?.questions || [];
  const answered = Object.values(answers).filter(Boolean).length;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;
  const timerColor = timeLeft < 60 ? '#f43f5e' : timeLeft < 300 ? '#f59e0b' : '#10b981';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'var(--slate-50)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Header */}
      {phase === 'taking' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          background: '#fff', borderBottom: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
              {testData?.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              {answered}/{questions.length} answered
            </div>
          </div>

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4375rem 1rem', borderRadius: 10,
            background: timeLeft < 60 ? 'var(--rose-50)' : timeLeft < 300 ? 'var(--amber-50)' : 'var(--emerald-50)',
            border: `1px solid ${timerColor}30`,
          }}>
            <Timer size={16} style={{ color: timerColor }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: timerColor, letterSpacing: '0.05em' }}>
              {fmtTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => { if (confirm('Submit test now? This cannot be undone.')) handleSubmit(); }}
            className="btn-primary"
            style={{ gap: '0.375rem' }}
          >
            <CheckCircle size={15} /> Submit Test
          </button>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
        {/* Loading / Error / Submitting */}
        {(phase === 'loading' || phase === 'submitting') && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner label={phase === 'loading' ? 'Starting test…' : 'Submitting…'} />
          </div>
        )}

        {phase === 'error' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <AlertCircle size={40} style={{ color: 'var(--rose-400)' }} />
            <p style={{ color: 'var(--slate-600)' }}>Failed to load test. Please try again.</p>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        )}

        {phase === 'taking' && testData && (
          <div style={{ flex: 1, display: 'flex', maxWidth: 900, margin: '0 auto', width: '100%', padding: '1.5rem', gap: '1.25rem' }}>
            {/* Question navigator sidebar */}
            <div style={{ width: 160, flexShrink: 0 }}>
              <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0.875rem', position: 'sticky', top: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '0.625rem' }}>
                  Questions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                  {questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrentQ(i)}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: 'none',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                        background: currentQ === i
                          ? 'var(--blue-600)'
                          : answers[questions[i]?._id]
                          ? 'var(--emerald-100)'
                          : 'var(--slate-100)',
                        color: currentQ === i ? '#fff' : answers[questions[i]?._id] ? 'var(--emerald-700)' : 'var(--slate-600)',
                        transition: 'all 120ms',
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                {/* Progress */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', marginBottom: '0.25rem' }}>{Math.round(progress)}% complete</div>
                  <div style={{ height: 4, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--emerald-500)', transition: 'width 300ms' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Question area */}
            <div style={{ flex: 1 }}>
              {testData.instructions && currentQ === 0 && (
                <div style={{
                  background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--blue-700)',
                }}>
                  <strong>Instructions:</strong> {testData.instructions}
                </div>
              )}

              {questions[currentQ] && (() => {
                const q = questions[currentQ];
                const qId = q._id;
                return (
                  <div style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: q.type === 'mcq' ? 'var(--blue-100)' : 'var(--violet-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem',
                        color: q.type === 'mcq' ? 'var(--blue-600)' : 'var(--violet-600)',
                      }}>
                        {currentQ + 1}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-900)', lineHeight: 1.4 }}>
                          {q.questionText}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                          {q.points} point{q.points !== 1 ? 's' : ''} · {q.type === 'mcq' ? 'Multiple choice' : 'Short answer'}
                        </div>
                      </div>
                    </div>

                    {q.type === 'mcq' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['A', 'B', 'C', 'D'].map(opt => q.options?.[opt] ? (
                          <label key={opt} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                            border: `2px solid ${answers[qId] === opt ? 'var(--blue-500)' : 'var(--slate-200)'}`,
                            background: answers[qId] === opt ? 'var(--blue-50)' : '#fff',
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                          }}>
                            <input
                              type="radio" name={`q-${qId}`} value={opt}
                              checked={answers[qId] === opt}
                              onChange={() => setAnswers(a => ({ ...a, [qId]: opt }))}
                              style={{ display: 'none' }}
                            />
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', border: `2px solid ${answers[qId] === opt ? 'var(--blue-500)' : 'var(--slate-300)'}`,
                              background: answers[qId] === opt ? 'var(--blue-500)' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
                              color: answers[qId] === opt ? '#fff' : 'var(--slate-600)',
                              transition: 'all 150ms',
                            }}>
                              {answers[qId] === opt ? <Check size={13} /> : opt}
                            </div>
                            <span style={{ fontSize: '0.9375rem', color: answers[qId] === opt ? 'var(--blue-700)' : 'var(--slate-700)', fontWeight: answers[qId] === opt ? 500 : 400 }}>
                              {q.options[opt]}
                            </span>
                          </label>
                        ) : null)}
                      </div>
                    ) : (
                      <textarea
                        value={answers[qId] || ''}
                        onChange={e => setAnswers(a => ({ ...a, [qId]: e.target.value }))}
                        placeholder="Type your answer here…"
                        rows={5}
                        className="input-field"
                        style={{ fontSize: '0.9375rem', lineHeight: 1.65 }}
                      />
                    )}
                  </div>
                );
              })()}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
                  disabled={currentQ === 0}
                  className="btn-secondary" style={{ gap: '0.25rem' }}
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                {currentQ < questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(i => i + 1)} className="btn-primary" style={{ gap: '0.25rem' }}>
                    Next <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={() => { if (confirm('Submit test now?')) handleSubmit(); }} className="btn-primary" style={{ gap: '0.25rem', background: 'var(--emerald-500)' }}>
                    <CheckCircle size={15} /> Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Done / Result */}
        {phase === 'done' && result && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.25rem',
                background: result.percentage >= (testData?.passingScore || 60) ? 'var(--emerald-100)' : 'var(--rose-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {result.percentage >= (testData?.passingScore || 60)
                  ? <Award size={36} style={{ color: 'var(--emerald-500)' }} />
                  : <XCircle size={36} style={{ color: 'var(--rose-500)' }} />
                }
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                {result.score}/{result.totalPoints}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: result.percentage >= 60 ? 'var(--emerald-600)' : 'var(--rose-600)', marginBottom: '1rem' }}>
                {result.percentage}% — {result.percentage >= (testData?.passingScore || 60) ? '🎉 Passed!' : 'Not passed'}
              </div>
              {result.status === 'submitted' && (
                <div style={{ background: 'var(--amber-50)', border: '1px solid var(--amber-200)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e' }}>
                  📝 Short answer questions are pending mentor review. Your final score may change.
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={() => { onComplete(); onClose(); }} className="btn-primary">Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Student Result View ──────────────────────────────────────────────────────
function MyResultModal({ isOpen, onClose, testId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getMyResult } = useTestStore();

  useEffect(() => {
    if (isOpen && testId) {
      setLoading(true);
      getMyResult(testId).then(setData).catch(() => toast.error('Failed to load result')).finally(() => setLoading(false));
    }
  }, [isOpen, testId]);

  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Test Result" width={640}>
      {loading ? <LoadingSpinner /> : !data ? null : (
        <>
          {/* Score summary */}
          <div style={{
            textAlign: 'center', padding: '1.5rem',
            background: data.submission.percentage >= (data.test.passingScore || 60) ? 'var(--emerald-50)' : 'var(--rose-50)',
            borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem',
            border: `1px solid ${data.submission.percentage >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', color: 'var(--slate-900)' }}>
              {data.submission.score}/{data.submission.totalPoints}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: data.submission.percentage >= 60 ? 'var(--emerald-600)' : 'var(--rose-600)' }}>
              {data.submission.percentage}% — {data.submission.passed ? '✅ Passed' : data.submission.passed === false ? '❌ Not Passed' : '⏳ Pending Review'}
            </div>
          </div>

          {/* Answers */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {data.submission.answers?.map((ans, i) => (
              <div key={i} style={{
                marginBottom: '0.75rem', padding: '0.875rem', borderRadius: 'var(--radius-md)',
                border: `1px solid ${ans.isCorrect === true ? 'rgba(16,185,129,0.25)' : ans.isCorrect === false ? 'rgba(244,63,94,0.2)' : 'var(--slate-200)'}`,
                background: ans.isCorrect === true ? 'var(--emerald-50)' : ans.isCorrect === false ? 'var(--rose-50)' : 'var(--slate-50)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
                  Q{i + 1}: {ans.questionText}
                  {ans.isCorrect === true && <span style={{ marginLeft: 8, color: 'var(--emerald-600)' }}>+{ans.pointsAwarded} pts ✓</span>}
                  {ans.isCorrect === false && <span style={{ marginLeft: 8, color: 'var(--rose-600)' }}>0 pts ✗</span>}
                  {ans.isCorrect === null && <span style={{ marginLeft: 8, color: 'var(--amber-600)', fontSize: '0.75rem' }}>Pending review — {ans.pointsAwarded} pts awarded</span>}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-700)' }}>Your answer: <strong>{ans.answer || '(not answered)'}</strong></div>
                {ans.questionType === 'mcq' && ans.correctAnswer && ans.isCorrect === false && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--emerald-700)', marginTop: '0.25rem' }}>Correct: {ans.correctAnswer}</div>
                )}
                {ans.mentorNote && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--blue-700)', marginTop: '0.375rem', background: 'var(--blue-50)', padding: '0.375rem 0.625rem', borderRadius: 6 }}>
                    💬 Mentor: {ans.mentorNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Test Card ────────────────────────────────────────────────────────────────
function TestCard({ test, user, onEdit, onDelete, onViewResults, onTake, onViewMyResult, index }) {
  const [hovered, setHovered] = useState(false);
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';
  const cfg = STATUS_CFG[test.status] || STATUS_CFG.draft;
  const mySub = test.mySubmission;
  const subStatus = mySub ? SUB_STATUS_CFG[mySub.status] : null;
  const overdue = test.dueDate && new Date() > new Date(test.dueDate);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'var(--blue-200)' : overdue ? 'rgba(244,63,94,0.15)' : 'var(--slate-200)'}`,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        padding: '1.25rem 1.375rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-1px)' : '',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'var(--blue-50)', border: '1px solid rgba(37,99,235,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.05)' : '',
        }}>
          <ClipboardList size={22} style={{ color: 'var(--blue-600)' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {test.title}
              </div>
              {test.description && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {test.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {test.status}
                </span>
                <span className="badge badge-gray"><Clock size={10} /> {test.duration} min</span>
                <span className="badge badge-gray"><FileText size={10} /> {test.questions?.length || 0} Qs</span>
                <span className="badge badge-gray"><Star size={10} /> {test.totalPoints} pts</span>
                {test.dueDate && (
                  <span className={`badge ${overdue ? 'badge-red' : 'badge-amber'}`}>
                    Due {new Date(test.dueDate).toLocaleDateString()}
                  </span>
                )}
                {mySub && subStatus && <span className={`badge ${subStatus.cls}`}>{subStatus.label}</span>}
                {mySub?.percentage !== undefined && <span className="badge badge-gray">{mySub.percentage}%</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
              {isMentorAdmin && (
                <>
                  <button onClick={() => onViewResults(test._id)} className="btn-secondary" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                    <BarChart2 size={12} /> Results
                  </button>
                  <button onClick={() => onEdit(test)} className="btn-icon" title="Edit"><Edit3 size={14} /></button>
                  <button onClick={() => onDelete(test._id)} className="btn-icon danger" title="Delete"><Trash2 size={14} /></button>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  {(!mySub || mySub.status === 'in_progress') && test.status === 'active' && !overdue && (
                    <button onClick={() => onTake(test._id)} className="btn-primary" style={{ gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <Play size={13} /> {mySub?.status === 'in_progress' ? 'Resume' : 'Start Test'}
                    </button>
                  )}
                  {(mySub?.status === 'submitted' || mySub?.status === 'reviewed') && test.showResultsToStudent && (
                    <button onClick={() => onViewMyResult(test._id)} className="btn-secondary" style={{ gap: '0.25rem', fontSize: '0.8125rem' }}>
                      <Eye size={12} /> My Result
                    </button>
                  )}
                  {overdue && !mySub && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--rose-500)', fontWeight: 600 }}>Deadline passed</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Label style ──────────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TestsPage() {
  const user = useAuthStore(s => s.user);
  const { tests, loading, fetchTests, deleteTest } = useTestStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [resultsTestId, setResultsTestId] = useState(null);
  const [takingTestId, setTakingTestId] = useState(null);
  const [myResultTestId, setMyResultTestId] = useState(null);
  const [filter, setFilter] = useState('all');
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this test and all submissions? This cannot be undone.')) return;
    try {
      await deleteTest(id);
      toast.success('Test deleted');
    } catch { toast.error('Failed to delete test'); }
  };

  const handleEdit = (test) => { setEditTest(test); setShowCreate(true); };

  const filtered = filter === 'all' ? tests : tests.filter(t =>
    filter === 'active' ? t.status === 'active' :
    filter === 'draft' ? t.status === 'draft' :
    filter === 'closed' ? t.status === 'closed' :
    filter === 'pending' ? t.mySubmission?.status === 'submitted' : true
  );

  if (loading) return <LoadingSpinner label="Loading tests…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
            <ClipboardList size={20} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Tests & Quizzes
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{tests.length} test{tests.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isMentorAdmin && (
            <>
              <a href="/api/tests/template/csv" download className="btn-secondary" style={{ textDecoration: 'none', gap: '0.25rem', fontSize: '0.8125rem' }}>
                <Download size={13} /> Template
              </a>
              <button onClick={() => { setEditTest(null); setShowCreate(true); }} className="btn-primary">
                <Plus size={15} /> New Test
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {tests.length > 0 && (
        <div className="animate-fade-up stagger-1" style={{
          display: 'flex', gap: '0.25rem',
          background: 'var(--slate-100)', borderRadius: 10, padding: '0.25rem',
          width: 'fit-content',
        }}>
          {[
            { key: 'all', label: 'All', count: tests.length },
            ...(isMentorAdmin ? [
              { key: 'active', label: 'Active', count: tests.filter(t => t.status === 'active').length },
              { key: 'draft', label: 'Draft', count: tests.filter(t => t.status === 'draft').length },
              { key: 'closed', label: 'Closed', count: tests.filter(t => t.status === 'closed').length },
            ] : [
              { key: 'active', label: 'Available', count: tests.filter(t => t.status === 'active').length },
              { key: 'pending', label: 'Submitted', count: tests.filter(t => t.mySubmission?.status === 'submitted' || t.mySubmission?.status === 'reviewed').length },
            ]),
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: 8, border: 'none',
              background: filter === key ? '#fff' : 'transparent',
              color: filter === key ? 'var(--slate-900)' : 'var(--slate-500)',
              fontSize: '0.8125rem', fontWeight: filter === key ? 600 : 400,
              cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-body)',
              boxShadow: filter === key ? 'var(--shadow-sm)' : 'none',
            }}>
              {label}
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.0625rem 0.375rem', borderRadius: 999, background: filter === key ? 'var(--blue-100)' : 'var(--slate-200)', color: filter === key ? 'var(--blue-600)' : 'var(--slate-500)' }}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Test list */}
      {filtered.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <ClipboardList size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            {filter !== 'all' ? `No ${filter} tests` : 'No tests yet'}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {isMentorAdmin ? 'Create a test using the "New Test" button above.' : 'Your mentor will assign tests here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((test, i) => (
            <TestCard
              key={test._id} test={test} user={user} index={i}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewResults={setResultsTestId}
              onTake={setTakingTestId}
              onViewMyResult={setMyResultTestId}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TestFormModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setEditTest(null); }}
        onSuccess={fetchTests}
        editTest={editTest}
      />
      <ResultsModal
        isOpen={!!resultsTestId}
        onClose={() => setResultsTestId(null)}
        testId={resultsTestId}
      />
      <MyResultModal
        isOpen={!!myResultTestId}
        onClose={() => setMyResultTestId(null)}
        testId={myResultTestId}
      />
      {takingTestId && (
        <TestTakingModal
          isOpen={!!takingTestId}
          onClose={() => setTakingTestId(null)}
          testId={takingTestId}
          onComplete={fetchTests}
        />
      )}
    </div>
  );
}