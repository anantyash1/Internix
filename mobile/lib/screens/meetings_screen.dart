import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/meeting_provider.dart';
import '../providers/auth_provider.dart';

class MeetingsScreen extends StatefulWidget {
  const MeetingsScreen({super.key});

  @override
  State<MeetingsScreen> createState() => _MeetingsScreenState();
}

class _MeetingsScreenState extends State<MeetingsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final mp = context.read<MeetingProvider>();
      mp.fetchMeetings();
      mp.fetchUpcoming();
    });
  }

  Color _freqColor(String f) {
    switch (f) {
      case 'daily':   return Colors.green;
      case 'weekly':  return Colors.blue;
      case 'monthly': return Colors.purple;
      default:        return Colors.orange;
    }
  }

  IconData _freqIcon(String f) {
    switch (f) {
      case 'daily':   return Icons.today_rounded;
      case 'weekly':  return Icons.date_range_rounded;
      case 'monthly': return Icons.calendar_month_rounded;
      default:        return Icons.event_rounded;
    }
  }

  void _openLink(String url) async {
    if (url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showCreateDialog() {
    final titleCtrl = TextEditingController();
    final linkCtrl  = TextEditingController();
    final timeCtrl  = TextEditingController(text: '10:00');
    String frequency = 'weekly';
    int dayOfWeek    = 1;

    final days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setS) => DraggableScrollableSheet(
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          builder: (_, scrollCtrl) => Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 8),
                Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Expanded(
                  child: ListView(
                    controller: scrollCtrl,
                    padding: const EdgeInsets.all(20),
                    children: [
                      Text('Schedule Meeting',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),
                      TextField(
                        controller: titleCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Meeting Title',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.video_call_rounded),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: linkCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Meeting Link (optional)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.link_rounded),
                        ),
                        keyboardType: TextInputType.url,
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        value: frequency,
                        decoration: const InputDecoration(
                          labelText: 'Frequency',
                          border: OutlineInputBorder(),
                        ),
                        items: ['once', 'daily', 'weekly', 'monthly']
                            .map((f) => DropdownMenuItem(
                                  value: f,
                                  child: Text(f[0].toUpperCase() + f.substring(1)),
                                ))
                            .toList(),
                        onChanged: (v) => setS(() => frequency = v!),
                      ),
                      if (frequency == 'weekly') ...[
                        const SizedBox(height: 14),
                        Text('Day of Week', style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: List.generate(7, (i) {
                            return ChoiceChip(
                              label: Text(days[i]),
                              selected: dayOfWeek == i,
                              onSelected: (_) => setS(() => dayOfWeek = i),
                            );
                          }),
                        ),
                      ],
                      const SizedBox(height: 14),
                      TextField(
                        controller: timeCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Meeting Time (HH:MM)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.access_time_rounded),
                        ),
                        keyboardType: TextInputType.datetime,
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          icon: const Icon(Icons.calendar_today_rounded),
                          label: const Text('Schedule Meeting'),
                          onPressed: () async {
                            if (titleCtrl.text.isEmpty) return;
                            final ok = await context.read<MeetingProvider>()
                                .createMeeting({
                              'title': titleCtrl.text.trim(),
                              'meetingLink': linkCtrl.text.trim(),
                              'frequency': frequency,
                              'meetingTime': timeCtrl.text.trim(),
                              'dayOfWeek': dayOfWeek,
                              'targetRoles': ['all'],
                            });
                            if (ok && context.mounted) Navigator.pop(context);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mp      = context.watch<MeetingProvider>();
    final user    = context.read<AuthProvider>().user;
    final isAdmin = user?['role'] == 'admin';
    final theme   = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meetings'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: mp.fetchMeetings),
        ],
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: _showCreateDialog,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Schedule'),
            )
          : null,
      body: mp.loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: mp.fetchMeetings,
              child: CustomScrollView(
                slivers: [
                  // Upcoming banner
                  if (mp.upcoming.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.all(16),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primary,
                              theme.colorScheme.primary.withOpacity(0.7),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44, height: 44,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.notifications_active_rounded,
                                  color: Colors.white),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Meeting starting soon!',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    '${mp.upcoming.first.meeting.title} in ${mp.upcoming.first.minutesLeft}m',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.85),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (mp.upcoming.first.meeting.meetingLink.isNotEmpty)
                              ElevatedButton(
                                onPressed: () =>
                                    _openLink(mp.upcoming.first.meeting.meetingLink),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: theme.colorScheme.primary,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 8),
                                ),
                                child: const Text('Join'),
                              ),
                          ],
                        ),
                      ),
                    ),

                  // List
                  mp.meetings.isEmpty
                      ? SliverFillRemaining(
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.event_busy_rounded, size: 64,
                                    color: theme.colorScheme.onSurface.withOpacity(0.3)),
                                const SizedBox(height: 16),
                                Text('No meetings scheduled',
                                    style: theme.textTheme.titleMedium),
                              ],
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (ctx, i) {
                                final m = mp.meetings[i];
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Card(
                                    elevation: 1,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(14),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: 48, height: 48,
                                            decoration: BoxDecoration(
                                              color: _freqColor(m.frequency).withOpacity(0.12),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Icon(
                                              _freqIcon(m.frequency),
                                              color: _freqColor(m.frequency),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(m.title,
                                                    style: theme.textTheme.titleSmall
                                                        ?.copyWith(fontWeight: FontWeight.bold),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis),
                                                const SizedBox(height: 4),
                                                Row(
                                                  children: [
                                                    Icon(Icons.access_time_rounded,
                                                        size: 13,
                                                        color: theme.colorScheme.onSurface
                                                            .withOpacity(0.5)),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      '${m.meetingTime}  ·  ${m.frequencyLabel}'
                                                      '${m.frequency == 'weekly' ? ' (${m.dayLabel})' : ''}',
                                                      style: theme.textTheme.bodySmall?.copyWith(
                                                        color: theme.colorScheme.onSurface
                                                            .withOpacity(0.55),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 8),
                                                Row(
                                                  children: [
                                                    Container(
                                                      padding: const EdgeInsets.symmetric(
                                                          horizontal: 8, vertical: 2),
                                                      decoration: BoxDecoration(
                                                        color: _freqColor(m.frequency)
                                                            .withOpacity(0.1),
                                                        borderRadius: BorderRadius.circular(8),
                                                      ),
                                                      child: Text(
                                                        m.frequencyLabel,
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.bold,
                                                          color: _freqColor(m.frequency),
                                                        ),
                                                      ),
                                                    ),
                                                    const Spacer(),
                                                    if (m.meetingLink.isNotEmpty)
                                                      TextButton.icon(
                                                        onPressed: () => _openLink(m.meetingLink),
                                                        icon: const Icon(Icons.open_in_new_rounded,
                                                            size: 14),
                                                        label: const Text('Join'),
                                                        style: TextButton.styleFrom(
                                                          padding: const EdgeInsets.symmetric(
                                                              horizontal: 10),
                                                          visualDensity: VisualDensity.compact,
                                                        ),
                                                      ),
                                                    if (isAdmin)
                                                      IconButton(
                                                        icon: const Icon(Icons.delete_outline_rounded,
                                                            size: 18),
                                                        color: theme.colorScheme.error,
                                                        visualDensity: VisualDensity.compact,
                                                        onPressed: () => ctx
                                                            .read<MeetingProvider>()
                                                            .deleteMeeting(m.id),
                                                      ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                              childCount: mp.meetings.length,
                            ),
                          ),
                        ),
                ],
              ),
            ),
    );
  }
}