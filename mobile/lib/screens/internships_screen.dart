import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/internship_provider.dart';

class InternshipsScreen extends StatefulWidget {
  const InternshipsScreen({super.key});

  @override
  State<InternshipsScreen> createState() => _InternshipsScreenState();
}

class _InternshipsScreenState extends State<InternshipsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _dateFormat = DateFormat('MMM d, yyyy');

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this, initialIndex: 1);
    _tabs.addListener(() {
      if (!_tabs.indexIsChanging) _loadForTab(_tabs.index);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadForTab(1); // active by default
    });
  }

  Future<void> _loadForTab(int idx) {
    const statuses = ['upcoming', 'active', 'completed'];
    return context
        .read<InternshipProvider>()
        .fetchInternships(status: statuses[idx]);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'active':    return Colors.green;
      case 'completed': return Colors.grey;
      default:          return Colors.orange;
    }
  }

  void _showDetail(BuildContext ctx, Internship intern) {
    final theme = Theme.of(ctx);
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.93,
        builder: (_, ctrl) => Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer.withOpacity(0.4),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(intern.title,
                              style: theme.textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold)),
                          if (intern.department.isNotEmpty)
                            Text(intern.department,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.primary,
                                )),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  controller: ctrl,
                  padding: const EdgeInsets.all(20),
                  children: [
                    _infoRow(Icons.calendar_month_rounded,
                        '${_dateFormat.format(intern.startDate)} – ${_dateFormat.format(intern.endDate)}',
                        theme),
                    const SizedBox(height: 10),
                    _infoRow(Icons.person_rounded,
                        'Mentor: ${intern.mentor?['name'] ?? 'N/A'}', theme),
                    const SizedBox(height: 10),
                    _infoRow(Icons.people_rounded,
                        '${intern.students.length} / ${intern.maxStudents} students', theme),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _statusColor(intern.status).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            intern.statusLabel,
                            style: TextStyle(
                              color: _statusColor(intern.status),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: intern.availableSlots > 0
                                ? Colors.green.withOpacity(0.12)
                                : Colors.red.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            intern.availableSlots > 0
                                ? '${intern.availableSlots} slots left'
                                : 'Full',
                            style: TextStyle(
                              color: intern.availableSlots > 0 ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (intern.description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 12),
                      Text('About', style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(intern.description,
                          style: theme.textTheme.bodyMedium?.copyWith(height: 1.6)),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String text, ThemeData theme) => Row(
        children: [
          Icon(icon, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: theme.textTheme.bodySmall),
          ),
        ],
      );

  @override
  Widget build(BuildContext context) {
    final ip    = context.watch<InternshipProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Internships'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: ip.loading
          ? const Center(child: CircularProgressIndicator())
          : ip.error != null
              ? Center(child: Text(ip.error!))
              : ip.internships.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.work_off_rounded, size: 64,
                              color: theme.colorScheme.onSurface.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          Text('No internships found', style: theme.textTheme.titleMedium),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _loadForTab(_tabs.index),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: ip.internships.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (ctx, i) {
                          final intern = ip.internships[i];
                          final pct = intern.maxStudents > 0
                              ? intern.students.length / intern.maxStudents
                              : 0.0;
                          return Card(
                            elevation: 1,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(14),
                              onTap: () => _showDetail(ctx, intern),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(intern.title,
                                              style: theme.textTheme.titleSmall
                                                  ?.copyWith(fontWeight: FontWeight.bold),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: _statusColor(intern.status).withOpacity(0.12),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            intern.statusLabel,
                                            style: TextStyle(
                                              color: _statusColor(intern.status),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (intern.department.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(intern.department,
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: theme.colorScheme.primary,
                                          )),
                                    ],
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(Icons.calendar_today_rounded, size: 12,
                                            color: theme.colorScheme.onSurface.withOpacity(0.4)),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${_dateFormat.format(intern.startDate)} – '
                                          '${_dateFormat.format(intern.endDate)}',
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: theme.colorScheme.onSurface.withOpacity(0.5),
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(4),
                                            child: LinearProgressIndicator(
                                              value: pct.clamp(0.0, 1.0),
                                              minHeight: 6,
                                              backgroundColor:
                                                  theme.colorScheme.primary.withOpacity(0.1),
                                              color: _statusColor(intern.status),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '${intern.students.length}/${intern.maxStudents}',
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    if (intern.mentor != null)
                                      Row(
                                        children: [
                                          Icon(Icons.person_outline_rounded, size: 12,
                                              color: theme.colorScheme.onSurface.withOpacity(0.4)),
                                          const SizedBox(width: 4),
                                          Text(
                                            intern.mentor!['name'] ?? '',
                                            style: theme.textTheme.bodySmall?.copyWith(
                                              color: theme.colorScheme.onSurface.withOpacity(0.5),
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
