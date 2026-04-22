import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Briefcase, Plus, Trash2, Users, Calendar, UserPlus, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  cls: 'badge-blue',  bar: '#3b82f6' },
  active:    { label: 'Active',    cls: 'badge-green', bar: '#10b981' },
  completed: { label: 'Completed', cls: 'badge-gray',  bar: '#94a3b8' },
};

function InternshipCard({ internship, user, onEnroll, onDelete, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[internship.status] || STATUS_CONFIG.upcoming;
  const pct = internship.maxStudents > 0
    ? Math.round(((internship.students?.length || 0) / internship.maxStudents) * 100)
    : 0;
  const isAdmin = user?.role === 'admin';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'var(--blue-200)' : 'var(--slate-200)'}`,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        padding: '1.25rem 1.375rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-2px)' : '',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Status top stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cfg.bar, opacity: 0.6 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginTop: '0.25rem' }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'var(--blue-50)', border: '1px solid rgba(37,99,235,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.05)' : '',
        }}>
          <Briefcase size={21} style={{ color: 'var(--blue-600)' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                color: 'var(--slate-900)', letterSpacing: '-0.025em', marginBottom: '0.25rem',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {internship.title}
              </div>
              {internship.description && (
                <div style={{
                  fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '0.625rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {internship.description}
                </div>
              )}
              {/* Meta */}
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                {internship.department && <span className="badge badge-gray">{internship.department}</span>}
                {internship.mentor && <span className="badge badge-amber">👨‍🏫 {internship.mentor.name}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                  <Calendar size={11} />
                  {new Date(internship.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                  {new Date(internship.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                <button onClick={() => onEnroll(internship._id)} className="btn-secondary" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                  <UserPlus size={12} /> Enroll
                </button>
                <button onClick={() => onDelete(internship._id)} className="btn-icon danger">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Capacity bar */}
          <div style={{ marginTop: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                <Users size={11} /> {internship.students?.length || 0} of {internship.maxStudents} students
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: pct >= 90 ? 'var(--rose-500)' : pct >= 60 ? 'var(--amber-500)' : 'var(--emerald-500)' }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: pct >= 90 ? 'var(--rose-400)' : pct >= 60 ? 'var(--amber-400)' : 'var(--emerald-400)',
                borderRadius: 999,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternshipsPage() {
  const user = useAuthStore((s) => s.user);
  const [internships, setInternships] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [enrollId,    setEnrollId]    = useState(null);
  const [mentors,     setMentors]     = useState([]);
  const [students,    setStudents]    = useState([]);
  const [enrollStu,   setEnrollStu]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [form, setForm] = useState({ title: '', description: '', department: '', startDate: '', endDate: '', mentor: '', maxStudents: 10 });

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try { const { data } = await api.get('/internships'); setInternships(data.internships); }
    catch { toast.error('Failed to load internships'); }
    setLoading(false);
  };

  const openCreate = async () => {
    setShowCreate(true);
    const { data } = await api.get('/users', { params: { role: 'mentor' } });
    setMentors(data.users);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/internships', form);
      toast.success('Internship created!');
      setShowCreate(false);
      setForm({ title: '', description: '', department: '', startDate: '', endDate: '', mentor: '', maxStudents: 10 });
      fetchInternships();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const openEnroll = async (id) => {
    setEnrollId(id);
    setEnrollStu('');
    const { data } = await api.get('/users', { params: { role: 'student' } });
    setStudents(data.users);
  };

  const handleEnroll = async () => {
    if (!enrollStu) return toast.error('Select a student');
    setSaving(true);
    try {
      await api.post(`/internships/${enrollId}/enroll`, { studentId: enrollStu });
      toast.success('Student enrolled!');
      setEnrollId(null);
      fetchInternships();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return;
    try { await api.delete(`/internships/${id}`); toast.success('Deleted'); fetchInternships(); }
    catch { toast.error('Failed to delete'); }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <LoadingSpinner label="Loading internships…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--emerald-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Briefcase size={19} style={{ color: 'var(--emerald-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>Internships</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{internships.length} programs</div>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Internship
          </button>
        )}
      </div>

      {/* Cards */}
      {internships.length === 0 ? (
        <div className="card animate-fade-up stagger-1" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <Briefcase size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>No internships yet</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>{user?.role === 'admin' ? 'Create your first internship program.' : 'No programs assigned to you yet.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {internships.map((i, idx) => (
            <InternshipCard key={i._id} internship={i} user={user} index={idx} onEnroll={openEnroll} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create internship">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { k: 'title', label: 'Title', placeholder: 'e.g. Full-Stack Development Internship', required: true },
            { k: 'department', label: 'Department', placeholder: 'e.g. Engineering', required: false },
          ].map(({ k, label, placeholder, required }) => (
            <div key={k}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                {label} {!required && <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>}
              </label>
              <input value={form[k]} onChange={set(k)} className="input-field" placeholder={placeholder} required={required} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Description <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.description} onChange={set('description')} className="input-field" rows={2} placeholder="Internship details…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Start date</label>
              <input type="date" value={form.startDate} onChange={set('startDate')} className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>End date</label>
              <input type="date" value={form.endDate} onChange={set('endDate')} className="input-field" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Mentor</label>
              <select value={form.mentor} onChange={set('mentor')} className="input-field" required>
                <option value="">Select mentor…</option>
                {mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Max students</label>
              <input type="number" min={1} max={100} value={form.maxStudents} onChange={set('maxStudents')} className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : <><Plus size={15} /> Create internship</>}
          </button>
        </form>
      </Modal>

      {/* Enroll modal */}
      <Modal isOpen={!!enrollId} onClose={() => setEnrollId(null)} title="Enroll student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Select student</label>
            <select value={enrollStu} onChange={(e) => setEnrollStu(e.target.value)} className="input-field">
              <option value="">Choose a student…</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <button onClick={handleEnroll} disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {saving ? 'Enrolling…' : <><UserPlus size={14} /> Enroll student</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
