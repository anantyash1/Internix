class ApiConfig {
  // Override with:
  // flutter run --dart-define=INTERNIX_API_BASE_URL=http://192.168.0.113:5000/api
  static const String _definedBaseUrl = String.fromEnvironment(
    'INTERNIX_API_BASE_URL',
    defaultValue: '',
  );

  // Default fallback for local development.
  static const String _fallbackBaseUrl = 'http://192.168.0.113:5000/api';

  static String get baseUrl {
    final value = _definedBaseUrl.trim();
    return value.isEmpty ? _fallbackBaseUrl : value;
  }

  static Uri apiUri(String endpoint, {Map<String, String>? queryParams}) {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$baseUrl$cleanEndpoint')
        .replace(queryParameters: queryParams);
  }

  static Uri resolveUri(String pathOrUrl) {
    final value = pathOrUrl.trim();
    if (value.isEmpty) return Uri();

    final parsed = Uri.tryParse(value);
    if (parsed != null && parsed.hasScheme) {
      return parsed;
    }

    final base = Uri.parse(baseUrl);
    final origin =
        '${base.scheme}://${base.host}${base.hasPort ? ':${base.port}' : ''}';
    final normalized = value.startsWith('/') ? value : '/$value';
    return Uri.parse('$origin$normalized');
  }
}
