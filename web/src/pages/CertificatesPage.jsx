import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Award, Download, Plus, Sparkles, RefreshCw, Copy, Check,
  Star, Calendar, User, Briefcase,
} from 'lucide-react';

/* ─── Certificate card ─── */
function CertCard({ cert, onDownload }) {
  const [hovered, setHovered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await onDownload(cert._id, cert.certificateNumber);
    setDownloading(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-up"
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'rgba(245,158,11,0.3)' : 'var(--slate-200)'}`,
        padding: '1.25rem 1.375rem',
        boxShadow: hovered ? '0 8px 24px rgba(245,158,11,0.12)' : 'var(--shadow-sm)',
        transition: 'all 220ms ease',
        transform: hovered ? 'translateY(-2px)' : '',
        display: 'flex', alignItems: 'center', gap: '1rem',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: 'radial-gradient(circle at 100% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'opacity 220ms', opacity: hovered ? 1 : 0.5,
      }} />

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: hovered ? 'var(--amber-100)' : 'var(--amber-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 220ms cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.06) rotate(-3deg)' : '',
        border: '1px solid rgba(245,158,11,0.2)',
      }}>
        <Award size={26} style={{ color: 'var(--amber-500)' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '0.9375rem', color: 'var(--slate-900)',
          marginBottom: '0.25rem', letterSpacing: '-0.02em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {cert.internship?.title || 'Internship'}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { icon: <User size={11} />, label: cert.student?.name },
            { icon: <span />, label: `#${cert.certificateNumber}` },
            cert.grade && { icon: <Star size={11} />, label: cert.grade },
            { icon: <Calendar size={11} />, label: new Date(cert.issuedAt).toLocaleDateString() },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', color: 'var(--slate-400)',
            }}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>
        {cert.achievementText && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.8125rem', color: 'var(--slate-600)',
            fontStyle: 'italic', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            "{cert.achievementText}"
          </div>
        )}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-primary"
        style={{ flexShrink: 0, gap: '0.375rem' }}
      >
        {downloading
          ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Download size={14} />
        }
        {downloading ? 'Downloading…' : 'Download'}
      </button>
    </div>
  );
}

/* ─── Generate modal with AI text ─── */
function GenerateModal({ isOpen, onClose, onSuccess }) {
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState({ studentId: '', internshipId: '', grade: '', achievementText: '' });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedInternTitle, setSelectedInternTitle] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      api.get('/users', { params: { role: 'student' } }),
      api.get('/internships'),
    ]).then(([sr, ir]) => {
      setStudents(sr.data.users || []);
      setInternships(ir.data.internships || []);
    });
  }, [isOpen]);

  const handleStudentChange = (e) => {
    const s = students.find(st => st._id === e.target.value);
    setSelectedStudentName(s?.name || '');
    setForm(f => ({ ...f, studentId: e.target.value }));
  };

  const handleInternChange = (e) => {
    const i = internships.find(it => it._id === e.target.value);
    setSelectedInternTitle(i?.title || '');
    setForm(f => ({ ...f, internshipId: e.target.value }));
  };

  const generateAIText = async () => {
    if (!form.studentId || !form.internshipId) {
      return toast.error('Select student and internship first');
    }
    setGenerating(true);
    try {
      const intern = internships.find(i => i._id === form.internshipId);
      const start  = intern?.startDate ? new Date(intern.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
      const end    = intern?.endDate   ? new Date(intern.endDate).toLocaleDateString('en-US',   { month: 'long', year: 'numeric' }) : '';

      const { data } = await api.post('/ai/chat', {
        messages: [{
          role: 'user',
          content: `Write a single personalized achievement statement (2-3 sentences) for a certificate of completion. Make it warm, professional, and specific to this context:\n\nStudent: ${selectedStudentName}\nInternship: ${selectedInternTitle}\nDuration: ${start} to ${end}${form.grade ? `\nGrade: ${form.grade}` : ''}\n\nIt should highlight dedication, skill development, and readiness for the next step. No quotes, no preamble — just the statement itself.`,
        }],
        context: 'Certificate achievement text generation',
      });
      setForm(f => ({ ...f, achievementText: data.reply || '' }));
      toast.success('AI text generated!');
    } catch { toast.error('AI generation failed'); }
    setGenerating(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(form.achievementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/certificates', form);
      toast.success('Certificate generated!');
      onSuccess();
      onClose();
      setForm({ studentId: '', internshipId: '', grade: '', achievementText: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Certificate" width={580}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
            Student
          </label>
          <select value={form.studentId} onChange={handleStudentChange} className="input-field" required>
            <option value="">Select a student…</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
            Internship
          </label>
          <select value={form.internshipId} onChange={handleInternChange} className="input-field" required>
            <option value="">Select an internship…</option>
            {internships.map((i) => (
              <option key={i._id} value={i._id}>{i.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
            Grade <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={form.grade}
            onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))}
            className="input-field"
            placeholder="e.g. A+, Excellent, Distinction"
          />
        </div>

        {/* AI achievement text */}
        <div style={{
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--blue-200)',
          background: 'var(--blue-50)',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Sparkles size={14} style={{ color: 'var(--blue-600)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--blue-700)' }}>
                AI achievement text
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {form.achievementText && (
                <button type="button" onClick={copyText} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              )}
              <button
                type="button" onClick={generateAIText} disabled={generating}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3125rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: generating ? 'var(--blue-200)' : 'var(--blue-600)',
                  color: '#fff',
                  fontSize: '0.75rem', fontWeight: 600,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                }}
              >
                {generating
                  ? <><RefreshCw size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={11} /> {form.achievementText ? 'Regenerate' : 'Generate with AI'}</>
                }
              </button>
            </div>
          </div>
          <textarea
            value={form.achievementText}
            onChange={(e) => setForm(f => ({ ...f, achievementText: e.target.value }))}
            className="input-field"
            placeholder="Click 'Generate with AI' to create personalized achievement text, or write your own…"
            rows={4}
            style={{
              background: 'rgba(255,255,255,0.8)',
              borderColor: 'var(--blue-200)',
              fontSize: '0.875rem',
              lineHeight: 1.65,
            }}
          />
          {generating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div className="ai-typing"><span/><span/><span/></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--blue-500)' }}>Claude is crafting personalized text…</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
          {saving
            ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
            : <><Award size={14} /> Generate Certificate</>
          }
        </button>
      </form>
    </Modal>
  );
}

/* ─── Main page ─── */
export default function CertificatesPage() {
  const user = useAuthStore((s) => s.user);
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGen, setShowGen] = useState(false);

  useEffect(() => { fetchCertificates(); }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/certificates');
      setCerts(data.certificates);
    } catch { toast.error('Failed to load certificates'); }
    setLoading(false);
  };

  const handleDownload = async (id, certNumber) => {
    try {
      const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `certificate-${certNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
  };

  if (loading) return <LoadingSpinner label="Loading certificates…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 10000, margin: '0 auto', padding: '1rem' }}>
      {/* Page header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--amber-100)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={21} style={{ color: 'var(--amber-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Certificates
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              {certs.length} {certs.length === 1 ? 'certificate' : 'certificates'} issued
            </div>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowGen(true)} className="btn-primary">
            <Plus size={15} /> Generate Certificate
          </button>
        )}
      </div>

      {/* AI badge */}
      {user?.role === 'admin' && (
        <div className="animate-fade-up stagger-1" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--blue-50)',
          border: '1px solid var(--blue-200)',
          fontSize: '0.8125rem', color: 'var(--blue-700)',
        }}>
          <Sparkles size={15} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
          <span>
            <strong>AI-powered:</strong> Certificates now include personalized achievement text generated by Claude AI, tailored to each student's specific internship journey.
          </span>
        </div>
      )}

      {/* Certificate list */}
      {certs.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--amber-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Award size={30} style={{ color: 'var(--amber-400)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
            No certificates yet
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {user?.role === 'admin' ? 'Generate certificates for students who have completed their internship.' : 'Complete your internship to receive a certificate.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {certs.map((cert, i) => (
            <div key={cert._id} className={`stagger-${Math.min(i + 1, 6)}`}>
              <CertCard cert={cert} onDownload={handleDownload} />
            </div>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <GenerateModal
        isOpen={showGen}
        onClose={() => setShowGen(false)}
        onSuccess={fetchCertificates}
      />
    </div>
  );
}
