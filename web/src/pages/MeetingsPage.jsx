import { useEffect, useState } from 'react';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Video, Plus, Trash2, Edit3, RefreshCw, Clock,
  Calendar, Users, Link, Bell, ExternalLink,
} from 'lucide-react';

const FREQ_CFG = {
  once:    { label: 'One-time',  bg: 'var(--slate-100)',   color: 'var(--slate-600)',   border: 'var(--slate-200)' },
  daily:   { label: 'Daily',    bg: 'var(--blue-100)',    color: '#1d4ed8',            border: 'rgba(37,99,235,0.2)' },
  weekly:  { label: 'Weekly',   bg: 'var(--violet-100)',  color: '#5b21b6',            border: 'rgba(139,92,246,0.2)' },
  monthly: { label: 'Monthly',  bg: 'var(--emerald-100)', color: '#065f46',            border: 'rgba(16,185,129,0.2)' },
};

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const labelStyle = {
  display: 'block', fontSize: '0.8125rem',
  fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem',
};

function MeetingCard({ meeting, onEdit, onDelete, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg = FREQ_CFG[meeting.frequency] || FREQ_CFG.once;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#fdf8f0',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'var(--blue-200)' : 'rgba(210,180,140,0.4)'}`,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        padding: '1.25rem 1.375rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-2px)' : '',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Color stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginTop: '0.25rem' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'var(--blue-50)', border: '1px solid rgba(37,99,235,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.06) rotate(-3deg)' : '',
        }}>
          <Video size={21} style={{ color: 'var(--blue-600)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.25rem',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {meeting.title}
              </div>
              {meeting.description && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {meeting.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 999, fontSize: '0.6875rem',
                  fontWeight: 700, background: cfg.bg, color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}>
                  {cfg.label}
                </span>
                <span className="badge badge-gray">
                  <Clock size={10} /> {meeting.meetingTime}
                </span>
                {meeting.frequency === 'weekly' && (
                  <span className="badge badge-gray">{DAY_NAMES[meeting.dayOfWeek]}</span>
                )}
                {meeting.frequency === 'monthly' && (
                  <span className="badge badge-gray">Day {meeting.dayOfMonth}</span>
                )}
                {meeting.frequency === 'once' && meeting.specificDate && (
                  <span className="badge badge-gray">
                    {new Date(meeting.specificDate).toLocaleDateString()}
                  </span>
                )}
                <span className="badge badge-gray">
                  <Bell size={10} /> {meeting.notifyMinutesBefore} min before
                </span>
                {meeting.targetRoles.map(r => (
                  <span key={r} className="badge badge-gray">
                    <Users size={9} /> {r}
                  </span>
                ))}
              </div>
              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--blue-600)',
                    textDecoration: 'none', fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  <ExternalLink size={11} /> {meeting.meetingLink}
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
              <button onClick={() => onEdit(meeting)} className="btn-icon" title="Edit">
                <Edit3 size={14} />
              </button>
              <button onClick={() => onDelete(meeting._id)} className="btn-icon danger" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingFormModal({ isOpen, onClose, onSuccess, editMeeting = null }) {
  const [form, setForm] = useState({
    title: '', description: '', meetingLink: '',
    frequency: 'weekly', meetingTime: '10:00',
    dayOfWeek: 1, dayOfMonth: 1, specificDate: '',
    targetRoles: ['all'], notifyMinutesBefore: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editMeeting) {
      setForm({
        title: editMeeting.title || '',
        description: editMeeting.description || '',
        meetingLink: editMeeting.meetingLink || '',
        frequency: editMeeting.frequency || 'weekly',
        meetingTime: editMeeting.meetingTime || '10:00',
        dayOfWeek: editMeeting.dayOfWeek ?? 1,
        dayOfMonth: editMeeting.dayOfMonth ?? 1,
        specificDate: editMeeting.specificDate
          ? new Date(editMeeting.specificDate).toISOString().substring(0, 10) : '',
        targetRoles: editMeeting.targetRoles || ['all'],
        notifyMinutesBefore: editMeeting.notifyMinutesBefore ?? 5,
      });
    } else {
      setForm({
        title: '', description: '', meetingLink: '',
        frequency: 'weekly', meetingTime: '10:00',
        dayOfWeek: 1, dayOfMonth: 1, specificDate: '',
        targetRoles: ['all'], notifyMinutesBefore: 5,
      });
    }
  }, [editMeeting, isOpen]);

  const set = k => e => setForm(f => ({ ...f, [k]: typeof e === 'object' && e.target ? e.target.value : e }));

  const toggleRole = (role) => {
    setForm(f => {
      if (role === 'all') return { ...f, targetRoles: ['all'] };
      const without = f.targetRoles.filter(r => r !== 'all');
      if (without.includes(role)) {
        const next = without.filter(r => r !== role);
        return { ...f, targetRoles: next.length === 0 ? ['all'] : next };
      }
      return { ...f, targetRoles: [...without, role] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        dayOfWeek: parseInt(form.dayOfWeek),
        dayOfMonth: parseInt(form.dayOfMonth),
        notifyMinutesBefore: parseInt(form.notifyMinutesBefore),
        specificDate: form.frequency === 'once' ? form.specificDate : null,
      };
      if (editMeeting) {
        await api.put(`/meetings/${editMeeting._id}`, payload);
        toast.success('Meeting updated!');
      } else {
        await api.post('/meetings', payload);
        toast.success('Meeting scheduled!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editMeeting ? 'Edit Meeting' : 'Schedule Meeting'} width={560}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Meeting Title *</label>
          <input value={form.title} onChange={set('title')} className="input-field" placeholder="e.g. Weekly Team Standup" required />
        </div>
        <div>
          <label style={labelStyle}>Description <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span></label>
          <textarea value={form.description} onChange={set('description')} className="input-field" rows={2} placeholder="Meeting agenda or notes…" />
        </div>
        <div>
          <label style={labelStyle}>
            <Link size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Meeting Link <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input value={form.meetingLink} onChange={set('meetingLink')} className="input-field" placeholder="https://meet.google.com/..." type="url" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Frequency *</label>
            <select value={form.frequency} onChange={set('frequency')} className="input-field">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="once">One-time</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Time *</label>
            <input type="time" value={form.meetingTime} onChange={set('meetingTime')} className="input-field" required />
          </div>
        </div>

        {form.frequency === 'weekly' && (
          <div>
            <label style={labelStyle}>Day of Week</label>
            <select value={form.dayOfWeek} onChange={set('dayOfWeek')} className="input-field">
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
        )}
        {form.frequency === 'monthly' && (
          <div>
            <label style={labelStyle}>Day of Month</label>
            <input type="number" min={1} max={31} value={form.dayOfMonth} onChange={set('dayOfMonth')} className="input-field" />
          </div>
        )}
        {form.frequency === 'once' && (
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" value={form.specificDate} onChange={set('specificDate')} className="input-field" required />
          </div>
        )}

        <div>
          <label style={labelStyle}><Bell size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Notify X minutes before</label>
          <select value={form.notifyMinutesBefore} onChange={set('notifyMinutesBefore')} className="input-field">
            {[1, 2, 5, 10, 15, 30].map(v => (
              <option key={v} value={v}>{v} minute{v > 1 ? 's' : ''} before</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}><Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Visible to</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'student', 'mentor', 'admin'].map(role => (
              <button
                key={role} type="button" onClick={() => toggleRole(role)}
                style={{
                  padding: '0.3125rem 0.75rem', borderRadius: 999, border: 'none',
                  background: form.targetRoles.includes(role) ? 'var(--blue-600)' : 'var(--slate-100)',
                  color: form.targetRoles.includes(role) ? '#fff' : 'var(--slate-600)',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', transition: 'all 150ms',
                  textTransform: 'capitalize',
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
          {saving
            ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {editMeeting ? 'Updating…' : 'Scheduling…'}</>
            : <><Video size={14} /> {editMeeting ? 'Update Meeting' : 'Schedule Meeting'}</>
          }
        </button>
      </form>
    </Modal>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/meetings/all');
      setMeetings(data.meetings || []);
    } catch { toast.error('Failed to load meetings'); }
    setLoading(false);
  };

  const openCreate = () => { setEditMeeting(null); setShowForm(true); };
  const openEdit = (m) => { setEditMeeting(m); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    try { await api.delete(`/meetings/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner label="Loading meetings…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
            <Video size={19} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Meeting Schedule
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{meetings.length} scheduled meeting{meetings.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Schedule Meeting
        </button>
      </div>

      {/* Info banner */}
      <div className="animate-fade-up stagger-1" style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
        fontSize: '0.8125rem', color: 'var(--blue-700)',
      }}>
        <Bell size={14} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
        Students and mentors receive a pop-up notification before each meeting based on the configured notify time.
      </div>

      {/* List */}
      {meetings.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <Video size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            No meetings scheduled yet
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            Schedule daily, weekly, or monthly meetings for your team.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {meetings.map((m, i) => (
            <MeetingCard key={m._id} meeting={m} index={i} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <MeetingFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditMeeting(null); }}
        onSuccess={fetchAll}
        editMeeting={editMeeting}
      />
    </div>
  );
}