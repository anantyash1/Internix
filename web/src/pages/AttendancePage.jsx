import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CalendarCheck, Clock } from 'lucide-react';

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [todayMarked, setTodayMarked] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance');
      setRecords(data.records);
      const today = new Date().toDateString();
      const todayRecord = data.records.find((r) => new Date(r.date).toDateString() === today);
      setTodayMarked(!!todayRecord);
    } catch {
      toast.error('Failed to load attendance');
    }
    setLoading(false);
  };

  const handleMarkAttendance = async () => {
    setMarking(true);
    try {
      await api.post('/attendance', { status: 'present' });
      toast.success('Attendance marked!');
      setTodayMarked(true);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
    setMarking(false);
  };

  const handleCheckOut = async () => {
    setMarking(true);
    try {
      await api.post('/attendance', {
        checkOutTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      });
      toast.success('Checked out!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check out');
    }
    setMarking(false);
  };

  if (loading) return <LoadingSpinner />;

  const statusColors = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        {user?.role === 'student' && (
          <div className="flex gap-2">
            {!todayMarked ? (
              <button onClick={handleMarkAttendance} disabled={marking} className="btn-primary flex items-center gap-2">
                <CalendarCheck size={18} />
                {marking ? 'Marking...' : 'Check In'}
              </button>
            ) : (
              <button onClick={handleCheckOut} disabled={marking} className="btn-secondary flex items-center gap-2">
                <Clock size={18} />
                {marking ? 'Processing...' : 'Check Out'}
              </button>
            )}
          </div>
        )}
      </div>

      {todayMarked && user?.role === 'student' && (
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-700 font-medium flex items-center gap-2">
            <CalendarCheck size={18} />
            You have marked your attendance for today.
          </p>
        </div>
      )}

      {records.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No attendance records found</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Date</th>
                {user?.role !== 'student' && <th className="pb-3 font-medium">Student</th>}
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Check In</th>
                <th className="pb-3 font-medium">Check Out</th>
                <th className="pb-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-900">{new Date(r.date).toLocaleDateString()}</td>
                  {user?.role !== 'student' && <td className="py-3 text-gray-600">{r.student?.name}</td>}
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{r.checkInTime || '-'}</td>
                  <td className="py-3 text-gray-500">{r.checkOutTime || '-'}</td>
                  <td className="py-3 text-gray-400 text-xs">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
