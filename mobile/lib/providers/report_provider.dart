import 'dart:io';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReportProvider extends ChangeNotifier {
  List<dynamic> _reports = [];
  bool _loading = false;

  List<dynamic> get reports => _reports;
  bool get loading => _loading;

  Future<void> fetchReports() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/reports');
      _reports = data['reports'] ?? [];
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> uploadReport(String title, String description, File file) async {
    try {
      await ApiService.uploadFile('/reports', file, {
        'title': title,
        'description': description,
      });
      await fetchReports();
      return true;
    } catch (e) {
      return false;
    }
  }
}
