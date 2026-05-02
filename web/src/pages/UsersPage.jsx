import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Users, Search, UserCog, Trash2, Lock } from 'lucide-react';

const ROLE_STYLE = {
  admin:  { cls: 'badge-violet', dot: 'var(--violet-500)', gradient: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' },
  mentor: { cls: 'badge-amber',  dot: 'var(--amber-500)',  gradient: 'linear-gradient(135deg, #fef3c7, #fffbeb)' },
  student:{ cls: 'badge-blue',   dot: 'var(--blue-500)',   gradient: 'linear-gradient(135deg, #dbeafe, #eff6ff)' },
};

function UserRow({ u, currentUser, onAssign, onDelete, onResetPassword }) {
  const [hovered, setHovered] = useState(false);
  const rs = ROLE_STYLE[u.role] || ROLE_STYLE.student;

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--slate-50)' : '', transition: 'background 120ms' }}
    >
      <td style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: rs.gradient,
            border: `1.5px solid ${rs.dot}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem',
            color: rs.dot,
          }}>
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)' }}>{u.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{u.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge ${rs.cls}`} style={{ textTransform: 'capitalize' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: rs.dot }} />
          {u.role}
        </span>
      </td>
      <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
        {u.mentor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--amber-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--amber-600)' }}>
              {u.mentor.name?.charAt(0)}
            </div>
            {u.mentor.name}
          </div>
        ) : <span style={{ color: 'var(--slate-300)' }}>—</span>}
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive ? 'var(--emerald-500)' : 'var(--rose-400)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: u.isActive ? 'var(--emerald-600)' : 'var(--rose-500)', fontWeight: 500 }}>
            {u.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      <td style={{ fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      {currentUser?.role === 'admin' && (
        <td>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {u.role === 'student' && (
              <button onClick={() => onAssign(u._id)} className="btn-icon" title="Assign mentor">
                <UserCog size={14} />
              </button>
            )}
            {(u.role === 'student' || u.role === 'mentor') && (
              <button type="button" onClick={() => onResetPassword(u)} className="btn-icon" title="Reset password">
                <Lock size={14} />
              </button>
            )}
            <button onClick={() => onDelete(u._id)} className="btn-icon danger" title="Delete user">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const { users, loading, fetchUsers, assignMentor, deleteUser, resetUserPassword } = useUserStore();
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [assignId,   setAssignId]   = useState(null);
  const [mentors,    setMentors]    = useState([]);
  const [selMentor,  setSelMentor]  = useState('');
  const [assigning,  setAssigning]  = useState(false);
  const [resetUser,  setResetUser]  = useState(null);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers({ search, role: roleFilter }), 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const openAssign = async (studentId) => {
    setAssignId(studentId);
    setSelMentor('');
    const allMentors = users.filter((u) => u.role === 'mentor');
    if (allMentors.length === 0) {
      const { data } = await (await import('../lib/axios')).default.get('/users', { params: { role: 'mentor' } });
      setMentors(data.users);
    } else setMentors(allMentors);
  };

  const handleAssign = async () => {
    if (!selMentor) return toast.error('Select a mentor');
    setAssigning(true);
    try {
      await assignMentor(assignId, selMentor);
      toast.success('Mentor assigned!');
      setAssignId(null);
      fetchUsers({ search, role: roleFilter });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setAssigning(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try { await deleteUser(id); toast.success('User deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const openResetPassword = (u) => {
    setResetUser(u);
    setNewPw('');
    setConfirmPw('');
  };

  const closeResetPassword = () => {
    setResetUser(null);
    setNewPw('');
    setConfirmPw('');
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetUser) return;
    if (newPw.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    setResetting(true);
    try {
      await resetUserPassword(resetUser._id, newPw);
      toast.success('Password updated');
      closeResetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
    setResetting(false);
  };

  if (loading) return <LoadingSpinner label="Loading users…" />;

  const roleGroups = ['all', 'student', 'mentor', 'admin'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
            <Users size={19} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              {user?.role === 'mentor' ? 'My Students' : 'Users'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{users.length} total users</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {user?.role === 'admin' && (
        <div className="animate-fade-up stagger-1" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', maxWidth: 340 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input-field"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          {/* Role tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--slate-100)', borderRadius: 10, padding: '0.25rem' }}>
            {roleGroups.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r === 'all' ? '' : r)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 8, border: 'none',
                  background: (r === 'all' ? roleFilter === '' : roleFilter === r) ? '#ffffff' : 'transparent',
                  color: (r === 'all' ? roleFilter === '' : roleFilter === r) ? 'var(--slate-900)' : 'var(--slate-500)',
                  fontSize: '0.8125rem', fontWeight: (r === 'all' ? roleFilter === '' : roleFilter === r) ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                  transition: 'all 150ms',
                  boxShadow: (r === 'all' ? roleFilter === '' : roleFilter === r) ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {users.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <Users size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            No users found
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {search ? 'Try a different search term.' : 'No users registered yet.'}
          </div>
        </div>
      ) : (
        <div className="card animate-fade-up stagger-2" style={{ padding: 0 }}>
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>User</th>
                <th>Role</th>
                <th>Mentor</th>
                <th>Status</th>
                <th>Joined</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u._id}
                  u={u}
                  currentUser={user}
                  onAssign={openAssign}
                  onDelete={handleDelete}
                  onResetPassword={openResetPassword}
                />
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Reset password (admin) */}
      <Modal
        isOpen={!!resetUser}
        onClose={closeResetPassword}
        title={resetUser ? `Reset password — ${resetUser.name}` : 'Reset password'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resetUser && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Set a new password for <strong style={{ color: 'var(--slate-700)' }}>{resetUser.email}</strong>. They will sign in with it on the next visit.
            </p>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              New password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="input-field"
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="input-field"
              autoComplete="new-password"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="button"
            onClick={handleResetPasswordSubmit}
            disabled={resetting || !newPw || !confirmPw}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.625rem' }}
          >
            {resetting ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </Modal>

      {/* Assign mentor modal */}
      <Modal isOpen={!!assignId} onClose={() => setAssignId(null)} title="Assign mentor">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Select mentor</label>
            <select value={selMentor} onChange={(e) => setSelMentor(e.target.value)} className="input-field">
              <option value="">Choose a mentor…</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <button onClick={handleAssign} disabled={assigning} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {assigning ? 'Assigning…' : 'Assign mentor'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
