import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useVideoStore from '../store/videoStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Play, Plus, Trash2, CheckCircle, Youtube, Upload, RefreshCw, BookOpen } from 'lucide-react';

function VideoThumbnail({ video }) {
  return video.thumbnailUrl ? (
    <img
      src={video.thumbnailUrl}
      alt={video.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  ) : (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-100)', color: 'var(--slate-300)' }}>
      <Play size={28} />
    </div>
  );
}

function VideoListItem({ video, isSelected, onSelect, user, onComplete, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isCompleted = video?.progress?.completed;
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div
      onClick={() => onSelect(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${isSelected ? 'var(--blue-400)' : hovered ? 'var(--slate-300)' : 'var(--slate-200)'}`,
        background: isSelected ? 'var(--blue-50)' : hovered ? 'var(--slate-50)' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 80, height: 52, borderRadius: 8, overflow: 'hidden',
        flexShrink: 0, background: 'var(--slate-100', position: 'relative',
      }}>
        <VideoThumbnail video={video} />
        {isCompleted && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(16,185,129,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={18} style={{ color: '#fff' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8125rem', fontWeight: 600,
          color: isSelected ? 'var(--blue-700)' : 'var(--slate-900)',
          lineHeight: 1.35, marginBottom: '0.25rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {video.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {video.type === 'youtube'
            ? <Youtube size={11} style={{ color: '#ef4444' }} />
            : <Upload size={11} style={{ color: 'var(--blue-500)' }} />}
          <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
            {video.type === 'youtube' ? 'YouTube' : 'Uploaded'}
            {video.duration ? ` · ${video.duration}` : ''}
          </span>
        </div>
      </div>

      {/* Delete (mentor/admin) */}
      {isMentorAdmin && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(video._id); }}
          className="btn-icon danger"
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26 }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function VideoPlayer({ video, user, onComplete }) {
  const [completing, setCompleting] = useState(false);
  const isCompleted = video?.progress?.completed;

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(video._id);
    setCompleting(false);
  };

  return (
    <div>
      {/* Player */}
      <div style={{
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: '#000', aspectRatio: '16/9', marginBottom: '1rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {video.type === 'youtube' ? (
          <iframe
            src={`${video.url}?rel=0&modestbranding=1`}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <video src={video.url} controls style={{ width: '100%', height: '100%', display: 'block' }} />
        )}
      </div>

      {/* Info bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--slate-900)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            {video.title}
          </h3>
          {video.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.6, marginBottom: '0.375rem' }}>
              {video.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {video.type === 'youtube'
              ? <span className="badge badge-red"><Youtube size={10} /> YouTube</span>
              : <span className="badge badge-blue"><Upload size={10} /> Uploaded</span>}
            {video.duration && <span className="badge badge-gray">{video.duration}</span>}
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>by {video.createdBy?.name}</span>
          </div>
        </div>

        {user?.role === 'student' && (
          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4375rem',
              padding: '0.5625rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
              background: isCompleted ? 'var(--emerald-50)' : 'var(--emerald-500)',
              color: isCompleted ? 'var(--emerald-600)' : '#ffffff',
              fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
              cursor: isCompleted ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
              transform: !isCompleted && !completing ? 'scale(1)' : '',
              boxShadow: !isCompleted ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
            }}
            onMouseEnter={(e) => { if (!isCompleted && !completing) e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
          >
            {completing ? <RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={15} />}
            {isCompleted ? 'Completed' : completing ? 'Saving…' : 'Mark complete'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VideosPage() {
  const user = useAuthStore((s) => s.user);
  const { videos, loading, fetchVideos, createVideoLink, uploadVideo, deleteVideo, markComplete } = useVideoStore();
  const [selected,  setSelected]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [addType,   setAddType]   = useState('youtube');
  const [form, setForm]           = useState({ title: '', description: '', url: '', duration: '' });
  const [fileInput, setFileInput] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => { fetchVideos(); }, []);
  useEffect(() => { if (videos.length > 0 && !selected) setSelected(videos[0]); }, [videos]);

  const completedCount = videos.filter((v) => v.progress?.completed).length;
  const progressPct    = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (addType === 'youtube') {
        await createVideoLink(form);
        toast.success('Video added!');
      } else {
        if (!fileInput) { toast.error('Select a file'); setSaving(false); return; }
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('video', fileInput);
        await uploadVideo(fd);
        toast.success('Video uploaded!');
      }
      setShowAdd(false);
      setForm({ title: '', description: '', url: '', duration: '' });
      setFileInput(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteVideo(id);
      toast.success('Deleted');
      if (selected?._id === id) setSelected(videos.find((v) => v._id !== id) || null);
    } catch { toast.error('Failed to delete'); }
  };

  const handleComplete = async (videoId) => {
    await markComplete(videoId);
    toast.success('🎉 Marked as completed!');
    setSelected((s) => s?._id === videoId ? { ...s, progress: { completed: true } } : s);
  };

  if (loading) return <LoadingSpinner label="Loading videos…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--rose-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(244,63,94,0.15)' }}>
            <BookOpen size={19} style={{ color: 'var(--rose-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>Learning Videos</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>{videos.length} videos{user?.role === 'student' ? ` · ${completedCount} completed` : ''}</div>
          </div>
        </div>
        {isMentorAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={15} /> Add Video
          </button>
        )}
      </div>

      {/* Progress bar for students */}
      {user?.role === 'student' && videos.length > 0 && (
        <div className="card animate-fade-up stagger-1" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Learning progress</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--blue-600)' }}>{progressPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.375rem' }}>
            {completedCount} of {videos.length} videos completed
          </div>
        </div>
      )}

      {/* Main layout */}
      {videos.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Play size={28} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>No videos yet</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>{isMentorAdmin ? 'Add YouTube links or upload video files.' : 'Your mentor will add learning materials here.'}</div>
        </div>
      ) : (
        <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'flex-start' }}>
          {/* Player */}
          <div className="card" style={{ padding: '1.25rem' }}>
            {selected
              ? <VideoPlayer video={selected} user={user} onComplete={handleComplete} />
              : <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', color: 'var(--slate-300)' }}>
                  <Play size={40} />
                </div>
            }
          </div>

          {/* Sidebar list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '0.25rem', padding: '0 0.125rem' }}>
              Playlist · {videos.length}
            </div>
            {videos.map((v) => (
              <VideoListItem
                key={v._id}
                video={v}
                isSelected={selected?._id === v._id}
                onSelect={setSelected}
                user={user}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add video modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add video">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', background: 'var(--slate-100)', borderRadius: 10, padding: '0.25rem', gap: '0.25rem' }}>
            {[
              { key: 'youtube', label: 'YouTube link', icon: <Youtube size={14} style={{ color: '#ef4444' }} /> },
              { key: 'upload',  label: 'Upload file',  icon: <Upload size={14} style={{ color: 'var(--blue-500)' }} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAddType(key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.5rem', borderRadius: 8, border: 'none',
                  background: addType === key ? '#ffffff' : 'transparent',
                  color: addType === key ? 'var(--slate-900)' : 'var(--slate-500)',
                  fontSize: '0.8125rem', fontWeight: addType === key ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  boxShadow: addType === key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 150ms',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Video title…" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Description <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field" rows={2} placeholder="Brief description…" />
            </div>
            {addType === 'youtube' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>YouTube URL</label>
                  <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} className="input-field" placeholder="https://youtube.com/watch?v=…" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                    Duration <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className="input-field" placeholder="e.g. 12:34" />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                  Video file <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(MP4, MOV · max 200MB)</span>
                </label>
                <input type="file" accept="video/*" onChange={(e) => setFileInput(e.target.files[0])} className="input-field" required />
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem', marginTop: '0.125rem' }}>
              {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><Plus size={15} /> Add video</>}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
