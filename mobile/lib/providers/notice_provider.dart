import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class Notice {
  final String id;
  final String title;
  final String content;
  final String priority;
  final String type;
  final List<String> targetRoles;
  final bool isPinned;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? createdBy;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    required this.priority,
    required this.type,
    required this.targetRoles,
    required this.isPinned,
    required this.isRead,
    required this.createdAt,
    this.createdBy,
  });

  factory Notice.fromJson(Map<String, dynamic> json) => Notice(
        id: json['_id'] ?? '',
        title: json['title'] ?? '',
        content: json['content'] ?? '',
        priority: json['priority'] ?? 'medium',
        type: json['type'] ?? 'general',
        targetRoles: List<String>.from(json['targetRoles'] ?? []),
        isPinned: json['isPinned'] ?? false,
        isRead: json['isRead'] ?? false,
        createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
        createdBy: json['createdBy'],
      );
}

class NoticeProvider extends ChangeNotifier {
  List<Notice> _notices = [];
  bool _loading = false;
  String? _error;

  List<Notice> get notices => _notices;
  bool get loading => _loading;
  String? get error => _error;
  int get unreadCount => _notices.where((n) => !n.isRead).length;

  Future<void> fetchNotices() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.get('/notices');
      _notices = (data['notices'] as List).map((n) => Notice.fromJson(n)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await ApiService.put('/notices/$id/read', body: {});
      final idx = _notices.indexWhere((n) => n.id == id);
      if (idx != -1) {
        _notices[idx] = Notice(
          id: _notices[idx].id,
          title: _notices[idx].title,
          content: _notices[idx].content,
          priority: _notices[idx].priority,
          type: _notices[idx].type,
          targetRoles: _notices[idx].targetRoles,
          isPinned: _notices[idx].isPinned,
          isRead: true,
          createdAt: _notices[idx].createdAt,
          createdBy: _notices[idx].createdBy,
        );
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<bool> createNotice(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/notices', body: body);
      await fetchNotices();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteNotice(String id) async {
    try {
      await ApiService.delete('/notices/$id');
      _notices.removeWhere((n) => n.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
