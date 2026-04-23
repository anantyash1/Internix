import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Copy, KeyRound, RefreshCw, Search, Trash2, UserCog } from 'lucide-react';

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const { users, loading, fetchUsers, assignMentor, resetUserPassword, deleteUser } = useUserStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAssign, setShowAssign] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState(generatePassword());
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchUsers({ search, role: roleFilter });
  }, [fetchUsers, search, roleFilter]);

  const openAssignModal = async (studentId) => {
    setShowAssign(studentId);
    const allUsers = users.filter((entry) => entry.role === 'mentor');
    if (allUsers.length === 0) {
      const { data } = await api.get('/users', { params: { role: 'mentor' } });
      setMentors(data.users);
    } else {
      setMentors(allUsers);
    }
  };

  const openResetModal = (entry) => {
    setResetTarget(entry);
    setResetPassword(generatePassword());
  };

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleAssign = async () => {
    if (!selectedMentor) return toast.error('Select a mentor');
    try {
      await assignMentor(showAssign, selectedMentor);
      toast.success('Mentor assigned');
      setShowAssign(null);
      setSelectedMentor('');
      fetchUsers({ search, role: roleFilter });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (resetPassword.trim().length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSavingPassword(true);
    try {
      await resetUserPassword(resetTarget._id, resetPassword);
      toast.success(`Password updated for ${resetTarget.name}`);
      setResetTarget(null);
      setResetPassword(generatePassword());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'mentor' ? 'My Students' : 'Users'}
          </h1>
          {user?.role === 'admin' && (
            <p className="mt-1 text-sm text-gray-500">
              Admin can reassign mentors and reset student or mentor passwords when they forget login access.
            </p>
          )}
        </div>
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
                <th className="pb-3 font-medium">Internship</th>
                <th className="pb-3 font-medium">Mentor</th>
                <th className="pb-3 font-medium">Status</th>
                {user?.role === 'admin' && <th className="pb-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((entry) => (
                <tr key={entry._id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-900">{entry.name}</td>
                  <td className="py-3 text-gray-500">{entry.email}</td>
                  <td className="py-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                      {entry.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{entry.internship?.title || '-'}</td>
                  <td className="py-3 text-gray-500">{entry.mentor?.name || '-'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-3">
                      <div className="flex gap-1">
                        {entry.role === 'student' && (
                          <>
                            <button
                              onClick={() => openAssignModal(entry._id)}
                              className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg"
                              title="Assign Mentor"
                            >
                              <UserCog size={16} />
                            </button>
                          </>
                        )}
                        {(entry.role === 'student' || entry.role === 'mentor') && (
                          <button
                            onClick={() => openResetModal(entry)}
                            className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg"
                            title="Reset Password"
                          >
                            <KeyRound size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                          title="Delete"
                        >
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
              {mentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name} ({mentor.email})
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleAssign} className="btn-primary w-full">Assign</button>
        </div>
      </Modal>

      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password">
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Set a new temporary password for <span className="font-semibold">{resetTarget?.name}</span> ({resetTarget?.role}) and share it securely.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <div className="flex gap-2">
              <input
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="input-field flex-1"
                placeholder="Enter a temporary password"
              />
              <button
                type="button"
                onClick={() => setResetPassword(generatePassword())}
                className="rounded-lg border border-gray-200 px-3 text-gray-600 hover:bg-gray-50"
                title="Generate Password"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(resetPassword)}
                className="rounded-lg border border-gray-200 px-3 text-gray-600 hover:bg-gray-50"
                title="Copy Password"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <button onClick={handleResetPassword} disabled={savingPassword} className="btn-primary w-full justify-center">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
