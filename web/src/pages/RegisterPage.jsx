import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Phone, ChevronDown } from 'lucide-react';

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Access tasks, reports & certificates', emoji: '🎓' },
  { value: 'mentor',  label: 'Mentor',  desc: 'Manage tasks and review student work', emoji: '👨‍🏫' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const fieldStyle = (key) => ({
    boxShadow: focused === key ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--slate-50)',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        animation: 'fadeUp 0.4s ease both',
      }}>
        {/* Logo row */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>I</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
            Create your account
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Join Internix and start your internship journey
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2rem',
        }}>
          {/* Role selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
              I am a…
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: '0.25rem',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${active ? 'var(--blue-500)' : 'var(--slate-200)'}`,
                      background: active ? 'var(--blue-50)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 180ms ease',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--slate-300)'; e.currentTarget.style.background = 'var(--slate-50)'; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.background = '#ffffff'; } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ fontSize: '1rem' }}>{r.emoji}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: active ? 'var(--blue-700)' : 'var(--slate-800)' }}>
                        {r.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: active ? 'var(--blue-500)' : 'var(--slate-400)', lineHeight: 1.4 }}>
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Full name
              </label>
              <input
                value={form.name} onChange={set('name')}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                className="input-field" placeholder="Jane Doe" required
                style={fieldStyle('name')}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Email address
              </label>
              <input
                type="email" value={form.email} onChange={set('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                className="input-field" placeholder="you@example.com" required
                style={fieldStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  className="input-field" placeholder="Min. 6 characters" required minLength={6}
                  style={{ paddingRight: '2.5rem', ...fieldStyle('password') }}
                />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--slate-400)', padding: '0.25rem', transition: 'color 150ms',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-400)'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: '0.375rem' }}>
                  <div style={{ height: 3, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: form.password.length >= 10 ? '100%' : form.password.length >= 6 ? '55%' : '25%',
                      background: form.password.length >= 10 ? 'var(--emerald-500)' : form.password.length >= 6 ? 'var(--amber-400)' : 'var(--rose-400)',
                      transition: 'all 250ms ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: 3 }}>
                    {form.password.length >= 10 ? '✓ Strong password' : form.password.length >= 6 ? 'Medium strength' : 'Weak'}
                  </div>
                </div>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Phone <span style={{ fontWeight: 400, color: 'var(--slate-400)' }}>(optional)</span>
              </label>
              <input
                type="tel" value={form.phone} onChange={set('phone')}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                className="input-field" placeholder="+91 98765 43210"
                style={fieldStyle('phone')}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{
                justifyContent: 'center', padding: '0.6875rem',
                fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem',
                background: loading ? 'var(--slate-300)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
