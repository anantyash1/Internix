// import 'package:flutter/material.dart';
// import '../services/api_service.dart';

// class AttendanceProvider extends ChangeNotifier {
//   List<dynamic> _records = [];
//   bool _loading = false;
//   bool _todayMarked = false;

//   List<dynamic> get records => _records;
//   bool get loading => _loading;
//   bool get todayMarked => _todayMarked;

//   Future<void> fetchAttendance() async {
//     _loading = true;
//     notifyListeners();
//     try {
//       final data = await ApiService.get('/attendance');
//       _records = data['records'] ?? [];
//       final today = DateTime.now();
//       final todayStr =
//           '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
//       _todayMarked = _records.any((r) {
//         final date = r['date']?.toString().substring(0, 10) ?? '';
//         return date == todayStr;
//       });
//       _loading = false;
//       notifyListeners();
//     } catch (e) {
//       _loading = false;
//       notifyListeners();
//     }
//   }

//   Future<bool> markAttendance() async {
//     try {
//       await ApiService.post('/attendance', body: {'status': 'present'});
//       await fetchAttendance();
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }
// }

import 'dart:io';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AttendanceProvider extends ChangeNotifier {
  List<dynamic> _records = [];
  bool _loading = false;
  bool _submitting = false;
  Map<String, dynamic>? _schedule;
  bool _isWorkingDay = true;
  dynamic _todayRecord;

  List<dynamic> get records => _records;
  bool get loading => _loading;
  bool get submitting => _submitting;
  Map<String, dynamic>? get schedule => _schedule;
  bool get isWorkingDay => _isWorkingDay;
  dynamic get todayRecord => _todayRecord;

  bool get todayMarked => _todayRecord != null;
  bool get checkedOut => _todayRecord?['checkOutTime'] != null;

  Future<void> fetchAttendance() async {
    _loading = true;
    notifyListeners();
    try {
      final attendanceData = await ApiService.get('/attendance');
      _records = attendanceData['records'] ?? [];
    } catch (e) {
      debugPrint('Attendance fetch error: $e');
    }

    // Keep this optional so records still load even when schedule endpoint fails.
    try {
      final scheduleData = await ApiService.get('/attendance/today-schedule');
      _schedule = scheduleData['schedule'];
      _isWorkingDay = scheduleData['isWorkingDay'] ?? true;
      _todayRecord = scheduleData['todayRecord'];
    } catch (e) {
      debugPrint('Attendance schedule fetch error: $e');
      _schedule = null;
      _isWorkingDay = true;
      _todayRecord = null;
    }

    _loading = false;
    notifyListeners();
  }

  /// [photoFile] is the captured selfie image (can be null)
  Future<Map<String, dynamic>> checkIn(File? photoFile) async {
    _submitting = true;
    notifyListeners();
    try {
      // Only use uploadFile if we have a real photo file
      final data = photoFile != null && photoFile.path.isNotEmpty
          ? await ApiService.uploadFile(
              '/attendance',
              photoFile,
              {'status': 'present'},
              fieldName: 'photo',
            )
          : await ApiService.post('/attendance', body: {'status': 'present'});

      await fetchAttendance();
      _submitting = false;
      notifyListeners();
      return {'success': true, 'message': data['message'] ?? 'Checked in!'};
    } catch (e) {
      _submitting = false;
      notifyListeners();
      return {'success': false, 'message': _cleanError(e)};
    }
  }

  Future<Map<String, dynamic>> checkOut(File? photoFile) async {
    _submitting = true;
    notifyListeners();
    try {
      // Only use uploadFile if we have a real photo file
      final data = photoFile != null && photoFile.path.isNotEmpty
          ? await ApiService.uploadFile(
              '/attendance',
              photoFile,
              {},
              fieldName: 'photo',
            )
          : await ApiService.post('/attendance', body: {});

      await fetchAttendance();
      _submitting = false;
      notifyListeners();
      return {'success': true, 'message': data['message'] ?? 'Checked out!'};
    } catch (e) {
      _submitting = false;
      notifyListeners();
      return {'success': false, 'message': _cleanError(e)};
    }
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '');
  }
}
