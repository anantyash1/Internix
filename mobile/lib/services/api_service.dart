// import 'dart:convert';
// import 'dart:io';
// import 'package:http/http.dart' as http;
// import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// import '../config/api_config.dart';

// class ApiService {
//   static const _storage = FlutterSecureStorage();
//   static const String _tokenKey = 'auth_token';

//   static Future<String?> getToken() async {
//     return await _storage.read(key: _tokenKey);
//   }

//   static Future<void> setToken(String token) async {
//     await _storage.write(key: _tokenKey, value: token);
//   }

//   static Future<void> removeToken() async {
//     await _storage.delete(key: _tokenKey);
//   }

//   static Future<Map<String, String>> _headers() async {
//     final token = await getToken();
//     return {
//       'Content-Type': 'application/json',
//       if (token != null) 'Authorization': 'Bearer $token',
//     };
//   }

//   static Future<Map<String, dynamic>> get(String endpoint,
//       {Map<String, String>? queryParams}) async {
//     final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint')
//         .replace(queryParameters: queryParams);
//     final response = await http.get(uri, headers: await _headers());
//     return _handleResponse(response);
//   }

//   static Future<Map<String, dynamic>> post(String endpoint,
//       {Map<String, dynamic>? body}) async {
//     final response = await http.post(
//       Uri.parse('${ApiConfig.baseUrl}$endpoint'),
//       headers: await _headers(),
//       body: body != null ? jsonEncode(body) : null,
//     );
//     return _handleResponse(response);
//   }

//   static Future<Map<String, dynamic>> put(String endpoint,
//       {Map<String, dynamic>? body}) async {
//     final response = await http.put(
//       Uri.parse('${ApiConfig.baseUrl}$endpoint'),
//       headers: await _headers(),
//       body: body != null ? jsonEncode(body) : null,
//     );
//     return _handleResponse(response);
//   }

//   static Future<Map<String, dynamic>> delete(String endpoint) async {
//     final response = await http.delete(
//       Uri.parse('${ApiConfig.baseUrl}$endpoint'),
//       headers: await _headers(),
//     );
//     return _handleResponse(response);
//   }

//   static Future<Map<String, dynamic>> uploadFile(
//       String endpoint, File file, Map<String, String> fields) async {
//     final token = await getToken();
//     final request = http.MultipartRequest(
//       'POST',
//       Uri.parse('${ApiConfig.baseUrl}$endpoint'),
//     );
//     request.headers['Authorization'] = 'Bearer $token';
//     request.fields.addAll(fields);
//     request.files.add(await http.MultipartFile.fromPath('file', file.path));
//     final streamedResponse = await request.send();
//     final response = await http.Response.fromStream(streamedResponse);
//     return _handleResponse(response);
//   }

//   static Future<List<int>> downloadBytes(String endpoint) async {
//     final response = await http.get(
//       Uri.parse('${ApiConfig.baseUrl}$endpoint'),
//       headers: await _headers(),
//     );
//     if (response.statusCode >= 200 && response.statusCode < 300) {
//       return response.bodyBytes;
//     }
//     throw Exception('Download failed: ${response.statusCode}');
//   }

//   static Map<String, dynamic> _handleResponse(http.Response response) {
//     final body = jsonDecode(response.body);
//     if (response.statusCode >= 200 && response.statusCode < 300) {
//       return body is Map<String, dynamic> ? body : {'data': body};
//     }
//     throw Exception(body['message'] ?? 'Request failed');
//   }
// }



import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class ApiService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';

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
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint')
        .replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: await _headers());
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> post(String endpoint,
      {Map<String, dynamic>? body}) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> put(String endpoint,
      {Map<String, dynamic>? body}) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(),
    );
    return _handleResponse(response);
  }

  /// Upload a file with additional fields.
  /// [fieldName] — the form field name for the file ('photo', 'file', 'video')
  static Future<Map<String, dynamic>> uploadFile(
    String endpoint,
    File file,
    Map<String, String> fields, {
    String fieldName = 'file',
  }) async {
    final token = await getToken();
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
    );
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.fields.addAll(fields);
    request.files.add(
      await http.MultipartFile.fromPath(fieldName, file.path),
    );
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  static Future<List<int>> downloadBytes(String endpoint) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.bodyBytes;
    }
    throw Exception('Download failed: ${response.statusCode}');
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body is Map<String, dynamic> ? body : {'data': body};
    }
    throw Exception(body['message'] ?? 'Request failed');
  }
}