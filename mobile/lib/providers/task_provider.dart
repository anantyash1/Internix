import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TaskProvider extends ChangeNotifier {
  List<dynamic> _tasks = [];
  bool _loading = false;

  List<dynamic> get tasks => _tasks;
  bool get loading => _loading;

  Future<void> fetchTasks() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/tasks');
      _tasks = data['tasks'] ?? [];
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> updateTaskStatus(String taskId, String status) async {
    try {
      await ApiService.put('/tasks/$taskId', body: {'status': status});
      await fetchTasks();
      return true;
    } catch (e) {
      return false;
    }
  }
}
