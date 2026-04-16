import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useVideoStore from '../store/videoStore';
import VideoPlayer from '../components/VideoPlayer';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Trash2, Play, CheckCircle, Youtube, Upload } from 'lucide-react';

export default function VideosPage() {
  const user = useAuthStore((s) => s.user);
  const { videos, loading, fetchVideos, createVideoLink, uploadVideo, deleteVideo } = useVideoStore();

  const [showModal, setShowModal] = useState(false);
  const [addType, setAddType] = useState('youtube'); // 'youtube' | 'upload'
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', url: '', duration: '' });
  const [fileInput, setFileInput] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const completedCount = videos.filter((v) => v.progress?.completed).length;
  const progressPct = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (addType === 'youtube') {
        await createVideoLink(form);
        toast.success('Video added!');
      } else {
        if (!fileInput) return toast.error('Select a video file');
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('video', fileInput);
        await uploadVideo(fd);
        toast.success('Video uploaded!');
      }
      setShowModal(false);
      setForm({ title: '', description: '', url: '', duration: '' });
      setFileInput(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteVideo(id);
      toast.success('Deleted');
      if (selectedVideo?._id === id) setSelectedVideo(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  const isMentorOrAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Videos</h1>
          {user?.role === 'student' && videos.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {completedCount}/{videos.length} completed
            </p>
          )}
        </div>
        {isMentorOrAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Video
          </button>
        )}
      </div>

      {/* Progress bar for students */}
      {user?.role === 'student' && videos.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your video progress</span>
            <span className="text-sm font-bold text-primary-600">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {completedCount} of {videos.length} videos completed
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video list */}
        <div className="lg:col-span-1 space-y-3">
          {videos.length === 0 && (
            <div className="card text-center py-10 text-gray-400">
              <Play size={32} className="mx-auto mb-2 opacity-30" />
              No videos yet
            </div>
          )}
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => setSelectedVideo(video)}
              className={`card cursor-pointer transition-all hover:shadow-md ${
                selectedVideo?._id === video._id ? 'ring-2 ring-primary-400' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video mb-3">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={28} className="text-gray-300" />
                  </div>
                )}
                {video.progress?.completed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                    <CheckCircle size={14} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                  <Play size={28} className="text-white" />
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {video.type === 'youtube' ? (
                      <Youtube size={12} className="text-red-500" />
                    ) : (
                      <Upload size={12} className="text-blue-500" />
                    )}
                    <span className="text-xs text-gray-400 capitalize">{video.type}</span>
                    {video.duration && <span className="text-xs text-gray-400">{video.duration}</span>}
                  </div>
                </div>
                {isMentorOrAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(video._id); }}
                    className="text-red-400 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Player panel */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="card">
              <VideoPlayer
                video={selectedVideo}
                canMark={user?.role === 'student' && !selectedVideo.progress?.completed}
              />
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-gray-300">
              <Play size={48} className="mb-3" />
              <p className="text-sm">Select a video to watch</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Video Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Video">
        <div className="space-y-4">
          {/* Type tabs */}
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => setAddType('youtube')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                addType === 'youtube' ? 'bg-white shadow text-red-600' : 'text-gray-500'
              }`}
            >
              <Youtube size={16} /> YouTube Link
            </button>
            <button
              onClick={() => setAddType('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                addType === 'upload' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
              }`}
            >
              <Upload size={16} /> Upload File
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            {addType === 'youtube' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="input-field"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 12:34"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File (MP4, MOV — max 200MB)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFileInput(e.target.files[0])}
                  className="input-field"
                  required
                />
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Add Video'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}