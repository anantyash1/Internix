import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class ApiService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  static const Duration _requestTimeout = Duration(seconds: 30);

  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  static Future<void> setToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<void> removeToken() async {
    await _storage.delete(key: _tokenKey);
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> get(String endpoint,
      {Map<String, String>? queryParams}) async {
    try {
      final response = await http
          .get(
            ApiConfig.apiUri(endpoint, queryParams: queryParams),
            headers: await _headers(),
          )
          .timeout(_requestTimeout);
      return _handleResponse(response);
    } on SocketException {
      throw Exception(
        'Unable to connect to server. Verify API URL: ${ApiConfig.baseUrl}',
      );
    } on TimeoutException {
      throw Exception('Request timed out. Please try again.');
    }
  }

  static Future<Map<String, dynamic>> post(String endpoint,
      {Map<String, dynamic>? body}) async {
    try {
      final response = await http
          .post(
            ApiConfig.apiUri(endpoint),
            headers: await _headers(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_requestTimeout);
      return _handleResponse(response);
    } on SocketException {
      throw Exception(
        'Unable to connect to server. Verify API URL: ${ApiConfig.baseUrl}',
      );
    } on TimeoutException {
      throw Exception('Request timed out. Please try again.');
    }
  }

  static Future<Map<String, dynamic>> put(String endpoint,
      {Map<String, dynamic>? body}) async {
    try {
      final response = await http
          .put(
            ApiConfig.apiUri(endpoint),
            headers: await _headers(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_requestTimeout);
      return _handleResponse(response);
    } on SocketException {
      throw Exception(
        'Unable to connect to server. Verify API URL: ${ApiConfig.baseUrl}',
      );
    } on TimeoutException {
      throw Exception('Request timed out. Please try again.');
    }
  }

  static Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final response = await http
          .delete(
            ApiConfig.apiUri(endpoint),
            headers: await _headers(),
          )
          .timeout(_requestTimeout);
      return _handleResponse(response);
    } on SocketException {
      throw Exception(
        'Unable to connect to server. Verify API URL: ${ApiConfig.baseUrl}',
      );
    } on TimeoutException {
      throw Exception('Request timed out. Please try again.');
    }
  }

  /// Upload a file with additional fields.
  /// [fieldName] — the form field name for the file ('photo', 'file', 'video')
  static Future<Map<String, dynamic>> uploadFile(
    String endpoint,
    File file,
    Map<String, String> fields, {
    String fieldName = 'file',
  }) async {
    try {
      final token = await getToken();
      final request = http.MultipartRequest(
        'POST',
        ApiConfig.apiUri(endpoint),
      );
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.fields.addAll(fields);
      
      // Determine MIME type based on file extension
      String mimeType = 'application/octet-stream';
      final fileName = file.path.toLowerCase();
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (fileName.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (fileName.endsWith('.mp4')) {
        mimeType = 'video/mp4';
      } else if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      }
      
      final multipartFile = await http.MultipartFile.fromPath(
        fieldName, 
        file.path,
        contentType: MediaType.parse(mimeType),
      );
      request.files.add(multipartFile);
      
      final streamedResponse = await request.send().timeout(_requestTimeout);
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } on SocketException {
      throw Exception(
        'Unable to connect to server. Verify API URL: ${ApiConfig.baseUrl}',
      );
    } on TimeoutException {
      throw Exception('Upload timed out. Please try again.');
    }
  }

  static Future<List<int>> downloadBytes(String endpoint) async {
    final response = await http
        .get(
          ApiConfig.apiUri(endpoint),
          headers: await _headers(),
        )
        .timeout(_requestTimeout);
    return _extractBytesOrThrow(response);
  }

  static Future<List<int>> downloadBytesFromUrl(
    String pathOrUrl, {
    bool authenticated = false,
  }) async {
    final response = await http
        .get(
          ApiConfig.resolveUri(pathOrUrl),
          headers: authenticated ? await _headers() : null,
        )
        .timeout(_requestTimeout);
    return _extractBytesOrThrow(response);
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    dynamic body;
    if (response.body.isNotEmpty) {
      try {
        body = jsonDecode(response.body);
      } catch (_) {
        body = response.body;
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body is Map<String, dynamic> ? body : {'data': body};
    }

    final message =
        body is Map<String, dynamic> ? body['message']?.toString() : null;
    throw Exception(message ?? 'Request failed (${response.statusCode})');
  }

  static List<int> _extractBytesOrThrow(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.bodyBytes;
    }
    throw Exception('Download failed (${response.statusCode})');
  }
}
