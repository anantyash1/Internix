import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class Group {
  final String id;
  final String name;
  final String description;
  final String domain;
  final String color;
  final bool isActive;
  final Map<String, dynamic>? internship;
  final Map<String, dynamic>? mentor;
  final List<dynamic> students;

  Group({
    required this.id,
    required this.name,
    required this.description,
    required this.domain,
    required this.color,
    required this.isActive,
    this.internship,
    this.mentor,
    required this.students,
  });

  factory Group.fromJson(Map<String, dynamic> json) => Group(
        id: json['_id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        domain: json['domain'] ?? '',
        color: json['color'] ?? '#2563eb',
        isActive: json['isActive'] ?? true,
        internship: json['internship'],
        mentor: json['mentor'],
        students: json['students'] ?? [],
      );
}

class GroupProvider extends ChangeNotifier {
  List<Group> _groups = [];
  bool _loading = false;
  String? _error;

  List<Group> get groups => _groups;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchGroups() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.get('/groups');
      _groups = (data['groups'] as List).map((g) => Group.fromJson(g)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> createGroup(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/groups', body: body);
      await fetchGroups();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteGroup(String id) async {
    try {
      await ApiService.delete('/groups/$id');
      _groups.removeWhere((g) => g.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> addStudent(String groupId, String studentId) async {
    try {
      await ApiService.post(
        '/groups/$groupId/add-student',
        body: {'studentId': studentId},
      );
      await fetchGroups();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
