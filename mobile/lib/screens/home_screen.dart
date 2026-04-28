// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../providers/auth_provider.dart';
// import 'dashboard_screen.dart';
// import 'tasks_screen.dart';
// import 'attendance_screen.dart';
// import 'reports_screen.dart';
// import 'certificates_screen.dart';
// import 'videos_screen.dart';
// import 'tests_screen.dart';
// import 'ai_chat_screen.dart';

// class HomeScreen extends StatefulWidget {
//   const HomeScreen({super.key});

//   @override
//   State<HomeScreen> createState() => _HomeScreenState();
// }

// class _HomeScreenState extends State<HomeScreen> {
//   int _currentIndex = 0;

//   @override
//   Widget build(BuildContext context) {
//     final auth = Provider.of<AuthProvider>(context);
//     final role = auth.role;

//     // ── Build screen list based on role ───────────────────────────────
//     final screens = <_NavItem>[
//       _NavItem(
//         screen: const DashboardScreen(),
//         label: 'Home',
//         icon: Icons.dashboard_outlined,
//         activeIcon: Icons.dashboard,
//       ),
//       _NavItem(
//         screen: const TasksScreen(),
//         label: 'Tasks',
//         icon: Icons.task_outlined,
//         activeIcon: Icons.task,
//       ),
//       _NavItem(
//         screen: const AttendanceScreen(),
//         label: 'Attendance',
//         icon: Icons.calendar_today_outlined,
//         activeIcon: Icons.calendar_today,
//       ),
//       _NavItem(
//         screen: const ReportsScreen(),
//         label: 'Reports',
//         icon: Icons.description_outlined,
//         activeIcon: Icons.description,
//       ),
//       _NavItem(
//         screen: const VideosScreen(),
//         label: 'Videos',
//         icon: Icons.play_circle_outline,
//         activeIcon: Icons.play_circle,
//       ),
//       _NavItem(
//         screen: const TestsScreen(),
//         label: 'Tests',
//         icon: Icons.quiz_outlined,
//         activeIcon: Icons.quiz,
//       ),
//       if (role == 'student')
//         _NavItem(
//           screen: const CertificatesScreen(),
//           label: 'Certificates',
//           icon: Icons.emoji_events_outlined,
//           activeIcon: Icons.emoji_events,
//         ),
//     ];

//     // Clamp index to valid range
//     if (_currentIndex >= screens.length) {
//       _currentIndex = 0;
//     }

//     final currentItem = screens[_currentIndex];

//     return Scaffold(
//       appBar: AppBar(
//         title: Text(currentItem.label),
//         actions: [
//           // AI Chat button in app bar
//           IconButton(
//             icon: const Icon(Icons.smart_toy_outlined),
//             tooltip: 'AI Chat',
//             onPressed: () {
//               Navigator.of(context).push(
//                 MaterialPageRoute(builder: (_) => const AiChatScreen()),
//               );
//             },
//           ),
//           // Role chip
//           Container(
//             margin: const EdgeInsets.only(right: 4),
//             padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
//             decoration: BoxDecoration(
//               color: role == 'admin'
//                   ? const Color(0xFFEDE9FE)
//                   : role == 'mentor'
//                       ? const Color(0xFFFEF3C7)
//                       : const Color(0xFFDBEAFE),
//               borderRadius: BorderRadius.circular(20),
//             ),
//             child: Text(
//               role.toUpperCase(),
//               style: TextStyle(
//                 fontSize: 10,
//                 fontWeight: FontWeight.w700,
//                 color: role == 'admin'
//                     ? const Color(0xFF5B21B6)
//                     : role == 'mentor'
//                         ? const Color(0xFF92400E)
//                         : const Color(0xFF1E40AF),
//               ),
//             ),
//           ),
//           IconButton(
//             icon: const Icon(Icons.logout),
//             tooltip: 'Sign out',
//             onPressed: () async {
//               await auth.logout();
//               if (mounted) {
//                 Navigator.pushReplacementNamed(context, '/login');
//               }
//             },
//           ),
//         ],
//       ),
//       body: IndexedStack(
//         index: _currentIndex,
//         children: screens.map((s) => s.screen).toList(),
//       ),
//       // Show Reports FAB when on the Reports tab
//       floatingActionButton: _currentIndex == 3 && role == 'student'
//           ? FloatingActionButton.extended(
//               onPressed: () {
//                 final reportsScreen = screens[3].screen;
//                 if (reportsScreen is ReportsScreen) {
//                   ReportsScreen.showUploadDialogStatic(context);
//                 }
//               },
//               icon: const Icon(Icons.upload),
//               label: const Text('Upload'),
//             )
//           : null,
//       bottomNavigationBar: NavigationBar(
//         selectedIndex: _currentIndex,
//         labelBehavior: screens.length > 6
//             ? NavigationDestinationLabelBehavior.onlyShowSelected
//             : NavigationDestinationLabelBehavior.alwaysShow,
//         onDestinationSelected: (i) => setState(() => _currentIndex = i),
//         destinations: screens
//             .map((item) => NavigationDestination(
//                   icon: Icon(item.icon, size: 22),
//                   selectedIcon: Icon(item.activeIcon, size: 22),
//                   label: item.label,
//                 ))
//             .toList(),
//       ),
//     );
//   }
// }

// class _NavItem {
//   final Widget screen;
//   final String label;
//   final IconData icon;
//   final IconData activeIcon;
//   const _NavItem({
//     required this.screen,
//     required this.label,
//     required this.icon,
//     required this.activeIcon,
//   });
// }


import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/notice_provider.dart';

// Existing screens
import 'dashboard_screen.dart';
import 'tasks_screen.dart';
import 'attendance_screen.dart';
import 'reports_screen.dart';
import 'certificates_screen.dart';
import 'videos_screen.dart';
import 'tests_screen.dart';
import 'ai_chat_screen.dart';

// New screens
import 'notices_screen.dart';
import 'meetings_screen.dart';
import 'groups_screen.dart';
import 'internships_screen.dart';
import 'users_screen.dart';
import 'onboarding_screen.dart';
import 'mentor_summary_screen.dart';
import 'work_schedule_screen.dart';

// ─── Nav item model ───────────────────────────────────────────────────────────
class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final Widget screen;

  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.screen,
  });
}

// ─── Role-based nav configs ───────────────────────────────────────────────────
List<_NavItem> _studentNav() => [
  _NavItem(label: 'Home',         icon: Icons.home_outlined,           activeIcon: Icons.home_rounded,                screen: const DashboardScreen()),
  _NavItem(label: 'Tasks',        icon: Icons.task_outlined,           activeIcon: Icons.task_rounded,                screen: const TasksScreen()),
  _NavItem(label: 'Attendance',   icon: Icons.fingerprint_outlined,    activeIcon: Icons.fingerprint_rounded,         screen: const AttendanceScreen()),
  _NavItem(label: 'Reports',      icon: Icons.description_outlined,    activeIcon: Icons.description_rounded,         screen: const ReportsScreen()),
  _NavItem(label: 'More',         icon: Icons.grid_view_outlined,      activeIcon: Icons.grid_view_rounded,           screen: const _MoreScreen('student')),
];

List<_NavItem> _mentorNav() => [
  _NavItem(label: 'Home',         icon: Icons.home_outlined,           activeIcon: Icons.home_rounded,                screen: const DashboardScreen()),
  _NavItem(label: 'Tasks',        icon: Icons.task_outlined,           activeIcon: Icons.task_rounded,                screen: const TasksScreen()),
  _NavItem(label: 'Students',     icon: Icons.people_outline,          activeIcon: Icons.people_rounded,              screen: const MentorSummaryScreen()),
  _NavItem(label: 'Reports',      icon: Icons.description_outlined,    activeIcon: Icons.description_rounded,         screen: const ReportsScreen()),
  _NavItem(label: 'More',         icon: Icons.grid_view_outlined,      activeIcon: Icons.grid_view_rounded,           screen: const _MoreScreen('mentor')),
];

List<_NavItem> _adminNav() => [
  _NavItem(label: 'Home',         icon: Icons.home_outlined,           activeIcon: Icons.home_rounded,                screen: const DashboardScreen()),
  _NavItem(label: 'Users',        icon: Icons.people_outline,          activeIcon: Icons.people_rounded,              screen: const UsersScreen()),
  _NavItem(label: 'Internships',  icon: Icons.work_outline_rounded,    activeIcon: Icons.work_rounded,                screen: const InternshipsScreen()),
  _NavItem(label: 'Notices',      icon: Icons.notifications_outlined,  activeIcon: Icons.notifications_rounded,       screen: const NoticesScreen()),
  _NavItem(label: 'More',         icon: Icons.grid_view_outlined,      activeIcon: Icons.grid_view_rounded,           screen: const _MoreScreen('admin')),
];

// ─── Home screen ──────────────────────────────────────────────────────────────
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  List<_NavItem> _navItems(String role) {
    switch (role) {
      case 'admin':  return _adminNav();
      case 'mentor': return _mentorNav();
      default:       return _studentNav();
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NoticeProvider>().fetchNotices();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user  = context.watch<AuthProvider>().user;
    final role  = user?['role'] as String? ?? 'student';
    final items = _navItems(role);
    final theme = Theme.of(context);
    final np    = context.watch<NoticeProvider>();

    // Clamp index if role changed
    if (_currentIndex >= items.length) _currentIndex = 0;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: items.map((e) => e.screen).toList(),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.07),
              blurRadius: 12,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (i) => setState(() => _currentIndex = i),
          height: 64,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: items.map((item) {
            // Badge for notices (bell icon only)
            Widget icon = Icon(item.icon);
            Widget activeIcon = Icon(item.activeIcon);

            if (item.label == 'Notices' && np.unreadCount > 0) {
              icon = Badge(
                label: Text('${np.unreadCount}',
                    style: const TextStyle(fontSize: 10)),
                child: Icon(item.icon),
              );
              activeIcon = Badge(
                label: Text('${np.unreadCount}',
                    style: const TextStyle(fontSize: 10)),
                child: Icon(item.activeIcon),
              );
            }

            return NavigationDestination(
              icon: icon,
              selectedIcon: activeIcon,
              label: item.label,
            );
          }).toList(),
        ),
      ),
    );
  }
}

// ─── "More" grid screen (role-aware) ──────────────────────────────────────────
class _MoreScreen extends StatelessWidget {
  final String role;
  const _MoreScreen(this.role);

  @override
  Widget build(BuildContext context) {
    final user  = context.watch<AuthProvider>().user;
    final theme = Theme.of(context);
    final name  = user?['name'] as String? ?? 'User';
    final items = _moreItems(role, context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('More'),
        automaticallyImplyLeading: false,
      ),
      body: CustomScrollView(
        slivers: [
          // User greeting card
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.primary.withOpacity(0.7),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.white.withOpacity(0.25),
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 22,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                        Text(
                          role[0].toUpperCase() + role.substring(1),
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.circle, size: 7, color: Colors.greenAccent),
                        const SizedBox(width: 5),
                        Text('Online',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 12,
                            )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Grid items
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.95,
              ),
              delegate: SliverChildBuilderDelegate(
                (ctx, i) {
                  final item = items[i];
                  return _MoreCard(item: item);
                },
                childCount: items.length,
              ),
            ),
          ),

          // Logout
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
              child: OutlinedButton.icon(
                onPressed: () async {
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Sign Out'),
                      content: const Text('Are you sure you want to sign out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancel'),
                        ),
                        FilledButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Sign Out'),
                        ),
                      ],
                    ),
                  );
                  if (ok == true && context.mounted) {
                    context.read<AuthProvider>().logout();
                    Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
                  }
                },
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Sign Out'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── More card ────────────────────────────────────────────────────────────────
class _MoreCard extends StatelessWidget {
  final _MoreItem item;
  const _MoreCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: item.color.withOpacity(0.08),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => item.screen),
        ),
        child: Container(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 46, height: 46,
                decoration: BoxDecoration(
                  color: item.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(item.icon, color: item.color, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                item.label,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 11,
                  color: theme.colorScheme.onSurface.withOpacity(0.8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── More item model ──────────────────────────────────────────────────────────
class _MoreItem {
  final String  label;
  final IconData icon;
  final Color   color;
  final Widget  screen;

  const _MoreItem({
    required this.label,
    required this.icon,
    required this.color,
    required this.screen,
  });
}

List<_MoreItem> _moreItems(String role, BuildContext ctx) {
  final shared = <_MoreItem>[
    _MoreItem(label: 'Notices',      icon: Icons.notifications_rounded,    color: Colors.amber,   screen: const NoticesScreen()),
    _MoreItem(label: 'Meetings',     icon: Icons.video_call_rounded,       color: Colors.blue,    screen: const MeetingsScreen()),
    _MoreItem(label: 'Groups',       icon: Icons.group_rounded,            color: Colors.green,   screen: const GroupsScreen()),
    _MoreItem(label: 'AI Chat',      icon: Icons.smart_toy_rounded,        color: Colors.purple,  screen: const AiChatScreen()),
    _MoreItem(label: 'Certificates', icon: Icons.workspace_premium_rounded, color: Colors.orange, screen: const CertificatesScreen()),
    _MoreItem(label: 'Videos',       icon: Icons.play_circle_rounded,      color: Colors.red,     screen: const VideosScreen()),
  ];

  if (role == 'student') {
    return [
      ...shared,
      _MoreItem(label: 'Tests',     icon: Icons.quiz_rounded,    color: Colors.teal,   screen: const TestsScreen()),
    ];
  }

  if (role == 'mentor') {
    return [
      ...shared,
      _MoreItem(label: 'Tests',        icon: Icons.quiz_rounded,           color: Colors.teal,       screen: const TestsScreen()),
      _MoreItem(label: 'Internships',  icon: Icons.work_rounded,           color: Colors.brown,      screen: const InternshipsScreen()),
      _MoreItem(label: 'Attendance',   icon: Icons.fingerprint_rounded,    color: Colors.indigo,     screen: const AttendanceScreen()),
      _MoreItem(label: 'Schedule',     icon: Icons.schedule_rounded,       color: Colors.cyan,       screen: const WorkScheduleScreen()),
      _MoreItem(label: 'Onboard',      icon: Icons.person_add_rounded,     color: Colors.pink,       screen: const OnboardingScreen()),
    ];
  }

  // admin
  return [
    ...shared,
    _MoreItem(label: 'Tests',       icon: Icons.quiz_rounded,          color: Colors.teal,       screen: const TestsScreen()),
    _MoreItem(label: 'Attendance',  icon: Icons.fingerprint_rounded,   color: Colors.indigo,     screen: const AttendanceScreen()),
    _MoreItem(label: 'Reports',     icon: Icons.description_rounded,   color: Colors.deepOrange, screen: const ReportsScreen()),
    _MoreItem(label: 'Tasks',       icon: Icons.task_rounded,          color: Colors.lightBlue,  screen: const TasksScreen()),
    _MoreItem(label: 'Schedule',    icon: Icons.schedule_rounded,      color: Colors.cyan,       screen: const WorkScheduleScreen()),
    _MoreItem(label: 'Onboard',     icon: Icons.person_add_rounded,    color: Colors.pink,       screen: const OnboardingScreen()),
    _MoreItem(label: 'Summary',     icon: Icons.bar_chart_rounded,     color: Colors.lime,       screen: const MentorSummaryScreen()),
  ];
}