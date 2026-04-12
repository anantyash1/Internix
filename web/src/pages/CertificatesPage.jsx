import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Award, Download, Plus } from 'lucide-react';

export default function CertificatesPage() {
  const user = useAuthStore((s) => s.user);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [students, setStudents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState({ studentId: '', internshipId: '', grade: '' });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/certificates');
      setCertificates(data.certificates);
    } catch {
      toast.error('Failed to load certificates');
    }
    setLoading(false);
  };

  const openGenerateModal = async () => {
    setShowGenerate(true);
    try {
      const [studentsRes, internshipsRes] = await Promise.all([
        api.get('/users', { params: { role: 'student' } }),
        api.get('/internships'),
      ]);
      setStudents(studentsRes.data.users);
      setInternships(internshipsRes.data.internships);
    } catch {
      /* ignore */
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', form);
      toast.success('Certificate generated!');
      setShowGenerate(false);
      setForm({ studentId: '', internshipId: '', grade: '' });
      fetchCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    }
  };

  const handleDownload = async (id, certNumber) => {
    try {
      const response = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Failed to download');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        {user?.role === 'admin' && (
          <button onClick={openGenerateModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Generate Certificate
          </button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No certificates found</div>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <div key={cert._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Award size={24} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cert.internship?.title || 'Internship'}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Student: {cert.student?.name}</span>
                    <span>#{cert.certificateNumber}</span>
                    {cert.grade && <span>Grade: {cert.grade}</span>}
                    <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(cert._id, cert.certificateNumber)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Download
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Certificate">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="input-field" required>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internship</label>
            <select value={form.internshipId} onChange={(e) => setForm({ ...form, internshipId: e.target.value })} className="input-field" required>
              <option value="">Select internship</option>
              {internships.map((i) => (
                <option key={i._id} value={i._id}>{i.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade (optional)</label>
            <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="input-field" placeholder="e.g. A+, Excellent" />
          </div>
          <button type="submit" className="btn-primary w-full">Generate</button>
        </form>
      </Modal>
    </div>
  );
}
