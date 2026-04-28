import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final String phone;
  final bool isActive;
  final Map<String, dynamic>? mentor;
  final Map<String, dynamic>? internship;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.phone,
    required this.isActive,
    this.mentor,
    this.internship,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['_id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        role: json['role'] ?? 'student',
        phone: json['phone'] ?? '',
        isActive: json['isActive'] ?? true,
        mentor: json['mentor'],
        internship: json['internship'],
      );

  String get roleLabel => role[0].toUpperCase() + role.substring(1);
  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class UserProvider extends ChangeNotifier {
  List<AppUser> _users = [];
  bool _loading = false;
  String? _error;
  int _total = 0;

  UserProvider();

  List<AppUser> get users => _users;
  bool get loading => _loading;
  String? get error => _error;
  int get total => _total;

  Future<void> fetchUsers({String? role, String? search}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final params = <String>[];
      if (role != null) params.add('role=$role');
      if (search != null && search.isNotEmpty) params.add('search=$search');
      final query = params.isNotEmpty ? '?${params.join('&')}' : '';
      final data = await ApiService.get('/users$query');
      _users = (data['users'] as List).map((u) => AppUser.fromJson(u)).toList();
      _total = data['total'] ?? _users.length;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> updateUser(String id, Map<String, dynamic> body) async {
    try {
      await ApiService.put('/users/$id', body: body);
      await fetchUsers();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> resetPassword(String id, String newPassword) async {
    try {
      await ApiService.put(
        '/users/$id/reset-password',
        body: {'newPassword': newPassword},
      );
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> assignMentor(String studentId, String mentorId) async {
    try {
      await ApiService.post(
        '/users/assign-mentor',
        body: {
          'studentId': studentId,
          'mentorId': mentorId,
        },
      );
      await fetchUsers();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteUser(String id) async {
    try {
      await ApiService.delete('/users/$id');
      _users.removeWhere((u) => u.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> onboardStudent(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/onboarding/student', body: body);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<List<AppUser>> fetchMentors() async {
    try {
      final data = await ApiService.get('/onboarding/mentors');
      return (data['mentors'] as List).map((m) => AppUser.fromJson(m)).toList();
    } catch (_) {
      return [];
    }
  }
}
