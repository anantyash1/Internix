import 'package:flutter/material.dart';
import '../services/api_service.dart';

class VideoProvider extends ChangeNotifier {
  List<dynamic> _videos = [];
  bool _loading = false;

  List<dynamic> get videos => _videos;
  bool get loading => _loading;

  int get completedCount =>
      _videos.where((v) => v['progress']?['completed'] == true).length;

  double get progressPercent =>
      _videos.isEmpty ? 0 : completedCount / _videos.length;

  Future<void> fetchVideos() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/videos');
      _videos = data['videos'] ?? [];
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<bool> markComplete(String videoId) async {
    try {
      await ApiService.post('/videos/$videoId/complete', body: {});
      final idx = _videos.indexWhere((v) => v['_id'] == videoId);
      if (idx != -1) {
        _videos[idx] = {
          ..._videos[idx],
          'progress': {'completed': true},
        };
        notifyListeners();
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}