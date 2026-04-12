import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import '../services/api_service.dart';

class CertificateProvider extends ChangeNotifier {
  List<dynamic> _certificates = [];
  bool _loading = false;

  List<dynamic> get certificates => _certificates;
  bool get loading => _loading;

  Future<void> fetchCertificates() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/certificates');
      _certificates = data['certificates'] ?? [];
      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
    }
  }

  Future<String?> downloadCertificate(String certId, String certNumber) async {
    try {
      final bytes = await ApiService.downloadBytes('/certificates/$certId/download');
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/certificate-$certNumber.pdf');
      await file.writeAsBytes(bytes);
      return file.path;
    } catch (e) {
      return null;
    }
  }
}
