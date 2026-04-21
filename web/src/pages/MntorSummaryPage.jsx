// import { useEffect, useState } from 'react';
// import useAuthStore from '../store/authStore';
// import api from '../lib/axios';
// import LoadingSpinner from '../components/ui/LoadingSpinner';
// import StatCard from '../components/ui/StatCard';
// import toast from 'react-hot-toast';
// import {
//   Sparkles, RefreshCw, TrendingUp, TrendingDown, Users,
//   CheckCircle, FileText, CalendarCheck, AlertCircle, Star,
//   ChevronRight, Zap,
// } from 'lucide-react';

// const FETCH_LIMIT = 1000;

// const getEntityId = (value) => {
//   if (!value) return '';
//   if (typeof value === 'string') return value;
//   return value._id || value.id || '';
// };

// const isCompletedTask = (task) => ['completed', 'reviewed'].includes(task?.status);
// const isCompletedAttendance = (record) => ['present', 'late'].includes(record?.status);
// const isCompletedReport = (report) => report?.status === 'approved';

// const percent = (completed, total) => (total > 0 ? Math.round((completed / total) * 100) : 0);

// const startOfCurrentWeek = () => {
//   const date = new Date();
//   const day = date.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   date.setDate(date.getDate() + diff);
//   date.setHours(0, 0, 0, 0);
//   return date;
// };

// const endOfToday = () => {
//   const date = new Date();
//   date.setHours(23, 59, 59, 999);
//   return date;
// };

// const countWeekdaysInclusive = (startDate, endDate) => {
//   let count = 0;
//   const cursor = new Date(startDate);
//   cursor.setHours(0, 0, 0, 0);
//   const end = new Date(endDate);
//   end.setHours(0, 0, 0, 0);

//   while (cursor <= end) {
//     const day = cursor.getDay();
//     if (day !== 0 && day !== 6) count += 1;
//     cursor.setDate(cursor.getDate() + 1);
//   }

//   return count;
// };

// const latestDate = (dates) => {
//   const validDates = dates
//     .filter(Boolean)
//     .map((date) => new Date(date))
//     .filter((date) => !Number.isNaN(date.getTime()));

//   if (validDates.length === 0) return null;
//   return new Date(Math.max(...validDates.map((date) => date.getTime()))).toISOString();
// };

// const buildStudentMetrics = ({ students, tasks, attendanceRecords, reports, workingDays }) => {
//   const studentIds = new Set(students.map((student) => getEntityId(student)));
//   const visibleTasks = tasks.filter((task) => studentIds.has(getEntityId(task.assignedTo)));
//   const visibleAttendance = attendanceRecords.filter((record) => studentIds.has(getEntityId(record.student)));
//   const visibleReports = reports.filter((report) => studentIds.has(getEntityId(report.student)));

//   const completedTasks = visibleTasks.filter(isCompletedTask).length;
//   const completedAttendance = visibleAttendance.filter(isCompletedAttendance).length;
//   const approvedReports = visibleReports.filter(isCompletedReport).length;
//   const submittedReports = visibleReports.length;
//   const expectedAttendance = workingDays * students.length;
//   const expectedReports = visibleTasks.length;

//   const enrichedStudents = students.map((student) => {
//     const studentId = getEntityId(student);
//     const studentTasks = visibleTasks.filter((task) => getEntityId(task.assignedTo) === studentId);
//     const studentAttendance = visibleAttendance.filter((record) => getEntityId(record.student) === studentId);
//     const studentReports = visibleReports.filter((report) => getEntityId(report.student) === studentId);

//     const studentCompletedTasks = studentTasks.filter(isCompletedTask).length;
//     const studentCompletedAttendance = studentAttendance.filter(isCompletedAttendance).length;
//     const studentApprovedReports = studentReports.filter(isCompletedReport).length;
//     const studentExpectedReports = studentTasks.length;

//     return {
//       ...student,
//       taskCompletionRate: percent(studentCompletedTasks, studentTasks.length),
//       attendanceRate: percent(studentCompletedAttendance, workingDays),
//       reportsStatus: studentExpectedReports === 0
//         ? 'no tasks'
//         : studentApprovedReports >= studentExpectedReports
//         ? 'all approved'
//         : studentReports.length > 0
//         ? 'pending'
//         : 'missing',
//       lastActive: latestDate([
//         ...studentTasks.map((task) => task.updatedAt || task.completedAt || task.createdAt),
//         ...studentAttendance.map((record) => record.date || record.updatedAt || record.createdAt),
//         ...studentReports.map((report) => report.updatedAt || report.reviewedAt || report.createdAt),
//       ]),
//       metrics: {
//         completedTasks: studentCompletedTasks,
//         totalTasks: studentTasks.length,
//         completedAttendance: studentCompletedAttendance,
//         expectedAttendance: workingDays,
//         approvedReports: studentApprovedReports,
//         submittedReports: studentReports.length,
//         expectedReports: studentExpectedReports,
//       },
//     };
//   });

//   return {
//     students: enrichedStudents,
//     stats: {
//       totalStudents: students.length,
//       completedTasks,
//       totalTasks: visibleTasks.length,
//       taskRate: percent(completedTasks, visibleTasks.length),
//       completedAttendance,
//       expectedAttendance,
//       attendanceRate: percent(completedAttendance, expectedAttendance),
//       approvedReports,
//       submittedReports,
//       expectedReports,
//       reportRate: percent(approvedReports, expectedReports),
//       workingDays,
//     },
//   };
// };


// /* ─── Mini components ─── */
// function InsightBlock({ icon: Icon, color, bg, title, children }) {
//   return (
//     <div style={{
//       display: 'flex', gap: '0.875rem',
//       padding: '1rem 1.125rem',
//       borderRadius: 'var(--radius-md)',
//       background: bg,
//       border: `1px solid ${color}20`,
//       transition: 'transform 180ms ease, box-shadow 180ms ease',
//     }}
//     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
//     onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
//     >
//       <div style={{
//         width: 36, height: 36, flexShrink: 0,
//         background: color + '20', borderRadius: 10,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//       }}>
//         <Icon size={17} style={{ color }} />
//       </div>
//       <div>
//         <div style={{ fontSize: '0.75rem', fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>
//           {title}
//         </div>
//         <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }

// // function StudentRow({ student, index }) {
// //   const score = student.taskCompletionRate ?? 0;
// //   const color = score >= 75 ? 'var(--emerald-500)' : score >= 40 ? 'var(--amber-500)' : 'var(--rose-500)';
// //   const bg    = score >= 75 ? 'var(--emerald-50)'  : score >= 40 ? 'var(--amber-50)'  : 'var(--rose-50)';

// function StudentRow({ student, index }) {
//   const metrics = student.metrics || {};
//   const score = student.taskCompletionRate ?? 0;
//   const attendanceScore = student.attendanceRate ?? 0;
//   const color = score >= 75 ? 'var(--emerald-500)' : score >= 40 ? 'var(--amber-500)' : 'var(--rose-500)';


//   return (
//     <tr style={{ animationDelay: `${index * 50}ms` }}
//       onMouseEnter={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = 'var(--slate-50)'); }}
//       onMouseLeave={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = ''); }}
//     >
//       <td style={{ padding: '0.875rem 1.25rem' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
//           <div style={{
//             width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
//             background: 'linear-gradient(135deg, var(--blue-100), var(--blue-50))',
//             border: '1.5px solid var(--blue-200)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontFamily: 'var(--font-display)', fontWeight: 700,
//             fontSize: '0.75rem', color: 'var(--blue-600)',
//           }}>
//             {student.name?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{student.name}</div>
//             <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{student.email}</div>
//           </div>
//         </div>
//       </td>
//       {/* <td>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <div style={{ flex: 1, height: 6, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden', maxWidth: 80 }}>
//             <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
//           </div>
//           <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{score}%</span>
//         </div>
//       </td>
//       <td>
//         <span style={{
//           display: 'inline-block', fontSize: '0.8125rem', fontWeight: 600,
//           color: student.attendanceRate >= 80 ? 'var(--emerald-500)' : 'var(--amber-500)',
//         }}>
//           {student.attendanceRate ?? 0}%
//         </span>
//       </td>
//       <td>
//         <span className={`badge badge-${student.reportsStatus === 'all approved' ? 'green' : student.reportsStatus === 'pending' ? 'amber' : 'gray'}`}>
//           {student.reportsStatus ?? 'n/a'}
//         </span>
//       </td> */}
// <td>
//        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <div style={{ flex: 1, height: 6, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden', maxWidth: 80 }}>
//             <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
//           </div>
//           <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>
//             {metrics.completedTasks ?? 0}/{metrics.totalTasks ?? 0}
//           </span>
//         </div>
//       </td>
//       <td>
//         <span style={{
//           display: 'inline-block', fontSize: '0.8125rem', fontWeight: 600,
//           color: attendanceScore >= 80 ? 'var(--emerald-500)' : 'var(--amber-500)',
//         }}>
//           {metrics.completedAttendance ?? 0}/{metrics.expectedAttendance ?? 0}
//         </span>
//       </td>
//       <td>
//         <span className={`badge badge-${student.reportsStatus === 'all approved' ? 'green' : student.reportsStatus === 'pending' ? 'amber' : 'gray'}`}>
//           {metrics.approvedReports ?? 0}/{metrics.expectedReports ?? 0} {student.reportsStatus ?? ''}
//         </span>
//       </td>
//       {/* <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}></td> */}
//       <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>
//         {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : '—'}
//       </td>
//     </tr>
//   );
// }

// /* ─── Parsed summary renderer ─── */
// function SummaryCard({ text }) {
//   if (!text) return null;
//   const lines = text.split('\n').filter(Boolean);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//       {lines.map((line, i) => {
//         if (line.startsWith('##')) {
//           return (
//             <h3 key={i} style={{
//               fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
//               color: 'var(--slate-900)', letterSpacing: '-0.02em',
//               margin: '0.75rem 0 0.25rem', paddingTop: i > 0 ? '0.5rem' : 0,
//               borderTop: i > 0 ? '1px solid var(--slate-100)' : 'none',
//             }}>
//               {line.replace(/^#+\s/, '')}
//             </h3>
//           );
//         }
//         if (line.startsWith('-') || line.startsWith('•')) {
//           return (
//             <div key={i} style={{
//               display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
//               padding: '0.125rem 0',
//             }}>
//               <ChevronRight size={13} style={{ color: 'var(--blue-500)', marginTop: 3, flexShrink: 0 }} />
//               <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
//                 {line.replace(/^[-•]\s*/, '')}
//               </span>
//             </div>
//           );
//         }
//         return (
//           <p key={i} style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>
//             {line}
//           </p>
//         );
//       })}
//     </div>
//   );
// }

// /* ─── Main component ─── */
// export default function MentorSummaryPage() {
//   const user = useAuthStore((s) => s.user);
//   const [students, setStudents] = useState([]);
//   const [summary,  setSummary]  = useState('');
//   const [stats,    setStats]    = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [generating, setGenerating] = useState(false);
//   const [generated,  setGenerated]  = useState(false);
//   const [generatedAt, setGeneratedAt] = useState(null);

//   useEffect(() => { fetchStudentData(); }, []);

//   // const fetchStudentData = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const { data } = await api.get('/users', { params: { role: 'student' } });
//   //     const studs = data.users || [];
//   //     setStudents(studs);

//   //     /* Compute aggregate stats */
//   //     const taskRes  = await api.get('/tasks');
//   //     const attendRes = await api.get('/attendance');
//   //     const reportRes = await api.get('/reports');

//   //     setStats({
//   //       totalStudents: studs.length,
//   //       totalTasks: taskRes.data.total ?? 0,
//   //       totalAttendance: attendRes.data.total ?? 0,
//   //       totalReports: reportRes.data.total ?? 0,
//   //       avgCompletion: studs.length > 0
//   //         ? Math.round(studs.reduce((a, s) => a + (s.taskCompletionRate ?? 0), 0) / studs.length)
//   //         : 0,
//   //     });
//   //   } catch { toast.error('Failed to load student data'); }
//   //   setLoading(false);
//   // };

//   const fetchStudentData = async () => {
//     setLoading(true);
//     try {
//       const weekStart = startOfCurrentWeek();
//       const todayEnd = endOfToday();
//       const { data } = await api.get('/users', { params: { role: 'student', limit: FETCH_LIMIT } });
//       const studs = data.users || [];

//       const [taskRes, attendRes, reportRes] = await Promise.all([
//         api.get('/tasks', { params: { limit: FETCH_LIMIT } }),
//         api.get('/attendance', {
//           params: {
//             startDate: weekStart.toISOString(),
//             endDate: todayEnd.toISOString(),
//             limit: FETCH_LIMIT,
//           },
//         }),
//         api.get('/reports', { params: { limit: FETCH_LIMIT } }),
//       ]);

//       const metrics = buildStudentMetrics({
//         students: studs,
//         tasks: taskRes.data.tasks || [],
//         attendanceRecords: attendRes.data.records || [],
//         reports: reportRes.data.reports || [],
//         workingDays: countWeekdaysInclusive(weekStart, todayEnd),
//       });

//       console.log('Fetched data:', { students: studs.length, metrics });
//       setStudents(metrics.students);
//       setStats(metrics.stats);
//     } catch (err) {
//       console.error('Failed to load student data:', err);
//       toast.error('Failed to load student data: ' + (err?.message || 'Unknown error'));
//     }
//     setLoading(false);
//   };


//   const generateSummary = async () => {
//     if (students.length === 0) return toast.error('No students to analyze');
//     setGenerating(true);
//     setSummary('');
//     try {
//       const avgTaskCompletion = students.length > 0
//         ? Math.round(students.reduce((a, s) => a + (s.taskCompletionRate ?? 0), 0) / students.length)
//         : 0;

//       const context = `
// Mentor: ${user?.name}
// Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

// Summary Stats:
// - Total Students: ${students.length}
// - Tasks Completed: ${stats?.completedTasks ?? 0}/${stats?.totalTasks ?? 0} (${stats?.taskRate ?? 0}%)
// - Attendance Marked: ${stats?.completedAttendance ?? 0}/${stats?.expectedAttendance ?? 0} (${stats?.attendanceRate ?? 0}%)
// - Reports Approved: ${stats?.approvedReports ?? 0}/${stats?.expectedReports ?? 0} (${stats?.reportRate ?? 0}%)
// - Working Days This Week: ${stats?.workingDays ?? 0}
// - Average Task Completion: ${avgTaskCompletion}%

// Top Students:
// ${students.slice(0, 10).map(s => `- ${s.name}: ${s.metrics?.completedTasks ?? 0}/${s.metrics?.totalTasks ?? 0} tasks, ${s.attendanceRate ?? 0}% attendance, ${s.metrics?.approvedReports ?? 0}/${s.metrics?.expectedReports ?? 0} reports`).join('\n')}
//       `.trim();

//       const { data } = await api.post('/ai/chat', {
//         messages: [{
//           role: 'user',
//           content: `Generate a concise, professional weekly performance summary for a mentor. Use this data:\n\n${context}\n\nStructure it with these sections using ## headers:\n## Overall Performance\n## Key Highlights\n## Students Needing Attention\n## Recommendations for Next Week\n\nBe specific, actionable, and encouraging. Use bullet points with - for lists. Keep it to 250-350 words.`,
//         }],
//         context: 'Mentor weekly performance report generation',
//       });
//       setSummary(data.reply || '');
//       setGenerated(true);
//       setGeneratedAt(new Date());
//       toast.success('Summary generated!');
//     } catch (err) { 
//       console.error('AI generation failed:', err);
//       toast.error('AI generation failed. Check your ANTHROPIC_API_KEY.');
//     }
//     setGenerating(false);
//   };

//   if (loading) return <LoadingSpinner label="Loading student data…" />;
//   if (user?.role === 'student') {
//     return (
//       <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
//         <AlertCircle size={36} style={{ color: 'var(--rose-400)', margin: '0 auto 1rem' }} />
//         <p style={{ color: 'var(--slate-500)' }}>This page is only available to mentors and admins.</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1100 }}>
//       {/* Header card */}
//       <div className="animate-fade-up" style={{
//         background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
//         borderRadius: 'var(--radius-xl)',
//         padding: '1.75rem 2rem',
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         gap: '1rem',
//         position: 'relative', overflow: 'hidden',
//       }}>
//         <div style={{
//           position: 'absolute', top: -40, right: -40,
//           width: 200, height: 200,
//           background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
//           pointerEvents: 'none',
//         }} />
//         <div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
//             <Sparkles size={18} style={{ color: '#fbbf24' }} />
//             <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
//               Powered by Claude AI
//             </span>
//           </div>
//           <h1 style={{
//             fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem',
//             color: '#ffffff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2,
//           }}>
//             Weekly Performance Summary
//           </h1>
//           <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0.375rem 0 0' }}>
//             AI-generated insights based on your students' activity this week
//           </p>
//         </div>
//         <button
//           onClick={generateSummary}
//           disabled={generating}
//           style={{
//             display: 'flex', alignItems: 'center', gap: '0.5rem',
//             padding: '0.625rem 1.25rem',
//             borderRadius: 'var(--radius-md)',
//             border: '1px solid rgba(255,255,255,0.15)',
//             background: generating ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
//             color: '#ffffff',
//             fontFamily: 'var(--font-body)',
//             fontSize: '0.875rem', fontWeight: 500,
//             cursor: generating ? 'not-allowed' : 'pointer',
//             transition: 'all 180ms ease',
//             whiteSpace: 'nowrap',
//           }}
//           onMouseEnter={(e) => { if (!generating) { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
//           onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = ''; }}
//         >
//           {generating
//             ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
//             : <><Sparkles size={14} /> {generated ? 'Regenerate' : 'Generate Summary'}</>
//           }
//         </button>
//       </div>

//       {/* Quick stats */}
//       {/* {stats && (
//         <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
//           <StatCard title="My Students"    value={stats.totalStudents}   icon={Users}        color="primary" />
//           <StatCard title="Tasks Assigned" value={stats.totalTasks}      icon={CheckCircle}  color="green" />
//           <StatCard title="Check-ins"      value={stats.totalAttendance} icon={CalendarCheck} color="amber" />
//           <StatCard title="Avg. Completion" value={`${stats.avgCompletion}%`} icon={TrendingUp} color="violet" />
//         </div>
//       )} */}
//       {stats && (
//         <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
//           <StatCard title="My Students" value={stats.totalStudents} icon={Users} color="primary" />
//           <StatCard
//             title="Tasks Completed"
//             value={`${stats.completedTasks}/${stats.totalTasks}`}
//             subtitle={`${stats.taskRate}% complete`}
//             icon={CheckCircle}
//             color="green"
//           />
//           <StatCard
//             title="Attendance Marked"
//             value={`${stats.completedAttendance}/${stats.expectedAttendance}`}
//             subtitle={`${stats.workingDays} weekdays this week`}
//             icon={CalendarCheck}
//             color="amber"
//           />
//           <StatCard
//             title="Reports Approved"
//             value={`${stats.approvedReports}/${stats.expectedReports}`}
//             subtitle={`${stats.submittedReports} submitted`}
//             icon={FileText}
//             color="violet"
//           />
//         </div>
//       )}

//       {/* AI Summary output */}
//       {(summary || generating) && (
//         <div className="animate-scale-in">
//           <div className="card" style={{ padding: '1.5rem 1.75rem', borderColor: 'var(--blue-200)', background: 'linear-gradient(to bottom right, var(--blue-50), #ffffff)' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
//                 <div style={{
//                   width: 32, height: 32, borderRadius: 10,
//                   background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 }}>
//                   <Zap size={15} style={{ color: '#fff' }} />
//                 </div>
//                 <div>
//                   <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
//                     AI Summary
//                   </div>
//                   {generatedAt && (
//                     <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
//                       Generated {generatedAt.toLocaleTimeString()}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <span style={{
//                 fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
//                 padding: '0.1875rem 0.5rem', borderRadius: 999,
//                 background: 'var(--blue-100)', color: 'var(--blue-600)',
//               }}>
//                 Claude AI
//               </span>
//             </div>

//             {generating ? (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
//                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
//                   <div className="ai-typing"><span/><span/><span/></div>
//                   <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>Claude is analyzing your students' data…</span>
//                 </div>
//                 {[120, 80, 100, 60].map((w, i) => (
//                   <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, maxWidth: 500 }} />
//                 ))}
//               </div>
//             ) : (
//               <SummaryCard text={summary} />
//             )}
//           </div>
//         </div>
//       )}

//       {/* Students table */}
//       {students.length > 0 && (
//         <div className="animate-fade-up stagger-3">
//           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.875rem' }}>
//             Student roster
//           </div>
//           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Student</th>
//                   <th>Tasks done</th>
//                   <th>Attendance this week</th>
//                   <th>Reports approved</th>
//                   <th>Last active</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {students.map((s, i) => <StudentRow key={s._id} student={s} index={i} />)}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {students.length === 0 && (
//         <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
//           <Users size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
//           <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>No students assigned yet.</p>
//         </div>
//       )}
//     </div>
//   );
// }






import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';
import toast from 'react-hot-toast';
import {
  Sparkles, RefreshCw, Users, CheckCircle,
  FileText, CalendarCheck, AlertCircle, ChevronRight,
  Zap, ClipboardList, BarChart2, TrendingUp,
} from 'lucide-react';

const FETCH_LIMIT = 1000;

const getEntityId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const isCompletedTask = (task) => ['completed', 'reviewed'].includes(task?.status);
const isCompletedAttendance = (record) => ['present', 'late'].includes(record?.status);
const isCompletedReport = (report) => report?.status === 'approved';
const percent = (completed, total) => (total > 0 ? Math.round((completed / total) * 100) : 0);

const startOfCurrentWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const countWeekdaysInclusive = (startDate, endDate) => {
  let count = 0;
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
};

const latestDate = (dates) => {
  const validDates = dates.filter(Boolean).map(d => new Date(d)).filter(d => !Number.isNaN(d.getTime()));
  if (validDates.length === 0) return null;
  return new Date(Math.max(...validDates.map(d => d.getTime()))).toISOString();
};

const buildStudentMetrics = ({ students, tasks, attendanceRecords, reports, workingDays }) => {
  const studentIds = new Set(students.map(s => getEntityId(s)));
  const visibleTasks = tasks.filter(t => studentIds.has(getEntityId(t.assignedTo)));
  const visibleAttendance = attendanceRecords.filter(r => studentIds.has(getEntityId(r.student)));
  const visibleReports = reports.filter(r => studentIds.has(getEntityId(r.student)));

  const completedTasks = visibleTasks.filter(isCompletedTask).length;
  const completedAttendance = visibleAttendance.filter(isCompletedAttendance).length;
  const approvedReports = visibleReports.filter(isCompletedReport).length;
  const expectedAttendance = workingDays * students.length;

  const enrichedStudents = students.map(student => {
    const studentId = getEntityId(student);
    const sTasks = visibleTasks.filter(t => getEntityId(t.assignedTo) === studentId);
    const sAtt = visibleAttendance.filter(r => getEntityId(r.student) === studentId);
    const sRep = visibleReports.filter(r => getEntityId(r.student) === studentId);

    const sDone = sTasks.filter(isCompletedTask).length;
    const sAttDone = sAtt.filter(isCompletedAttendance).length;
    const sRepApproved = sRep.filter(isCompletedReport).length;

    return {
      ...student,
      taskCompletionRate: percent(sDone, sTasks.length),
      attendanceRate: percent(sAttDone, workingDays),
      reportsStatus: sTasks.length === 0 ? 'no tasks'
        : sRepApproved >= sTasks.length ? 'all approved'
        : sRep.length > 0 ? 'pending' : 'missing',
      lastActive: latestDate([
        ...sTasks.map(t => t.updatedAt || t.completedAt || t.createdAt),
        ...sAtt.map(r => r.date || r.updatedAt || r.createdAt),
        ...sRep.map(r => r.updatedAt || r.reviewedAt || r.createdAt),
      ]),
      metrics: {
        completedTasks: sDone, totalTasks: sTasks.length,
        completedAttendance: sAttDone, expectedAttendance: workingDays,
        approvedReports: sRepApproved, submittedReports: sRep.length, expectedReports: sTasks.length,
      },
    };
  });

  return {
    students: enrichedStudents,
    stats: {
      totalStudents: students.length,
      completedTasks, totalTasks: visibleTasks.length, taskRate: percent(completedTasks, visibleTasks.length),
      completedAttendance, expectedAttendance, attendanceRate: percent(completedAttendance, expectedAttendance),
      approvedReports, submittedReports: visibleReports.length, expectedReports: visibleTasks.length,
      reportRate: percent(approvedReports, visibleTasks.length),
      workingDays,
    },
  };
};

function SummaryCard({ text }) {
  if (!text) return null;
  const lines = text.split('\n').filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {lines.map((line, i) => {
        if (line.startsWith('##')) return (
          <h3 key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: '0.75rem 0 0.25rem', paddingTop: i > 0 ? '0.5rem' : 0, borderTop: i > 0 ? '1px solid var(--slate-100)' : 'none' }}>
            {line.replace(/^#+\s/, '')}
          </h3>
        );
        if (line.startsWith('-') || line.startsWith('•')) return (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.125rem 0' }}>
            <ChevronRight size={13} style={{ color: 'var(--blue-500)', marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>{line.replace(/^[-•]\s*/, '')}</span>
          </div>
        );
        return <p key={i} style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.7, margin: 0 }}>{line}</p>;
      })}
    </div>
  );
}

function StudentRow({ student, index, testStats }) {
  const metrics = student.metrics || {};
  const score = student.taskCompletionRate ?? 0;
  const attendanceScore = student.attendanceRate ?? 0;
  const color = score >= 75 ? 'var(--emerald-500)' : score >= 40 ? 'var(--amber-500)' : 'var(--rose-500)';
  const testSub = testStats?.submissionsMap?.[student._id] || null;

  return (
    <tr
      onMouseEnter={e => { [...e.currentTarget.children].forEach(td => td.style.background = 'var(--slate-50)'); }}
      onMouseLeave={e => { [...e.currentTarget.children].forEach(td => td.style.background = ''); }}
    >
      <td style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--blue-100), var(--blue-50))', border: '1.5px solid var(--blue-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--blue-600)' }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{student.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{student.email}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 6, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden', maxWidth: 80 }}>
            <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{metrics.completedTasks ?? 0}/{metrics.totalTasks ?? 0}</span>
        </div>
      </td>
      <td>
        <span style={{ display: 'inline-block', fontSize: '0.8125rem', fontWeight: 600, color: attendanceScore >= 80 ? 'var(--emerald-500)' : 'var(--amber-500)' }}>
          {metrics.completedAttendance ?? 0}/{metrics.expectedAttendance ?? 0}
        </span>
      </td>
      <td>
        <span className={`badge badge-${student.reportsStatus === 'all approved' ? 'green' : student.reportsStatus === 'pending' ? 'amber' : 'gray'}`}>
          {metrics.approvedReports ?? 0}/{metrics.expectedReports ?? 0}
        </span>
      </td>
      <td>
        {testSub ? (
          <div>
            <span className={`badge badge-${testSub.status === 'reviewed' ? 'green' : testSub.status === 'submitted' ? 'amber' : 'blue'}`}>
              {testSub.percentage}%
            </span>
            <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', marginTop: 2 }}>{testSub.status}</div>
          </div>
        ) : (
          <span className="badge badge-red">Not attempted</span>
        )}
      </td>
      <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>
        {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
}

export default function MentorSummaryPage() {
  const user = useAuthStore(s => s.user);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState(null);
  const [testStats, setTestStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  useEffect(() => { fetchStudentData(); }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const weekStart = startOfCurrentWeek();
      const todayEnd = endOfToday();
      const { data } = await api.get('/users', { params: { role: 'student', limit: FETCH_LIMIT } });
      const studs = data.users || [];

      const [taskRes, attendRes, reportRes, testRes] = await Promise.all([
        api.get('/tasks', { params: { limit: FETCH_LIMIT } }),
        api.get('/attendance', { params: { startDate: weekStart.toISOString(), endDate: todayEnd.toISOString(), limit: FETCH_LIMIT } }),
        api.get('/reports', { params: { limit: FETCH_LIMIT } }),
        api.get('/tests/stats').catch(() => ({ data: { tests: [], submissions: [] } })),
      ]);

      const metrics = buildStudentMetrics({
        students: studs,
        tasks: taskRes.data.tasks || [],
        attendanceRecords: attendRes.data.records || [],
        reports: reportRes.data.reports || [],
        workingDays: countWeekdaysInclusive(weekStart, todayEnd),
      });

      setStudents(metrics.students);
      setStats(metrics.stats);

      // Process test stats
      const tests = testRes.data.tests || [];
      const submissions = testRes.data.submissions || [];
      const activeTests = tests.filter(t => t.status === 'active');
      const submissionsMap = {};
      submissions.forEach(s => {
        const sId = getEntityId(s.student);
        if (!submissionsMap[sId] || new Date(s.submittedAt) > new Date(submissionsMap[sId].submittedAt)) {
          submissionsMap[sId] = s;
        }
      });

      const studentsWithTests = studs.filter(s => submissionsMap[s._id.toString()]);
      const studentsWithoutTests = studs.filter(s => !submissionsMap[s._id.toString()]);
      const avgScore = submissions.length > 0
        ? Math.round(submissions.reduce((a, s) => a + (s.percentage || 0), 0) / submissions.length)
        : 0;

      setTestStats({ activeTests, submissions, submissionsMap, studentsWithTests, studentsWithoutTests, avgScore, totalTests: tests.length });
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load student data');
    }
    setLoading(false);
  };

  const generateSummary = async () => {
    if (students.length === 0) return toast.error('No students to analyze');
    setGenerating(true);
    setSummary('');
    try {
      const avgCompletion = students.length > 0
        ? Math.round(students.reduce((a, s) => a + (s.taskCompletionRate ?? 0), 0) / students.length) : 0;

      const testSummary = testStats
        ? `\nTest Performance:\n- Active Tests: ${testStats.activeTests.length}\n- Students who attempted: ${testStats.studentsWithTests.length}/${students.length}\n- Average test score: ${testStats.avgScore}%\n- Students who haven't taken any test: ${testStats.studentsWithoutTests.map(s => s.name).join(', ') || 'None'}`
        : '';

      const context = `
Mentor: ${user?.name}
Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Summary Stats:
- Total Students: ${students.length}
- Tasks Completed: ${stats?.completedTasks ?? 0}/${stats?.totalTasks ?? 0} (${stats?.taskRate ?? 0}%)
- Attendance Marked: ${stats?.completedAttendance ?? 0}/${stats?.expectedAttendance ?? 0} (${stats?.attendanceRate ?? 0}%)
- Reports Approved: ${stats?.approvedReports ?? 0}/${stats?.expectedReports ?? 0}
- Working Days This Week: ${stats?.workingDays ?? 0}
- Average Task Completion: ${avgCompletion}%
${testSummary}

Top Students:
${students.slice(0, 10).map(s => `- ${s.name}: ${s.metrics?.completedTasks ?? 0}/${s.metrics?.totalTasks ?? 0} tasks, ${s.attendanceRate ?? 0}% attendance`).join('\n')}
      `.trim();

      const { data } = await api.post('/ai/chat', {
        messages: [{
          role: 'user',
          content: `Generate a concise, professional weekly performance summary for a mentor. Use this data:\n\n${context}\n\nStructure it with ## headers:\n## Overall Performance\n## Key Highlights\n## Test & Assessment Performance\n## Students Needing Attention\n## Recommendations for Next Week\n\nBe specific, actionable, and encouraging. Use - bullet points for lists. Keep it to 280-360 words.`,
        }],
        context: 'Mentor weekly performance report generation',
      });
      setSummary(data.reply || '');
      setGenerated(true);
      setGeneratedAt(new Date());
      toast.success('Summary generated!');
    } catch { toast.error('AI generation failed'); }
    setGenerating(false);
  };

  if (loading) return <LoadingSpinner label="Loading student data…" />;
  if (user?.role === 'student') return (
    <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
      <AlertCircle size={36} style={{ color: 'var(--rose-400)', margin: '0 auto 1rem' }} />
      <p style={{ color: 'var(--slate-500)' }}>This page is only available to mentors and admins.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1100 }}>
      {/* Header card */}
      <div className="animate-fade-up" style={{
        background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Powered by Claude AI</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem', color: '#ffffff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
            Weekly Performance Summary
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0.375rem 0 0' }}>
            AI-generated insights including tasks, attendance, reports & test performance
          </p>
        </div>
        <button
          onClick={generateSummary} disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.15)',
            background: generating ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
            color: '#ffffff', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
            cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 180ms ease', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!generating) { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = ''; }}
        >
          {generating
            ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
            : <><Sparkles size={14} /> {generated ? 'Regenerate' : 'Generate Summary'}</>
          }
        </button>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <StatCard title="My Students" value={stats.totalStudents} icon={Users} color="primary" />
          <StatCard title="Tasks Completed" value={`${stats.completedTasks}/${stats.totalTasks}`} subtitle={`${stats.taskRate}% complete`} icon={CheckCircle} color="green" />
          <StatCard title="Attendance Marked" value={`${stats.completedAttendance}/${stats.expectedAttendance}`} subtitle={`${stats.workingDays} weekdays`} icon={CalendarCheck} color="amber" />
          <StatCard title="Reports Approved" value={`${stats.approvedReports}/${stats.expectedReports}`} icon={FileText} color="violet" />
          {testStats && (
            <StatCard title="Tests Attempted" value={`${testStats.studentsWithTests.length}/${stats.totalStudents}`} subtitle={`Avg: ${testStats.avgScore}%`} icon={ClipboardList} color="rose" />
          )}
        </div>
      )}

      {/* Test Performance Section */}
      {testStats && testStats.totalTests > 0 && (
        <div className="animate-fade-up stagger-2">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={17} style={{ color: 'var(--blue-500)' }} /> Test Performance Overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Students who submitted */}
            <div className="card" style={{ padding: '1.125rem 1.375rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle size={14} style={{ color: 'var(--emerald-500)' }} /> Attempted ({testStats.studentsWithTests.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 180, overflowY: 'auto' }}>
                {testStats.studentsWithTests.length === 0
                  ? <span style={{ fontSize: '0.8125rem', color: 'var(--slate-400)' }}>No students have attempted tests yet</span>
                  : testStats.studentsWithTests.map(s => {
                    const sub = testStats.submissionsMap[s._id.toString()];
                    return (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)' }}>{s.name}</span>
                        <span className={`badge badge-${(sub?.percentage || 0) >= 60 ? 'green' : 'red'}`}>{sub?.percentage ?? 0}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* Students who haven't submitted */}
            <div className="card" style={{ padding: '1.125rem 1.375rem', border: testStats.studentsWithoutTests.length > 0 ? '1px solid rgba(244,63,94,0.2)' : undefined, background: testStats.studentsWithoutTests.length > 0 ? 'var(--rose-50)' : '#fff' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: testStats.studentsWithoutTests.length > 0 ? 'var(--rose-700)' : 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <AlertCircle size={14} style={{ color: testStats.studentsWithoutTests.length > 0 ? 'var(--rose-500)' : 'var(--slate-400)' }} /> Not Attempted ({testStats.studentsWithoutTests.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {testStats.studentsWithoutTests.length === 0
                  ? <span style={{ fontSize: '0.8125rem', color: 'var(--emerald-600)', fontWeight: 600 }}>✅ All students have attempted tests!</span>
                  : testStats.studentsWithoutTests.map(s => (
                    <span key={s._id} className="badge badge-red">{s.name}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary output */}
      {(summary || generating) && (
        <div className="animate-scale-in">
          <div className="card" style={{ padding: '1.5rem 1.75rem', borderColor: 'var(--blue-200)', background: 'linear-gradient(to bottom right, var(--blue-50), #ffffff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={15} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>AI Summary</div>
                  {generatedAt && <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>Generated {generatedAt.toLocaleTimeString()}</div>}
                </div>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', padding: '0.1875rem 0.5rem', borderRadius: 999, background: 'var(--blue-100)', color: 'var(--blue-600)' }}>Claude AI</span>
            </div>
            {generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className="ai-typing"><span/><span/><span/></div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>Claude is analyzing all performance data…</span>
                </div>
                {[120, 80, 100, 60].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, maxWidth: 500 }} />
                ))}
              </div>
            ) : (
              <SummaryCard text={summary} />
            )}
          </div>
        </div>
      )}

      {/* Students table */}
      {students.length > 0 && (
        <div className="animate-fade-up stagger-3">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.875rem' }}>
            Student roster
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Student</th>
                  <th>Tasks done</th>
                  <th>Attendance this week</th>
                  <th>Reports approved</th>
                  <th>Latest test</th>
                  <th>Last active</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <StudentRow key={s._id} student={s} index={i} testStats={testStats} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>No students assigned yet.</p>
        </div>
      )}
    </div>
  );
}