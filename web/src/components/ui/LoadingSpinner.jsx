export default function LoadingSpinner({ size = 32, label = 'Loading…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '4rem 2rem', gap: '1rem',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Dual-ring spinner */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: `2.5px solid var(--blue-100)`,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          border: '2.5px solid transparent',
          borderTopColor: 'var(--blue-600)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
      {label && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', fontWeight: 400 }}>
          {label}
        </span>
      )}
    </div>
  );
}
