import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class WorkSchedule {
  final String? id;
  final String name;
  final List<String> workingDays;
  final String startTime;
  final String endTime;
  final int graceMinutes;
  final bool requirePhoto;
  final bool isActive;
  final bool isDefault;

  WorkSchedule({
    this.id,
    required this.name,
    required this.workingDays,
    required this.startTime,
    required this.endTime,
    required this.graceMinutes,
    required this.requirePhoto,
    required this.isActive,
    this.isDefault = false,
  });

  factory WorkSchedule.fromJson(Map<String, dynamic> json) => WorkSchedule(
        id: json['_id'],
        name: json['name'] ?? 'Default Schedule',
        workingDays: List<String>.from(json['workingDays'] ?? []),
        startTime: json['startTime'] ?? '09:00',
        endTime: json['endTime'] ?? '18:00',
        graceMinutes: json['graceMinutes'] ?? 15,
        requirePhoto: json['requirePhoto'] ?? true,
        isActive: json['isActive'] ?? true,
        isDefault: json['isDefault'] ?? false,
      );
}

class WorkScheduleProvider extends ChangeNotifier {
  WorkSchedule? _current;
  List<WorkSchedule> _all = [];
  bool _loading = false;
  String? _error;

  WorkScheduleProvider();

  WorkSchedule? get current => _current;
  List<WorkSchedule> get all => _all;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchSchedule({String? internshipId}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final query = internshipId != null ? '?internshipId=$internshipId' : '';
      final data = await ApiService.get('/workschedule$query');
      _current = WorkSchedule.fromJson(data['schedule']);
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAll() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/workschedule/all');
      _all = (data['schedules'] as List)
          .map((s) => WorkSchedule.fromJson(s))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> saveSchedule(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/workschedule', body: body);
      await fetchSchedule();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteSchedule(String id) async {
    try {
      await ApiService.delete('/workschedule/$id');
      _all.removeWhere((s) => s.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
