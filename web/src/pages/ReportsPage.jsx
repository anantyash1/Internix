import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const statusColors = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showReview, setShowReview] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null });
  const [reviewForm, setReviewForm] = useState({ status: 'approved', feedback: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports');
      setReports(data.reports);
    } catch {
      toast.error('Failed to load reports');
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded!');
      setShowUpload(false);
      setUploadForm({ title: '', description: '', file: null });
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleReview = async (id) => {
    try {
      await api.put(`/reports/${id}/review`, reviewForm);
      toast.success('Report reviewed!');
      setShowReview(null);
      fetchReports();
    } catch {
      toast.error('Review failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isMentorOrAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {user?.role === 'student' && (
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload size={18} /> Upload Report
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No reports found</div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  {report.description && <p className="text-sm text-gray-500 mt-1">{report.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    {report.student && <span>By: {report.student.name}</span>}
                    <span>Uploaded: {new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.feedback && (
                      <span className="text-primary-600">Feedback: {report.feedback}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg"
                    title="View file"
                  >
                    <ExternalLink size={16} />
                  </a>
                  {isMentorOrAdmin && report.status === 'submitted' && (
                    <button
                      onClick={() => { setShowReview(report._id); setReviewForm({ status: 'approved', feedback: '' }); }}
                      className="btn-primary text-xs py-1"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Report">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF or Image)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary w-full">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!showReview} onClose={() => setShowReview(null)} title="Review Report">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  reviewForm.status === 'approved' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  reviewForm.status === 'rejected' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea
              value={reviewForm.feedback}
              onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Provide feedback for the student..."
            />
          </div>
          <button onClick={() => handleReview(showReview)} className="btn-primary w-full">
            Submit Review
          </button>
        </div>
      </Modal>
    </div>
  );
}
