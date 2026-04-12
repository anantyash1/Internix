import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Plus, Briefcase, Users, Trash2 } from 'lucide-react';

export default function InternshipsPage() {
  const user = useAuthStore((s) => s.user);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEnroll, setShowEnroll] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', department: '', startDate: '', endDate: '', mentor: '', maxStudents: 10,
  });
  const [enrollStudentId, setEnrollStudentId] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/internships');
      setInternships(data.internships);
    } catch {
      toast.error('Failed to load internships');
    }
    setLoading(false);
  };

  const openCreateModal = async () => {
    setShowCreate(true);
    try {
      const { data } = await api.get('/users', { params: { role: 'mentor' } });
      setMentors(data.users);
    } catch {
      /* ignore */
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internships', form);
      toast.success('Internship created!');
      setShowCreate(false);
      setForm({ title: '', description: '', department: '', startDate: '', endDate: '', mentor: '', maxStudents: 10 });
      fetchInternships();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const openEnrollModal = async (internshipId) => {
    setShowEnroll(internshipId);
    try {
      const { data } = await api.get('/users', { params: { role: 'student' } });
      setStudents(data.users);
    } catch {
      /* ignore */
    }
  };

  const handleEnroll = async () => {
    if (!enrollStudentId) return toast.error('Select a student');
    try {
      await api.post(`/internships/${showEnroll}/enroll`, { studentId: enrollStudentId });
      toast.success('Student enrolled!');
      setShowEnroll(null);
      setEnrollStudentId('');
      fetchInternships();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return;
    try {
      await api.delete(`/internships/${id}`);
      toast.success('Deleted');
      fetchInternships();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Internships</h1>
        {user?.role === 'admin' && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Internship
          </button>
        )}
      </div>

      {internships.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No internships found</div>
      ) : (
        <div className="grid gap-4">
          {internships.map((i) => (
            <div key={i._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Briefcase size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{i.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[i.status]}`}>{i.status}</span>
                  </div>
                  {i.description && <p className="text-sm text-gray-500 mt-1">{i.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {i.department && <span>Dept: {i.department}</span>}
                    <span>Mentor: {i.mentor?.name || 'N/A'}</span>
                    <span>{new Date(i.startDate).toLocaleDateString()} - {new Date(i.endDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {i.students?.length || 0}/{i.maxStudents}</span>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEnrollModal(i._id)} className="btn-secondary text-xs py-1">Enroll</button>
                    <button onClick={() => handleDelete(i._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Internship">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input type="number" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
            <select value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} className="input-field" required>
              <option value="">Select mentor</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal isOpen={!!showEnroll} onClose={() => setShowEnroll(null)} title="Enroll Student">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} className="input-field">
              <option value="">Choose a student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <button onClick={handleEnroll} className="btn-primary w-full">Enroll</button>
        </div>
      </Modal>
    </div>
  );
}
