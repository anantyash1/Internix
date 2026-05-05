import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    }
  };

  return (
    <div
      className="login-page-root"
      style={{
        background: '#060d1f',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
      }}
    >
      {/* ── Animated background mesh ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Horizontal glow line */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.2), transparent)',
          filter: 'blur(1px)',
        }} />
      </div>

      {/* ── Left: Branding panel ── */}
      <div
        className="login-page-brand"
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 'clamp(1.25rem, 4vw, 3rem) clamp(1.25rem, 4vw, 3.5rem)',
          position: 'relative', zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateX(-20px)',
          transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
          background: '#000000',
        }}
      >
        {/* Logo */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
           <div style={{ width: 84, height: 84, position: 'relative' }}>
  {/* Animated gradient border */}
  <div style={{
    position: 'absolute',
    inset: -2,
    background: 'conic-gradient(from 0deg,#7c3aed,#06b6d4,#10b981,#f43f5e,#7c3aed)',
    borderRadius: 18,
    animation: 'spinBorder 4s linear infinite',
  }} />

  {/* Inner container */}
  <div style={{
    position: 'absolute',
    inset: 2,
    background: '#0a0f1e',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <img
      src="/logo.png"
      alt="Logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  </div>
</div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                MR Techlab LLP
              </div>
              <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                Internship Platform
              </div>
            </div>
          </div>
        </div>

        {/* Main hero text */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3125rem 0.875rem',
              borderRadius: 999,
              border: '1px solid rgba(37,99,235,0.35)',
              background: 'rgba(37,99,235,0.12)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
                All systems operational
              </span>
            </div>

            <h1
              className="login-hero-heading"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.04em',
                lineHeight: 1.08,
                marginBottom: '1.25rem',
              }}
            >
              Manage internships<br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                intelligently.
              </span>
            </h1>

            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.75, maxWidth: 380,
            }}>
              One unified platform for tasks, attendance, reports, and AI-powered insights — built for modern internship programs.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '2rem' }}>
            {[
              { icon: '⚡', label: 'Real-time task & attendance tracking' },
              { icon: '🤖', label: 'MR AI-powered insights & assistance' },
              { icon: '🎓', label: 'Auto-generated completion certificates' },
              { icon: '📊', label: 'Live performance analytics dashboard' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.875rem',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateX(-12px)',
                transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${0.1 + i * 0.08}s`,
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
          © 2025 MR Techlab LLP · Secure & Encrypted
        </div>
      </div>

      {/* ── Right: Login form panel ── */}
      <div
        className="login-page-form"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(1rem, 4vw, 2rem)',
          position: 'relative', zIndex: 1,
          background: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        {/* Glass card */}
        <div style={{
          width: '100%', maxWidth: 420,
          background: '#ffffff',
          borderRadius: 24,
          border: '3px solid #000000',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          padding: 'clamp(1.25rem, 5vw, 2.5rem)',
          boxSizing: 'border-box',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px) scale(0.98)',
          transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.1s',
        }}>
          {/* Card header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.5rem',
              color: '#000000', letterSpacing: '-0.03em', marginBottom: '0.375rem',
            }}>
              Welcome back 👋
            </div>
            <div style={{ fontSize: '0.875rem', color: '#333333' }}>
              Sign in to your account to continue
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: '#000000', marginBottom: '0.5rem',
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'email' ? '#000000' : '#999999',
                  transition: 'color 200ms',
                  pointerEvents: 'none',
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
                    borderRadius: 12,
                    border: `2px solid ${focused === 'email' ? '#000000' : '#cccccc'}`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 200ms ease',
                    boxSizing: 'border-box',
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: '#000000', marginBottom: '0.5rem',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'pw' ? '#000000' : '#999999',
                  transition: 'color 200ms',
                  pointerEvents: 'none',
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused('')}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                    borderRadius: 12,
                    border: `2px solid ${focused === 'pw' ? '#000000' : '#cccccc'}`,
                    background: '#ffffff',
                    color: '#000000',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 200ms ease',
                    boxSizing: 'border-box',
                    boxShadow: focused === 'pw' ? '0 0 0 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#666666', padding: 2,
                    display: 'flex', alignItems: 'center',
                    transition: 'color 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#000000'}
                  onMouseLeave={e => e.currentTarget.style.color = '#666666'}
                >
                  {show ? (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666666', lineHeight: 1.5 }}>
                Forgot password? Contact your admin to reset it.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.25rem',
                width: '100%',
                padding: '0.8125rem',
                borderRadius: 12,
                border: '2px solid #000000',
                background: loading ? '#e0e0e0' : '#000000',
                color: '#fff',
                fontSize: '0.9375rem', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                transition: 'all 200ms ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 12px rgba(0,0,0,0.3)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#cccccc' }} />
            <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#cccccc' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666666' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#000000', fontWeight: 600, textDecoration: 'none',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => e.target.style.color = '#333333'}
              onMouseLeave={e => e.target.style.color = '#000000'}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.03); }
          66% { transform: translate(15px, -25px) scale(0.98); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -30px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(37,99,235,0.1) inset !important;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}