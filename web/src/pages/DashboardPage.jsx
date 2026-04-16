import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useDashboardStore from '../store/dashboardStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';
import {
  Users, ListTodo, FileText, Briefcase, Award, CalendarCheck, CheckCircle, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !data) return <LoadingSpinner />;

  if (user?.role === 'admin') return <AdminDashboard data={data} />;
  if (user?.role === 'mentor') return <MentorDashboard data={data} />;
  return <StudentDashboard data={data} />;
}

function AdminDashboard({ data }) {
  const { stats, tasksByStatus, attendanceStats } = data;

  const taskChartData = Object.entries(tasksByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  const attendanceChartData = Object.entries(attendanceStats || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="primary" />
        <StatCard title="Total Mentors" value={stats.totalMentors} icon={Users} color="purple" />
        <StatCard title="Internships" value={stats.totalInternships} icon={Briefcase} color="green" />
        <StatCard title="Tasks" value={stats.totalTasks} icon={ListTodo} color="orange" />
        <StatCard title="Reports" value={stats.totalReports} icon={FileText} color="blue" />
        <StatCard title="Certificates" value={stats.totalCertificates} icon={Award} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={attendanceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {attendanceChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.recentUsers?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100">{u.role}</span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MentorDashboard({ data }) {
  const { stats, tasksByStatus, recentTasks } = data;

  const taskChartData = Object.entries(tasksByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Students" value={stats.myStudents} icon={Users} color="primary" />
        <StatCard title="Tasks Created" value={stats.totalTasks} icon={ListTodo} color="green" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={FileText} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {(recentTasks || []).map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.assignedTo?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  t.status === 'completed' ? 'bg-green-100 text-green-700' :
                  t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ data }) {
  const { stats, tasksByStatus, todayAttendance, certificates } = data;

  const taskChartData = Object.entries(tasksByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={ListTodo} color="primary" />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} color="green" />
        <StatCard title="Completion Rate" value={`${stats.taskCompletionRate}%`} icon={TrendingUp} color="purple" />
        <StatCard title="Attendance Days" value={stats.totalAttendanceDays} icon={CalendarCheck} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={taskChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {taskChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Today's Attendance</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                todayAttendance === 'present' ? 'bg-green-100 text-green-700' :
                todayAttendance === 'late' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {todayAttendance || 'Not marked'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  <span className="text-sm text-gray-600">Videos Completed</span>
  <span className="text-sm font-semibold">
    {stats.completedVideos || 0}/{stats.totalVideos || 0}
  </span>
</div>
{(stats.totalVideos > 0) && (
  <div className="card mt-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-gray-700">Video Learning Progress</span>
      <span className="text-sm font-bold text-green-600">{stats.videoProgressRate || 0}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all"
        style={{ width: `${stats.videoProgressRate || 0}%` }}
      />
    </div>
  </div>
)}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Reports Submitted</span>
              <span className="text-sm font-semibold">{stats.totalReports}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Reports Approved</span>
              <span className="text-sm font-semibold text-green-600">{stats.approvedReports}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Certificates Earned</span>
              <span className="text-sm font-semibold text-primary-600">{certificates?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
