import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  UserPlus, Check, Copy, Eye, EyeOff, RefreshCw,
  GraduationCap, Mail, Lock, Phone, Briefcase, Users,
  CheckCircle, AlertCircle,
} from 'lucide-react';

// Onboarding page component for student creation and management
// ── Generate random password ───────────────────────────────────────────────────
function generatePassword(len = 10) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ── Student row in the "Recently onboarded" table ─────────────────────────────
function StudentRow({ student, index }) {
  return (
    <tr style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = 'var(--slate-50)'); }}
      onMouseLeave={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = ''); }}
    >
      <td style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'var(--blue-100)', border: '1.5px solid var(--blue-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--blue-600)',
          }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{student.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{student.email}</div>
          </div>
        </div>
      </td>
      <td>
        {student.mentor
          ? <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)' }}>{student.mentor.name}</span>
          : <span style={{ fontSize: '0.8125rem', color: 'var(--slate-300)' }}>—</span>}
      </td>
      <td>
        {student.internship
          ? <span className="badge badge-blue">{student.internship.title}</span>
          : <span style={{ fontSize: '0.8125rem', color: 'var(--slate-300)' }}>—</span>}
      </td>
      <td>
        <span className="badge badge-green">
          <CheckCircle size={10} /> Active
        </span>
      </td>
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState('');
  const [successCard, setSuccessCard] = useState(null); // last onboarded student info

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: generatePassword(),
    phone: '',
    mentorId: '',
    internshipId: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stuRes, mentorRes, internRes] = await Promise.all([
        api.get('/users', { params: { role: 'student', limit: 20 } }),
        api.get('/onboarding/mentors'),
        api.get('/onboarding/internships'),
      ]);
      setStudents(stuRes.data.users || []);
      setMentors(mentorRes.data.mentors || []);
      setInternships(internRes.data.internships || []);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const refreshPassword = () => setForm((f) => ({ ...f, password: generatePassword() }));

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Name, email and password are required');
    }
    setSaving(true);
    try {
      const { data } = await api.post('/onboarding/student', form);
      setSuccessCard({
        name: form.name,
        email: form.email,
        password: form.password,
        mentor: mentors.find((m) => m._id === form.mentorId)?.name,
        internship: internships.find((i) => i._id === form.internshipId)?.title,
      });
      toast.success(data.message || 'Student onboarded!');
      setForm({ name: '', email: '', password: generatePassword(), phone: '', mentorId: '', internshipId: '' });
      setShowPw(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to onboard student');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner label="Loading onboarding data…" />;

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 900 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,99,235,0.15)' }}>
          <UserPlus size={21} style={{ color: 'var(--blue-600)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
            Student Onboarding
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
            Create student accounts and assign mentor & internship
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* ── Form ── */}
        <div className="card animate-fade-up stagger-1" style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={17} style={{ color: 'var(--blue-500)' }} />
            New student details
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Full name *
              </label>
              <input value={form.name} onChange={set('name')} className="input-field" placeholder="e.g. Priya Sharma" required />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Email address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="student@example.com" style={{ paddingLeft: '2.25rem' }} required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Phone <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="+91 98765 43210" style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Temporary password *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem', fontFamily: showPw ? 'var(--font-body)' : 'monospace', letterSpacing: showPw ? 'normal' : '0.1em' }}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 2,
                  }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={refreshPassword} 
                  title="Generate new password" 
                  style={{
                    width: 38, height: 38, border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)',
                    background: 'var(--slate-50)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--slate-500)', transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.background = 'var(--blue-50)'; 
                    e.currentTarget.style.color = 'var(--blue-600)'; 
                    e.currentTarget.style.borderColor = 'var(--blue-200)'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.background = 'var(--slate-50)'; 
                    e.currentTarget.style.color = 'var(--slate-500)'; 
                    e.currentTarget.style.borderColor = 'var(--slate-200)'; 
                  }}
                >
                  <RefreshCw size={13} />
                </button>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard(form.password, 'pw')} 
                  title="Copy password" 
                  style={{
                    width: 38, height: 38, border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)',
                    background: copied === 'pw' ? 'var(--emerald-50)' : 'var(--slate-50)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: copied === 'pw' ? 'var(--emerald-600)' : 'var(--slate-500)', transition: 'all 150ms',
                  }}
                >
                  {copied === 'pw' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.375rem' }}>
                Share these credentials with the student. They can change their password after login.
              </div>
            </div>

            {/* Mentor (admin only) */}
            {isAdmin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                  <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Assign mentor <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
                </label>
                <select value={form.mentorId} onChange={set('mentorId')} className="input-field">
                  <option value="">No mentor assigned</option>
                  {mentors.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
              </div>
            )}

            {/* Internship */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                <Briefcase size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Enroll in internship <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select value={form.internshipId} onChange={set('internshipId')} className="input-field">
                <option value="">No internship</option>
                {internships.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.title} ({i.students?.length || 0}/{i.maxStudents} enrolled)
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
              {saving
                ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Onboarding…</>
                : <><UserPlus size={15} /> Onboard Student</>
              }
            </button>
          </form>
        </div>

        {/* ── Right panel: success card + tips ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Success card */}
          {successCard && (
            <div className="animate-scale-in" style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16,185,129,0.3)',
              background: 'linear-gradient(to bottom right, var(--emerald-50), #fff)',
              padding: '1.25rem 1.375rem',
              boxShadow: '0 4px 16px rgba(16,185,129,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--emerald-500)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--emerald-700)', fontSize: '0.9375rem' }}>
                  Student Onboarded!
                </span>
              </div>

              {[
                { label: 'Name', value: successCard.name, key: 'sname' },
                { label: 'Email', value: successCard.email, key: 'semail' },
                { label: 'Password', value: successCard.password, key: 'spw', mono: true },
                successCard.mentor && { label: 'Mentor', value: successCard.mentor, key: 'smentor' },
                successCard.internship && { label: 'Internship', value: successCard.internship, key: 'sintern' },
              ].filter(Boolean).map((row) => (
                <div key={row.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(16,185,129,0.1)',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', flexShrink: 0 }}>{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)',
                      fontFamily: row.mono ? 'monospace' : 'var(--font-body)',
                      letterSpacing: row.mono ? '0.05em' : 'normal',
                    }}>
                      {row.value}
                    </span>
                    <button onClick={() => copyToClipboard(row.value, row.key)} style={{
                      border: 'none', background: 'none', cursor: 'pointer', padding: 2,
                      color: copied === row.key ? 'var(--emerald-600)' : 'var(--slate-400)',
                    }}>
                      {copied === row.key ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: 8, background: 'rgba(16,185,129,0.1)', fontSize: '0.75rem', color: 'var(--emerald-700)', lineHeight: 1.5 }}>
                📋 Share these credentials securely with the student. They can change their password from the login screen.
              </div>
            </div>
          )}

          {/* Tips card */}
          <div className="card animate-fade-up stagger-2" style={{ padding: '1.25rem 1.375rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)', marginBottom: '0.875rem' }}>
              Onboarding checklist
            </div>
            {[
              { done: true, text: 'Create student account with temporary password' },
              { done: false, text: 'Assign a mentor to the student' },
              { done: false, text: 'Enroll student in an internship program' },
              { done: false, text: 'Set up work schedule & attendance rules' },
              { done: false, text: 'Assign first tasks to get started' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.5rem 0',
                borderBottom: i < 4 ? '1px solid var(--slate-100)' : 'none',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: item.done ? 'var(--emerald-100)' : 'var(--slate-100)',
                  border: `1.5px solid ${item.done ? 'rgba(16,185,129,0.3)' : 'var(--slate-200)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.done
                    ? <Check size={10} style={{ color: 'var(--emerald-600)' }} />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--slate-300)' }} />}
                </div>
                <span style={{ fontSize: '0.8125rem', color: item.done ? 'var(--slate-600)' : 'var(--slate-500)', lineHeight: 1.4 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently onboarded students table */}
      {students.length > 0 && (
        <div className="animate-fade-up stagger-3">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)', marginBottom: '0.875rem' }}>
            Recent students ({students.length})
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.875rem 1.25rem 0.75rem' }}>Student</th>
                  <th>Mentor</th>
                  <th>Internship</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <StudentRow key={s._id} student={s} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}