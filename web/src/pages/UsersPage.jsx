import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Trash2, UserCog, Search } from 'lucide-react';

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const { users, loading, fetchUsers, assignMentor, deleteUser } = useUserStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAssign, setShowAssign] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');

  useEffect(() => {
    fetchUsers({ search, role: roleFilter });
  }, [fetchUsers, search, roleFilter]);

  const openAssignModal = async (studentId) => {
    setShowAssign(studentId);
    const allUsers = users.filter((u) => u.role === 'mentor');
    if (allUsers.length === 0) {
      const { data } = await (await import('../lib/axios')).default.get('/users', { params: { role: 'mentor' } });
      setMentors(data.users);
    } else {
      setMentors(allUsers);
    }
  };

  const handleAssign = async () => {
    if (!selectedMentor) return toast.error('Select a mentor');
    try {
      await assignMentor(showAssign, selectedMentor);
      toast.success('Mentor assigned!');
      setShowAssign(null);
      setSelectedMentor('');
      fetchUsers({ search, role: roleFilter });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'mentor' ? 'My Students' : 'Users'}
        </h1>
      </div>

      {user?.role === 'admin' && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-9"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      )}

      {users.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No users found</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Mentor</th>
                <th className="pb-3 font-medium">Status</th>
                {user?.role === 'admin' && <th className="pb-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">{u.role}</span>
                  </td>
                  <td className="py-3 text-gray-500">{u.mentor?.name || '-'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-3">
                      <div className="flex gap-1">
                        {u.role === 'student' && (
                          <button onClick={() => openAssignModal(u._id)} className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg" title="Assign Mentor">
                            <UserCog size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!showAssign} onClose={() => setShowAssign(null)} title="Assign Mentor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Mentor</label>
            <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} className="input-field">
              <option value="">Choose a mentor</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          <button onClick={handleAssign} className="btn-primary w-full">Assign</button>
        </div>
      </Modal>
    </div>
  );
}
