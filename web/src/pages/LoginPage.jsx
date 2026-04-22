import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: '📋', label: 'Task tracking'   },
  { icon: '📊', label: 'Live analytics'  },
  { icon: '🎓', label: 'Certificates'    },
  { icon: '🤖', label: 'AI insights'     },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [focused,  setFocused]  = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--navy-950)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* ── Left panel ── */}
      <div style={{
        flex: '0 0 480px',
        background: 'linear-gradient(160deg, var(--navy-800) 0%, var(--navy-900) 60%, var(--navy-950) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ animation: 'slideInLeft 0.5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>MR</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.03em' }}>
              MR Techlab LLP
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.25rem',
            color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            Manage internships<br />
            <span style={{ color: '#60a5fa' }}>smarter.</span>
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 320 }}>
            A unified platform for students, mentors, and administrators to manage the full internship lifecycle.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ animation: 'slideInLeft 0.5s ease 0.15s both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '2rem' }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)',
                fontWeight: 400,
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            System operational · All services running
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'var(--slate-50)',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          animation: 'fadeUp 0.5s ease both',
        }}>
          {/* Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.25rem',
          }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.5rem', color: 'var(--slate-900)',
                letterSpacing: '-0.03em', marginBottom: '0.25rem',
              }}>
                Sign in
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  style={{
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}>
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                    style={{
                      paddingRight: '2.5rem',
                      boxShadow: focused === 'password' ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--slate-400)', padding: '0.25rem',
                      transition: 'color 150ms', display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-400)'}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>
                  Forgot your password? Contact the admin. They can set a new student password for you.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  justifyContent: 'center', padding: '0.6875rem',
                  fontSize: '0.9375rem', fontWeight: 600,
                  marginTop: '0.25rem',
                  background: loading ? 'var(--slate-300)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            {/* <div style={{
              marginTop: '1.25rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--blue-50)',
              border: '1px solid var(--blue-100)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <Sparkles size={12} style={{ color: 'var(--blue-500)' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--blue-600)' }}>
                  
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--blue-700)', fontFamily: 'monospace' }}>
                
              </div>
            </div> */}

            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '1.25rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
