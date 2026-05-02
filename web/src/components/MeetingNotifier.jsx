import { useEffect, useRef, useState } from 'react';
import useMeetingStore from '../store/meetingStore';
import { Video, X, ExternalLink, Clock, Bell } from 'lucide-react';

const FREQ_LABEL = {
  daily: '📅 Daily',
  weekly: '📆 Weekly',
  monthly: '🗓️ Monthly',
  once: '📌 One-time',
};

function MeetingToast({ meeting, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid rgba(37,99,235,0.25)',
        boxShadow: '0 16px 48px rgba(37,99,235,0.18), 0 4px 12px rgba(0,0,0,0.08)',
        padding: '1.125rem 1.25rem',
        width: 'min(340px, calc(100vw - 2rem))',
        maxWidth: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      {/* Blue top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 26, height: 26, borderRadius: 8, border: 'none',
          background: 'var(--slate-100)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--slate-400)', transition: 'all 150ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-50)'; e.currentTarget.style.color = 'var(--rose-500)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--slate-100)'; e.currentTarget.style.color = 'var(--slate-400)'; }}
      >
        <X size={13} />
      </button>

      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginTop: '0.25rem' }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Video size={20} style={{ color: '#2563eb' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: meeting.minutesLeft <= 1
              ? 'var(--rose-100)' : 'var(--amber-100)',
            color: meeting.minutesLeft <= 1
              ? 'var(--rose-700)' : '#92400e',
            padding: '2px 8px', borderRadius: 999,
            fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.04em',
            marginBottom: '0.375rem',
            animation: 'pulse-badge 1.5s infinite',
          }}>
            <Bell size={10} />
            {meeting.minutesLeft <= 1
              ? 'MEETING STARTING NOW!'
              : `STARTS IN ${meeting.minutesLeft} MIN`}
          </div>

          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9375rem', color: 'var(--slate-900)',
            lineHeight: 1.3, marginBottom: '0.25rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {meeting.title}
          </div>

          {meeting.description && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
              {meeting.description}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              {meeting.meetingTime}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              {FREQ_LABEL[meeting.frequency]}
            </span>
          </div>

          {meeting.meetingLink && (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 0.875rem',
                borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', textDecoration: 'none',
                fontSize: '0.8125rem', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                transition: 'all 150ms cubic-bezier(0.34,1.56,0.64,1)',
                transform: hovered ? 'translateY(-1px)' : '',
              }}
            >
              <ExternalLink size={13} /> Join Meeting
            </a>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default function MeetingNotifier() {
  const { upcoming, fetchUpcoming } = useMeetingStore();
  const [shown, setShown] = useState([]); // ids already dismissed this session
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchUpcoming();
    intervalRef.current = setInterval(fetchUpcoming, 60 * 1000); // poll every minute
    return () => clearInterval(intervalRef.current);
  }, []);

  const visible = upcoming.filter(m => !shown.includes(m._id));

  const dismiss = (id) => setShown(s => [...s, id]);

  if (visible.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      zIndex: 300,
      bottom: 'max(18px, env(safe-area-inset-bottom))',
      right: 'max(14px, env(safe-area-inset-right))',
      left: 'max(14px, env(safe-area-inset-left))',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      alignItems: 'flex-end',
    }}
    >
      {visible.map(meeting => (
        <MeetingToast
          key={meeting._id}
          meeting={meeting}
          onClose={() => dismiss(meeting._id)}
        />
      ))}
    </div>
  );
}