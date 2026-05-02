// import { useNavigate, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import useAuthStore from '../store/authStore';
// import { LogOut } from 'lucide-react';

// const pageTitles = {
//   '/dashboard':      { title: 'Dashboard',      subtitle: 'Welcome back' },
//   '/tasks':          { title: 'Tasks',           subtitle: 'Track your progress' },
//   '/attendance':     { title: 'Attendance',      subtitle: 'Daily check-ins' },
//   '/reports':        { title: 'Reports',         subtitle: 'Uploaded documents' },
//   '/videos':         { title: 'Videos',          subtitle: 'Learning materials' },
//   '/users':          { title: 'Users',           subtitle: 'Team management' },
//   '/internships':    { title: 'Internships',     subtitle: 'Active programs' },
//   '/certificates':   { title: 'Certificates',    subtitle: 'Achievements' },
//   '/ai-summary':     { title: 'AI Insights',     subtitle: 'Powered by Claude' },
//   '/work-schedule':  { title: 'Work Schedule',   subtitle: 'Attendance configuration' },
//   '/onboarding':     { title: 'Onboarding',       subtitle: 'Add new students' },
// };

// export default function Header() {
//   const { user, logout } = useAuthStore();
//   const navigate  = useNavigate();
//   const { pathname } = useLocation();
//   const [loggingOut, setLoggingOut] = useState(false);

//   const page = pageTitles[pathname] || { title: 'Internix', subtitle: '' };

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     setTimeout(() => { logout(); navigate('/login'); }, 300);
//   };

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good morning';
//     if (h < 17) return 'Good afternoon';
//     return 'Good evening';
//   };

//   const roleColors = {
//     admin:  { bg: 'var(--violet-100)', dot: 'var(--violet-500)', text: 'var(--violet-500)', border: 'rgba(139,92,246,0.2)' },
//     mentor: { bg: 'var(--amber-100)',  dot: 'var(--amber-500)',  text: '#92400e',           border: 'rgba(245,158,11,0.2)' },
//     student:{ bg: 'var(--blue-100)',   dot: 'var(--blue-600)',   text: '#1d4ed8',           border: 'rgba(59,130,246,0.2)' },
//   };
//   const rc = roleColors[user?.role] || roleColors.student;

//   return (
//     <header style={{
//       height: 64,
//       background: '#ffffff',
//       borderBottom: '1px solid var(--slate-200)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: '0 1.5rem',
//       position: 'sticky',
//       top: 0,
//       zIndex: 20,
//       boxShadow: 'var(--shadow-xs)',
//     }}>
//       {/* Left: Page title */}
//       <div className="animate-fade-in">
//         <div style={{
//           fontFamily: 'var(--font-display)',
//           fontWeight: 700,
//           fontSize: '1.125rem',
//           color: 'var(--slate-900)',
//           letterSpacing: '-0.025em',
//           lineHeight: 1.2,
//         }}>
//           {page.title}
//         </div>
//         <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>
//           {page.subtitle
//             ? page.subtitle
//             : `${greeting()}, ${user?.name?.split(' ')[0]}`}
//         </div>
//       </div>

//       {/* Right: Actions */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//         {/* Role badge */}
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '0.375rem',
//           padding: '0.25rem 0.75rem',
//           borderRadius: 999,
//           background: rc.bg,
//           border: `1px solid ${rc.border}`,
//         }}>
//           <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.dot }} />
//           <span style={{
//             fontSize: '0.6875rem',
//             fontWeight: 700,
//             letterSpacing: '0.05em',
//             textTransform: 'capitalize',
//             color: rc.text,
//           }}>
//             {user?.role}
//           </span>
//         </div>

//         {/* User name chip */}
//         <div style={{
//           display: 'none',
//           alignItems: 'center', gap: '0.375rem',
//           padding: '0.25rem 0.625rem',
//           borderRadius: 999,
//           background: 'var(--slate-100)',
//           fontSize: '0.8125rem', color: 'var(--slate-700)', fontWeight: 500,
//         }}
//         className="sm-flex">
//           {user?.name?.split(' ')[0]}
//         </div>

//         {/* Divider */}
//         <div style={{ width: 1, height: 20, background: 'var(--slate-200)', margin: '0 0.25rem' }} />

//         {/* Logout */}
//         <button
//           onClick={handleLogout}
//           disabled={loggingOut}
//           style={{
//             display: 'flex', alignItems: 'center', gap: '0.375rem',
//             padding: '0.375rem 0.75rem',
//             borderRadius: 8,
//             border: '1px solid transparent',
//             background: 'transparent',
//             color: 'var(--slate-500)',
//             fontSize: '0.8125rem',
//             fontWeight: 500,
//             cursor: 'pointer',
//             transition: 'all 150ms ease',
//             fontFamily: 'var(--font-body)',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = 'var(--rose-50)';
//             e.currentTarget.style.color = 'var(--rose-500)';
//             e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = 'transparent';
//             e.currentTarget.style.color = 'var(--slate-500)';
//             e.currentTarget.style.borderColor = 'transparent';
//           }}
//         >
//           <LogOut size={15} />
//           {loggingOut ? 'Signing out…' : 'Sign out'}
//         </button>
//       </div>
//     </header>
//   );
// }




// import { useNavigate, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import useAuthStore from '../store/authStore';
// import { LogOut } from 'lucide-react';

// const pageTitles = {
//   '/dashboard':      { title: 'Dashboard',         subtitle: 'Welcome back' },
//   '/tasks':          { title: 'Tasks',              subtitle: 'Track your progress' },
//   '/attendance':     { title: 'Attendance',         subtitle: 'Daily check-ins' },
//   '/reports':        { title: 'Reports',            subtitle: 'Uploaded documents' },
//   '/videos':         { title: 'Videos',             subtitle: 'Learning materials' },
//   '/users':          { title: 'Users',              subtitle: 'Team management' },
//   '/internships':    { title: 'Internships',        subtitle: 'Active programs' },
//   '/certificates':   { title: 'Certificates',       subtitle: 'Achievements' },
//   '/ai-summary':     { title: 'AI Insights',        subtitle: 'Powered by MR TECHLAB' },
//   '/work-schedule':  { title: 'Work Schedule',      subtitle: 'Attendance configuration' },
//   '/onboarding':     { title: 'Onboarding',         subtitle: 'Add new students' },
//   '/tests':          { title: 'Tests & Quizzes',    subtitle: 'Assessments' },
//   '/meetings':       { title: 'Meetings',           subtitle: 'Scheduled events' },
// };

// export default function Header() {
//   const { user, logout } = useAuthStore();
//   const navigate  = useNavigate();
//   const { pathname } = useLocation();
//   const [loggingOut, setLoggingOut] = useState(false);

//   const page = pageTitles[pathname] || { title: 'Internix', subtitle: '' };

//   const handleLogout = async () => {
//     setLoggingOut(true);
//     setTimeout(() => { logout(); navigate('/login'); }, 300);
//   };

//   const greeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return 'Good morning';
//     if (h < 17) return 'Good afternoon';
//     return 'Good evening';
//   };

//   const roleColors = {
//     admin:  { bg: 'var(--violet-100)', dot: 'var(--violet-500)', text: 'var(--violet-500)', border: 'rgba(139,92,246,0.2)' },
//     mentor: { bg: 'var(--amber-100)',  dot: 'var(--amber-500)',  text: '#92400e',           border: 'rgba(245,158,11,0.2)' },
//     student:{ bg: 'var(--blue-100)',   dot: 'var(--blue-600)',   text: '#1d4ed8',           border: 'rgba(59,130,246,0.2)' },
//   };
//   const rc = roleColors[user?.role] || roleColors.student;

//   return (
//     <header style={{
//       height: 64,
//       background: '#ffffff',
//       borderBottom: '1px solid var(--slate-200)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: '0 1.5rem',
//       position: 'sticky',
//       top: 0,
//       zIndex: 20,
//       boxShadow: 'var(--shadow-xs)',
//     }}>
//       {/* Left: Page title */}
//       <div className="animate-fade-in">
//         <div style={{
//           fontFamily: 'var(--font-display)',
//           fontWeight: 700,
//           fontSize: '1.125rem',
//           color: 'var(--slate-900)',
//           letterSpacing: '-0.025em',
//           lineHeight: 1.2,
//         }}>
//           {page.title}
//         </div>
//         <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>
//           {page.subtitle
//             ? page.subtitle
//             : `${greeting()}, ${user?.name?.split(' ')[0]}`}
//         </div>
//       </div>

//       {/* Right: Actions */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//         {/* Role badge */}
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '0.375rem',
//           padding: '0.25rem 0.75rem',
//           borderRadius: 999,
//           background: rc.bg,
//           border: `1px solid ${rc.border}`,
//         }}>
//           <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.dot }} />
//           <span style={{
//             fontSize: '0.6875rem',
//             fontWeight: 700,
//             letterSpacing: '0.05em',
//             textTransform: 'capitalize',
//             color: rc.text,
//           }}>
//             {user?.role}
//           </span>
//         </div>

//         {/* Divider */}
//         <div style={{ width: 1, height: 20, background: 'var(--slate-200)', margin: '0 0.25rem' }} />

//         {/* Logout */}
//         <button
//           onClick={handleLogout}
//           disabled={loggingOut}
//           style={{
//             display: 'flex', alignItems: 'center', gap: '0.375rem',
//             padding: '0.375rem 0.75rem',
//             borderRadius: 8,
//             border: '1px solid transparent',
//             background: 'transparent',
//             color: 'var(--slate-500)',
//             fontSize: '0.8125rem',
//             fontWeight: 500,
//             cursor: 'pointer',
//             transition: 'all 150ms ease',
//             fontFamily: 'var(--font-body)',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = 'var(--rose-50)';
//             e.currentTarget.style.color = 'var(--rose-500)';
//             e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = 'transparent';
//             e.currentTarget.style.color = 'var(--slate-500)';
//             e.currentTarget.style.borderColor = 'transparent';
//           }}
//         >
//           <LogOut size={15} />
//           {loggingOut ? 'Signing out…' : 'Sign out'}
//         </button>
//       </div>
//     </header>
//   );
// }


import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { LogOut, Menu } from 'lucide-react';

const pageTitles = {
  '/dashboard':      { title: 'Dashboard',         subtitle: 'Welcome back' },
  '/tasks':          { title: 'Tasks',              subtitle: 'Track your progress' },
  '/attendance':     { title: 'Attendance',         subtitle: 'Daily check-ins' },
  '/reports':        { title: 'Reports',            subtitle: 'Uploaded documents' },
  '/videos':         { title: 'Videos',             subtitle: 'Learning materials' },
  '/users':          { title: 'Users',              subtitle: 'Team management' },
  '/internships':    { title: 'Internships',        subtitle: 'Active programs' },
  '/certificates':   { title: 'Certificates',       subtitle: 'Achievements' },
  '/ai-summary':     { title: 'AI Insights',        subtitle: 'Powered by Claude' },
  '/work-schedule':  { title: 'Work Schedule',      subtitle: 'Attendance configuration' },
  '/onboarding':     { title: 'Onboarding',         subtitle: 'Add new students' },
  '/tests':          { title: 'Tests & Quizzes',    subtitle: 'Assessments' },
  '/groups':         { title: 'Student Groups',     subtitle: 'Internship groups' },
  '/notices':        { title: 'Notice Board',       subtitle: 'Announcements' },
  '/meetings':       { title: 'Meetings',           subtitle: 'Scheduled team meetings' },
};

export default function Header({ showMobileMenu = false, onOpenMenu }) {
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
      minHeight: 56,
      height: 'auto',
      /* pure black header */
      background: '#000000',
      borderBottom: '2px solid #333333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      padding: `max(0.5rem, env(safe-area-inset-top, 0px)) 1rem 0.625rem`,
      paddingLeft: showMobileMenu ? 'max(0.625rem, env(safe-area-inset-left))' : 'max(1.5rem, env(safe-area-inset-left))',
      paddingRight: 'max(1rem, env(safe-area-inset-right))',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      flexShrink: 0,
    }}>
      {/* Left: menu + Page title */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, flex: 1 }}>
        {showMobileMenu && (
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => onOpenMenu?.()}
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f5f5f5',
              cursor: 'pointer',
            }}
          >
            <Menu size={22} />
          </button>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.0625rem',
            color: '#f5f5f5',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {page.title}
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {page.subtitle
              ? page.subtitle
              : `${greeting()}, ${user?.name?.split(' ')[0]}`}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
        {/* Role badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          borderRadius: 999,
          background: '#ffffff',
          border: '1px solid #000000',
          maxWidth: 'min(112px, 28vw)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000000', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'capitalize',
            color: '#000000',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.role}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: '#333333', flexShrink: 0 }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem min(0.75rem, 2vw)',
            minHeight: 44,
            borderRadius: 8,
            border: '1px solid transparent',
            background: 'transparent',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f43f5e';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut size={15} aria-hidden />
          <span className="header-signout-text">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </header>
  );
}