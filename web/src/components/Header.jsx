import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { LogOut, Bell, Search } from 'lucide-react';

const pageTitles = {
  '/dashboard':    { title: 'Dashboard',     subtitle: 'Welcome back' },
  '/tasks':        { title: 'Tasks',          subtitle: 'Track your progress' },
  '/attendance':   { title: 'Attendance',     subtitle: 'Daily check-ins' },
  '/reports':      { title: 'Reports',        subtitle: 'Uploaded documents' },
  '/videos':       { title: 'Videos',         subtitle: 'Learning materials' },
  '/users':        { title: 'Users',          subtitle: 'Team management' },
  '/internships':  { title: 'Internships',    subtitle: 'Active programs' },
  '/certificates': { title: 'Certificates',   subtitle: 'Achievements' },
  '/ai-summary':   { title: 'AI Insights',    subtitle: 'Powered by Claude' },
};

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const page = pageTitles[pathname] || { title: 'Internix', subtitle: '' };

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => { logout(); navigate('/login'); }, 300);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header style={{
      height: 64,
      background: '#ffffff',
      borderBottom: '1px solid var(--slate-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Left: Page title */}
      <div className="animate-fade-in">
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: 'var(--slate-900)',
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
        }}>
          {page.title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>
          {page.subtitle
            ? page.subtitle
            : `${greeting()}, ${user?.name?.split(' ')[0]}`}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Role badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.75rem',
          borderRadius: 999,
          background: user?.role === 'admin'
            ? 'var(--violet-100)'
            : user?.role === 'mentor'
            ? 'var(--amber-100)'
            : 'var(--blue-100)',
          border: `1px solid ${user?.role === 'admin'
            ? 'rgba(139,92,246,0.2)'
            : user?.role === 'mentor'
            ? 'rgba(245,158,11,0.2)'
            : 'rgba(59,130,246,0.2)'}`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: user?.role === 'admin'
              ? 'var(--violet-500)'
              : user?.role === 'mentor'
              ? 'var(--amber-500)'
              : 'var(--blue-600)',
          }} />
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'capitalize',
            color: user?.role === 'admin'
              ? 'var(--violet-500)'
              : user?.role === 'mentor'
              ? '#92400e'
              : '#1d4ed8',
          }}>
            {user?.role}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--slate-200)', margin: '0 0.25rem' }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 8,
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--slate-500)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--rose-50)';
            e.currentTarget.style.color = 'var(--rose-500)';
            e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--slate-500)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut size={15} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
