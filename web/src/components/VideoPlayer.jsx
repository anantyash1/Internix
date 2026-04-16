import { useState } from 'react';
import { CheckCircle, Play } from 'lucide-react';
import useVideoStore from '../store/videoStore';
import toast from 'react-hot-toast';

export default function VideoPlayer({ video, canMark = false }) {
  const [played, setPlayed] = useState(false);
  const { markComplete } = useVideoStore();
  const isCompleted = video?.progress?.completed;

  const handleMark = async () => {
    try {
      await markComplete(video._id);
      toast.success('Marked as completed!');
    } catch {
      toast.error('Failed to mark');
    }
  };

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {video.type === 'youtube' ? (
          <iframe
            src={`${video.url}?autoplay=0&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
            onPlay={() => setPlayed(true)}
            title={video.title}
          />
        ) : (
          <video
            src={video.url}
            controls
            className="w-full h-full"
            onPlay={() => setPlayed(true)}
          />
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-gray-500 mt-0.5">{video.description}</p>
          )}
          <div className="flex gap-3 mt-1 text-xs text-gray-400">
            <span className="capitalize">{video.type}</span>
            {video.duration && <span>{video.duration}</span>}
            <span>By {video.createdBy?.name}</span>
          </div>
        </div>
        {canMark && (
          <button
            onClick={handleMark}
            disabled={isCompleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCompleted
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'btn-primary'
            }`}
          >
            <CheckCircle size={16} />
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
        )}
      </div>
    </div>
  );
}