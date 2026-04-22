import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../providers/auth_provider.dart';
import '../providers/video_provider.dart';

class VideosScreen extends StatefulWidget {
  const VideosScreen({super.key});

  @override
  State<VideosScreen> createState() => _VideosScreenState();
}

class _VideosScreenState extends State<VideosScreen> {
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
                      const Text(
                        'Video Progress',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${videoProvider.completedCount}/${videoProvider.videos.length}',
                        style: const TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
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

          if (role == 'student' && videoProvider.videos.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline,
                      size: 18, color: Color(0xFF2563EB)),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Videos complete automatically when you watch them fully without skipping. Students can no longer mark them manually.',
                      style: TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFF475569),
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          Expanded(
            child: videoProvider.videos.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.play_circle_outline,
                            size: 64, color: Colors.grey),
                        SizedBox(height: 8),
                        Text(
                          'No videos yet',
                          style: TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: videoProvider.videos.length,
                    itemBuilder: (ctx, i) {
                      final video = videoProvider.videos[i];
                      final isCompleted =
                          video['progress']?['completed'] == true;
                      final isSkipped = video['progress']?['skipped'] == true;
                      final isYoutube = video['type'] == 'youtube';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => VideoPlaybackScreen(video: video),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
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
                                      Text(
                                        video['title'] ?? '',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Icon(
                                            isYoutube
                                                ? Icons.smart_display_rounded
                                                : Icons.video_file_outlined,
                                            size: 14,
                                            color: isYoutube
                                                ? Colors.red
                                                : Colors.blue,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            isYoutube ? 'YouTube' : 'Uploaded',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                if (isCompleted)
                                  const Icon(Icons.check_circle,
                                      color: Colors.green, size: 20)
                                else if (isSkipped)
                                  const Icon(Icons.warning_amber_rounded,
                                      color: Colors.orange, size: 20)
                                else
                                  const Icon(Icons.play_circle_outline,
                                      color: Colors.blueGrey, size: 20),
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
}

class VideoPlaybackScreen extends StatefulWidget {
  const VideoPlaybackScreen({super.key, required this.video});

  final Map<String, dynamic> video;

  @override
  State<VideoPlaybackScreen> createState() => _VideoPlaybackScreenState();
}

class _VideoPlaybackScreenState extends State<VideoPlaybackScreen> {
  late final WebViewController _controller;
  bool _skipMessageShown = false;
  bool _completeMessageShown = false;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..addJavaScriptChannel(
        'PlaybackBridge',
        onMessageReceived: _handlePlaybackMessage,
      )
      ..loadHtmlString(_buildPlayerHtml(widget.video));
  }

  Future<void> _handlePlaybackMessage(JavaScriptMessage message) async {
    final payload = Map<String, dynamic>.from(jsonDecode(message.message));
    final previousProgress = widget.video['progress'] is Map
        ? Map<String, dynamic>.from(widget.video['progress'])
        : <String, dynamic>{};

    final updatedProgress =
        await Provider.of<VideoProvider>(context, listen: false).syncProgress(
      widget.video['_id'] as String,
      payload,
    );

    if (!mounted || updatedProgress == null) return;

    setState(() {
      widget.video['progress'] = updatedProgress;
    });

    final completedNow = updatedProgress['completed'] == true;
    final skippedNow = updatedProgress['skipped'] == true;

    if (completedNow &&
        previousProgress['completed'] != true &&
        !_completeMessageShown) {
      _completeMessageShown = true;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Video completed automatically'),
          backgroundColor: Colors.green,
        ),
      );
    }

    if (skippedNow &&
        previousProgress['skipped'] != true &&
        !_skipMessageShown) {
      _skipMessageShown = true;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Skipping detected. Restart from the beginning and watch fully to complete it.'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  String _buildPlayerHtml(Map<String, dynamic> video) {
    if (video['type'] == 'youtube') {
      return _buildYoutubeHtml(video);
    }
    return _buildUploadHtml(video);
  }

  String _buildUploadHtml(Map<String, dynamic> video) {
    final src = jsonEncode(video['url'] ?? '');

    return '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #000;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      #player {
        width: 100%;
        height: 100%;
        background: #000;
      }
    </style>
  </head>
  <body>
    <video id="player" controls playsinline controlsList="nodownload"></video>
    <script>
      const player = document.getElementById('player');
      player.src = $src;

      const state = { lastTime: 0, skipped: false, timer: null };

      function sendProgress(isEnded) {
        if (!window.PlaybackBridge) return;
        PlaybackBridge.postMessage(JSON.stringify({
          currentTime: player.currentTime || 0,
          duration: player.duration || 0,
          hasSkipped: state.skipped,
          isEnded: Boolean(isEnded)
        }));
      }

      function startSync() {
        stopSync();
        state.timer = setInterval(function() {
          sendProgress(false);
        }, 5000);
      }

      function stopSync() {
        if (state.timer) {
          clearInterval(state.timer);
          state.timer = null;
        }
      }

      player.addEventListener('timeupdate', function() {
        if (player.currentTime < 2 && state.lastTime > 10) {
          state.skipped = false;
        } else if (player.currentTime > state.lastTime + 2.25) {
          state.skipped = true;
        }
        state.lastTime = player.currentTime;
      });

      player.addEventListener('seeking', function() {
        if (player.currentTime < 2 && state.lastTime > 10) {
          state.skipped = false;
        } else if (player.currentTime > state.lastTime + 2.25) {
          state.skipped = true;
        }
      });

      player.addEventListener('play', startSync);
      player.addEventListener('pause', function() {
        stopSync();
        sendProgress(false);
      });
      player.addEventListener('ended', function() {
        stopSync();
        sendProgress(true);
      });
    </script>
  </body>
</html>
''';
  }

  String _buildYoutubeHtml(Map<String, dynamic> video) {
    final youtubeId = jsonEncode(_extractYoutubeId(video['url'] as String? ?? ''));

    return '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #000;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      #player {
        width: 100%;
        height: 100%;
        background: #000;
      }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      const state = { lastTime: 0, skipped: false, timer: null, lastSentAt: 0 };
      let player = null;

      function sendProgress(isEnded) {
        if (!player || !player.getCurrentTime || !window.PlaybackBridge) return;
        PlaybackBridge.postMessage(JSON.stringify({
          currentTime: player.getCurrentTime() || 0,
          duration: player.getDuration() || 0,
          hasSkipped: state.skipped,
          isEnded: Boolean(isEnded)
        }));
      }

      function pollProgress() {
        if (!player || !player.getCurrentTime) return;
        const currentTime = player.getCurrentTime() || 0;

        if (currentTime < 2 && state.lastTime > 10) {
          state.skipped = false;
        } else if (currentTime > state.lastTime + 4) {
          state.skipped = true;
        }

        state.lastTime = currentTime;

        if (Date.now() - state.lastSentAt >= 5000) {
          state.lastSentAt = Date.now();
          sendProgress(false);
        }
      }

      function startSync() {
        stopSync();
        state.timer = setInterval(pollProgress, 1000);
      }

      function stopSync() {
        if (state.timer) {
          clearInterval(state.timer);
          state.timer = null;
        }
      }

      window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
          videoId: $youtubeId,
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: function(event) {
              if (event.data === YT.PlayerState.PLAYING) {
                startSync();
                return;
              }

              if (
                event.data === YT.PlayerState.PAUSED ||
                event.data === YT.PlayerState.BUFFERING
              ) {
                stopSync();
                sendProgress(false);
                return;
              }

              if (event.data === YT.PlayerState.ENDED) {
                stopSync();
                sendProgress(true);
              }
            }
          }
        });
      };
    </script>
  </body>
</html>
''';
  }

  String _extractYoutubeId(String url) {
    final regExp = RegExp(
      r'(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})',
    );
    final match = regExp.firstMatch(url);
    return match?.group(1) ?? '';
  }

  @override
  Widget build(BuildContext context) {
    final progress = widget.video['progress'] as Map<String, dynamic>?;
    final isCompleted = progress?['completed'] == true;
    final isSkipped = progress?['skipped'] == true;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.video['title'] ?? 'Video'),
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isCompleted
                  ? const Color(0xFFECFDF5)
                  : isSkipped
                      ? const Color(0xFFFFF7ED)
                      : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isCompleted
                    ? const Color(0xFFA7F3D0)
                    : isSkipped
                        ? const Color(0xFFFED7AA)
                        : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  isCompleted
                      ? Icons.check_circle
                      : isSkipped
                          ? Icons.warning_amber_rounded
                          : Icons.play_circle_outline,
                  size: 18,
                  color: isCompleted
                      ? Colors.green
                      : isSkipped
                          ? Colors.orange
                          : const Color(0xFF2563EB),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isCompleted
                        ? 'Completed automatically after full playback.'
                        : isSkipped
                            ? 'Skipping was detected. Restart the video and watch it fully without skipping.'
                            : 'Watch the full video without skipping. Completion will happen automatically.',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: Color(0xFF475569),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: WebViewWidget(controller: _controller),
          ),
        ],
      ),
    );
  }
}
