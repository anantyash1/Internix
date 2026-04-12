import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'dashboard_screen.dart';
import 'tasks_screen.dart';
import 'attendance_screen.dart';
import 'reports_screen.dart';
import 'certificates_screen.dart';

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

    final screens = <Widget>[
      const DashboardScreen(),
      const TasksScreen(),
      const AttendanceScreen(),
      const ReportsScreen(),
      if (role == 'student') const CertificatesScreen(),
    ];

    final navItems = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(
        icon: Icon(Icons.dashboard_outlined),
        activeIcon: Icon(Icons.dashboard),
        label: 'Dashboard',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.task_outlined),
        activeIcon: Icon(Icons.task),
        label: 'Tasks',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.calendar_today_outlined),
        activeIcon: Icon(Icons.calendar_today),
        label: 'Attendance',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.description_outlined),
        activeIcon: Icon(Icons.description),
        label: 'Reports',
      ),
      if (role == 'student')
        const BottomNavigationBarItem(
          icon: Icon(Icons.emoji_events_outlined),
          activeIcon: Icon(Icons.emoji_events),
          label: 'Certificates',
        ),
    ];

    // Clamp index
    if (_currentIndex >= screens.length) {
      _currentIndex = 0;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Internix'),
        actions: [
          Chip(
            label: Text(
              role.toUpperCase(),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
            ),
            backgroundColor: const Color(0xFFDBEAFE),
            labelStyle: const TextStyle(color: Color(0xFF1E40AF)),
            side: BorderSide.none,
            padding: const EdgeInsets.symmetric(horizontal: 4),
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
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
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: navItems
            .map((item) => NavigationDestination(
                  icon: item.icon,
                  selectedIcon: item.activeIcon,
                  label: item.label,
                ))
            .toList(),
      ),
    );
  }
}
