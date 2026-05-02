import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Provider.of<DashboardProvider>(context, listen: false).fetchDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final dashboard = Provider.of<DashboardProvider>(context);

    if (dashboard.loading || dashboard.data == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final role = auth.role;
    final data = dashboard.data!;

    if (role == 'admin') return _AdminDashboard(data: data);
    if (role == 'mentor') return _MentorDashboard(data: data);
    return _StudentDashboard(data: data);
  }
}

class _AdminDashboard extends StatelessWidget {
  final Map<String, dynamic> data;
  const _AdminDashboard({required this.data});

  @override
  Widget build(BuildContext context) {
    final stats = data['stats'] ?? {};
    return RefreshIndicator(
      onRefresh: () =>
          Provider.of<DashboardProvider>(context, listen: false).fetchDashboard(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Admin Dashboard',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          _buildStatGrid([
            _StatItem('Students', '${stats['totalStudents'] ?? 0}',
                Icons.people, const Color(0xFF2563EB)),
            _StatItem('Mentors', '${stats['totalMentors'] ?? 0}',
                Icons.supervisor_account, const Color(0xFF7C3AED)),
            _StatItem('Internships', '${stats['totalInternships'] ?? 0}',
                Icons.work, const Color(0xFF059669)),
            _StatItem('Tasks', '${stats['totalTasks'] ?? 0}', Icons.task,
                const Color(0xFFF59E0B)),
            _StatItem('Reports', '${stats['totalReports'] ?? 0}',
                Icons.description, const Color(0xFF3B82F6)),
            _StatItem('Certificates', '${stats['totalCertificates'] ?? 0}',
                Icons.emoji_events, const Color(0xFFEF4444)),
          ]),
        ],
      ),
    );
  }
}

class _MentorDashboard extends StatelessWidget {
  final Map<String, dynamic> data;
  const _MentorDashboard({required this.data});

  @override
  Widget build(BuildContext context) {
    final stats = data['stats'] ?? {};
    return RefreshIndicator(
      onRefresh: () =>
          Provider.of<DashboardProvider>(context, listen: false).fetchDashboard(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Mentor Dashboard',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          _buildStatGrid([
            _StatItem('My Students', '${stats['myStudents'] ?? 0}',
                Icons.people, const Color(0xFF2563EB)),
            _StatItem('Tasks Created', '${stats['totalTasks'] ?? 0}',
                Icons.task, const Color(0xFF059669)),
            _StatItem('Pending Reports', '${stats['pendingReports'] ?? 0}',
                Icons.pending_actions, const Color(0xFFF59E0B)),
          ]),
        ],
      ),
    );
  }
}

class _StudentDashboard extends StatelessWidget {
  final Map<String, dynamic> data;
  const _StudentDashboard({required this.data});

  @override
  Widget build(BuildContext context) {
    final stats = data['stats'] ?? {};
    final todayAttendance = data['todayAttendance'];

    return RefreshIndicator(
      onRefresh: () =>
          Provider.of<DashboardProvider>(context, listen: false).fetchDashboard(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('My Dashboard',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          _buildStatGrid([
            _StatItem('Total Tasks', '${stats['totalTasks'] ?? 0}',
                Icons.task, const Color(0xFF2563EB)),
            _StatItem('Completed', '${stats['completedTasks'] ?? 0}',
                Icons.check_circle, const Color(0xFF059669)),
            _StatItem('Completion', '${stats['taskCompletionRate'] ?? 0}%',
                Icons.trending_up, const Color(0xFF7C3AED)),
            _StatItem('Attendance', '${stats['totalAttendanceDays'] ?? 0} days',
                Icons.calendar_today, const Color(0xFFF59E0B)),
          ]),
          const SizedBox(height: 16),

          // Video Progress Card
          if ((stats['totalVideos'] ?? 0) > 0)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Expanded(
                          child: Text(
                            'Video Progress',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${stats['completedVideos'] ?? 0}/${stats['totalVideos'] ?? 0}',
                          style: const TextStyle(
                            color: Color(0xFF2563EB),
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    LinearProgressIndicator(
                      value: (stats['videoProgressRate'] ?? 0) / 100,
                      backgroundColor: const Color(0xFFE5E7EB),
                      color: const Color(0xFF2563EB),
                      minHeight: 8,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${stats['videoProgressRate'] ?? 0}% completed',
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),

          // Quick Info Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Quick Info',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  _InfoRow('Today\'s Attendance',
                      todayAttendance ?? 'Not marked',
                      todayAttendance == 'present'
                          ? Colors.green
                          : Colors.red),
                  _InfoRow('Reports Submitted',
                      '${stats['totalReports'] ?? 0}', null),
                  _InfoRow('Reports Approved',
                      '${stats['approvedReports'] ?? 0}', Colors.green),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  _StatItem(this.title, this.value, this.icon, this.color);
}

Widget _buildStatGrid(List<_StatItem> items) {
  return GridView.count(
    crossAxisCount: 2,
    shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: 12,
    crossAxisSpacing: 12,
    childAspectRatio: 1.25,
    children: items
        .map((item) => Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(item.icon, color: item.color, size: 28),
                    const SizedBox(height: 8),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        item.value,
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: Colors.grey[900]),
                        maxLines: 1,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.title,
                      style:
                          TextStyle(fontSize: 13, color: Colors.grey[600]),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ))
        .toList(),
  );
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _InfoRow(this.label, this.value, this.valueColor);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            fit: FlexFit.loose,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: valueColor ?? Colors.grey[800],
                  fontSize: 14),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
