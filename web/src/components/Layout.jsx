// import { Outlet, useLocation } from 'react-router-dom';
// import { useEffect, useRef, useState } from 'react';
// import Sidebar from './Sidebar';
// import Header from './Header';
// import AIAssistant from './AIAssistant';

// export default function Layout() {
//   const { pathname } = useLocation();
//   const [contentKey, setContentKey] = useState(pathname);
//   const mainRef = useRef(null);

//   useEffect(() => {
//     setContentKey(pathname);
//     if (mainRef.current) mainRef.current.scrollTop = 0;
//   }, [pathname]);

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--slate-50)' }}>
//       <Sidebar />
//       <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
//         <Header />
//         <main
//           ref={mainRef}
//           key={contentKey}
//           style={{
//             flex: 1,
//             overflowY: 'auto',
//             padding: '1.75rem 2rem',
//             animation: 'fadeUp 0.3s ease both',
//           }}
//         >
//           <Outlet />
//         </main>
//       </div>
//       <AIAssistant />
//     </div>
//   );
// }


import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';
import MeetingNotifier from './MeetingNotifier';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Layout() {
  const { pathname } = useLocation();
  const [contentKey, setContentKey] = useState(pathname);
  const [navOpen, setNavOpen] = useState(false);
  const mainRef = useRef(null);
  const isMobileNav = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    setContentKey(pathname);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNav) setNavOpen(false);
  }, [isMobileNav]);

  useEffect(() => {
    if (isMobileNav) setNavOpen(false);
  }, [pathname, isMobileNav]);

  useEffect(() => {
    if (!navOpen || !isMobileNav) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen, isMobileNav]);

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        background: 'var(--beige-50)',
      }}
    >
      <Sidebar
        mobileDrawer={isMobileNav}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />
      {isMobileNav && navOpen && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Header showMobileMenu={isMobileNav} onOpenMenu={() => setNavOpen(true)} />
        <main
          ref={mainRef}
          key={contentKey}
          className="app-main"
          style={{ animation: 'fadeUp 0.3s ease both' }}
        >
          <Outlet />
        </main>
      </div>
      <AIAssistant />
      <MeetingNotifier />
    </div>
  );
}