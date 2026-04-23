import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Bell, BellRing, Pin, X, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Info, Megaphone, Clock } from 'lucide-react';

const PRIORITY_CFG = {
  urgent: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.35)', color: '#f43f5e', dot: '#f43f5e', label: 'URGENT' },
  high:   { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',  color: '#d97706', dot: '#f59e0b', label: 'HIGH' },
  medium: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', color: 'var(--blue-600)', dot: '#3b82f6', label: '' },
  low:    { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', color: 'var(--slate-500)', dot: '#94a3b8', label: '' },
};

const TYPE_ICON = {
  announcement: <Megaphone size={12} />,
  alert:        <AlertCircle size={12} />,
  reminder:     <Clock size={12} />,
  general:      <Info size={12} />,
};

function NoticeItem({ notice, onRead }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CFG[notice.priority] || PRIORITY_CFG.medium;
  const isRead = notice.isRead;

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!isRead) onRead(notice._id);
  };

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${cfg.border}`,
      background: cfg.bg,
      marginBottom: '0.5rem',
      overflow: 'hidden',
      transition: 'all 200ms ease',
      opacity: isRead ? 0.75 : 1,
    }}>
      <div
        onClick={handleExpand}
        style={{ padding: '0.625rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
      >
        {/* Priority dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: cfg.dot,
          flexShrink: 0, marginTop: 5,
          boxShadow: !isRead ? `0 0 6px ${cfg.dot}` : 'none',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.1875rem' }}>
            {notice.isPinned && <Pin size={9} style={{ color: cfg.color, flexShrink: 0 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: cfg.color, flexShrink: 0 }}>
              {TYPE_ICON[notice.type] || TYPE_ICON.general}
            </div>
            {cfg.label && (
              <span style={{
                fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.07em',
                color: cfg.color, flexShrink: 0,
              }}>
                {cfg.label}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '0.75rem', fontWeight: isRead ? 500 : 700,
            color: isRead ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)',
            lineHeight: 1.35,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {notice.title}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1875rem' }}>
            {notice.createdBy?.name} · {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div style={{ flexShrink: 0, color: 'rgba(255,255,255,0.3)' }}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </div>

      {expanded && (
        <div style={{
          padding: '0 0.75rem 0.75rem 1.625rem',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6,
          borderTop: `1px solid ${cfg.border}`,
          paddingTop: '0.5rem',
          animation: 'slideDown 0.15s ease both',
        }}>
          {notice.content}
        </div>
      )}
    </div>
  );
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data.notices || []);
      setUnreadCount((data.notices || []).filter(n => !n.isRead).length);
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleRead = async (id) => {
    try {
      await api.put(`/notices/${id}/read`);
      setNotices(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  if (notices.length === 0 && !loading) return null;

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: collapsed ? '0.625rem 0.75rem' : '0.75rem',
    }}>
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', marginBottom: collapsed ? 0 : '0.625rem',
          padding: collapsed ? 0 : '0 0.125rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: unreadCount > 0 ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {unreadCount > 0
              ? <BellRing size={12} style={{ color: '#f43f5e' }} />
              : <Bell size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
            }
          </div>
          <span style={{
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          }}>
            Notices
          </span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 800,
              padding: '1px 5px', borderRadius: 999,
              background: '#f43f5e', color: '#fff',
              animation: 'pulse-ring 2s infinite',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.2)' }}>
          {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </div>

      {!collapsed && (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
              <RefreshCw size={14} style={{ color: 'rgba(255,255,255,0.2)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            notices.map(notice => (
              <NoticeItem key={notice._id} notice={notice} onRead={handleRead} />
            ))
          )}
        </div>
      )}
    </div>
  );
}