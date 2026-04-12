import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider extends ChangeNotifier {
  Map<String, dynamic>? _data;
  bool _loading = false;

  Map<String, dynamic>? get data => _data;
  bool get loading => _loading;

  Future<void> fetchDashboard() async {
    _loading = true;
    notifyListeners();
    try {
      _data = await ApiService.get('/dashboard');
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }
}
