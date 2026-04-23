library file_picker;

export './src/file_picker.dart';
export './src/platform_file.dart';
export './src/file_picker_result.dart';

// Flutter's generated desktop registrant expects these classes when
// `dartPluginClass` is declared. This package uses pure-Dart platform
// selection internally, so the hooks can stay as no-ops.
class FilePickerLinux {
  static void registerWith() {}
}

class FilePickerMacOS {
  static void registerWith() {}
}

class FilePickerWindows {
  static void registerWith() {}
}
