import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AttendanceProvider extends ChangeNotifier {
  List<dynamic> _records = [];
  bool _loading = false;
  bool _todayMarked = false;

  List<dynamic> get records => _records;
  bool get loading => _loading;
  bool get todayMarked => _todayMarked;

  Future<void> fetchAttendance() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/attendance');
      _records = data['records'] ?? [];
      final today = DateTime.now();
      final todayStr =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      _todayMarked = _records.any((r) {
        final date = r['date']?.toString().substring(0, 10) ?? '';
        return date == todayStr;
      });
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> markAttendance() async {
    try {
      await ApiService.post('/attendance', body: {'status': 'present'});
      await fetchAttendance();
      return true;
    } catch (e) {
      return false;
    }
  }
}
