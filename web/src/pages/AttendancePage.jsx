// import { useEffect, useState } from 'react';
// import useAuthStore from '../store/authStore';
// import api from '../lib/axios';
// import LoadingSpinner from '../components/ui/LoadingSpinner';
// import toast from 'react-hot-toast';
// import { CalendarCheck, CheckCircle, Clock, XCircle, LogIn, LogOut } from 'lucide-react';

// const STATUS_CONFIG = {
//   present: { label: 'Present', bg: 'var(--emerald-100)', color: 'var(--emerald-500)', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle size={14} /> },
//   late:    { label: 'Late',    bg: 'var(--amber-100)',   color: 'var(--amber-500)',   border: 'rgba(245,158,11,0.2)', icon: <Clock size={14} /> },
//   absent:  { label: 'Absent',  bg: 'var(--rose-100)',    color: 'var(--rose-500)',    border: 'rgba(244,63,94,0.2)',  icon: <XCircle size={14} /> },
// };

// function AttendanceRow({ record, showStudent }) {
//   const [hovered, setHovered] = useState(false);
//   const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.absent;

//   return (
//     <tr
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{ background: hovered ? 'var(--slate-50)' : '', transition: 'background 120ms' }}
//     >
//       <td style={{ padding: '0.875rem 1.25rem' }}>
//         <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>
//           {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
//         </div>
//       </td>
//       {showStudent && (
//         <td>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//             <div style={{
//               width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
//               background: 'var(--blue-100)', border: '1px solid var(--blue-200)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '0.6875rem', fontWeight: 700, color: 'var(--blue-600)',
//             }}>
//               {record.student?.name?.charAt(0)}
//             </div>
//             <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>{record.student?.name || '—'}</span>
//           </div>
//         </td>
//       )}
//       <td>
//         <div style={{
//           display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
//           padding: '0.25rem 0.625rem',
//           borderRadius: 999,
//           background: cfg.bg, color: cfg.color,
//           border: `1px solid ${cfg.border}`,
//           fontSize: '0.75rem', fontWeight: 600,
//         }}>
//           {cfg.icon} {cfg.label}
//         </div>
//       </td>
//       <td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{record.checkInTime  || '—'}</td>
//       <td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{record.checkOutTime || '—'}</td>
//       <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem', maxWidth: 180 }}>
//         <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
//           {record.notes || '—'}
//         </span>
//       </td>
//     </tr>
//   );
// }

// export default function AttendancePage() {
//   const user    = useAuthStore((s) => s.user);
//   const [records,     setRecords]     = useState([]);
//   const [loading,     setLoading]     = useState(true);
//   const [marking,     setMarking]     = useState(false);
//   const [todayRecord, setTodayRecord] = useState(null);

//   useEffect(() => { fetchAttendance(); }, []);

//   const fetchAttendance = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/attendance');
//       setRecords(data.records);
//       const today = new Date().toDateString();
//       setTodayRecord(data.records.find((r) => new Date(r.date).toDateString() === today) || null);
//     } catch { toast.error('Failed to load attendance'); }
//     setLoading(false);
//   };

//   const handleCheckIn = async () => {
//     setMarking(true);
//     try {
//       await api.post('/attendance', { status: 'present' });
//       toast.success('✅ Check-in recorded!');
//       fetchAttendance();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     setMarking(false);
//   };

//   const handleCheckOut = async () => {
//     setMarking(true);
//     try {
//       await api.post('/attendance', { checkOutTime: new Date().toLocaleTimeString('en-US', { hour12: false }) });
//       toast.success('Check-out recorded!');
//       fetchAttendance();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     setMarking(false);
//   };

//   /* Quick stats */
//   const presentCount = records.filter((r) => r.status === 'present').length;
//   const lateCount    = records.filter((r) => r.status === 'late').length;
//   const absentCount  = records.filter((r) => r.status === 'absent').length;
//   const total        = records.length;
//   const rate         = total > 0 ? Math.round((presentCount / total) * 100) : 0;

//   if (loading) return <LoadingSpinner label="Loading attendance…" />;

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000 }}>
//       {/* Header + check-in button */}
//       <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//           <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--emerald-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
//             <CalendarCheck size={19} style={{ color: 'var(--emerald-500)' }} />
//           </div>
//           <div>
//             <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
//               Attendance
//             </div>
//             <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{total} records</div>
//           </div>
//         </div>
//         {user?.role === 'student' && (
//           <div style={{ display: 'flex', gap: '0.5rem' }}>
//             {!todayRecord ? (
//               <button onClick={handleCheckIn} disabled={marking} className="btn-primary">
//                 <LogIn size={15} /> {marking ? 'Recording…' : 'Check in'}
//               </button>
//             ) : !todayRecord.checkOutTime ? (
//               <button onClick={handleCheckOut} disabled={marking} className="btn-secondary">
//                 <LogOut size={15} /> {marking ? 'Recording…' : 'Check out'}
//               </button>
//             ) : (
//               <div style={{
//                 display: 'flex', alignItems: 'center', gap: '0.375rem',
//                 padding: '0.4375rem 0.875rem',
//                 borderRadius: 'var(--radius-md)',
//                 background: 'var(--emerald-50)', color: 'var(--emerald-600)',
//                 border: '1px solid rgba(16,185,129,0.2)',
//                 fontSize: '0.8125rem', fontWeight: 600,
//               }}>
//                 <CheckCircle size={14} /> Done for today
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Today's status banner */}
//       {user?.role === 'student' && (
//         <div className="animate-fade-up stagger-1" style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           padding: '1rem 1.25rem',
//           borderRadius: 'var(--radius-lg)',
//           background: todayRecord
//             ? STATUS_CONFIG[todayRecord.status]?.bg
//             : 'var(--slate-100)',
//           border: `1px solid ${todayRecord ? STATUS_CONFIG[todayRecord.status]?.border : 'var(--slate-200)'}`,
//           transition: 'all 300ms ease',
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//             <div style={{
//               width: 38, height: 38, borderRadius: 10,
//               background: todayRecord ? STATUS_CONFIG[todayRecord.status]?.color + '20' : 'var(--slate-200)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               color: todayRecord ? STATUS_CONFIG[todayRecord.status]?.color : 'var(--slate-400)',
//             }}>
//               {todayRecord ? STATUS_CONFIG[todayRecord.status]?.icon : <CalendarCheck size={18} />}
//             </div>
//             <div>
//               <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: todayRecord ? STATUS_CONFIG[todayRecord.status]?.color : 'var(--slate-500)', fontFamily: 'var(--font-display)' }}>
//                 {todayRecord ? `Marked as ${todayRecord.status}` : "Today's attendance not marked yet"}
//               </div>
//               {todayRecord && (
//                 <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
//                   {todayRecord.checkInTime && `In: ${todayRecord.checkInTime}`}
//                   {todayRecord.checkOutTime && ` · Out: ${todayRecord.checkOutTime}`}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-700)' }}>
//             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//           </div>
//         </div>
//       )}

//       {/* Quick stats */}
//       {total > 0 && (
//         <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
//           {[
//             { label: 'Attendance rate', value: `${rate}%`, color: 'var(--blue-600)',    bg: 'var(--blue-50)',    border: 'rgba(37,99,235,0.15)'  },
//             { label: 'Present days',    value: presentCount, color: 'var(--emerald-500)', bg: 'var(--emerald-50)', border: 'rgba(16,185,129,0.15)'  },
//             { label: 'Late arrivals',   value: lateCount,   color: 'var(--amber-500)',   bg: 'var(--amber-50)',   border: 'rgba(245,158,11,0.15)'  },
//             { label: 'Absent days',     value: absentCount, color: 'var(--rose-500)',    bg: 'var(--rose-50)',    border: 'rgba(244,63,94,0.15)'   },
//           ].map((s) => (
//             <div key={s.label} style={{
//               background: s.bg, border: `1px solid ${s.border}`,
//               borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
//               transition: 'all 180ms ease',
//             }}>
//               <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem', color: s.color, letterSpacing: '-0.03em' }}>
//                 {s.value}
//               </div>
//               <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>{s.label}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Table */}
//       {records.length === 0 ? (
//         <div className="card animate-fade-up stagger-3" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
//           <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
//             <CalendarCheck size={26} style={{ color: 'var(--slate-300)' }} />
//           </div>
//           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
//             No attendance records yet
//           </div>
//           <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
//             {user?.role === 'student' ? 'Check in daily using the button above.' : 'Student attendance will appear here.'}
//           </div>
//         </div>
//       ) : (
//         <div className="card animate-fade-up stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Date</th>
//                 {user?.role !== 'student' && <th>Student</th>}
//                 <th>Status</th>
//                 <th>Check in</th>
//                 <th>Check out</th>
//                 <th>Notes</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((r) => (
//                 <AttendanceRow key={r._id} record={r} showStudent={user?.role !== 'student'} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }





import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CameraCapture from '../components/CameraCapture';
import toast from 'react-hot-toast';
import {
  CalendarCheck, CheckCircle, Clock, XCircle,
  LogIn, LogOut, Camera, Eye, Shield, AlertCircle,
  Info,
} from 'lucide-react';

const STATUS_CONFIG = {
  present: { label: 'Present', bg: 'var(--emerald-100)', color: 'var(--emerald-500)', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle size={14} /> },
  late:    { label: 'Late',    bg: 'var(--amber-100)',   color: 'var(--amber-500)',   border: 'rgba(245,158,11,0.2)', icon: <Clock size={14} /> },
  absent:  { label: 'Absent',  bg: 'var(--rose-100)',    color: 'var(--rose-500)',    border: 'rgba(244,63,94,0.2)',  icon: <XCircle size={14} /> },
};

function AttendanceRow({ record, showStudent, onVerify, isAdmin }) {
  const [hovered, setHovered] = useState(false);
  const [showPhoto, setShowPhoto] = useState(null); // 'in' | 'out' | null
  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.absent;

  return (
    <>
      <tr
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? 'var(--slate-50)' : '', transition: 'background 120ms' }}
      >
        <td style={{ padding: '0.875rem 1.25rem' }}>
          <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>
            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </td>
        {showStudent && (
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: 'var(--blue-100)', border: '1px solid var(--blue-200)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--blue-600)',
              }}>
                {record.student?.name?.charAt(0)}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>{record.student?.name || '—'}</span>
            </div>
          </td>
        )}
        <td>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
            padding: '0.25rem 0.625rem',
            borderRadius: 999,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontSize: '0.75rem', fontWeight: 600,
          }}>
            {cfg.icon} {cfg.label}
            {record.isManualOverride && (
              <span style={{ fontSize: '0.625rem', opacity: 0.7 }}>(manual)</span>
            )}
          </div>
        </td>
        <td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {record.checkInTime || '—'}
            {record.checkInPhoto && (
              <button onClick={() => setShowPhoto(showPhoto === 'in' ? null : 'in')}
                style={{ border: 'none', background: 'var(--blue-100)', borderRadius: 4, padding: '1px 4px', cursor: 'pointer', color: 'var(--blue-600)', fontSize: '0.6875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Camera size={10} /> photo
              </button>
            )}
          </div>
        </td>
        <td style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {record.checkOutTime || '—'}
            {record.checkOutPhoto && (
              <button onClick={() => setShowPhoto(showPhoto === 'out' ? null : 'out')}
                style={{ border: 'none', background: 'var(--blue-100)', borderRadius: 4, padding: '1px 4px', cursor: 'pointer', color: 'var(--blue-600)', fontSize: '0.6875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Camera size={10} /> photo
              </button>
            )}
          </div>
        </td>
        <td>
          {record.checkInPhoto ? (
            record.isPhotoVerified ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                <Shield size={11} /> Verified
              </span>
            ) : isAdmin ? (
              <button onClick={() => onVerify(record._id)} style={{
                border: 'none', background: 'var(--emerald-100)', borderRadius: 6, padding: '3px 8px',
                cursor: 'pointer', color: 'var(--emerald-700)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)',
              }}>
                Verify
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Pending</span>
            )
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-300)' }}>—</span>
          )}
        </td>
      </tr>
      {/* Photo preview row */}
      {showPhoto && (
        <tr>
          <td colSpan={showStudent ? 7 : 6} style={{ padding: '0.5rem 1.25rem 1rem', background: 'var(--slate-50)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {showPhoto === 'in' && record.checkInPhoto && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.375rem', fontWeight: 600 }}>Check-in photo</div>
                  <img src={record.checkInPhoto} alt="Check-in" style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--slate-200)' }} />
                </div>
              )}
              {showPhoto === 'out' && record.checkOutPhoto && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.375rem', fontWeight: 600 }}>Check-out photo</div>
                  <img src={record.checkOutPhoto} alt="Check-out" style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--slate-200)' }} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [showCamera, setShowCamera] = useState(null); // 'checkin' | 'checkout' | null
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [attRes, schedRes] = await Promise.all([
        api.get('/attendance'),
        user?.role === 'student' ? api.get('/attendance/today-schedule') : Promise.resolve(null),
      ]);
      setRecords(attRes.data.records);

      if (schedRes) {
        setSchedule(schedRes.data.schedule);
        setIsWorkingDay(schedRes.data.isWorkingDay);
        setTodayRecord(schedRes.data.todayRecord);
      } else {
        const today = new Date().toDateString();
        setTodayRecord(attRes.data.records.find((r) => new Date(r.date).toDateString() === today) || null);
      }
    } catch { toast.error('Failed to load attendance'); }
    setLoading(false);
  };

  // Called when camera confirms a photo
  const handlePhotoCapture = async (photoFile) => {
    setShowCamera(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const { data } = await api.post('/attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(data.message || (data.record.checkOutTime ? 'Checked out!' : 'Checked in!'));
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Attendance failed';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  const handleVerifyPhoto = async (recordId) => {
    try {
      await api.put(`/attendance/${recordId}/verify-photo`);
      toast.success('Photo verified');
      fetchAll();
    } catch { toast.error('Verification failed'); }
  };

  // Stats
  const presentCount = records.filter((r) => r.status === 'present').length;
  const lateCount    = records.filter((r) => r.status === 'late').length;
  const absentCount  = records.filter((r) => r.status === 'absent').length;
  const total        = records.length;
  const rate         = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  const isAdmin = user?.role === 'mentor' || user?.role === 'admin';
  const needsCheckIn = user?.role === 'student' && isWorkingDay && !todayRecord;
  const needsCheckOut = user?.role === 'student' && todayRecord && !todayRecord.checkOutTime;
  const completedToday = user?.role === 'student' && todayRecord?.checkOutTime;

  if (loading) return <LoadingSpinner label="Loading attendance…" />;

  return (
    <>
      {/* Camera modal */}
      {showCamera && (
        <CameraCapture
          label={showCamera === 'checkin' ? 'Check In Selfie' : 'Check Out Selfie'}
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(null)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem'  }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--emerald-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CalendarCheck size={19} style={{ color: 'var(--emerald-500)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
                Attendance
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{total} records</div>
            </div>
          </div>
        </div>

        {/* Work schedule info (student) */}
        {user?.role === 'student' && schedule && (
          <div className="animate-fade-up stagger-1" style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
          }}>
            <Info size={15} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--blue-700)', lineHeight: 1.6 }}>
              <strong>Working hours:</strong> {schedule.startTime} – {schedule.endTime} &nbsp;·&nbsp;
              <strong>Days:</strong> {schedule.workingDays?.join(', ')} &nbsp;·&nbsp;
              <strong>Grace period:</strong> {schedule.graceMinutes} min &nbsp;·&nbsp;
              {schedule.requirePhoto
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Camera size={11} /> Photo required</span>
                : 'No photo required'}
            </div>
          </div>
        )}

        {/* Non-working day notice */}
        {user?.role === 'student' && !isWorkingDay && (
          <div className="animate-fade-up stagger-1" style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.875rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--slate-100)', border: '1px solid var(--slate-200)',
          }}>
            <AlertCircle size={15} style={{ color: 'var(--slate-500)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
              Today is not a scheduled working day. No check-in required.
            </span>
          </div>
        )}

        {/* Student: Today's attendance action */}
        {user?.role === 'student' && isWorkingDay && (
          <div className="animate-fade-up stagger-1" style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: completedToday ? 'var(--emerald-50)' : 'var(--slate-100)',
            border: `1px solid ${completedToday ? 'rgba(16,185,129,0.2)' : 'var(--slate-200)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              {/* Today's photos thumbnail */}
              {(todayRecord?.checkInPhoto || todayRecord?.checkOutPhoto) && (
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {todayRecord.checkInPhoto && (
                    <img src={todayRecord.checkInPhoto} alt="In"
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--emerald-300)' }} />
                  )}
                  {todayRecord.checkOutPhoto && (
                    <img src={todayRecord.checkOutPhoto} alt="Out"
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--amber-300)' }} />
                  )}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-display)', color: 'var(--slate-900)' }}>
                  {completedToday ? '✅ Attendance complete for today'
                    : todayRecord ? `Checked in at ${todayRecord.checkInTime}`
                    : "Today's attendance not marked yet"}
                </div>
                {todayRecord && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>
                    {todayRecord.checkOutTime ? `Checked out at ${todayRecord.checkOutTime}` : 'Check out when you leave'}
                    {' '}· <span style={{ textTransform: 'capitalize', color: STATUS_CONFIG[todayRecord.status]?.color }}>
                      {todayRecord.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              {needsCheckIn && (
                <button onClick={() => setShowCamera('checkin')} disabled={submitting} className="btn-primary">
                  <Camera size={15} /> <LogIn size={14} /> Check In
                </button>
              )}
              {needsCheckOut && (
                <button onClick={() => setShowCamera('checkout')} disabled={submitting} className="btn-secondary">
                  <Camera size={15} /> <LogOut size={14} /> Check Out
                </button>
              )}
              {completedToday && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.4375rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--emerald-100)', color: 'var(--emerald-700)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  <CheckCircle size={14} /> Done for today
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick stats */}
        {total > 0 && (
          <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
            {[
              { label: 'Attendance rate', value: `${rate}%`, color: 'var(--blue-600)', bg: 'var(--blue-50)', border: 'rgba(37,99,235,0.15)' },
              { label: 'Present days', value: presentCount, color: 'var(--emerald-500)', bg: 'var(--emerald-50)', border: 'rgba(16,185,129,0.15)' },
              { label: 'Late arrivals', value: lateCount, color: 'var(--amber-500)', bg: 'var(--amber-50)', border: 'rgba(245,158,11,0.15)' },
              { label: 'Absent days', value: absentCount, color: 'var(--rose-500)', bg: 'var(--rose-50)', border: 'rgba(244,63,94,0.15)' },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem', color: s.color, letterSpacing: '-0.03em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {records.length === 0 ? (
          <div className="card animate-fade-up stagger-3" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
              <CalendarCheck size={26} style={{ color: 'var(--slate-300)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
              No attendance records yet
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
              {user?.role === 'student' ? 'Check in using the camera button above.' : 'Student attendance will appear here.'}
            </div>
          </div>
        ) : (
          <div className="card animate-fade-up stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Date</th>
                  {isAdmin && <th>Student</th>}
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <AttendanceRow
                    key={r._id}
                    record={r}
                    showStudent={isAdmin}
                    onVerify={handleVerifyPhoto}
                    isAdmin={isAdmin}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}