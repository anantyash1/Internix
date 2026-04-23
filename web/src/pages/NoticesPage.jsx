import { useEffect, useState } from 'react';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Bell, Plus, Trash2, Pin, RefreshCw, Eye, EyeOff,
  AlertCircle, Info, Megaphone, Clock, Edit3, Users,
} from 'lucide-react';

const PRIORITY_CFG = {
  urgent: { bg: 'var(--rose-100)', color: 'var(--rose-700)', border: 'rgba(244,63,94,0.2)', label: '🚨 Urgent' },
  high:   { bg: 'var(--amber-100)', color: '#92400e', border: 'rgba(245,158,11,0.2)', label: '⚠ High' },
  medium: { bg: 'var(--blue-100)', color: '#1d4ed8', border: 'rgba(37,99,235,0.15)', label: 'Medium' },
  low:    { bg: 'var(--slate-100)', color: 'var(--slate-600)', border: 'var(--slate-200)', label: 'Low' },
};

const TYPE_OPTIONS = [
  { value: 'general', label: 'General', icon: '📌' },
  { value: 'announcement', label: 'Announcement', icon: '📣' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'alert', label: 'Alert', icon: '⚠️' },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', priority: 'medium', type: 'general',
    targetRoles: ['all'], isPinned: false, expiresAt: '',
  });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notices/all');
      setNotices(data.notices || []);
    } catch { toast.error('Failed to load notices'); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditNotice(null);
    setForm({ title: '', content: '', priority: 'medium', type: 'general', targetRoles: ['all'], isPinned: false, expiresAt: '' });
    setShowCreate(true);
  };

  const openEdit = (notice) => {
    setEditNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      type: notice.type,
      targetRoles: notice.targetRoles,
      isPinned: notice.isPinned,
      expiresAt: notice.expiresAt ? notice.expiresAt.substring(0, 16) : '',
    });
    setShowCreate(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, expiresAt: form.expiresAt || null };
      if (editNotice) {
        await api.put(`/notices/${editNotice._id}`, payload);
        toast.success('Notice updated!');
      } else {
        await api.post('/notices', payload);
        toast.success('Notice published!');
      }
      setShowCreate(false);
      fetchNotices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const togglePin = async (notice) => {
    try {
      await api.put(`/notices/${notice._id}`, { isPinned: !notice.isPinned });
      fetchNotices();
    } catch { toast.error('Failed'); }
  };

  const toggleActive = async (notice) => {
    try {
      await api.put(`/notices/${notice._id}`, { isActive: !notice.isActive });
      fetchNotices();
      toast.success(notice.isActive ? 'Notice hidden' : 'Notice visible');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try { await api.delete(`/notices/${id}`); toast.success('Deleted'); fetchNotices(); }
    catch { toast.error('Failed'); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: typeof e === 'object' && e.target ? e.target.value : e }));

  const toggleRole = (role) => {
    setForm(f => {
      const current = f.targetRoles;
      if (role === 'all') return { ...f, targetRoles: ['all'] };
      const withoutAll = current.filter(r => r !== 'all');
      if (withoutAll.includes(role)) {
        const next = withoutAll.filter(r => r !== role);
        return { ...f, targetRoles: next.length === 0 ? ['all'] : next };
      }
      return { ...f, targetRoles: [...withoutAll, role] };
    });
  };

  if (loading) return <LoadingSpinner label="Loading notices…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--amber-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Bell size={19} style={{ color: 'var(--amber-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>Notice Board</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{notices.length} notices</div>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> New Notice
        </button>
      </div>

      {/* Notices */}
      {notices.length === 0 ? (
        <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Bell size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--slate-600)' }}>No notices yet</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>Publish notices for students and mentors</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notices.map((notice, i) => {
            const cfg = PRIORITY_CFG[notice.priority] || PRIORITY_CFG.medium;
            return (
              <div key={notice._id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`} style={{
                background: '#fff', borderRadius: 'var(--radius-lg)',
                border: `1px solid ${notice.isActive ? cfg.border : 'var(--slate-200)'}`,
                padding: '1rem 1.25rem',
                opacity: notice.isActive ? 1 : 0.6,
                boxShadow: 'var(--shadow-sm)',
                position: 'relative', overflow: 'hidden',
              }}>
                {notice.isPinned && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--amber-500)', color: '#fff', fontSize: '0.5625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '0 var(--radius-lg) 0 6px' }}>
                    📌 PINNED
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span className={`badge`} style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label || notice.priority}
                      </span>
                      <span className="badge badge-gray">{TYPE_OPTIONS.find(t => t.value === notice.type)?.icon} {notice.type}</span>
                      {notice.targetRoles.map(r => (
                        <span key={r} className="badge badge-gray"><Users size={9} /> {r}</span>
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                      {notice.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                      {notice.content}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      By {notice.createdBy?.name} · {new Date(notice.createdAt).toLocaleString()}
                      {notice.expiresAt && ` · Expires ${new Date(notice.expiresAt).toLocaleDateString()}`}
                      · Read by {notice.readBy?.length || 0} users
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button onClick={() => togglePin(notice)} className="btn-icon" title={notice.isPinned ? 'Unpin' : 'Pin'}>
                      <Pin size={14} style={{ color: notice.isPinned ? 'var(--amber-500)' : 'var(--slate-400)' }} />
                    </button>
                    <button onClick={() => toggleActive(notice)} className="btn-icon" title={notice.isActive ? 'Hide' : 'Show'}>
                      {notice.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => openEdit(notice)} className="btn-icon"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(notice._id)} className="btn-icon danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={editNotice ? 'Edit Notice' : 'Publish New Notice'} width={560}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Title *</label>
            <input value={form.title} onChange={set('title')} className="input-field" placeholder="Notice title…" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Content *</label>
            <textarea value={form.content} onChange={set('content')} className="input-field" rows={4} placeholder="Notice details…" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Priority</label>
              <select value={form.priority} onChange={set('priority')} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Type</label>
              <select value={form.type} onChange={set('type')} className="input-field">
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>Visible to</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'student', 'mentor', 'admin'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  style={{
                    padding: '0.3125rem 0.75rem', borderRadius: 999, border: 'none',
                    background: form.targetRoles.includes(role) ? 'var(--blue-600)' : 'var(--slate-100)',
                    color: form.targetRoles.includes(role) ? '#fff' : 'var(--slate-600)',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'all 150ms',
                    textTransform: 'capitalize',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              Expires at <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')} className="input-field" />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
            border: `1px solid ${form.isPinned ? 'rgba(245,158,11,0.3)' : 'var(--slate-200)'}`,
            background: form.isPinned ? 'var(--amber-50)' : 'var(--slate-50)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pin size={15} style={{ color: form.isPinned ? 'var(--amber-500)' : 'var(--slate-400)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: form.isPinned ? '#92400e' : 'var(--slate-700)' }}>Pin to top of notice board</span>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))} style={{
              width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: form.isPinned ? 'var(--amber-400)' : 'var(--slate-300)',
              position: 'relative', transition: 'background 200ms',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: form.isPinned ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {saving
              ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> {editNotice ? 'Updating…' : 'Publishing…'}</>
              : <><Bell size={14} /> {editNotice ? 'Update Notice' : 'Publish Notice'}</>
            }
          </button>
        </form>
      </Modal>
    </div>
  );
}