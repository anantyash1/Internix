import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Upload, FileText, ExternalLink, CheckCircle, XCircle, Clock, FileImage, RefreshCw } from 'lucide-react';

const STATUS_MAP = {
  submitted:    { label: 'Submitted',    cls: 'badge-blue',   bg: 'var(--blue-50)',    color: 'var(--blue-600)'    },
  under_review: { label: 'In review',    cls: 'badge-amber',  bg: 'var(--amber-50)',   color: 'var(--amber-500)'   },
  approved:     { label: 'Approved',     cls: 'badge-green',  bg: 'var(--emerald-50)', color: 'var(--emerald-500)' },
  rejected:     { label: 'Rejected',     cls: 'badge-red',    bg: 'var(--rose-50)',    color: 'var(--rose-500)'    },
};

function ReportCard({ report, user, onReview, index }) {
  const [hovered, setHovered] = useState(false);
  const st = STATUS_MAP[report.status] || STATUS_MAP.submitted;
  const isPdf = report.fileType === 'pdf' || report.fileUrl?.includes('.pdf');
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? 'var(--slate-300)' : 'var(--slate-200)'}`,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)',
        padding: '1.125rem 1.25rem',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-1px)' : '',
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
      }}
    >
      {/* File icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 11, flexShrink: 0,
        background: isPdf ? 'var(--rose-50)' : 'var(--blue-50)',
        border: `1px solid ${isPdf ? 'rgba(244,63,94,0.15)' : 'rgba(59,130,246,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.05)' : '',
      }}>
        <FileText size={20} style={{ color: isPdf ? 'var(--rose-500)' : 'var(--blue-500)' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem',
              color: 'var(--slate-900)', letterSpacing: '-0.02em', marginBottom: '0.25rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {report.title}
            </div>
            {report.description && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {report.description}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge ${st.cls}`}>{st.label}</span>
              {report.student && <span className="badge badge-gray">{report.student.name}</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {report.reviewedBy && (
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                  · Reviewed by {report.reviewedBy.name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 8, border: '1px solid var(--slate-200)',
                background: 'var(--slate-50)', color: 'var(--slate-600)',
                fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-300)'; e.currentTarget.style.color = 'var(--blue-600)'; e.currentTarget.style.background = 'var(--blue-50)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.color = 'var(--slate-600)'; e.currentTarget.style.background = 'var(--slate-50)'; }}
            >
              <ExternalLink size={12} /> View
            </a>
            {isMentorAdmin && report.status === 'submitted' && (
              <button
                onClick={() => onReview(report._id)}
                className="btn-primary"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
              >
                Review
              </button>
            )}
          </div>
        </div>

        {/* Feedback box */}
        {report.feedback && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            background: report.status === 'approved' ? 'var(--emerald-50)' : report.status === 'rejected' ? 'var(--rose-50)' : 'var(--blue-50)',
            border: `1px solid ${report.status === 'approved' ? 'rgba(16,185,129,0.2)' : report.status === 'rejected' ? 'rgba(244,63,94,0.2)' : 'var(--blue-100)'}`,
            fontSize: '0.8125rem',
            color: report.status === 'approved' ? 'var(--emerald-700)' : report.status === 'rejected' ? 'var(--rose-700)' : 'var(--blue-700)',
            lineHeight: 1.5,
          }}>
            💬 {report.feedback}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showUpload,   setShowUpload]   = useState(false);
  const [reviewId,     setReviewId]     = useState(null);
  const [uploadForm,   setUploadForm]   = useState({ title: '', description: '', file: null });
  const [reviewForm,   setReviewForm]   = useState({ status: 'approved', feedback: '' });
  const [uploading,    setUploading]    = useState(false);
  const [reviewing,    setReviewing]    = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try { const { data } = await api.get('/reports'); setReports(data.reports); }
    catch { toast.error('Failed to load reports'); }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', uploadForm.title);
      fd.append('description', uploadForm.description);
      fd.append('file', uploadForm.file);
      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report uploaded!');
      setShowUpload(false);
      setUploadForm({ title: '', description: '', file: null });
      fetchReports();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setUploading(false);
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      await api.put(`/reports/${reviewId}/review`, reviewForm);
      toast.success('Review submitted!');
      setReviewId(null);
      fetchReports();
    } catch { toast.error('Review failed'); }
    setReviewing(false);
  };

  if (loading) return <LoadingSpinner label="Loading reports…" />;

  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';
  const pendingCount  = reports.filter((r) => r.status === 'submitted').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.15)' }}>
            <FileText size={19} style={{ color: 'var(--violet-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Reports
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              {reports.length} reports{isMentorAdmin && pendingCount > 0 ? ` · ${pendingCount} pending review` : ''}
            </div>
          </div>
        </div>
        {user?.role === 'student' && (
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <Upload size={15} /> Upload Report
          </button>
        )}
      </div>

      {/* Pending alert for mentors */}
      {isMentorAdmin && pendingCount > 0 && (
        <div className="animate-fade-up stagger-1" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1.125rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--amber-50)', border: '1px solid rgba(245,158,11,0.25)',
        }}>
          <Clock size={16} style={{ color: 'var(--amber-500)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#92400e' }}>
            <strong>{pendingCount} report{pendingCount > 1 ? 's' : ''}</strong> awaiting your review.
          </span>
        </div>
      )}

      {/* Report list */}
      {reports.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
            <FileText size={26} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            No reports yet
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {user?.role === 'student' ? 'Upload your first report using the button above.' : 'Student reports will appear here.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {reports.map((r, i) => (
            <ReportCard key={r._id} report={r} user={user} index={i} onReview={setReviewId} />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload report">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Title</label>
            <input value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Report title…" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Description</label>
            <textarea value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Brief description…" rows={2} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>File <span style={{ color: 'var(--slate-400)' }}>(PDF, JPG, PNG · max 10MB)</span></label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUploadForm((f) => ({ ...f, file: e.target.files[0] }))} className="input-field" required />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {uploading ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading…</> : <><Upload size={14} /> Upload report</>}
          </button>
        </form>
      </Modal>

      {/* Review modal */}
      <Modal isOpen={!!reviewId} onClose={() => setReviewId(null)} title="Review report">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { value: 'approved', label: 'Approve', icon: <CheckCircle size={15} />, active: 'var(--emerald-500)', activeBg: 'var(--emerald-50)', activeBorder: 'rgba(16,185,129,0.3)' },
              { value: 'rejected', label: 'Reject',  icon: <XCircle size={15} />,    active: 'var(--rose-500)',    activeBg: 'var(--rose-50)',    activeBorder: 'rgba(244,63,94,0.3)'  },
            ].map((btn) => {
              const isActive = reviewForm.status === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, status: btn.value }))}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isActive ? btn.activeBorder : 'var(--slate-200)'}`,
                    background: isActive ? btn.activeBg : '#ffffff',
                    color: isActive ? btn.active : 'var(--slate-600)',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    transition: 'all 180ms ease',
                  }}
                >
                  {btn.icon} {btn.label}
                </button>
              );
            })}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
              Feedback <span style={{ color: 'var(--slate-400)' }}>(optional)</span>
            </label>
            <textarea
              value={reviewForm.feedback}
              onChange={(e) => setReviewForm((f) => ({ ...f, feedback: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Provide specific feedback for the student…"
            />
          </div>
          <button onClick={handleReview} disabled={reviewing} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
            {reviewing ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting…</> : 'Submit review'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
