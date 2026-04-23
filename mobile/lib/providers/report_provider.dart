import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../services/api_service.dart';

class ReportProvider extends ChangeNotifier {
  List<dynamic> _reports = [];
  bool _loading = false;
  String? _error;

  List<dynamic> get reports => _reports;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchReports() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.get('/reports');
      _reports = data['reports'] ?? [];
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }
    _loading = false;
    notifyListeners();
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
      _error = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<String?> downloadReportFile(
    String pathOrUrl, {
    String fallbackName = 'report',
  }) async {
    try {
      final bytes = await ApiService.downloadBytesFromUrl(
        pathOrUrl,
        authenticated: true,
      );
      final dir = await getApplicationDocumentsDirectory();
      final extension = _extractExtension(pathOrUrl);
      final safeName = _sanitizeFileName(fallbackName);
      final file = File(
        '${dir.path}/$safeName-${DateTime.now().millisecondsSinceEpoch}$extension',
      );
      await file.writeAsBytes(bytes, flush: true);
      return file.path;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return null;
    }
  }

  String _extractExtension(String pathOrUrl) {
    final uri = Uri.tryParse(pathOrUrl);
    final ext = p.extension(uri?.path ?? pathOrUrl);
    if (ext.isEmpty) return '.pdf';
    return ext;
  }

  String _sanitizeFileName(String value) {
    final cleaned = value.replaceAll(RegExp(r'[^a-zA-Z0-9-_ ]'), '').trim();
    if (cleaned.isEmpty) return 'report';
    return cleaned.replaceAll(RegExp(r'\s+'), '_');
  }
}
