import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Users, Plus, Trash2, UserPlus, UserMinus, RefreshCw,
  Briefcase, Palette, ChevronRight, X, Search,
} from 'lucide-react';

const GROUP_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#d97706', '#f43f5e',
  '#0891b2', '#65a30d', '#c026d3', '#ea580c', '#0284c7',
];

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
      {GROUP_COLORS.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          style={{
            width: 26, height: 26, borderRadius: 6, border: 'none',
            background: color, cursor: 'pointer',
            outline: value === color ? `3px solid ${color}` : 'none',
            outlineOffset: 2,
            transform: value === color ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 150ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      ))}
    </div>
  );
}

function GroupCard({ group, user, onEdit, onDelete, onManageStudents, index }) {
  const [hovered, setHovered] = useState(false);
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? group.color + '40' : 'var(--slate-200)'}`,
        boxShadow: hovered ? `0 8px 24px ${group.color}18` : 'var(--shadow-sm)',
        padding: '1.25rem 1.375rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-2px)' : '',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Color strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: group.color,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginTop: '0.25rem' }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: group.color + '18',
          border: `1px solid ${group.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem',
          color: group.color,
          transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.05)' : '',
        }}>
          {group.name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                color: 'var(--slate-900)', letterSpacing: '-0.025em', marginBottom: '0.125rem',
              }}>
                {group.name}
              </div>
              {group.domain && (
                <span style={{
                  display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: group.color + '15', color: group.color,
                  border: `1px solid ${group.color}25`,
                  marginBottom: '0.375rem',
                }}>
                  {group.domain}
                </span>
              )}
              {group.description && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {group.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-gray">
                  <Briefcase size={10} /> {group.internship?.title || 'No internship'}
                </span>
                <span className="badge" style={{ background: group.color + '15', color: group.color, border: `1px solid ${group.color}25` }}>
                  <Users size={10} /> {group.students?.length || 0} students
                </span>
                {group.mentor && (
                  <span className="badge badge-gray">👨‍🏫 {group.mentor.name}</span>
                )}
              </div>
            </div>

            {isMentorAdmin && (
              <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                <button
                  onClick={() => onManageStudents(group)}
                  className="btn-secondary"
                  style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
                >
                  <UserPlus size={12} /> Members
                </button>
                <button onClick={() => onDelete(group._id)} className="btn-icon danger">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Students avatars */}
          {group.students?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
              {group.students.slice(0, 6).map((s, i) => (
                <div key={s._id || i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `hsl(${(s.name?.charCodeAt(0) || 65) * 137 % 360}, 55%, 65%)`,
                  border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 700, color: '#fff',
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 10 - i,
                  position: 'relative',
                  title: s.name,
                }}>
                  {s.name?.charAt(0).toUpperCase()}
                </div>
              ))}
              {group.students.length > 6 && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--slate-200)', border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', fontWeight: 700, color: 'var(--slate-500)',
                  marginLeft: -8, position: 'relative',
                }}>
                  +{group.students.length - 6}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const user = useAuthStore(s => s.user);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [manageGroup, setManageGroup] = useState(null);
  const [internships, setInternships] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', domain: '', internshipId: '', color: '#2563eb', studentIds: [] });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, iRes] = await Promise.all([
        api.get('/groups'),
        api.get('/internships'),
      ]);
      setGroups(gRes.data.groups || []);
      setInternships(iRes.data.internships || []);
    } catch { toast.error('Failed to load groups'); }
    setLoading(false);
  };

  const openManage = async (group) => {
    setManageGroup(group);
    try {
      const { data } = await api.get('/users', { params: { role: 'student' } });
      setAllStudents(data.users || []);
    } catch { toast.error('Failed to load students'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/groups', form);
      toast.success('Group created!');
      setShowCreate(false);
      setForm({ name: '', description: '', domain: '', internshipId: '', color: '#2563eb', studentIds: [] });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleAddStudent = async (studentId) => {
    try {
      const { data } = await api.post(`/groups/${manageGroup._id}/add-student`, { studentId });
      setManageGroup(data.group);
      fetchAll();
      toast.success('Student added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await api.delete(`/groups/${manageGroup._id}/remove-student/${studentId}`);
      setManageGroup(prev => ({ ...prev, students: prev.students.filter(s => (s._id || s) !== studentId) }));
      fetchAll();
      toast.success('Student removed');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this group?')) return;
    try { await api.delete(`/groups/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.domain?.toLowerCase().includes(search.toLowerCase()) ||
    g.internship?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  if (loading) return <LoadingSpinner label="Loading groups…" />;

  const groupStudentIds = new Set((manageGroup?.students || []).map(s => s._id || s));
  const availableStudents = allStudents.filter(s => !groupStudentIds.has(s._id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Users size={19} style={{ color: 'var(--violet-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Student Groups
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              {groups.length} group{groups.length !== 1 ? 's' : ''} by internship domain
            </div>
          </div>
        </div>
        {isMentorAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={15} /> New Group
          </button>
        )}
      </div>

      {/* Search */}
      {groups.length > 0 && (
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search groups by name or domain…"
            className="input-field"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      )}

      {/* Groups grid */}
      {filteredGroups.length === 0 ? (
        <div className="card animate-fade-up stagger-1" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <Users size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            {search ? 'No groups found' : 'No groups yet'}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {isMentorAdmin ? 'Create your first student group to organize by internship domain.' : 'Your mentor will assign you to a group.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '0.875rem' }}>
          {filteredGroups.map((g, i) => (
            <GroupCard
              key={g._id} group={g} user={user} index={i}
              onEdit={() => {}} onDelete={handleDelete} onManageStudents={openManage}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Student Group" width={540}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Group Name *</label>
            <input value={form.name} onChange={set('name')} className="input-field" placeholder="e.g. Frontend Developers" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              Domain <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input value={form.domain} onChange={set('domain')} className="input-field" placeholder="e.g. Full-Stack Dev, Data Science, ML" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              Description <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea value={form.description} onChange={set('description')} className="input-field" rows={2} placeholder="Brief description of this group's focus…" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Internship *</label>
            <select value={form.internshipId} onChange={set('internshipId')} className="input-field" required>
              <option value="">Select internship…</option>
              {internships.map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
              <Palette size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Group Color
            </label>
            <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : <><Plus size={15} /> Create Group</>}
          </button>
        </form>
      </Modal>

      {/* Manage Students Modal */}
      <Modal isOpen={!!manageGroup} onClose={() => setManageGroup(null)} title={`Manage Members — ${manageGroup?.name}`} width={600}>
        {manageGroup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Current members */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.625rem' }}>
                Current Members ({manageGroup.students?.length || 0})
              </div>
              {(!manageGroup.students || manageGroup.students.length === 0) ? (
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--slate-50)', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
                  No members yet. Add students below.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 200, overflowY: 'auto' }}>
                  {manageGroup.students.map(s => (
                    <div key={s._id || s} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--slate-100)',
                      background: 'var(--slate-50)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: `hsl(${(s.name?.charCodeAt(0) || 65) * 137 % 360}, 55%, 65%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-900)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>{s.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(s._id || s)}
                        className="btn-icon danger"
                        style={{ width: 26, height: 26 }}
                        title="Remove from group"
                      >
                        <UserMinus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add students */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.625rem' }}>
                Add Students ({availableStudents.length} available)
              </div>
              {availableStudents.length === 0 ? (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--slate-50)', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
                  All students are already in this group.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 200, overflowY: 'auto' }}>
                  {availableStudents.map(s => (
                    <div key={s._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--slate-200)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'var(--slate-100)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, color: 'var(--slate-600)', flexShrink: 0,
                        }}>
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-800)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>{s.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudent(s._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 6, border: 'none',
                          background: manageGroup.color + '18', color: manageGroup.color,
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <UserPlus size={11} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}