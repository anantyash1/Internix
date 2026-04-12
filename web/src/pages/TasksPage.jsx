import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  reviewed: 'bg-purple-100 text-purple-700',
};

const priorityColors = {
  low: 'bg-green-50 text-green-600',
  medium: 'bg-yellow-50 text-yellow-600',
  high: 'bg-red-50 text-red-600',
};

export default function TasksPage() {
  const user = useAuthStore((s) => s.user);
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'mentor' || user?.role === 'admin') {
      fetchUsers({ role: 'student' });
    }
  }, [fetchTasks, fetchUsers, user?.role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTask(form);
      toast.success('Task created');
      setShowModal(false);
      setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTask(id, { status });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isMentorOrAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'student' ? 'My Tasks' : 'Tasks'}
        </h1>
        {isMentorOrAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No tasks found</div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {task.assignedTo && <span>Assigned to: {task.assignedTo.name}</span>}
                  {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  {task.feedback && <span className="text-primary-600">Feedback: {task.feedback}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user?.role === 'student' && task.status === 'pending' && (
                  <button onClick={() => handleStatusUpdate(task._id, 'in_progress')} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg" title="Start">
                    <Edit2 size={16} />
                  </button>
                )}
                {user?.role === 'student' && task.status === 'in_progress' && (
                  <button onClick={() => handleStatusUpdate(task._id, 'completed')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg" title="Complete">
                    <CheckCircle size={16} />
                  </button>
                )}
                {isMentorOrAdmin && (
                  <button onClick={() => handleDelete(task._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input-field" required>
              <option value="">Select student</option>
              {users.filter((u) => u.role === 'student').map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Create Task</button>
        </form>
      </Modal>
    </div>
  );
}
