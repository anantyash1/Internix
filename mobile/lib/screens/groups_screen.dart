import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/group_provider.dart';
import '../providers/auth_provider.dart';

class GroupsScreen extends StatefulWidget {
  const GroupsScreen({super.key});

  @override
  State<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends State<GroupsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<GroupProvider>().fetchGroups();
    });
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.blue;
    }
  }

  void _showGroupDetail(BuildContext ctx, Group g) {
    final theme = Theme.of(ctx);
    final color = _parseColor(g.color);

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        maxChildSize: 0.92,
        builder: (_, ctrl) => Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Colored header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40, height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(Icons.group_rounded, color: color, size: 26),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(g.name,
                                  style: theme.textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold)),
                              if (g.domain.isNotEmpty)
                                Text(g.domain,
                                    style: theme.textTheme.bodySmall
                                        ?.copyWith(color: color)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  controller: ctrl,
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (g.description.isNotEmpty) ...[
                      Text(g.description,
                          style: theme.textTheme.bodyMedium
                              ?.copyWith(height: 1.5)),
                      const SizedBox(height: 16),
                    ],
                    if (g.internship != null) ...[
                      Row(children: [
                        Icon(Icons.business_center_rounded, size: 16,
                            color: theme.colorScheme.primary),
                        const SizedBox(width: 6),
                        Text(g.internship!['title'] ?? '',
                            style: theme.textTheme.bodySmall),
                      ]),
                      const SizedBox(height: 12),
                    ],
                    if (g.mentor != null) ...[
                      Row(children: [
                        Icon(Icons.person_rounded, size: 16,
                            color: theme.colorScheme.primary),
                        const SizedBox(width: 6),
                        Text('Mentor: ${g.mentor!['name'] ?? ''}',
                            style: theme.textTheme.bodySmall),
                      ]),
                      const SizedBox(height: 16),
                    ],
                    Text('Members (${g.students.length})',
                        style: theme.textTheme.titleSmall
                            ?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    if (g.students.isEmpty)
                      Text('No members yet',
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: theme.colorScheme.onSurface.withOpacity(0.5)))
                    else
                      ...g.students.map((s) {
                        final name = s is Map ? (s['name'] ?? '') : s.toString();
                        final email = s is Map ? (s['email'] ?? '') : '';
                        final initials = name.isNotEmpty ? name[0].toUpperCase() : '?';
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: color.withOpacity(0.15),
                            child: Text(initials,
                                style: TextStyle(
                                    color: color, fontWeight: FontWeight.bold)),
                          ),
                          title: Text(name, style: theme.textTheme.bodyMedium),
                          subtitle: email.isNotEmpty
                              ? Text(email, style: theme.textTheme.bodySmall)
                              : null,
                        );
                      }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gp      = context.watch<GroupProvider>();
    final user    = context.read<AuthProvider>().user;
    final role    = user?['role'] ?? 'student';
    final isStaff = role == 'admin' || role == 'mentor';
    final theme   = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Groups'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: gp.fetchGroups),
        ],
      ),
      body: gp.loading
          ? const Center(child: CircularProgressIndicator())
          : gp.error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
                      const SizedBox(height: 12),
                      Text(gp.error!, textAlign: TextAlign.center),
                      TextButton(onPressed: gp.fetchGroups, child: const Text('Retry')),
                    ],
                  ),
                )
              : gp.groups.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.group_off_rounded, size: 64,
                              color: theme.colorScheme.onSurface.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          Text('No groups found', style: theme.textTheme.titleMedium),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: gp.fetchGroups,
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.05,
                        ),
                        itemCount: gp.groups.length,
                        itemBuilder: (ctx, i) {
                          final g     = gp.groups[i];
                          final color = _parseColor(g.color);
                          return GestureDetector(
                            onTap: () => _showGroupDetail(ctx, g),
                            child: Card(
                              elevation: 1,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 40, height: 40,
                                          decoration: BoxDecoration(
                                            color: color.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Icon(Icons.group_rounded,
                                              color: color, size: 20),
                                        ),
                                        const Spacer(),
                                        if (isStaff)
                                          InkWell(
                                            borderRadius: BorderRadius.circular(8),
                                            onTap: () => showDialog(
                                              context: ctx,
                                              builder: (_) => AlertDialog(
                                                title: const Text('Delete Group'),
                                                content: Text('Delete "${g.name}"?'),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () => Navigator.pop(ctx),
                                                    child: const Text('Cancel'),
                                                  ),
                                                  FilledButton(
                                                    onPressed: () {
                                                      Navigator.pop(ctx);
                                                      ctx.read<GroupProvider>().deleteGroup(g.id);
                                                    },
                                                    child: const Text('Delete'),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            child: Padding(
                                              padding: const EdgeInsets.all(4),
                                              child: Icon(Icons.more_vert_rounded,
                                                  size: 18,
                                                  color: theme.colorScheme.onSurface
                                                      .withOpacity(0.4)),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const Spacer(),
                                    Text(
                                      g.name,
                                      style: theme.textTheme.titleSmall
                                          ?.copyWith(fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    if (g.domain.isNotEmpty)
                                      Text(
                                        g.domain,
                                        style: theme.textTheme.bodySmall
                                            ?.copyWith(color: color),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(Icons.people_rounded,
                                            size: 13,
                                            color: theme.colorScheme.onSurface.withOpacity(0.5)),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${g.students.length} members',
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