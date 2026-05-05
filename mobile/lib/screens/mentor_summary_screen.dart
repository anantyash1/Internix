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
                    // Student list panel - narrower
                    Container(
                      width: 130,
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
                            padding: const EdgeInsets.fromLTRB(10, 12, 10, 8),
                            child: Text(
                              'Students',
                              style: theme.textTheme.labelSmall
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              itemCount: up.users.length,
                              itemBuilder: (ctx, i) {
                                final u      = up.users[i];
                                final active = _selected?.id == u.id;
                                return InkWell(
                                  borderRadius: BorderRadius.circular(8),
                                  onTap: () => _loadStudentDetail(u),
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 3),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: active
                                          ? theme.colorScheme.primary.withOpacity(0.15)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                      border: active
                                          ? Border.all(
                                              color: theme.colorScheme.primary.withOpacity(0.4))
                                          : null,
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        CircleAvatar(
                                          radius: 14,
                                          backgroundColor: active
                                              ? theme.colorScheme.primary.withOpacity(0.3)
                                              : theme.colorScheme.surfaceContainerHighest,
                                          child: Text(
                                            u.initials,
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: active
                                                  ? theme.colorScheme.primary
                                                  : theme.colorScheme.onSurfaceVariant,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            u.name.split(' ').first,
                                            style: theme.textTheme.bodySmall?.copyWith(
                                              fontWeight: active
                                                  ? FontWeight.w600 : FontWeight.w400,
                                              fontSize: 11,
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

                    // Detail panel - larger and more spacious
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
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Student header - more compact
                                      Container(
                                        padding: const EdgeInsets.all(14),
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(colors: [
                                            theme.colorScheme.primary.withOpacity(0.12),
                                            theme.colorScheme.primary.withOpacity(0.04),
                                          ]),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Row(
                                          children: [
                                            CircleAvatar(
                                              radius: 20,
                                              backgroundColor:
                                                  theme.colorScheme.primary.withOpacity(0.25),
                                              child: Text(_selected!.initials,
                                                  style: TextStyle(
                                                    color: theme.colorScheme.primary,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 16,
                                                  )),
                                            ),
                                            const SizedBox(width: 14),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(_selected!.name,
                                                      style: theme.textTheme.titleSmall
                                                          ?.copyWith(fontWeight: FontWeight.bold),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis),
                                                  const SizedBox(height: 2),
                                                  Text(_selected!.email,
                                                      style: theme.textTheme.bodySmall?.copyWith(
                                                        color: theme.colorScheme.onSurface
                                                            .withOpacity(0.55),
                                                        fontSize: 11,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      const SizedBox(height: 20),
                                      Text('Performance Overview',
                                          style: theme.textTheme.titleMedium
                                              ?.copyWith(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 14),

                                      // Stats grid - larger cards
                                      GridView.count(
                                        crossAxisCount: 2,
                                        shrinkWrap: true,
                                        physics: const NeverScrollableScrollPhysics(),
                                        mainAxisSpacing: 14,
                                        crossAxisSpacing: 14,
                                        childAspectRatio: 1.3,
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

                                      const SizedBox(height: 18),

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
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(13),
          border: Border.all(color: color.withOpacity(0.18)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: color),
                const SizedBox(width: 7),
                Text(title,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                      fontWeight: FontWeight.w500,
                    )),
              ],
            ),
            const Spacer(),
            Text(value,
                style: theme.textTheme.headlineSmall
                    ?.copyWith(fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(sub,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.45),
                  fontSize: 11,
                )),
          ],
        ),
      );

  Widget _progressSection(ThemeData theme) {
    final total     = _detail['tasks'] as int? ?? 0;
    final completed = _detail['completed'] as int? ?? 0;
    final pct       = total > 0 ? completed / total : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.5),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Task Completion',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.bold)),
              Text('${(pct * 100).round()}%',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  )),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 12,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
            ),
          ),
          const SizedBox(height: 8),
          Text('$completed of $total tasks completed',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.55),
              )),
        ],
      ),
    );
  }
}