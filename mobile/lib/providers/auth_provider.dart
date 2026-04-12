import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _loading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;
  String? get error => _error;
  String get role => _user?['role'] ?? 'student';

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    final token = prefs.getString('token');
    if (userData != null && token != null) {
      _user = jsonDecode(userData);
      await ApiService.setToken(token);
      notifyListeners();
    }
  }

  Future<void> _saveUser(Map<String, dynamic> user, String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
    await prefs.setString('token', token);
    await ApiService.setToken(token);
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.post('/auth/login', body: {
        'email': email,
        'password': password,
      });
      _user = data['user'];
      await _saveUser(data['user'], data['token']);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, String role) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.post('/auth/register', body: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      });
      _user = data['user'];
      await _saveUser(data['user'], data['token']);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    await prefs.remove('token');
    await ApiService.removeToken();
    _user = null;
    notifyListeners();
  }
}
