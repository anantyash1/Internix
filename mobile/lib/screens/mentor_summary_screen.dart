import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/task_provider.dart';
import '../providers/report_provider.dart';
import '../providers/attendance_provider.dart';

class MentorSummaryScreen extends StatefulWidget {
  const MentorSummaryScreen({super.key});

  @override
  State<MentorSummaryScreen> createState() => _MentorSummaryScreenState();
}

class _MentorSummaryScreenState extends State<MentorSummaryScreen> {
  AppUser? _selected;
  bool     _loadingDetail = false;
  Map<String, dynamic> _detail = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UserProvider>().fetchUsers(role: 'student');
    });
  }

  Future<void> _loadStudentDetail(AppUser student) async {
    setState(() { _selected = student; _loadingDetail = true; });

    final taskP  = context.read<TaskProvider>();
    final reportP= context.read<ReportProvider>();
    final attendP= context.read<AttendanceProvider>();

    await Future.wait([
      taskP.fetchTasks(),
      reportP.fetchReports(),
      attendP.fetchAttendance(),
    ]);

    if (!mounted) return;

    final tasks     = taskP.tasks.where((t) {
      final assignedTo = t is Map ? t['assignedTo'] : null;
      if (assignedTo is Map) return assignedTo['_id'] == student.id;
      return false;
    }).toList();

    final reports   = reportP.reports.where((r) {
      if (r is Map) {
        final s = r['student'];
        if (s is Map) return s['_id'] == student.id;
      }
      return false;
    }).toList();

    final attendance = attendP.records.where((a) {
      if (a is Map) {
        final s = a['student'];
        if (s is Map) return s['_id'] == student.id;
      }
      return false;
    }).toList();

    setState(() {
      _loadingDetail = false;
      _detail = {
        'tasks':      tasks.length,
        'completed':  tasks.where((t) => (t is Map ? t['status'] : '') == 'completed').length,
        'pending':    tasks.where((t) => (t is Map ? t['status'] : '') == 'pending').length,
        'reports':    reports.length,
        'approved':   reports.where((r) => (r is Map ? r['status'] : '') == 'approved').length,
        'attendance': attendance.where((a) => (a is Map ? a['status'] : '') == 'present').length,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final up    = context.watch<UserProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Student Summary')),
      body: up.loading
          ? const Center(child: CircularProgressIndicator())
          : up.users.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.people_outline_rounded, size: 64,
                          color: theme.colorScheme.onSurface.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      Text('No students assigned', style: theme.textTheme.titleMedium),
                    ],
                  ),
                )
              : Row(
                  children: [
                    // Student list panel
                    Container(
                      width: 200,
                      decoration: BoxDecoration(
                        border: Border(
                          right: BorderSide(
                            color: theme.colorScheme.outline.withOpacity(0.2),
                          ),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
                            child: Text(
                              'My Students (${up.users.length})',
                              style: theme.textTheme.labelLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              itemCount: up.users.length,
                              itemBuilder: (ctx, i) {
                                final u      = up.users[i];
                                final active = _selected?.id == u.id;
                                return InkWell(
                                  borderRadius: BorderRadius.circular(10),
                                  onTap: () => _loadStudentDetail(u),
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 4),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: active
                                          ? theme.colorScheme.primary.withOpacity(0.1)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      border: active
                                          ? Border.all(
                                              color: theme.colorScheme.primary.withOpacity(0.3))
                                          : null,
                                    ),
                                    child: Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 16,
                                          backgroundColor: active
                                              ? theme.colorScheme.primary.withOpacity(0.2)
                                              : theme.colorScheme.surfaceVariant,
                                          child: Text(
                                            u.initials,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: active
                                                  ? theme.colorScheme.primary
                                                  : theme.colorScheme.onSurfaceVariant,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            u.name.split(' ').first,
                                            style: theme.textTheme.bodySmall?.copyWith(
                                              fontWeight: active
                                                  ? FontWeight.bold : FontWeight.normal,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Detail panel
                    Expanded(
                      child: _selected == null
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.touch_app_rounded, size: 52,
                                      color: theme.colorScheme.onSurface.withOpacity(0.2)),
                                  const SizedBox(height: 12),
                                  Text('Select a student to view details',
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        color: theme.colorScheme.onSurface.withOpacity(0.4),
                                      )),
                                ],
                              ),
                            )
                          : _loadingDetail
                              ? const Center(child: CircularProgressIndicator())
                              : SingleChildScrollView(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Student header
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(colors: [
                                            theme.colorScheme.primary.withOpacity(0.1),
                                            theme.colorScheme.primary.withOpacity(0.04),
                                          ]),
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                        child: Row(
                                          children: [
                                            CircleAvatar(
                                              radius: 24,
                                              backgroundColor:
                                                  theme.colorScheme.primary.withOpacity(0.2),
                                              child: Text(_selected!.initials,
                                                  style: TextStyle(
                                                    color: theme.colorScheme.primary,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                  )),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(_selected!.name,
                                                      style: theme.textTheme.titleMedium
                                                          ?.copyWith(fontWeight: FontWeight.bold),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis),
                                                  Text(_selected!.email,
                                                      style: theme.textTheme.bodySmall?.copyWith(
                                                        color: theme.colorScheme.onSurface
                                                            .withOpacity(0.55),
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      const SizedBox(height: 16),
                                      Text('Performance Overview',
                                          style: theme.textTheme.titleSmall
                                              ?.copyWith(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 10),

                                      // Stats grid
                                      GridView.count(
                                        crossAxisCount: 2,
                                        shrinkWrap: true,
                                        physics: const NeverScrollableScrollPhysics(),
                                        mainAxisSpacing: 10,
                                        crossAxisSpacing: 10,
                                        childAspectRatio: 1.5,
                                        children: [
                                          _statCard(
                                            'Tasks',
                                            '${_detail['completed']}/${_detail['tasks']}',
                                            Icons.task_alt_rounded,
                                            Colors.blue,
                                            '${_detail['tasks'] > 0 ? ((_detail['completed'] / _detail['tasks']) * 100).round() : 0}% done',
                                            theme,
                                          ),
                                          _statCard(
                                            'Attendance',
                                            '${_detail['attendance']} days',
                                            Icons.fingerprint_rounded,
                                            Colors.green,
                                            'Present days',
                                            theme,
                                          ),
                                          _statCard(
                                            'Reports',
                                            '${_detail['reports']}',
                                            Icons.description_rounded,
                                            Colors.purple,
                                            '${_detail['approved']} approved',
                                            theme,
                                          ),
                                          _statCard(
                                            'Pending',
                                            '${_detail['pending']}',
                                            Icons.pending_actions_rounded,
                                            Colors.orange,
                                            'Tasks pending',
                                            theme,
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 16),

                                      // Progress bar
                                      _progressSection(theme),
                                    ],
                                  ),
                                ),
                    ),
                  ],
                ),
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color,
      String sub, ThemeData theme) =>
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.07),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16, color: color),
                const SizedBox(width: 6),
                Text(title,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.55),
                    )),
              ],
            ),
            const Spacer(),
            Text(value,
                style: theme.textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold, color: color)),
            Text(sub,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                  fontSize: 10,
                )),
          ],
        ),
      );

  Widget _progressSection(ThemeData theme) {
    final total     = _detail['tasks'] as int? ?? 0;
    final completed = _detail['completed'] as int? ?? 0;
    final pct       = total > 0 ? completed / total : 0.0;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant.withOpacity(0.4),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Task Completion',
                  style: theme.textTheme.labelLarge
                      ?.copyWith(fontWeight: FontWeight.bold)),
              Text('${(pct * 100).round()}%',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  )),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 10,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
            ),
          ),
          const SizedBox(height: 6),
          Text('$completed of $total tasks completed',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              )),
        ],
      ),
    );
  }
}