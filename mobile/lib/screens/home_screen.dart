import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'dashboard_screen.dart';
import 'tasks_screen.dart';
import 'attendance_screen.dart';
import 'reports_screen.dart';
import 'certificates_screen.dart';
import 'videos_screen.dart';
import 'tests_screen.dart';
import 'ai_chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final role = auth.role;

    // ── Build screen list based on role ───────────────────────────────
    final screens = <_NavItem>[
      _NavItem(
        screen: const DashboardScreen(),
        label: 'Home',
        icon: Icons.dashboard_outlined,
        activeIcon: Icons.dashboard,
      ),
      _NavItem(
        screen: const TasksScreen(),
        label: 'Tasks',
        icon: Icons.task_outlined,
        activeIcon: Icons.task,
      ),
      _NavItem(
        screen: const AttendanceScreen(),
        label: 'Attendance',
        icon: Icons.calendar_today_outlined,
        activeIcon: Icons.calendar_today,
      ),
      _NavItem(
        screen: const ReportsScreen(),
        label: 'Reports',
        icon: Icons.description_outlined,
        activeIcon: Icons.description,
      ),
      _NavItem(
        screen: const VideosScreen(),
        label: 'Videos',
        icon: Icons.play_circle_outline,
        activeIcon: Icons.play_circle,
      ),
      _NavItem(
        screen: const TestsScreen(),
        label: 'Tests',
        icon: Icons.quiz_outlined,
        activeIcon: Icons.quiz,
      ),
      if (role == 'student')
        _NavItem(
          screen: const CertificatesScreen(),
          label: 'Certificates',
          icon: Icons.emoji_events_outlined,
          activeIcon: Icons.emoji_events,
        ),
    ];

    // Clamp index to valid range
    if (_currentIndex >= screens.length) {
      _currentIndex = 0;
    }

    final currentItem = screens[_currentIndex];

    return Scaffold(
      appBar: AppBar(
        title: Text(currentItem.label),
        actions: [
          // AI Chat button in app bar
          IconButton(
            icon: const Icon(Icons.smart_toy_outlined),
            tooltip: 'AI Chat',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AiChatScreen()),
              );
            },
          ),
          // Role chip
          Container(
            margin: const EdgeInsets.only(right: 4),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: role == 'admin'
                  ? const Color(0xFFEDE9FE)
                  : role == 'mentor'
                      ? const Color(0xFFFEF3C7)
                      : const Color(0xFFDBEAFE),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              role.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: role == 'admin'
                    ? const Color(0xFF5B21B6)
                    : role == 'mentor'
                        ? const Color(0xFF92400E)
                        : const Color(0xFF1E40AF),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
            onPressed: () async {
              await auth.logout();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens.map((s) => s.screen).toList(),
      ),
      // Show Reports FAB when on the Reports tab
      floatingActionButton: _currentIndex == 3 && role == 'student'
          ? FloatingActionButton.extended(
              onPressed: () {
                final reportsScreen = screens[3].screen;
                if (reportsScreen is ReportsScreen) {
                  ReportsScreen.showUploadDialogStatic(context);
                }
              },
              icon: const Icon(Icons.upload),
              label: const Text('Upload'),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        labelBehavior: screens.length > 6
            ? NavigationDestinationLabelBehavior.onlyShowSelected
            : NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: screens
            .map((item) => NavigationDestination(
                  icon: Icon(item.icon, size: 22),
                  selectedIcon: Icon(item.activeIcon, size: 22),
                  label: item.label,
                ))
            .toList(),
      ),
    );
  }
}

class _NavItem {
  final Widget screen;
  final String label;
  final IconData icon;
  final IconData activeIcon;
  const _NavItem({
    required this.screen,
    required this.label,
    required this.icon,
    required this.activeIcon,
  });
}
