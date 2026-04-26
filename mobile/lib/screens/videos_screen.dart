import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../providers/video_provider.dart';

class VideosScreen extends StatefulWidget {
  const VideosScreen({super.key});
  @override
  State<VideosScreen> createState() => _VideosScreenState();
}

class _VideosScreenState extends State<VideosScreen> {
  dynamic _selected;

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<VideoProvider>(context, listen: false).fetchVideos());
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final videoProvider = Provider.of<VideoProvider>(context);
    final role = auth.role;

    if (videoProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () => videoProvider.fetchVideos(),
      child: Column(
        children: [
          // Progress bar for students
          if (role == 'student' && videoProvider.videos.isNotEmpty)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF3F4F6)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Video Progress',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                      Text(
                          '${videoProvider.completedCount}/${videoProvider.videos.length}',
                          style: const TextStyle(
                              color: Color(0xFF2563EB),
                              fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: videoProvider.progressPercent,
                    backgroundColor: const Color(0xFFE5E7EB),
                    color: const Color(0xFF2563EB),
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${(videoProvider.progressPercent * 100).round()}% completed',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),

          // Video list
          Expanded(
            child: videoProvider.videos.isEmpty
                ? const Center(
                    child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.play_circle_outline,
                          size: 64, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('No videos yet',
                          style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: videoProvider.videos.length,
                    itemBuilder: (ctx, i) {
                      final video = videoProvider.videos[i];
                      final isCompleted =
                          video['progress']?['completed'] == true;
                      final isYoutube = video['type'] == 'youtube';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () => _openVideo(video),
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                // Thumbnail
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: video['thumbnailUrl'] != null
                                      ? Image.network(
                                          video['thumbnailUrl'],
                                          width: 90,
                                          height: 60,
                                          fit: BoxFit.cover,
                                        )
                                      : Container(
                                          width: 90,
                                          height: 60,
                                          color: const Color(0xFFF3F4F6),
                                          child: const Icon(Icons.play_arrow,
                                              color: Colors.grey),
                                        ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(video['title'] ?? '',
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Icon(
                                            isYoutube
                                                ? Icons.youtube_searched_for
                                                : Icons.upload_file,
                                            size: 14,
                                            color: isYoutube
                                                ? Colors.red
                                                : Colors.blue,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                              isYoutube
                                                  ? 'YouTube'
                                                  : 'Uploaded',
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                if (isCompleted)
                                  const Icon(Icons.check_circle,
                                      color: Colors.green, size: 20)
                                else if (role == 'student')
                                  TextButton(
                                    onPressed: () async {
                                      final ok = await videoProvider
                                          .markComplete(video['_id']);
                                      if (ok && mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(const SnackBar(
                                                content: Text('Marked complete!')));
                                      }
                                    },
                                    child: const Text('Done',
                                        style: TextStyle(fontSize: 12)),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _openVideo(dynamic video) async {
    final url = video['url'] as String?;
    if (url == null) return;

    // For YouTube embed URLs, convert to watch URL for launching
    final watchUrl = url.contains('embed')
        ? url.replaceFirst('embed/', 'watch?v=')
        : url;

    final uri = Uri.parse(watchUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}