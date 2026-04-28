import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class Internship {
  final String id;
  final String title;
  final String description;
  final String department;
  final String status;
  final DateTime startDate;
  final DateTime endDate;
  final int maxStudents;
  final Map<String, dynamic>? mentor;
  final List<dynamic> students;

  Internship({
    required this.id,
    required this.title,
    required this.description,
    required this.department,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.maxStudents,
    this.mentor,
    required this.students,
  });

  factory Internship.fromJson(Map<String, dynamic> json) => Internship(
        id: json['_id'] ?? '',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        department: json['department'] ?? '',
        status: json['status'] ?? 'upcoming',
        startDate: DateTime.tryParse(json['startDate'] ?? '') ?? DateTime.now(),
        endDate: DateTime.tryParse(json['endDate'] ?? '') ?? DateTime.now(),
        maxStudents: json['maxStudents'] ?? 10,
        mentor: json['mentor'],
        students: json['students'] ?? [],
      );

  String get statusLabel {
    switch (status) {
      case 'active':    return 'Active';
      case 'completed': return 'Completed';
      default:          return 'Upcoming';
    }
  }

  int get availableSlots => maxStudents - students.length;
}

class InternshipProvider extends ChangeNotifier {
  List<Internship> _internships = [];
  bool _loading = false;
  String? _error;
  int _total = 0;

  InternshipProvider();

  List<Internship> get internships => _internships;
  bool get loading => _loading;
  String? get error => _error;
  int get total => _total;

  Future<void> fetchInternships({String? status}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final query = status != null ? '?status=$status' : '';
      final data = await ApiService.get('/internships$query');
      _internships = (data['internships'] as List)
          .map((i) => Internship.fromJson(i))
          .toList();
      _total = data['total'] ?? _internships.length;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> createInternship(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/internships', body: body);
      await fetchInternships();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> enrollStudent(String internshipId, String studentId) async {
    try {
      await ApiService.post(
        '/internships/$internshipId/enroll',
        body: {'studentId': studentId},
      );
      await fetchInternships();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteInternship(String id) async {
    try {
      await ApiService.delete('/internships/$id');
      _internships.removeWhere((i) => i.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
