import { CheckCircle, Play } from 'lucide-react';

export default function VideoPlayer({ video }) {
  const isCompleted = video?.progress?.completed;

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {video.type === 'youtube' ? (
          <iframe
            src={`${video.url}?autoplay=0&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <video src={video.url} controls className="w-full h-full" />
        )}
      </div>

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

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {isCompleted ? <CheckCircle size={16} /> : <Play size={16} />}
          {isCompleted ? 'Completed Automatically' : 'Auto Completion Enabled'}
        </div>
      </div>
    </div>
  );
}
