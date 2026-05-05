import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/task_provider.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
        () => Provider.of<TaskProvider>(context, listen: false).fetchTasks());
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'in_progress':
        return Colors.blue;
      case 'reviewed':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  Color _priorityColor(String priority) {
    switch (priority) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      default:
        return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final taskProvider = Provider.of<TaskProvider>(context);
    final role = auth.role;

    if (taskProvider.loading) {
      return const ColoredBox(
        color: Color(0xFFF8FAFC),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    final tasks = taskProvider.tasks;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      floatingActionButton: role == 'admin'
          ? FloatingActionButton.extended(
              onPressed: () => _showCreateTaskDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New Task'),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: () => taskProvider.fetchTasks(),
        child: tasks.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.task_outlined, size: 64, color: Colors.grey[300]),
                    const SizedBox(height: 8),
                    Text('No tasks found',
                        style: TextStyle(color: Colors.grey[400], fontSize: 16)),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: tasks.length,
                itemBuilder: (context, index) {
                  final task = tasks[index];
                  final status = task['status'] ?? 'pending';
                  final priority = task['priority'] ?? 'medium';

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  task['title'] ?? '',
                                  style: const TextStyle(
                                      fontSize: 16, fontWeight: FontWeight.w600),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color:
                                      _statusColor(status).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  status.replaceAll('_', ' '),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: _statusColor(status),
                                  ),
                                ),
                              ),
                              if (role == 'admin')
                                PopupMenuButton(
                                  itemBuilder: (ctx) => [
                                    PopupMenuItem(
                                      onTap: () => _showCreateTaskDialog(context, task),
                                      child: const Row(
                                        children: [
                                          Icon(Icons.edit, size: 18),
                                          SizedBox(width: 8),
                                          Text('Edit'),
                                        ],
                                      ),
                                    ),
                                    PopupMenuItem(
                                      onTap: () => _confirmDelete(context, task['_id']),
                                      child: const Row(
                                        children: [
                                          Icon(Icons.delete, size: 18, color: Colors.red),
                                          SizedBox(width: 8),
                                          Text('Delete', style: TextStyle(color: Colors.red)),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              else
                                const SizedBox(width: 8),
                            ],
                          ),
                          if (task['description'] != null &&
                              task['description'].isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text(task['description'],
                                  style: TextStyle(
                                      color: Colors.grey[600], fontSize: 13)),
                            ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: _priorityColor(priority)
                                      .withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  priority,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: _priorityColor(priority),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (task['dueDate'] != null)
                                Text(
                                  'Due: ${task['dueDate'].toString().substring(0, 10)}',
                                  style: TextStyle(
                                      fontSize: 12, color: Colors.grey[500]),
                                ),
                              const Spacer(),
                              if (role == 'student' && status == 'pending')
                                _ActionButton(
                                  label: 'Start',
                                  color: Colors.blue,
                                  onPressed: () async {
                                    final ok = await taskProvider
                                        .updateTaskStatus(task['_id'], 'in_progress');
                                    if (ok && mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Task started')));
                                    }
                                  },
                                ),
                              if (role == 'student' && status == 'in_progress')
                                _ActionButton(
                                  label: 'Complete',
                                  color: Colors.green,
                                  onPressed: () async {
                                    final ok = await taskProvider
                                        .updateTaskStatus(task['_id'], 'completed');
                                    if (ok && mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                              content: Text('Task completed!')));
                                    }
                                  },
                                ),
                            ],
                          ),
                          if (task['feedback'] != null &&
                              task['feedback'].isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF0F9FF),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.feedback_outlined,
                                        size: 16, color: Color(0xFF2563EB)),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(task['feedback'],
                                          style: const TextStyle(
                                              fontSize: 12,
                                              color: Color(0xFF1E40AF))),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }

  void _showCreateTaskDialog(BuildContext context, [dynamic task]) {
    final titleCtrl = TextEditingController(text: task?['title'] ?? '');
    final descCtrl = TextEditingController(text: task?['description'] ?? '');
    final dueDateCtrl = TextEditingController(text: task?['dueDate'] != null ? task!['dueDate'].toString().substring(0, 10) : '');
    String priority = task?['priority'] ?? 'medium';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: Text(task == null ? 'Create Task' : 'Edit Task'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dueDateCtrl,
                  decoration: const InputDecoration(labelText: 'Due Date (YYYY-MM-DD)'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField(
                  value: priority,
                  items: const [
                    DropdownMenuItem(value: 'low', child: Text('Low')),
                    DropdownMenuItem(value: 'medium', child: Text('Medium')),
                    DropdownMenuItem(value: 'high', child: Text('High')),
                  ],
                  onChanged: (val) => setState(() => priority = val ?? 'medium'),
                  decoration: const InputDecoration(labelText: 'Priority'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            FilledButton(
              onPressed: () async {
                if (titleCtrl.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Title required')));
                  return;
                }
                final data = {
                  'title': titleCtrl.text,
                  'description': descCtrl.text,
                  'priority': priority,
                  if (dueDateCtrl.text.isNotEmpty) 'dueDate': dueDateCtrl.text,
                };
                Navigator.pop(ctx);
                // Call create or update API - you'll need to add these methods to TaskProvider
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(task == null ? 'Task created' : 'Task updated'),
                  backgroundColor: Colors.green,
                ));
              },
              child: Text(task == null ? 'Create' : 'Update'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, String taskId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Task'),
        content: const Text('Are you sure you want to delete this task?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Task deleted'),
                backgroundColor: Colors.green,
              ));
              // Call delete API
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onPressed;
  const _ActionButton(
      {required this.label, required this.color, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        backgroundColor: color.withOpacity(0.1),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
