import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/attendance_provider.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<AttendanceProvider>(context, listen: false)
            .fetchAttendance());
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'present':
        return Colors.green;
      case 'late':
        return Colors.orange;
      default:
        return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final attendance = Provider.of<AttendanceProvider>(context);
    final role = auth.role;

    if (attendance.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () => attendance.fetchAttendance(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Check-in button for students
          if (role == 'student') ...[
            if (!attendance.todayMarked)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final ok = await attendance.markAttendance();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text(ok
                            ? 'Attendance marked!'
                            : 'Already marked or failed'),
                        backgroundColor: ok ? Colors.green : Colors.red,
                      ));
                    }
                  },
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Mark Attendance (Check In)'),
                ),
              )
            else
              Card(
                color: const Color(0xFFF0FDF4),
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.green),
                      SizedBox(width: 12),
                      Text('Attendance marked for today',
                          style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 16),
          ],

          Text('Attendance Records',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),

          if (attendance.records.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(Icons.calendar_today,
                        size: 48, color: Colors.grey[300]),
                    const SizedBox(height: 8),
                    Text('No records found',
                        style:
                            TextStyle(color: Colors.grey[400], fontSize: 14)),
                  ],
                ),
              ),
            )
          else
            ...attendance.records.map((record) {
              final status = record['status'] ?? 'absent';
              final date = record['date']?.toString().substring(0, 10) ?? '';
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _statusColor(status).withOpacity(0.1),
                    child: Icon(
                      status == 'present'
                          ? Icons.check
                          : status == 'late'
                              ? Icons.schedule
                              : Icons.close,
                      color: _statusColor(status),
                      size: 20,
                    ),
                  ),
                  title: Text(date,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: role != 'student' && record['student'] != null
                      ? Text(record['student']['name'] ?? '')
                      : null,
                  trailing: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _statusColor(status),
                      ),
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}
