import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useDashboardStore from '../store/dashboardStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';
import {
  Users, ListTodo, FileText, Briefcase, Award, CalendarCheck,
  CheckCircle, TrendingUp, Clock, Star, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ── Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem',
      boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)',
    }}>
      {label && <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.color }} />
          <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{p.value}</span>
          <span style={{ color: 'var(--slate-500)', textTransform: 'capitalize' }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];

/* ── Section wrapper ── */
function Section({ title, action, children, delay = 0 }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {title && (
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0,
            }}>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Empty state ── */
function Empty({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--slate-300)' }}>
      <Icon size={36} />
      <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>{label}</span>
    </div>
  );
}

/* ─────────────────────── Admin ─────────────────────── */
function AdminDashboard({ data }) {
  const { stats = {}, tasksByStatus = {}, attendanceStats = {}, recentUsers = [] } = data;

  const taskData = Object.entries(tasksByStatus).map(([k, v]) => ({
    name: k.replace('_', ' '),
    value: v,
    fill: k === 'completed' ? '#10b981' : k === 'in_progress' ? '#3b82f6' : k === 'reviewed' ? '#8b5cf6' : '#94a3b8',
  }));

  const attendData = Object.entries(attendanceStats).map(([k, v]) => ({
    name: k, value: v,
    fill: k === 'present' ? '#10b981' : k === 'late' ? '#f59e0b' : '#f43f5e',
  }));

  const roleColors = { admin: '#8b5cf6', mentor: '#f59e0b', student: '#3b82f6' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Stats grid */}
      <Section delay={0}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <StatCard title="Total Students"  value={stats.totalStudents  ?? 0} icon={Users}     color="primary" />
          <StatCard title="Total Mentors"   value={stats.totalMentors   ?? 0} icon={Users}     color="violet" />
          <StatCard title="Internships"     value={stats.totalInternships ?? 0} icon={Briefcase} color="green" />
          <StatCard title="Tasks Created"   value={stats.totalTasks     ?? 0} icon={ListTodo}  color="amber" />
          <StatCard title="Reports Filed"   value={stats.totalReports   ?? 0} icon={FileText}  color="blue" />
          <StatCard title="Certificates"    value={stats.totalCertificates ?? 0} icon={Award}  color="rose" />
        </div>
      </Section>

      {/* Charts row */}
      <Section delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Tasks pie */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Task distribution
            </div>
            {taskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={88} paddingAngle={3} cornerRadius={4}>
                    {taskData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty icon={ListTodo} label="No task data yet" />}
          </div>

          {/* Attendance pie */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Attendance overview
            </div>
            {attendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={88} paddingAngle={3} cornerRadius={4}>
                    {attendData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty icon={CalendarCheck} label="No attendance data yet" />}
          </div>
        </div>
      </Section>

      {/* Recent users table */}
      {recentUsers.length > 0 && (
        <Section title="Recently joined" delay={160}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={u._id} style={{ animationDelay: `${i * 40}ms` }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${roleColors[u.role] || '#94a3b8'}40, ${roleColors[u.role] || '#94a3b8'}20)`,
                          border: `1.5px solid ${roleColors[u.role] || '#94a3b8'}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 700,
                          fontSize: '0.6875rem', color: roleColors[u.role] || '#94a3b8',
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--slate-900)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'violet' : u.role === 'mentor' ? 'amber' : 'blue'}`}
                        style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate-400)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

/* ─────────────────────── Mentor ─────────────────────── */
function MentorDashboard({ data }) {
  const { stats = {}, tasksByStatus = {}, recentTasks = [] } = data;

  const taskChartData = Object.entries(tasksByStatus).map(([k, v]) => ({
    name: k.replace('_', ' '), count: v,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <Section delay={0}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <StatCard title="My Students"     value={stats.myStudents    ?? 0} icon={Users}    color="primary" />
          <StatCard title="Tasks Created"   value={stats.totalTasks    ?? 0} icon={ListTodo} color="green" />
          <StatCard title="Pending Reviews" value={stats.pendingReports ?? 0} icon={FileText} color="amber" />
        </div>
      </Section>

      <Section delay={60}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Tasks by status
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={taskChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="var(--blue-500)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Recent tasks
            </div>
            {recentTasks.length === 0
              ? <Empty icon={ListTodo} label="No tasks yet" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recentTasks.slice(0, 5).map((t) => (
                  <div key={t._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-100)',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--slate-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-900)' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{t.assignedTo?.name}</div>
                    </div>
                    <span className={`badge badge-${
                      t.status === 'completed' ? 'green'
                      : t.status === 'in_progress' ? 'blue'
                      : t.status === 'reviewed' ? 'violet' : 'gray'
                    }`} style={{ textTransform: 'capitalize' }}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────── Student ─────────────────────── */
function StudentDashboard({ data }) {
  const { stats = {}, tasksByStatus = {}, todayAttendance, certificates = [] } = data;

  const taskData = Object.entries(tasksByStatus).map(([k, v]) => ({
    name: k.replace('_', ' '), value: v,
    fill: k === 'completed' ? '#10b981' : k === 'in_progress' ? '#3b82f6' : k === 'reviewed' ? '#8b5cf6' : '#94a3b8',
  }));

  const videoRate   = stats.videoProgressRate   ?? 0;
  const taskRate    = stats.taskCompletionRate  ?? 0;
  const attendDays  = stats.totalAttendanceDays ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Stats */}
      <Section delay={0}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <StatCard title="Total Tasks"     value={stats.totalTasks    ?? 0} icon={ListTodo}    color="primary" />
          <StatCard title="Completed"       value={stats.completedTasks ?? 0} icon={CheckCircle} color="green" />
          <StatCard title="Task Completion" value={`${taskRate}%`}             icon={TrendingUp}  color="violet" />
          <StatCard title="Attendance Days" value={attendDays}                 icon={CalendarCheck} color="amber" />
        </div>
      </Section>

      {/* Progress bars + today */}
      <Section delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Progress card */}
          <div className="card" style={{ padding: '1.375rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              My progress
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Task completion', value: taskRate, color: '#3b82f6', icon: <ListTodo size={13} /> },
                { label: 'Video learning', value: videoRate, color: '#10b981', icon: <Activity size={13} /> },
              ].map((p) => (
                <div key={p.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                      {p.icon} {p.label}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: p.color }}>{p.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${p.value}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}bb)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick status */}
          <div className="card" style={{ padding: '1.375rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>
              At a glance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  label: "Today's attendance",
                  value: todayAttendance ? (
                    <span className={`badge badge-${todayAttendance === 'present' ? 'green' : todayAttendance === 'late' ? 'amber' : 'red'}`}
                      style={{ textTransform: 'capitalize' }}>{todayAttendance}</span>
                  ) : <span className="badge badge-gray">Not marked</span>,
                },
                { label: 'Reports submitted', value: <strong>{stats.totalReports ?? 0}</strong> },
                { label: 'Reports approved',  value: <strong style={{ color: 'var(--emerald-500)' }}>{stats.approvedReports ?? 0}</strong> },
                { label: 'Certificates earned', value: <strong style={{ color: 'var(--amber-500)' }}>{certificates.length}</strong> },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid var(--slate-100)',
                  fontSize: '0.8125rem',
                }}>
                  <span style={{ color: 'var(--slate-500)' }}>{row.label}</span>
                  {row.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Task breakdown */}
      {taskData.length > 0 && (
        <Section title="Task breakdown" delay={160}>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={taskData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {taskData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}
    </div>
  );
}

/* ─────────────────────── Root ─────────────────────── */
export default function DashboardPage() {
  const user  = useAuthStore((s) => s.user);
  const { data, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading || !data) return <LoadingSpinner label="Loading dashboard…" />;

  if (user?.role === 'admin')  return <AdminDashboard  data={data} />;
  if (user?.role === 'mentor') return <MentorDashboard data={data} />;
  return <StudentDashboard data={data} />;
}
