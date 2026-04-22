import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import useVideoStore from '../store/videoStore';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Youtube,
} from 'lucide-react';

function extractYoutubeVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

function loadYoutubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (window.__internixYoutubeApiPromise) {
    return window.__internixYoutubeApiPromise;
  }

  window.__internixYoutubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') {
        previousReady();
      }
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    if (window.YT?.Player) {
      resolve(window.YT);
    }
  });

  return window.__internixYoutubeApiPromise;
}

function VideoThumbnail({ video }) {
  return video.thumbnailUrl ? (
    <img
      src={video.thumbnailUrl}
      alt={video.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-100)', color: 'var(--slate-300)' }}>
      <Play size={28} />
    </div>
  );
}

function VideoListItem({ video, isSelected, onSelect, user, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isCompleted = video?.progress?.completed;
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  return (
    <div
      onClick={() => onSelect(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${isSelected ? 'var(--blue-400)' : hovered ? 'var(--slate-300)' : 'var(--slate-200)'}`,
        background: isSelected ? 'var(--blue-50)' : hovered ? 'var(--slate-50)' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 180ms ease',
        position: 'relative',
      }}
    >
      <div style={{
        width: 80,
        height: 52,
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--slate-100)',
        position: 'relative',
      }}>
        <VideoThumbnail video={video} />
        {isCompleted && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(16,185,129,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle size={18} style={{ color: '#fff' }} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: isSelected ? 'var(--blue-700)' : 'var(--slate-900)',
          lineHeight: 1.35,
          marginBottom: '0.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {video.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          {video.type === 'youtube'
            ? <Youtube size={11} style={{ color: '#ef4444' }} />
            : <Upload size={11} style={{ color: 'var(--blue-500)' }} />}
          <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
            {video.type === 'youtube' ? 'YouTube' : 'Uploaded'}
            {video.duration ? ` · ${video.duration}` : ''}
          </span>
          {video.internship?.title && user?.role !== 'student' && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
              · {video.internship.title}
            </span>
          )}
        </div>
      </div>

      {isMentorAdmin && hovered && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete(video._id);
          }}
          className="btn-icon danger"
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26 }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function UploadTrackedPlayer({ video, onSync }) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const lastTimeRef = useRef(video?.progress?.lastPositionSeconds || 0);
  const skippedRef = useRef(Boolean(video?.progress?.skipped));

  useEffect(() => {
    lastTimeRef.current = video?.progress?.lastPositionSeconds || 0;
    skippedRef.current = Boolean(video?.progress?.skipped);
  }, [video?._id, video?.progress?.lastPositionSeconds, video?.progress?.skipped]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const syncProgress = async (isEnded = false) => {
    const player = videoRef.current;
    if (!player) return;

    await onSync(video._id, {
      currentTime: player.currentTime || 0,
      duration: Number.isFinite(player.duration) ? player.duration : 0,
      hasSkipped: skippedRef.current,
      isEnded,
    });
  };

  const startSyncing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      void syncProgress(false);
    }, 5000);
  };

  const stopSyncing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTimeUpdate = () => {
    const player = videoRef.current;
    if (!player) return;

    if (player.currentTime < 2 && lastTimeRef.current > 10 && !video?.progress?.completed) {
      skippedRef.current = false;
    } else if (player.currentTime > lastTimeRef.current + 2.25) {
      skippedRef.current = true;
    }

    lastTimeRef.current = player.currentTime;
  };

  const handleSeeking = () => {
    const player = videoRef.current;
    if (!player) return;

    if (player.currentTime < 2 && lastTimeRef.current > 10 && !video?.progress?.completed) {
      skippedRef.current = false;
      return;
    }

    if (player.currentTime > lastTimeRef.current + 2.25) {
      skippedRef.current = true;
    }
  };

  return (
    <video
      ref={videoRef}
      src={video.url}
      controls
      controlsList="nodownload"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onPlay={startSyncing}
      onPause={() => {
        stopSyncing();
        void syncProgress(false);
      }}
      onEnded={() => {
        stopSyncing();
        void syncProgress(true);
      }}
      onSeeking={handleSeeking}
      onTimeUpdate={handleTimeUpdate}
    />
  );
}

function YoutubeTrackedPlayer({ video, onSync }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);
  const lastTimeRef = useRef(video?.progress?.lastPositionSeconds || 0);
  const skippedRef = useRef(Boolean(video?.progress?.skipped));
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    lastTimeRef.current = video?.progress?.lastPositionSeconds || 0;
    skippedRef.current = Boolean(video?.progress?.skipped);
    lastSyncAtRef.current = 0;
  }, [video?._id, video?.progress?.lastPositionSeconds, video?.progress?.skipped]);

  useEffect(() => {
    let cancelled = false;
    const videoId = extractYoutubeVideoId(video.url);

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const syncFromPlayer = async (isEnded = false) => {
      const player = playerRef.current;
      if (!player?.getCurrentTime || !player?.getDuration) return;

      await onSync(video._id, {
        currentTime: player.getCurrentTime() || 0,
        duration: player.getDuration() || 0,
        hasSkipped: skippedRef.current,
        isEnded,
      });
    };

    const pollProgress = () => {
      const player = playerRef.current;
      if (!player?.getCurrentTime || !player?.getDuration) return;

      const currentTime = player.getCurrentTime() || 0;

      if (currentTime < 2 && lastTimeRef.current > 10 && !video?.progress?.completed) {
        skippedRef.current = false;
      } else if (currentTime > lastTimeRef.current + 4) {
        skippedRef.current = true;
      }

      lastTimeRef.current = currentTime;

      if (Date.now() - lastSyncAtRef.current >= 5000) {
        lastSyncAtRef.current = Date.now();
        void syncFromPlayer(false);
      }
    };

    const startPolling = () => {
      stopPolling();
      pollRef.current = setInterval(pollProgress, 1000);
    };

    loadYoutubeApi().then(() => {
      if (cancelled || !hostRef.current) return;

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startPolling();
              return;
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.BUFFERING
            ) {
              stopPolling();
              void syncFromPlayer(false);
              return;
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              stopPolling();
              void syncFromPlayer(true);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopPolling();
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [onSync, video?._id, video?.progress?.completed, video.url]);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}

function VideoPlayerPanel({ video, user, onSync }) {
  const isCompleted = video?.progress?.completed;
  const isSkipped = video?.progress?.skipped;

  return (
    <div>
      <div style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: '#000',
        aspectRatio: '16/9',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {video.type === 'youtube' ? (
          <YoutubeTrackedPlayer video={video} onSync={onSync} />
        ) : (
          <UploadTrackedPlayer video={video} onSync={onSync} />
        )}
      </div>

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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: user?.role === 'student' ? '0.875rem' : 0 }}>
            {video.type === 'youtube'
              ? <span className="badge badge-red"><Youtube size={10} /> YouTube</span>
              : <span className="badge badge-blue"><Upload size={10} /> Uploaded</span>}
            {video.duration && <span className="badge badge-gray">{video.duration}</span>}
            {video.internship?.title && user?.role !== 'student' && (
              <span className="badge badge-gray">{video.internship.title}</span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>by {video.createdBy?.name}</span>
          </div>

          {user?.role === 'student' && (
            <div style={{
              display: 'flex',
              gap: '0.625rem',
              alignItems: 'flex-start',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : isSkipped ? 'rgba(245,158,11,0.25)' : 'var(--slate-200)'}`,
              background: isCompleted ? 'var(--emerald-50)' : isSkipped ? 'rgba(245,158,11,0.08)' : 'var(--slate-50)',
            }}>
              {isCompleted ? (
                <CheckCircle size={18} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: 1 }} />
              ) : isSkipped ? (
                <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              ) : (
                <Play size={18} style={{ color: 'var(--blue-500)', flexShrink: 0, marginTop: 1 }} />
              )}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.1875rem' }}>
                  {isCompleted ? 'Completed automatically' : isSkipped ? 'Skipping detected' : 'Completion happens automatically'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.55 }}>
                  {isCompleted
                    ? 'You watched this video fully without skipping, so it has been marked as completed.'
                    : isSkipped
                      ? 'Restart from the beginning and watch the full video without skipping to complete it.'
                      : 'Students cannot manually mark videos complete. Watch the full video without skipping and the system will complete it for you.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const user = useAuthStore((state) => state.user);
  const { videos, loading, fetchVideos, createVideoLink, uploadVideo, deleteVideo, syncVideoProgress } = useVideoStore();
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('youtube');
  const [form, setForm] = useState({ title: '', description: '', url: '', duration: '', internshipId: '' });
  const [fileInput, setFileInput] = useState(null);
  const [saving, setSaving] = useState(false);
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [loadingInternships, setLoadingInternships] = useState(false);
  const isMentorAdmin = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => {
    if (!isMentorAdmin) {
      fetchVideos();
      return;
    }

    let active = true;
    setLoadingInternships(true);

    api.get('/internships')
      .then(({ data }) => {
        if (!active) return;
        const nextInternships = data.internships || [];
        setInternships(nextInternships);
        setSelectedInternship((current) => current || nextInternships[0]?._id || '');
      })
      .catch(() => {
        if (!active) return;
        toast.error('Failed to load internships');
      })
      .finally(() => {
        if (active) setLoadingInternships(false);
      });

    return () => {
      active = false;
    };
  }, [fetchVideos, isMentorAdmin]);

  useEffect(() => {
    if (isMentorAdmin) {
      fetchVideos(selectedInternship ? { internshipId: selectedInternship } : {});
    }
  }, [fetchVideos, isMentorAdmin, selectedInternship]);

  useEffect(() => {
    setSelected((current) => {
      if (videos.length === 0) return null;
      return videos.find((video) => video._id === current?._id) || videos[0];
    });
  }, [videos]);

  useEffect(() => {
    if (!showAdd) return;
    setForm((current) => ({
      ...current,
      internshipId: current.internshipId || selectedInternship || internships[0]?._id || '',
    }));
  }, [internships, selectedInternship, showAdd]);

  const completedCount = videos.filter((video) => video.progress?.completed).length;
  const progressPct = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;
  const activeInternship = internships.find((internship) => internship._id === selectedInternship);

  const refreshVideos = async () => {
    await fetchVideos(isMentorAdmin ? (selectedInternship ? { internshipId: selectedInternship } : {}) : {});
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (isMentorAdmin && !form.internshipId) {
      toast.error('Select an internship for this video');
      return;
    }

    setSaving(true);
    try {
      if (addType === 'youtube') {
        await createVideoLink(form);
        toast.success('Video added');
      } else {
        if (!fileInput) {
          toast.error('Select a file');
          setSaving(false);
          return;
        }

        const uploadData = new FormData();
        uploadData.append('title', form.title);
        uploadData.append('description', form.description);
        uploadData.append('internshipId', form.internshipId);
        uploadData.append('video', fileInput);
        await uploadVideo(uploadData);
        toast.success('Video uploaded');
      }

      await refreshVideos();
      setShowAdd(false);
      setForm({ title: '', description: '', url: '', duration: '', internshipId: selectedInternship || internships[0]?._id || '' });
      setFileInput(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteVideo(id);
      toast.success('Video deleted');
      await refreshVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSyncProgress = async (videoId, payload) => {
    try {
      const previousProgress = videos.find((video) => video._id === videoId)?.progress;
      const { progress } = await syncVideoProgress(videoId, payload);

      if (!previousProgress?.completed && progress?.completed) {
        toast.success('Video completed automatically');
      } else if (!previousProgress?.skipped && progress?.skipped) {
        toast.error('Skipping detected. Restart the video and watch it fully.');
      }

      setSelected((current) => (
        current?._id === videoId
          ? { ...current, progress }
          : current
      ));
    } catch {
      // Ignore noisy sync errors while the student watches the video.
    }
  };

  if (loading || loadingInternships) return <LoadingSpinner label="Loading videos..." />;

  if (user?.role === 'student' && !user?.internship) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <BookOpen size={28} style={{ color: 'var(--slate-300)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
          No internship assigned yet
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
          Ask your admin or mentor to assign you to an internship so the right videos can appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--rose-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(244,63,94,0.15)' }}>
            <BookOpen size={19} style={{ color: 'var(--rose-500)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
              Learning Videos
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              {user?.role === 'student'
                ? `${user?.internship?.title || 'My internship'} · ${videos.length} videos · ${completedCount} completed`
                : `${activeInternship?.title || 'All internships'} · ${videos.length} videos`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isMentorAdmin && (
            <select
              value={selectedInternship}
              onChange={(event) => setSelectedInternship(event.target.value)}
              className="input-field"
              style={{ minWidth: 220 }}
            >
              {internships.length === 0 ? (
                <option value="">No internships found</option>
              ) : (
                internships.map((internship) => (
                  <option key={internship._id} value={internship._id}>
                    {internship.title}
                  </option>
                ))
              )}
            </select>
          )}

          {isMentorAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary"
              disabled={internships.length === 0}
            >
              <Plus size={15} /> Add Video
            </button>
          )}
        </div>
      </div>

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
            {completedCount} of {videos.length} videos completed automatically
          </div>
        </div>
      )}

      {isMentorAdmin && internships.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={28} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
            Create an internship first
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            Videos are now managed inside internships, so create or assign an internship before adding learning content.
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="card animate-fade-up stagger-2" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Play size={28} style={{ color: 'var(--slate-300)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.375rem' }}>
            No videos yet
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>
            {isMentorAdmin
              ? `Add videos for ${activeInternship?.title || 'this internship'}.`
              : 'Your mentor will add internship videos here.'}
          </div>
        </div>
      ) : (
        <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            {selected ? (
              <VideoPlayerPanel video={selected} user={user} onSync={handleSyncProgress} />
            ) : (
              <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', color: 'var(--slate-300)' }}>
                <Play size={40} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '0.25rem', padding: '0 0.125rem' }}>
              Playlist · {videos.length}
            </div>
            {videos.map((video) => (
              <VideoListItem
                key={video._id}
                video={video}
                isSelected={selected?._id === video._id}
                onSelect={setSelected}
                user={user}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add video">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', background: 'var(--slate-100)', borderRadius: 10, padding: '0.25rem', gap: '0.25rem' }}>
            {[
              { key: 'youtube', label: 'YouTube link', icon: <Youtube size={14} style={{ color: '#ef4444' }} /> },
              { key: 'upload', label: 'Upload file', icon: <Upload size={14} style={{ color: 'var(--blue-500)' }} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAddType(key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem',
                  borderRadius: 8,
                  border: 'none',
                  background: addType === key ? '#ffffff' : 'transparent',
                  color: addType === key ? 'var(--slate-900)' : 'var(--slate-500)',
                  fontSize: '0.8125rem',
                  fontWeight: addType === key ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
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
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Internship
              </label>
              <select
                value={form.internshipId}
                onChange={(event) => setForm((current) => ({ ...current, internshipId: event.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select internship</option>
                {internships.map((internship) => (
                  <option key={internship._id} value={internship._id}>
                    {internship.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Title
              </label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="input-field"
                placeholder="Video title..."
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                Description <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="input-field"
                rows={2}
                placeholder="Brief description..."
              />
            </div>

            {addType === 'youtube' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                    YouTube URL
                  </label>
                  <input
                    value={form.url}
                    onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                    className="input-field"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                    Duration <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    value={form.duration}
                    onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                    className="input-field"
                    placeholder="e.g. 12:34"
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
                  Video file <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(MP4, MOV · max 200MB)</span>
                </label>
                <input type="file" accept="video/*" onChange={(event) => setFileInput(event.target.files[0])} className="input-field" required />
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem', marginTop: '0.125rem' }}>
              {saving ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Plus size={15} /> Add video</>}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
