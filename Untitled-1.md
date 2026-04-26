# File Tree: Internix

**Generated:** 4/23/2026, 8:56:09 PM
**Root Path:** `c:\Users\anant\OneDrive\Desktop\internix\Internix`

```
├── 📁 backend
│   ├── 📁 src
│   │   ├── 📁 config
│   │   │   ├── 📄 cloudinary.js
│   │   │   └── 📄 db.js
│   │   ├── 📁 controllers
│   │   │   ├── 📄 ai.controller.js
│   │   │   ├── 📄 attendance.controller.js
│   │   │   ├── 📄 auth.controller.js
│   │   │   ├── 📄 certificate.controller.js
│   │   │   ├── 📄 dashboard.controller.js
│   │   │   ├── 📄 group.controller.js
│   │   │   ├── 📄 internship.controller.js
│   │   │   ├── 📄 notice.controller.js
│   │   │   ├── 📄 onboarding.controller.js
│   │   │   ├── 📄 report.controller.js
│   │   │   ├── 📄 task.controller.js
│   │   │   ├── 📄 test.controller.js
│   │   │   ├── 📄 user.controller.js
│   │   │   ├── 📄 video.controller.js
│   │   │   └── 📄 workschedule.controller.js
│   │   ├── 📁 middleware
│   │   │   ├── 📄 auth.middleware.js
│   │   │   ├── 📄 error.middleware.js
│   │   │   ├── 📄 upload.middleware.js
│   │   │   └── 📄 validate.middleware.js
│   │   ├── 📁 models
│   │   │   ├── 📄 Attendance.js
│   │   │   ├── 📄 Attendance2.js
│   │   │   ├── 📄 Certificate.js
│   │   │   ├── 📄 Group.js
│   │   │   ├── 📄 Internship.js
│   │   │   ├── 📄 Notice.js
│   │   │   ├── 📄 Report.js
│   │   │   ├── 📄 Task.js
│   │   │   ├── 📄 Test.js
│   │   │   ├── 📄 TestSubmission.js
│   │   │   ├── 📄 User.js
│   │   │   ├── 📄 Video.js
│   │   │   ├── 📄 VideoProgress.js
│   │   │   └── 📄 WorkSchedule.js
│   │   ├── 📁 routes
│   │   │   ├── 📄 Workschedule.js
│   │   │   ├── 📄 ai.routes.js
│   │   │   ├── 📄 attendance.routes.js
│   │   │   ├── 📄 auth.routes.js
│   │   │   ├── 📄 certificate.routes.js
│   │   │   ├── 📄 dashboard.routes.js
│   │   │   ├── 📄 group.routes.js
│   │   │   ├── 📄 internship.routes.js
│   │   │   ├── 📄 notice.routes.js
│   │   │   ├── 📄 onboarding.js
│   │   │   ├── 📄 report.routes.js
│   │   │   ├── 📄 task.routes.js
│   │   │   ├── 📄 test.routes.js
│   │   │   ├── 📄 user.routes.js
│   │   │   └── 📄 video.routes.js
│   │   ├── 📁 utils
│   │   │   ├── 📄 generateCertificate.js
│   │   │   ├── 📄 generateToken.js
│   │   │   └── 📄 seed.js
│   │   ├── 📁 validators
│   │   │   ├── 📄 auth.validator.js
│   │   │   └── 📄 task.validator.js
│   │   ├── 📄 app.js
│   │   └── 📄 server.js
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitignore
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
├── 📁 mobile
│   ├── 📁 .dart_tool
│   │   ├── 📁 extension_discovery
│   │   │   └── ⚙️ vs_code.json
│   │   ├── 📁 flutter_build
│   │   │   ├── 📁 2e2501ae8e576a68c38272dbd3f6860c
│   │   │   │   ├── ⚙️ .filecache
│   │   │   │   ├── 📄 app.dill
│   │   │   │   ├── 📄 dart_build.d
│   │   │   │   ├── 📄 dart_build.stamp
│   │   │   │   ├── ⚙️ dart_build_result.json
│   │   │   │   ├── 📄 debug_android_application.stamp
│   │   │   │   ├── 📄 flutter_assets.d
│   │   │   │   ├── 📄 gen_dart_plugin_registrant.stamp
│   │   │   │   ├── 📄 gen_localizations.stamp
│   │   │   │   ├── 📄 install_code_assets.d
│   │   │   │   ├── 📄 install_code_assets.stamp
│   │   │   │   ├── 📄 kernel_snapshot_program.d
│   │   │   │   ├── 📄 kernel_snapshot_program.stamp
│   │   │   │   ├── ⚙️ native_assets.json
│   │   │   │   └── ⚙️ outputs.json
│   │   │   ├── 📁 c932ec8fde426d4009f25646362e9060
│   │   │   │   ├── ⚙️ .filecache
│   │   │   │   ├── 📄 app.dill
│   │   │   │   ├── 📄 dart_build.d
│   │   │   │   ├── 📄 dart_build.stamp
│   │   │   │   ├── ⚙️ dart_build_result.json
│   │   │   │   ├── 📄 debug_android_application.stamp
│   │   │   │   ├── 📄 flutter_assets.d
│   │   │   │   ├── 📄 gen_dart_plugin_registrant.stamp
│   │   │   │   ├── 📄 gen_localizations.stamp
│   │   │   │   ├── 📄 install_code_assets.d
│   │   │   │   ├── 📄 install_code_assets.stamp
│   │   │   │   ├── 📄 kernel_snapshot_program.d
│   │   │   │   ├── 📄 kernel_snapshot_program.stamp
│   │   │   │   ├── ⚙️ native_assets.json
│   │   │   │   └── ⚙️ outputs.json
│   │   │   └── 📄 dart_plugin_registrant.dart
│   │   ├── 📁 hooks_runner
│   │   │   ├── 📁 objective_c
│   │   │   │   ├── 📁 38c9b2219b
│   │   │   │   │   ├── ⚙️ .lock
│   │   │   │   │   ├── ⚙️ dependencies.dependencies_hash_file.json
│   │   │   │   │   ├── ⚙️ hook.dependencies_hash_file.json
│   │   │   │   │   ├── 📄 hook.dill
│   │   │   │   │   ├── 📄 hook.dill.d
│   │   │   │   │   ├── ⚙️ input.json
│   │   │   │   │   ├── ⚙️ output.json
│   │   │   │   │   ├── 📄 stderr.txt
│   │   │   │   │   └── 📄 stdout.txt
│   │   │   │   ├── 📁 7e89d2e4d8
│   │   │   │   │   ├── ⚙️ .lock
│   │   │   │   │   ├── ⚙️ dependencies.dependencies_hash_file.json
│   │   │   │   │   ├── ⚙️ hook.dependencies_hash_file.json
│   │   │   │   │   ├── 📄 hook.dill
│   │   │   │   │   ├── 📄 hook.dill.d
│   │   │   │   │   ├── ⚙️ input.json
│   │   │   │   │   ├── ⚙️ output.json
│   │   │   │   │   ├── 📄 stderr.txt
│   │   │   │   │   └── 📄 stdout.txt
│   │   │   │   └── 📁 f1dfd3119a
│   │   │   │       ├── ⚙️ .lock
│   │   │   │       ├── ⚙️ dependencies.dependencies_hash_file.json
│   │   │   │       ├── ⚙️ hook.dependencies_hash_file.json
│   │   │   │       ├── 📄 hook.dill
│   │   │   │       ├── 📄 hook.dill.d
│   │   │   │       ├── ⚙️ input.json
│   │   │   │       ├── ⚙️ output.json
│   │   │   │       ├── 📄 stderr.txt
│   │   │   │       └── 📄 stdout.txt
│   │   │   └── 📁 shared
│   │   │       └── 📁 objective_c
│   │   │           └── ⚙️ .lock
│   │   ├── ⚙️ package_config.json
│   │   ├── ⚙️ package_graph.json
│   │   └── 📄 version
│   ├── 📁 android
│   │   ├── 📁 .gradle
│   │   │   ├── 📁 8.14
│   │   │   │   ├── 📁 checksums
│   │   │   │   │   ├── 📄 checksums.lock
│   │   │   │   │   ├── ⚙️ md5-checksums.bin
│   │   │   │   │   └── ⚙️ sha1-checksums.bin
│   │   │   │   ├── 📁 executionHistory
│   │   │   │   │   ├── ⚙️ executionHistory.bin
│   │   │   │   │   └── 📄 executionHistory.lock
│   │   │   │   ├── 📁 expanded
│   │   │   │   ├── 📁 fileChanges
│   │   │   │   │   └── ⚙️ last-build.bin
│   │   │   │   ├── 📁 fileHashes
│   │   │   │   │   ├── ⚙️ fileHashes.bin
│   │   │   │   │   ├── 📄 fileHashes.lock
│   │   │   │   │   └── ⚙️ resourceHashesCache.bin
│   │   │   │   ├── 📁 vcsMetadata
│   │   │   │   └── 📄 gc.properties
│   │   │   ├── 📁 buildOutputCleanup
│   │   │   │   ├── 📄 buildOutputCleanup.lock
│   │   │   │   ├── 📄 cache.properties
│   │   │   │   └── ⚙️ outputFiles.bin
│   │   │   ├── 📁 noVersion
│   │   │   │   └── 📄 buildLogic.lock
│   │   │   ├── 📁 vcs-1
│   │   │   │   └── 📄 gc.properties
│   │   │   └── 📄 file-system.probe
│   │   ├── 📁 .kotlin
│   │   │   └── 📁 sessions
│   │   ├── 📁 app
│   │   │   ├── 📁 src
│   │   │   │   ├── 📁 debug
│   │   │   │   │   └── ⚙️ AndroidManifest.xml
│   │   │   │   ├── 📁 main
│   │   │   │   │   ├── 📁 java
│   │   │   │   │   │   └── 📁 io
│   │   │   │   │   │       └── 📁 flutter
│   │   │   │   │   │           └── 📁 plugins
│   │   │   │   │   │               └── ☕ GeneratedPluginRegistrant.java
│   │   │   │   │   ├── 📁 kotlin
│   │   │   │   │   │   └── 📁 com
│   │   │   │   │   │       └── 📁 example
│   │   │   │   │   │           └── 📁 internix_mobile
│   │   │   │   │   │               └── ☕ MainActivity.kt
│   │   │   │   │   ├── 📁 res
│   │   │   │   │   │   ├── 📁 drawable
│   │   │   │   │   │   │   └── ⚙️ launch_background.xml
│   │   │   │   │   │   ├── 📁 drawable-v21
│   │   │   │   │   │   │   └── ⚙️ launch_background.xml
│   │   │   │   │   │   ├── 📁 mipmap-hdpi
│   │   │   │   │   │   │   └── 🖼️ ic_launcher.png
│   │   │   │   │   │   ├── 📁 mipmap-mdpi
│   │   │   │   │   │   │   └── 🖼️ ic_launcher.png
│   │   │   │   │   │   ├── 📁 mipmap-xhdpi
│   │   │   │   │   │   │   └── 🖼️ ic_launcher.png
│   │   │   │   │   │   ├── 📁 mipmap-xxhdpi
│   │   │   │   │   │   │   └── 🖼️ ic_launcher.png
│   │   │   │   │   │   ├── 📁 mipmap-xxxhdpi
│   │   │   │   │   │   │   └── 🖼️ ic_launcher.png
│   │   │   │   │   │   ├── 📁 values
│   │   │   │   │   │   │   └── ⚙️ styles.xml
│   │   │   │   │   │   └── 📁 values-night
│   │   │   │   │   │       └── ⚙️ styles.xml
│   │   │   │   │   └── ⚙️ AndroidManifest.xml
│   │   │   │   └── 📁 profile
│   │   │   │       └── ⚙️ AndroidManifest.xml
│   │   │   └── 📄 build.gradle.kts
│   │   ├── 📁 gradle
│   │   │   └── 📁 wrapper
│   │   │       ├── 📄 gradle-wrapper.jar
│   │   │       └── 📄 gradle-wrapper.properties
│   │   ├── ⚙️ .gitignore
│   │   ├── 📄 build.gradle.kts
│   │   ├── 📄 gradle.properties
│   │   ├── 📄 gradlew
│   │   ├── 📄 gradlew.bat
│   │   ├── 📄 internix_mobile_android.iml
│   │   ├── 📄 local.properties
│   │   └── 📄 settings.gradle.kts
│   ├── 📁 lib
│   │   ├── 📁 config
│   │   │   ├── 📄 api_config.dart
│   │   │   └── 📄 theme.dart
│   │   ├── 📁 providers
│   │   │   ├── 📄 ai_provider.dart
│   │   │   ├── 📄 attendance_provider.dart
│   │   │   ├── 📄 auth_provider.dart
│   │   │   ├── 📄 certificate_provider.dart
│   │   │   ├── 📄 dashboard_provider.dart
│   │   │   ├── 📄 report_provider.dart
│   │   │   ├── 📄 task_provider.dart
│   │   │   ├── 📄 test_provider.dart
│   │   │   └── 📄 video_provider.dart
│   │   ├── 📁 screens
│   │   │   ├── 📄 ai_chat_screen.dart
│   │   │   ├── 📄 attendance_screen.dart
│   │   │   ├── 📄 certificates_screen.dart
│   │   │   ├── 📄 dashboard_screen.dart
│   │   │   ├── 📄 home_screen.dart
│   │   │   ├── 📄 login_screen.dart
│   │   │   ├── 📄 register_screen.dart
│   │   │   ├── 📄 reports_screen.dart
│   │   │   ├── 📄 tasks_screen.dart
│   │   │   ├── 📄 tests_screen.dart
│   │   │   └── 📄 videos_screen.dart
│   │   ├── 📁 services
│   │   │   └── 📄 api_service.dart
│   │   └── 📄 main.dart
│   ├── 📁 vendor
│   │   └── 📁 file_picker
│   │       ├── 📁 .dart_tool
│   │       │   ├── 📁 extension_discovery
│   │       │   │   └── ⚙️ vs_code.json
│   │       │   ├── ⚙️ package_config.json
│   │       │   ├── ⚙️ package_graph.json
│   │       │   └── 📄 version
│   │       ├── 📁 android
│   │       │   ├── 📁 gradle
│   │       │   │   └── 📁 wrapper
│   │       │   │       └── 📄 gradle-wrapper.properties
│   │       │   ├── 📁 src
│   │       │   │   └── 📁 main
│   │       │   │       ├── 📁 java
│   │       │   │       │   └── 📁 com
│   │       │   │       │       └── 📁 mr
│   │       │   │       │           └── 📁 flutter
│   │       │   │       └── ⚙️ AndroidManifest.xml
│   │       │   ├── 📄 build.gradle
│   │       │   ├── 📄 gradle.properties
│   │       │   └── 📄 settings.gradle
│   │       ├── 📁 example
│   │       │   ├── 📁 android
│   │       │   │   ├── 📁 app
│   │       │   │   │   ├── 📁 src
│   │       │   │   │   │   ├── 📁 debug
│   │       │   │   │   │   │   └── ⚙️ AndroidManifest.xml
│   │       │   │   │   │   ├── 📁 main
│   │       │   │   │   │   │   ├── 📁 java
│   │       │   │   │   │   │   │   └── 📁 com
│   │       │   │   │   │   │   ├── 📁 kotlin
│   │       │   │   │   │   │   │   └── 📁 com
│   │       │   │   │   │   │   ├── 📁 res
│   │       │   │   │   │   │   │   ├── 📁 drawable
│   │       │   │   │   │   │   │   ├── 📁 drawable-v21
│   │       │   │   │   │   │   │   ├── 📁 mipmap-hdpi
│   │       │   │   │   │   │   │   ├── 📁 mipmap-mdpi
│   │       │   │   │   │   │   │   ├── 📁 mipmap-xhdpi
│   │       │   │   │   │   │   │   ├── 📁 mipmap-xxhdpi
│   │       │   │   │   │   │   │   ├── 📁 mipmap-xxxhdpi
│   │       │   │   │   │   │   │   ├── 📁 values
│   │       │   │   │   │   │   │   └── 📁 values-night
│   │       │   │   │   │   │   └── ⚙️ AndroidManifest.xml
│   │       │   │   │   │   └── 📁 profile
│   │       │   │   │   │       └── ⚙️ AndroidManifest.xml
│   │       │   │   │   └── 📄 build.gradle
│   │       │   │   ├── 📁 gradle
│   │       │   │   │   └── 📁 wrapper
│   │       │   │   │       └── 📄 gradle-wrapper.properties
│   │       │   │   ├── 📄 build.gradle
│   │       │   │   ├── 📄 gradle.properties
│   │       │   │   ├── 📄 settings.gradle
│   │       │   │   └── 📄 settings_aar.gradle
│   │       │   ├── 📁 ios
│   │       │   │   ├── 📁 Flutter
│   │       │   │   │   ├── 📄 AppFrameworkInfo.plist
│   │       │   │   │   ├── 📄 Debug.xcconfig
│   │       │   │   │   └── 📄 Release.xcconfig
│   │       │   │   ├── 📁 Runner
│   │       │   │   │   ├── 📁 Assets.xcassets
│   │       │   │   │   │   ├── 📁 AppIcon.appiconset
│   │       │   │   │   │   │   ├── ⚙️ Contents.json
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-1024x1024@1x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-20x20@1x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-20x20@2x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-20x20@3x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-29x29@1x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-29x29@2x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-29x29@3x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-40x40@1x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-40x40@2x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-40x40@3x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-60x60@2x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-60x60@3x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-76x76@1x.png
│   │       │   │   │   │   │   ├── 🖼️ Icon-App-76x76@2x.png
│   │       │   │   │   │   │   └── 🖼️ Icon-App-83.5x83.5@2x.png
│   │       │   │   │   │   └── 📁 LaunchImage.imageset
│   │       │   │   │   │       ├── ⚙️ Contents.json
│   │       │   │   │   │       ├── 🖼️ LaunchImage.png
│   │       │   │   │   │       ├── 🖼️ LaunchImage@2x.png
│   │       │   │   │   │       ├── 🖼️ LaunchImage@3x.png
│   │       │   │   │   │       └── 📝 README.md
│   │       │   │   │   ├── 📁 Base.lproj
│   │       │   │   │   │   ├── 📄 LaunchScreen.storyboard
│   │       │   │   │   │   └── 📄 Main.storyboard
│   │       │   │   │   ├── ⚡ AppDelegate.h
│   │       │   │   │   ├── 📄 AppDelegate.m
│   │       │   │   │   ├── 🍎 AppDelegate.swift
│   │       │   │   │   ├── 🍎 File.swift
│   │       │   │   │   ├── 📄 Info.plist
│   │       │   │   │   ├── ⚡ Runner-Bridging-Header.h
│   │       │   │   │   └── 📄 main.m
│   │       │   │   ├── 📁 Runner.xcodeproj
│   │       │   │   │   ├── 📁 project.xcworkspace
│   │       │   │   │   │   ├── 📁 xcshareddata
│   │       │   │   │   │   │   ├── 📄 IDEWorkspaceChecks.plist
│   │       │   │   │   │   │   └── 📄 WorkspaceSettings.xcsettings
│   │       │   │   │   │   └── 📄 contents.xcworkspacedata
│   │       │   │   │   ├── 📁 xcshareddata
│   │       │   │   │   │   └── 📁 xcschemes
│   │       │   │   │   │       └── 📄 Runner.xcscheme
│   │       │   │   │   └── 📄 project.pbxproj
│   │       │   │   ├── 📁 Runner.xcworkspace
│   │       │   │   │   ├── 📁 xcshareddata
│   │       │   │   │   │   ├── 📄 IDEWorkspaceChecks.plist
│   │       │   │   │   │   └── 📄 WorkspaceSettings.xcsettings
│   │       │   │   │   └── 📄 contents.xcworkspacedata
│   │       │   │   ├── 📄 Podfile
│   │       │   │   └── 📄 gpxgenerator_path.gpx
│   │       │   ├── 📁 lib
│   │       │   │   ├── 📁 src
│   │       │   │   │   └── 📄 file_picker_demo.dart
│   │       │   │   ├── 📄 generated_plugin_registrant.dart
│   │       │   │   ├── 📄 main.dart
│   │       │   │   └── 📄 main_desktop.dart
│   │       │   ├── 📁 linux
│   │       │   │   ├── 📁 flutter
│   │       │   │   │   ├── 📄 CMakeLists.txt
│   │       │   │   │   ├── ⚡ generated_plugin_registrant.cc
│   │       │   │   │   ├── ⚡ generated_plugin_registrant.h
│   │       │   │   │   └── 📄 generated_plugins.cmake
│   │       │   │   ├── 📄 CMakeLists.txt
│   │       │   │   ├── ⚡ main.cc
│   │       │   │   ├── ⚡ my_application.cc
│   │       │   │   └── ⚡ my_application.h
│   │       │   ├── 📁 screenshots
│   │       │   │   ├── 🖼️ example_android.gif
│   │       │   │   ├── 🖼️ example_ios.gif
│   │       │   │   ├── 🖼️ example_linux.gif
│   │       │   │   ├── 🖼️ example_macos.png
│   │       │   │   └── 🖼️ example_windows.gif
│   │       │   ├── 📁 web
│   │       │   │   ├── 📁 icons
│   │       │   │   │   ├── 🖼️ Icon-192.png
│   │       │   │   │   └── 🖼️ Icon-512.png
│   │       │   │   ├── 🖼️ favicon.png
│   │       │   │   ├── 🌐 index.html
│   │       │   │   └── ⚙️ manifest.json
│   │       │   ├── 📁 windows
│   │       │   │   ├── 📁 flutter
│   │       │   │   │   ├── 📄 CMakeLists.txt
│   │       │   │   │   ├── ⚡ generated_plugin_registrant.cc
│   │       │   │   │   ├── ⚡ generated_plugin_registrant.h
│   │       │   │   │   └── 📄 generated_plugins.cmake
│   │       │   │   ├── 📁 runner
│   │       │   │   │   ├── 📁 resources
│   │       │   │   │   │   └── 📄 app_icon.ico
│   │       │   │   │   ├── 📄 CMakeLists.txt
│   │       │   │   │   ├── 📄 Runner.rc
│   │       │   │   │   ├── ⚡ flutter_window.cpp
│   │       │   │   │   ├── ⚡ flutter_window.h
│   │       │   │   │   ├── ⚡ main.cpp
│   │       │   │   │   ├── ⚡ resource.h
│   │       │   │   │   ├── 📄 runner.exe.manifest
│   │       │   │   │   ├── ⚡ utils.cpp
│   │       │   │   │   ├── ⚡ utils.h
│   │       │   │   │   ├── ⚡ win32_window.cpp
│   │       │   │   │   └── ⚡ win32_window.h
│   │       │   │   └── 📄 CMakeLists.txt
│   │       │   ├── 📝 README.md
│   │       │   ├── ⚙️ analysis_options.yaml
│   │       │   └── ⚙️ pubspec.yaml
│   │       ├── 📁 go
│   │       │   ├── 📝 README.md
│   │       │   ├── 🐹 file_darwin.go
│   │       │   ├── 🐹 file_linux.go
│   │       │   ├── 🐹 file_unsupported.go
│   │       │   ├── 🐹 file_windows.go
│   │       │   ├── 📄 go.mod
│   │       │   ├── 📄 go.sum
│   │       │   ├── 📄 import.go.tmpl
│   │       │   └── 🐹 plugin.go
│   │       ├── 📁 ios
│   │       │   ├── 📁 Classes
│   │       │   │   ├── ⚡ FileInfo.h
│   │       │   │   ├── 📄 FileInfo.m
│   │       │   │   ├── ⚡ FilePickerPlugin.h
│   │       │   │   ├── 📄 FilePickerPlugin.m
│   │       │   │   ├── ⚡ FileUtils.h
│   │       │   │   ├── 📄 FileUtils.m
│   │       │   │   ├── ⚡ ImageUtils.h
│   │       │   │   └── 📄 ImageUtils.m
│   │       │   └── 📄 file_picker.podspec
│   │       ├── 📁 lib
│   │       │   ├── 📁 _internal
│   │       │   │   └── 📄 file_picker_web.dart
│   │       │   ├── 📁 src
│   │       │   │   ├── 📁 linux
│   │       │   │   │   ├── 📄 dialog_handler.dart
│   │       │   │   │   ├── 📄 file_picker_linux.dart
│   │       │   │   │   ├── 📄 kdialog_handler.dart
│   │       │   │   │   └── 📄 qarma_and_zenity_handler.dart
│   │       │   │   ├── 📁 windows
│   │       │   │   │   ├── 📄 file_picker_windows.dart
│   │       │   │   │   ├── 📄 file_picker_windows_ffi_types.dart
│   │       │   │   │   └── 📄 stub.dart
│   │       │   │   ├── 📄 exceptions.dart
│   │       │   │   ├── 📄 file_picker.dart
│   │       │   │   ├── 📄 file_picker_io.dart
│   │       │   │   ├── 📄 file_picker_macos.dart
│   │       │   │   ├── 📄 file_picker_result.dart
│   │       │   │   ├── 📄 platform_file.dart
│   │       │   │   └── 📄 utils.dart
│   │       │   └── 📄 file_picker.dart
│   │       ├── 📁 test
│   │       │   ├── 📁 linux
│   │       │   │   ├── 📄 dialog_handler_test.dart
│   │       │   │   ├── 📄 kdialog_handler_test.dart
│   │       │   │   └── 📄 qarma_and_zenity_handler_test.dart
│   │       │   ├── 📁 test_files
│   │       │   │   ├── 🖼️ franz-michael-schneeberger-unsplash.jpg
│   │       │   │   ├── 📕 test.pdf
│   │       │   │   └── ⚙️ test.yml
│   │       │   ├── 📄 common.dart
│   │       │   ├── 📄 file_picker_macos_test.dart
│   │       │   ├── 📄 file_picker_utils_test.dart
│   │       │   └── 📄 file_picker_windows_test.dart
│   │       ├── 📝 CHANGELOG.md
│   │       ├── 📝 CONTRIBUTING.md
│   │       ├── 📄 LICENSE
│   │       ├── 📝 README.md
│   │       ├── ⚙️ analysis_options.yaml
│   │       ├── 📄 pubspec.lock
│   │       └── ⚙️ pubspec.yaml
│   ├── ⚙️ .flutter-plugins-dependencies
│   ├── ⚙️ .gitignore
│   ├── ⚙️ .metadata
│   ├── 📝 README.md
│   ├── ⚙️ analysis_options.yaml
│   ├── 📄 internix_mobile.iml
│   ├── 📄 pubspec.lock
│   └── ⚙️ pubspec.yaml
├── 📁 web
│   ├── 📁 public
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 components
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 LoadingSpinner.jsx
│   │   │   │   ├── 📄 Modal.jsx
│   │   │   │   └── 📄 StatCard.jsx
│   │   │   ├── 📄 AIAssistant.jsx
│   │   │   ├── 📄 CameraCapture.jsx
│   │   │   ├── 📄 Header.jsx
│   │   │   ├── 📄 Layout.jsx
│   │   │   ├── 📄 NoticeBoard.jsx
│   │   │   ├── 📄 Sidebar.jsx
│   │   │   └── 📄 VideoPlayer.jsx
│   │   ├── 📁 lib
│   │   │   └── 📄 axios.js
│   │   ├── 📁 pages
│   │   │   ├── 📄 AttendancePage.jsx
│   │   │   ├── 📄 CertificatesPage.jsx
│   │   │   ├── 📄 DashboardPage.jsx
│   │   │   ├── 📄 GroupsPage.jsx
│   │   │   ├── 📄 InternshipsPage.jsx
│   │   │   ├── 📄 LoginPage.jsx
│   │   │   ├── 📄 MntorSummaryPage.jsx
│   │   │   ├── 📄 NoticesPage.jsx
│   │   │   ├── 📄 OnboardingPage.jsx
│   │   │   ├── 📄 RegisterPage.jsx
│   │   │   ├── 📄 ReportsPage.jsx
│   │   │   ├── 📄 TasksPage.jsx
│   │   │   ├── 📄 TestsPage.jsx
│   │   │   ├── 📄 UsersPage.jsx
│   │   │   ├── 📄 VideosPage.jsx
│   │   │   └── 📄 WorkSchedulePage.jsx
│   │   ├── 📁 store
│   │   │   ├── 📄 aiStore.js
│   │   │   ├── 📄 authStore.js
│   │   │   ├── 📄 dashboardStore.js
│   │   │   ├── 📄 groupStore.js
│   │   │   ├── 📄 noticeStore.js
│   │   │   ├── 📄 taskStore.js
│   │   │   ├── 📄 testStore.js
│   │   │   ├── 📄 userStore.js
│   │   │   └── 📄 videoStore.js
│   │   ├── 📄 App.jsx
│   │   ├── 🎨 index.css
│   │   └── 📄 main.jsx
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitignore
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
├── 📝 ATTENDANCE_FIXES.md
├── 📝 README.md
├── 📝 SETUP.md
└── ⚙️ package.json
```

---
*Generated by FileTree Pro Extension*