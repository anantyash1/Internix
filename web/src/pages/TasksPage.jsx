import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Play, CheckCircle, Clock, AlertCircle,
  ListTodo, Filter, ChevronDown, Calendar,
} from 'lucide-react';

/* ── Constants ── */
const STATUS_MAP = {
  pending:     { label: 'Pending',     cls: 'badge-gray',   icon: <Clock size={10} />,        dot: '#94a3b8' },
  in_progress: { label: 'In progress', cls: 'badge-blue',   icon: <Play size={10} />,         dot: '#3b82f6' },
  completed:   { label: 'Completed',   cls: 'badge-green',  icon: <CheckCircle size={10} />,  dot: '#10b981' },
  reviewed:    { label: 'Reviewed',    cls: 'badge-violet', icon: <CheckCircle size={10} />,  dot: '#8b5cf6' },
};

const PRIORITY_MAP = {
  low:    { cls: 'badge-green', bar: '#10b981', pct: 33  },
  medium: { cls: 'badge-amber', bar: '#f59e0b', pct: 66  },
  high:   { cls: 'badge-red',   bar: '#f43f5e', pct: 100 },
};

/* ── Task card ── */
function TaskCard({ task, user, onStatusUpdate, onDelete, index }) {
  const [hovered, setHovered] = useState(false);
  const [actioning, setActioning] = useState(false);
  const st = STATUS_MAP[task.status] || STATUS_MAP.pending;
  const pr = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleAction = async (newStatus) => {
    setActioning(true);
    await onStatusUpdate(task._id, newStatus);
    setActioning(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'var(--blue-200)' : overdue ? 'rgba(244,63,94,0.2)' : 'var(--slate-200)'}`,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        padding: '1.125rem 1.25rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-1px)' : '',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Priority accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: pr.bar, borderRadius: '3px 0 0 3px',
        opacity: 0.7,
      }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--slate-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {task.title}
            </div>
            {task.description && (
              <div style={{
                fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {task.description}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            {user?.role === 'student' && task.status === 'pending' && (
              <button
                onClick={() => handleAction('in_progress')}
                disabled={actioning}
                className="btn-secondary"
                style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
              >
                <Play size={12} /> Start
              </button>
            )}
            {user?.role === 'student' && task.status === 'in_progress' && (
              <button
                onClick={() => handleAction('completed')}
                disabled={actioning}
                className="btn-primary"
                style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
              >
                <CheckCircle size={12} /> Done
              </button>
            )}
            {isMentorAdmin && (
              <button
                onClick={() => onDelete(task._id)}
                className="btn-icon danger"
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <span className={`badge ${st.cls}`}>
            {st.icon} {st.label}
          </span>
          <span className={`badge ${pr.cls}`} style={{ textTransform: 'capitalize' }}>
            {task.priority}
          </span>
          {task.assignedTo && (
            <span className="badge badge-gray">
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: 'var(--blue-600)' }}>
                {task.assignedTo.name?.charAt(0)}
              </div>
              {task.assignedTo.name}
            </span>
          )}
          {task.dueDate && (
            <span className={`badge ${overdue ? 'badge-red' : 'badge-gray'}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Calendar size={10} />
              {overdue ? '⚠ ' : ''}{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Feedback */}
        {task.feedback && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--blue-50)',
            border: '1px solid var(--blue-100)',
            fontSize: '0.8125rem',
            color: 'var(--blue-700)',
            lineHeight: 1.5,
          }}>
            💬 {task.feedback}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Create task modal ── */
function CreateModal({ isOpen, onClose, users, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onCreate(form);
    setSaving(false);
    if (ok) { onClose(); setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' }); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Title</label>
          <input value={form.title} onChange={set('title')} className="input-field" placeholder="Task title…" required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Description</label>
          <textarea value={form.description} onChange={set('description')} className="input-field" placeholder="What needs to be done?" rows={3} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Assign to</label>
          <select value={form.assignedTo} onChange={set('assignedTo')} className="input-field" required>
            <option value="">Select student…</option>
            {users.filter((u) => u.role === 'student').map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Priority</label>
            <select value={form.priority} onChange={set('priority')} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Due date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
          {saving ? (
            <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating…</>
          ) : (
            <><Plus size={15} /> Create task</>
          )}
        </button>
      </form>
    </Modal>
  );
}

/* ── Main page ── */
export default function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    if (isMentorAdmin) fetchUsers({ role: 'student' });
  }, []);

  const handleCreate = async (form) => {
    try {
      await createTask(form);
      toast.success('Task created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      return false;
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateTask(id, { status });
      toast.success(status === 'completed' ? '🎉 Task completed!' : 'Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const counts   = { all: tasks.length, ...Object.fromEntries(['pending','in_progress','completed','reviewed'].map((s) => [s, tasks.filter((t) => t.status === s).length])) };

  if (loading) return <LoadingSpinner label="Loading tasks…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1900, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
            <ListTodo size={19} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              {user?.role === 'student' ? 'My Tasks' : 'Tasks'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{tasks.length} total tasks</div>
          </div>
        </div>
        {isMentorAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={15} /> New Task
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="animate-fade-up stagger-1" style={{
        display: 'flex', gap: '0.25rem',
        background: 'var(--slate-100)', borderRadius: 10, padding: '0.25rem',
        width: 'fit-content',
      }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In progress' },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 8, border: 'none',
              background: filter === key ? '#ffffff' : 'transparent',
              color: filter === key ? 'var(--slate-900)' : 'var(--slate-500)',
              fontSize: '0.8125rem', fontWeight: filter === key ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: 'var(--font-body)',
              boxShadow: filter === key ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {label}
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700,
              padding: '0.0625rem 0.375rem', borderRadius: 999,
              background: filter === key ? 'var(--blue-100)' : 'var(--slate-200)',
              color: filter === key ? 'var(--blue-600)' : 'var(--slate-500)',
            }}>
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <ListTodo size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            No tasks {filter !== 'all' ? `with status "${filter.replace('_', ' ')}"` : 'yet'}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {isMentorAdmin ? 'Create a task using the button above.' : 'Your mentor will assign tasks here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map((task, i) => (
            <TaskCard
              key={task._id} task={task} user={user} index={i}
              onStatusUpdate={handleStatus} onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        users={users}
        onCreate={handleCreate}
      />
    </div>
  );
}
