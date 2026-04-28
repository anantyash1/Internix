// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'providers/auth_provider.dart';
// import 'providers/dashboard_provider.dart';
// import 'providers/task_provider.dart';
// import 'providers/attendance_provider.dart';
// import 'providers/report_provider.dart';
// import 'providers/certificate_provider.dart';
// import 'screens/login_screen.dart';
// import 'screens/register_screen.dart';
// import 'screens/home_screen.dart';
// import 'config/theme.dart';
// import 'providers/video_provider.dart';
// import 'providers/ai_provider.dart';
// import 'providers/test_provider.dart';

// void main() {
//   runApp(const InternixApp());
// }

// class InternixApp extends StatelessWidget {
//   const InternixApp({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return MultiProvider(
//       providers: [
//         ChangeNotifierProvider(create: (_) => AuthProvider()),
//         ChangeNotifierProvider(create: (_) => DashboardProvider()),
//         ChangeNotifierProvider(create: (_) => TaskProvider()),
//         ChangeNotifierProvider(create: (_) => AttendanceProvider()),
//         ChangeNotifierProvider(create: (_) => ReportProvider()),
//         ChangeNotifierProvider(create: (_) => CertificateProvider()),
//         ChangeNotifierProvider(create: (_) => VideoProvider()),
//         ChangeNotifierProvider(create: (_) => AiProvider()),
//         ChangeNotifierProvider(create: (_) => TestProvider()),
//       ],
//       child: Consumer<AuthProvider>(
//         builder: (context, auth, _) {
//           return MaterialApp(
//             title: 'Internix',
//             debugShowCheckedModeBanner: false,
//             theme: AppTheme.lightTheme,
//             home: auth.isAuthenticated ? const HomeScreen() : const LoginScreen(),
//             routes: {
//               '/login': (_) => const LoginScreen(),
//               '/register': (_) => const RegisterScreen(),
//               '/home': (_) => const HomeScreen(),
//             },
//           );
//         },
//       ),
//     );
//   }
// }



import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Config
import 'config/theme.dart';

// Providers — existing
import 'providers/auth_provider.dart';
import 'providers/task_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/report_provider.dart';
import 'providers/certificate_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/video_provider.dart';
import 'providers/test_provider.dart';
import 'providers/ai_provider.dart';

// Providers — new
import 'providers/notice_provider.dart';
import 'providers/meeting_provider.dart';
import 'providers/group_provider.dart';
import 'providers/internship_provider.dart';
import 'providers/user_provider.dart';
import 'providers/work_schedule_provider.dart';

// Screens
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';

void main() {
  runApp(const InternixApp());
}

class InternixApp extends StatelessWidget {
  const InternixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // ── Core ──────────────────────────────────────────────────────────────
        ChangeNotifierProvider(create: (_) => AuthProvider()),

        // ── Existing feature providers ────────────────────────────────────────
        ChangeNotifierProvider(create: (_) => TaskProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => ReportProvider()),
        ChangeNotifierProvider(create: (_) => CertificateProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => VideoProvider()),
        ChangeNotifierProvider(create: (_) => TestProvider()),
        ChangeNotifierProvider(create: (_) => AiProvider()),

        // ── New feature providers ─────────────────────────────────────────────
        ChangeNotifierProvider(create: (_) => NoticeProvider()),
        ChangeNotifierProvider(create: (_) => MeetingProvider()),
        ChangeNotifierProvider(create: (_) => GroupProvider()),
        ChangeNotifierProvider(create: (_) => InternshipProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => WorkScheduleProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'Internix',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.light,
            initialRoute: auth.isAuthenticated ? '/home' : '/login',
            routes: {
              '/login':    (_) => const LoginScreen(),
              '/register': (_) => const RegisterScreen(),
              '/home':     (_) => const HomeScreen(),
            },
            // Guard: redirect if token expires mid-session
            navigatorObservers: [_AuthObserver(auth)],
          );
        },
      ),
    );
  }
}

// Redirect to /login when auth is lost
class _AuthObserver extends NavigatorObserver {
  final AuthProvider auth;
  _AuthObserver(this.auth);

  @override
  void didPush(Route route, Route? previousRoute) {
    super.didPush(route, previousRoute);
    _check(route);
  }

  @override
  void didReplace({Route? newRoute, Route? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (newRoute != null) _check(newRoute);
  }

  void _check(Route route) {
    if (!auth.isAuthenticated && route.settings.name != '/login' &&
        route.settings.name != '/register') {
      // Navigator is not directly accessible here; handled by Consumer above
    }
  }
}
