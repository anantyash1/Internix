import { useEffect, useState } from 'react';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Settings, Clock, Calendar, Camera, Save, RefreshCw, Check, Trash2, Plus } from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_SHORT = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const DAY_COLORS = {
  Monday: '#3b82f6', Tuesday: '#8b5cf6', Wednesday: '#10b981',
  Thursday: '#f59e0b', Friday: '#f43f5e', Saturday: '#06b6d4', Sunday: '#ec4899',
};

function DayToggle({ day, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 64, height: 64,
        borderRadius: 14,
        border: `2px solid ${selected ? DAY_COLORS[day] : 'var(--slate-200)'}`,
        background: selected ? DAY_COLORS[day] + '18' : '#fff',
        cursor: 'pointer',
        transition: 'all 180ms cubic-bezier(0.34,1.56,0.64,1)',
        transform: selected ? 'scale(1.04)' : '',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: selected ? DAY_COLORS[day] : 'var(--slate-400)' }}>
        {DAY_SHORT[day]}
      </span>
      {selected && <Check size={12} style={{ color: DAY_COLORS[day], marginTop: 2 }} />}
    </button>
  );
}

function ScheduleCard({ schedule, onDelete, index }) {
  return (
    <div className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`} style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      border: `1px solid ${schedule.isActive ? 'rgba(37,99,235,0.2)' : 'var(--slate-200)'}`,
      padding: '1.25rem 1.375rem',
      boxShadow: schedule.isActive ? '0 4px 16px rgba(37,99,235,0.08)' : 'var(--shadow-sm)',
      position: 'relative', overflow: 'hidden',
    }}>
      {schedule.isActive && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          color: '#fff', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em',
          padding: '3px 10px', borderRadius: '0 var(--radius-lg) 0 8px',
        }}>
          ACTIVE
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            {schedule.name || 'Work Schedule'}
            {schedule.internship && <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--slate-400)', marginLeft: '0.5rem' }}>· {schedule.internship?.title}</span>}
          </div>
          {/* Day pills */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
            {ALL_DAYS.map((d) => {
              const active = schedule.workingDays?.includes(d);
              return (
                <span key={d} style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                  background: active ? DAY_COLORS[d] + '18' : 'var(--slate-100)',
                  color: active ? DAY_COLORS[d] : 'var(--slate-400)',
                  border: `1px solid ${active ? DAY_COLORS[d] + '30' : 'transparent'}`,
                }}>
                  {DAY_SHORT[d]}
                </span>
              );
            })}
          </div>
          {/* Details */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
              <Clock size={14} style={{ color: 'var(--blue-500)' }} />
              {schedule.startTime} – {schedule.endTime}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
              Grace: {schedule.graceMinutes} min
            </div>
            {schedule.requirePhoto && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                <Camera size={13} style={{ color: 'var(--emerald-500)' }} /> Photo required
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
            Created by {schedule.createdBy?.name} · {new Date(schedule.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button onClick={() => onDelete(schedule._id)} className="btn-icon danger" style={{ flexShrink: 0 }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function WorkSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState({
    name: 'Default Schedule',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    requirePhoto: true,
    internshipId: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchInternships();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workschedule/all');
      setSchedules(data.schedules);
    } catch { toast.error('Failed to load schedules'); }
    setLoading(false);
  };

  const fetchInternships = async () => {
    try {
      const { data } = await api.get('/internships');
      setInternships(data.internships);
    } catch { /* ignore */ }
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.workingDays.length === 0) {
      return toast.error('Select at least one working day');
    }
    setSaving(true);
    try {
      await api.post('/workschedule', form);
      toast.success('Work schedule saved and activated!');
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/workschedule/${id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch { toast.error('Failed to delete'); }
  };

  const setPreset = (preset) => {
    const presets = {
      'mon-fri': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'mon-sat': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'all':     ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    };
    setForm((f) => ({ ...f, workingDays: presets[preset] }));
  };

  if (loading) return <LoadingSpinner label="Loading schedules…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
          <Settings size={21} style={{ color: 'var(--blue-600)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>Work Schedule</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Configure working days and hours for attendance</div>
        </div>
      </div>

      {/* Create form */}
      <div className="card animate-fade-up stagger-1" style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
          {schedules.some((s) => s.isActive) ? 'Update Schedule' : 'Create Schedule'}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Name + Internship row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Schedule name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Standard 5-Day Week" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Apply to internship <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional, blank = global)</span>
              </label>
              <select value={form.internshipId} onChange={(e) => setForm((f) => ({ ...f, internshipId: e.target.value }))} className="input-field">
                <option value="">All internships (global)</option>
                {internships.map((i) => <option key={i._id} value={i._id}>{i.title}</option>)}
              </select>
            </div>
          </div>

          {/* Working days */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}>Working days</label>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {[
                  { key: 'mon-fri', label: 'Mon–Fri' },
                  { key: 'mon-sat', label: 'Mon–Sat' },
                  { key: 'all', label: 'All 7' },
                ].map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setPreset(key)} style={{
                    padding: '0.25rem 0.625rem', borderRadius: 6,
                    border: '1px solid var(--slate-200)',
                    background: 'var(--slate-50)', color: 'var(--slate-600)',
                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.color = 'var(--blue-600)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.color = 'var(--slate-600)'; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {ALL_DAYS.map((day) => (
                <DayToggle key={day} day={day} selected={form.workingDays.includes(day)} onToggle={toggleDay} />
              ))}
            </div>
          </div>

          {/* Times + grace */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Start time
              </label>
              <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />End time
              </label>
              <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Grace period (minutes)</label>
              <input type="number" min={0} max={60} value={form.graceMinutes}
                onChange={(e) => setForm((f) => ({ ...f, graceMinutes: parseInt(e.target.value) || 0 }))}
                className="input-field" placeholder="15" />
            </div>
          </div>

          {/* Photo toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${form.requirePhoto ? 'rgba(37,99,235,0.2)' : 'var(--slate-200)'}`,
            background: form.requirePhoto ? 'var(--blue-50)' : 'var(--slate-50)',
            transition: 'all 200ms ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Camera size={18} style={{ color: form.requirePhoto ? 'var(--blue-600)' : 'var(--slate-400)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: form.requirePhoto ? 'var(--blue-700)' : 'var(--slate-700)' }}>
                  Require selfie photo
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Students must take a photo for check-in & check-out
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setForm((f) => ({ ...f, requirePhoto: !f.requirePhoto }))} style={{
              width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: form.requirePhoto ? 'var(--blue-600)' : 'var(--slate-300)',
              position: 'relative', transition: 'background 200ms ease', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2, left: form.requirePhoto ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Preview */}
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--slate-100)',
            fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--slate-900)' }}>Preview:</strong> Students work{' '}
            <strong>{form.workingDays.join(', ')}</strong> from{' '}
            <strong>{form.startTime}</strong> to <strong>{form.endTime}</strong>.
            {' '}Check-in within {form.graceMinutes} min of start is <strong>Present</strong>; after is <strong>Late</strong>.
            {form.requirePhoto && ' Selfie photo is mandatory.'}
          </div>

          <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {saving
              ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
              : <><Save size={14} /> Save & Activate Schedule</>
            }
          </button>
        </form>
      </div>

      {/* Existing schedules */}
      {schedules.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.875rem' }}>
            All schedules ({schedules.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {schedules.map((s, i) => (
              <ScheduleCard key={s._id} schedule={s} onDelete={handleDelete} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}