// import { NavLink, useLocation } from 'react-router-dom';
// import { useEffect, useRef, useState } from 'react';
// import useAuthStore from '../store/authStore';
// import {
//   LayoutDashboard, ListTodo, CalendarCheck, FileText,
//   Users, Briefcase, Award, Play, Sparkles, ChevronRight, Settings, UserPlus,
// } from 'lucide-react';

// const navGroups = {
//   admin: [
//     { label: 'Overview', items: [
//       { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
//     ]},
//     { label: 'Management', items: [
//       { to: '/users',        icon: Users,          label: 'Users' },
//       { to: '/internships',  icon: Briefcase,      label: 'Internships' },
//       { to: '/onboarding',   icon: UserPlus,       label: 'Onboarding' },
//       { to: '/certificates', icon: Award,          label: 'Certificates' },
//     ]},
//     { label: 'Activity', items: [
//       { to: '/tasks',      icon: ListTodo,      label: 'Tasks' },
//       { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
//       { to: '/reports',    icon: FileText,      label: 'Reports' },
//       { to: '/videos',     icon: Play,          label: 'Videos' },
//     ]},
//     { label: 'Settings', items: [
//       { to: '/work-schedule', icon: Settings, label: 'Work Schedule' },
//     ]},
//     { label: 'AI Features', items: [
//       { to: '/ai-summary', icon: Sparkles, label: 'AI Insights', badge: 'New' },
//     ]},
//   ],
//   mentor: [
//     { label: 'Overview', items: [
//       { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//     ]},
//     { label: 'My Students', items: [
//       { to: '/users',       icon: Users,     label: 'Students' },
//       { to: '/internships', icon: Briefcase, label: 'Internships' },
//       { to: '/onboarding',  icon: UserPlus,  label: 'Onboarding' },
//     ]},
//     { label: 'Activity', items: [
//       { to: '/tasks',      icon: ListTodo,      label: 'Tasks' },
//       { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
//       { to: '/reports',    icon: FileText,      label: 'Reports' },
//       { to: '/videos',     icon: Play,          label: 'Videos' },
//     ]},
//     { label: 'AI Features', items: [
//       { to: '/ai-summary', icon: Sparkles, label: 'AI Insights', badge: 'New' },
//     ]},
//   ],
//   student: [
//     { label: 'Overview', items: [
//       { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//     ]},
//     { label: 'My Work', items: [
//       { to: '/tasks',      icon: ListTodo,      label: 'My Tasks' },
//       { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
//       { to: '/reports',    icon: FileText,      label: 'Reports' },
//       { to: '/videos',     icon: Play,          label: 'Learning' },
//     ]},
//     { label: 'Achievements', items: [
//       { to: '/certificates', icon: Award, label: 'Certificates' },
//     ]},
//   ],
// };

// export default function Sidebar() {
//   const user    = useAuthStore((s) => s.user);
//   const { pathname } = useLocation();
//   const groups  = navGroups[user?.role] || navGroups.student;
//   const [hovered, setHovered] = useState(null);

//   return (
//     <aside style={{
//       width: 256,
//       background: 'var(--navy-900)',
//       display: 'flex',
//       flexDirection: 'column',
//       height: '100vh',
//       position: 'relative',
//       flexShrink: 0,
//       borderRight: '1px solid rgba(255,255,255,0.06)',
//     }}>
//       <div style={{
//         position: 'absolute', top: 0, left: 0, right: 0, height: 180,
//         background: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.18) 0%, transparent 70%)',
//         pointerEvents: 'none',
//       }} />

//       {/* Logo */}
//       <div style={{
//         padding: '1.5rem 1.25rem 1.25rem',
//         borderBottom: '1px solid rgba(255,255,255,0.06)',
//         position: 'relative',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
//           <div style={{
//             width: 34, height: 34,
//             background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
//             borderRadius: 10,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             boxShadow: '0 4px 12px rgba(37,99,235,0.45)',
//             flexShrink: 0,
//           }}>
//             <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>I</span>
//           </div>
//           <div>
//             <div style={{
//               fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem',
//               color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1,
//             }}>Internix</div>
//             <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
//               Management System
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//         {groups.map((group) => (
//           <div key={group.label}>
//             <div style={{
//               fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
//               textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
//               padding: '0 0.5rem', marginBottom: '0.375rem',
//             }}>
//               {group.label}
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//               {group.items.map(({ to, icon: Icon, label, badge }) => {
//                 const active = pathname === to || pathname.startsWith(to + '/');
//                 return (
//                   <NavLink
//                     key={to}
//                     to={to}
//                     onMouseEnter={() => setHovered(to)}
//                     onMouseLeave={() => setHovered(null)}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: '0.625rem',
//                       padding: '0.5625rem 0.75rem',
//                       borderRadius: 9,
//                       textDecoration: 'none',
//                       position: 'relative',
//                       transition: 'all 180ms ease',
//                       background: active
//                         ? 'rgba(37,99,235,0.18)'
//                         : hovered === to
//                         ? 'rgba(255,255,255,0.05)'
//                         : 'transparent',
//                     }}
//                   >
//                     {active && (
//                       <span style={{
//                         position: 'absolute', left: 0, top: '20%', bottom: '20%',
//                         width: 3, borderRadius: '0 3px 3px 0',
//                         background: '#3b82f6',
//                         boxShadow: '0 0 10px #3b82f6',
//                       }} />
//                     )}

//                     <div style={{
//                       width: 30, height: 30, borderRadius: 8,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       flexShrink: 0,
//                       background: active
//                         ? 'rgba(59,130,246,0.25)'
//                         : hovered === to
//                         ? 'rgba(255,255,255,0.07)'
//                         : 'transparent',
//                       transition: 'background 180ms ease',
//                     }}>
//                       <Icon
//                         size={16}
//                         style={{
//                           color: active ? '#60a5fa' : 'rgba(255,255,255,0.45)',
//                           transition: 'color 180ms ease',
//                           flexShrink: 0,
//                         }}
//                       />
//                     </div>

//                     <span style={{
//                       fontSize: '0.8125rem',
//                       fontWeight: active ? 600 : 400,
//                       color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
//                       transition: 'all 180ms ease',
//                       flex: 1,
//                     }}>
//                       {label}
//                     </span>

//                     {badge && (
//                       <span style={{
//                         fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.06em',
//                         padding: '1px 6px', borderRadius: 999,
//                         background: 'rgba(245,158,11,0.2)',
//                         color: '#fbbf24',
//                         border: '1px solid rgba(245,158,11,0.3)',
//                       }}>
//                         {badge}
//                       </span>
//                     )}

//                     {active && (
//                       <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
//                     )}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </nav>

//       {/* User badge */}
//       <div style={{
//         padding: '0.75rem',
//         borderTop: '1px solid rgba(255,255,255,0.06)',
//       }}>
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '0.625rem',
//           padding: '0.625rem 0.75rem',
//           borderRadius: 10,
//           background: 'rgba(255,255,255,0.04)',
//           border: '1px solid rgba(255,255,255,0.06)',
//         }}>
//           <div style={{
//             width: 30, height: 30, borderRadius: '50%',
//             background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             flexShrink: 0,
//             fontSize: '0.75rem', fontWeight: 700, color: '#fff',
//             fontFamily: 'var(--font-display)',
//           }}>
//             {user?.name?.charAt(0).toUpperCase()}
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{
//               fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)',
//               whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
//             }}>
//               {user?.name}
//             </div>
//             <div style={{
//               fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)',
//               textTransform: 'capitalize', letterSpacing: '0.04em', fontWeight: 600,
//             }}>
//               {user?.role}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }



import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import NoticeBoard from './NoticeBoard';
import {
  LayoutDashboard, ListTodo, CalendarCheck, FileText,
  Users, Briefcase, Award, Play, Sparkles, ChevronRight,
  Settings, UserPlus, ClipboardList,
  LucideSquareSlash,
} from 'lucide-react';

const navGroups = {
  admin: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { label: 'Management', items: [
      { to: '/users',        icon: Users,          label: 'Users' },
      { to: '/internships',  icon: Briefcase,      label: 'Internships' },
      { to: '/onboarding',   icon: UserPlus,       label: 'Onboarding' },
      { to: '/certificates', icon: Award,          label: 'Certificates' },
      { to: '/groups',       icon: Users,         label: 'Groups' },
    ]},
    { label: 'Activity', items: [
      { to: '/tasks',      icon: ListTodo,       label: 'Tasks' },
      { to: '/attendance', icon: CalendarCheck,  label: 'Attendance' },
      { to: '/reports',    icon: FileText,       label: 'Reports' },
      { to: '/notices',    icon: LucideSquareSlash,           label: 'Notices' },
      { to: '/videos',     icon: Play,           label: 'Videos' },
      { to: '/tests',      icon: ClipboardList,  label: 'Tests', badge: 'New' },
    ]},
    { label: 'Settings', items: [
      { to: '/work-schedule', icon: Settings, label: 'Work Schedule' },
    ]},
    { label: 'AI Features', items: [
      { to: '/ai-summary', icon: Sparkles, label: 'AI Insights', badge: 'AI' },
    ]},
  ],
  mentor: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { label: 'My Students', items: [
      { to: '/users',       icon: Users,     label: 'Students' },
      { to: '/internships', icon: Briefcase, label: 'Internships' },
      { to: '/onboarding',  icon: UserPlus,  label: 'Onboarding' },
      { to: '/groups', icon: Users, label: 'Groups' },
    ]},
    { label: 'Activity', items: [
      { to: '/tasks',      icon: ListTodo,      label: 'Tasks' },
      { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
      { to: '/reports',    icon: FileText,      label: 'Reports' },
      { to: '/videos',     icon: Play,          label: 'Videos' },
      { to: '/tests',      icon: ClipboardList, label: 'Tests', badge: 'New' },
    ]},
    { label: 'AI Features', items: [
      { to: '/ai-summary', icon: Sparkles, label: 'AI Insights', badge: 'AI' },
    ]},
  ],
  student: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { label: 'My Work', items: [
      { to: '/tasks',      icon: ListTodo,      label: 'My Tasks' },
      { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
      { to: '/reports',    icon: FileText,      label: 'Reports' },
      { to: '/videos',     icon: Play,          label: 'Learning' },
      { to: '/tests',      icon: ClipboardList, label: 'Tests & Quizzes' },
    ]},
    { label: 'Achievements', items: [
      { to: '/certificates', icon: Award, label: 'Certificates' },
    ]},
  ],
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const groups = navGroups[user?.role] || navGroups.student;
  const [hovered, setHovered] = useState(null);

  return (
    <aside style={{
      width: 256,
      background: 'var(--navy-900)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'relative',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 180,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        padding: '1.5rem 1.25rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.45)',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff' }}>MR</span>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem',
              color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>MR Techlab</div>
            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              Management System
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {groups.map((group) => (
          <div key={group.label}>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
              padding: '0 0.5rem', marginBottom: '0.375rem',
            }}>
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(({ to, icon: Icon, label, badge }) => {
                const active = pathname === to || pathname.startsWith(to + '/');
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onMouseEnter={() => setHovered(to)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.5625rem 0.75rem',
                      borderRadius: 9,
                      textDecoration: 'none',
                      position: 'relative',
                      transition: 'all 180ms ease',
                      background: active
                        ? 'rgba(37,99,235,0.18)'
                        : hovered === to
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                    }}
                  >
                    {active && (
                      <span style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: '#3b82f6',
                        boxShadow: '0 0 10px #3b82f6',
                      }} />
                    )}

                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      background: active
                        ? 'rgba(59,130,246,0.25)'
                        : hovered === to
                        ? 'rgba(255,255,255,0.07)'
                        : 'transparent',
                      transition: 'background 180ms ease',
                    }}>
                      <Icon
                        size={16}
                        style={{
                          color: active ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                          transition: 'color 180ms ease',
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                      transition: 'all 180ms ease',
                      flex: 1,
                    }}>
                      {label}
                    </span>

                    {badge && (
                      <span style={{
                        fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.06em',
                        padding: '1px 6px', borderRadius: 999,
                        background: badge === 'AI' ? 'rgba(139,92,246,0.25)' : 'rgba(245,158,11,0.2)',
                        color: badge === 'AI' ? '#c4b5fd' : '#fbbf24',
                        border: `1px solid ${badge === 'AI' ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {badge}
                      </span>
                    )}

                    {active && (
                      <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Notice Board — always visible */}
      <NoticeBoard />

      {/* User badge */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.625rem 0.75rem',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.88)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)',
              textTransform: 'capitalize', letterSpacing: '0.04em', fontWeight: 600,
            }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}