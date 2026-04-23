import 'package:flutter/material.dart';
import '../services/api_service.dart';

class VideoProvider extends ChangeNotifier {
  List<dynamic> _videos = [];
  bool _loading = false;
  String? _error;

  List<dynamic> get videos => _videos;
  bool get loading => _loading;
  String? get error => _error;

  int get completedCount =>
      _videos.where((v) => v['progress']?['completed'] == true).length;

  double get progressPercent =>
      _videos.isEmpty ? 0 : completedCount / _videos.length;

  Future<void> fetchVideos() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.get('/videos');
      _videos = data['videos'] ?? [];
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }
    _loading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> syncProgress(
    String videoId,
    Map<String, dynamic> payload,
  ) async {
    try {
      final data = await ApiService.post(
        '/videos/$videoId/progress',
        body: payload,
      );
      final idx = _videos.indexWhere((v) => v['_id'] == videoId);
      if (idx != -1 && data['progress'] != null) {
        _videos[idx] = {
          ..._videos[idx],
          'progress': data['progress'],
        };
        notifyListeners();
      }
      return data['progress'] as Map<String, dynamic>?;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return null;
    }
  }
}
