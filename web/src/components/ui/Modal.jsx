import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, width = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.18s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.06)',
          animation: 'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--slate-100)',
          flexShrink: 0,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '1rem', color: 'var(--slate-900)',
            letterSpacing: '-0.02em', margin: 0,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30,
              borderRadius: 8, border: 'none',
              background: 'var(--slate-100)',
              color: 'var(--slate-500)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--slate-200)'; e.currentTarget.style.color = 'var(--slate-900)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--slate-100)'; e.currentTarget.style.color = 'var(--slate-500)'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
