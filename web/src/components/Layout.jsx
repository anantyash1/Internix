import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const { pathname } = useLocation();
  const [contentKey, setContentKey] = useState(pathname);
  const mainRef = useRef(null);

  useEffect(() => {
    setContentKey(pathname);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--slate-50)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Header />
        <main
          ref={mainRef}
          key={contentKey}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            animation: 'fadeUp 0.3s ease both',
          }}
        >
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
