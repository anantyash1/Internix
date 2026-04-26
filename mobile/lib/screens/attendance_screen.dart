import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../config/api_config.dart';
import '../providers/auth_provider.dart';
import '../providers/attendance_provider.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final _imagePicker = ImagePicker();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Provider.of<AttendanceProvider>(context, listen: false).fetchAttendance();
    });
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

  /// Capture a selfie from the front camera
  Future<File?> _captureSelfie() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        imageQuality: 80,
        maxWidth: 640,
        maxHeight: 640,
      );
      if (photo == null) return null;
      return File(photo.path);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Camera error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return null;
    }
  }

  Future<void> _handleCheckIn() async {
    final provider = Provider.of<AttendanceProvider>(context, listen: false);
    final messenger = ScaffoldMessenger.of(context);
    final schedule = provider.schedule;
    final requirePhoto = schedule?['requirePhoto'] ?? true;

    File? photoFile;

    if (requirePhoto) {
      // Show instruction dialog first
      final proceed = await _showPhotoInstructionDialog('Check In');
      if (!proceed) return;

      photoFile = await _captureSelfie();
      if (photoFile == null) return; // User cancelled
    }

    if (!mounted) return;

    // Show preview if photo captured
    if (photoFile != null) {
      final confirmed = await _showPhotoPreviewDialog(photoFile, 'Check In');
      if (!confirmed) return;
    }

    final result = await provider.checkIn(photoFile);

    if (!mounted) return;
    messenger.showSnackBar(SnackBar(
      content: Text(result['message'] ?? 'Done'),
      backgroundColor: result['success'] == true ? Colors.green : Colors.red,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _handleCheckOut() async {
    final provider = Provider.of<AttendanceProvider>(context, listen: false);
    final messenger = ScaffoldMessenger.of(context);
    final schedule = provider.schedule;
    final requirePhoto = schedule?['requirePhoto'] ?? true;

    File? photoFile;

    if (requirePhoto) {
      final proceed = await _showPhotoInstructionDialog('Check Out');
      if (!proceed) return;

      photoFile = await _captureSelfie();
      if (photoFile == null) return;
    }

    if (!mounted) return;

    if (photoFile != null) {
      final confirmed = await _showPhotoPreviewDialog(photoFile, 'Check Out');
      if (!confirmed) return;
    }

    final result = await provider.checkOut(photoFile);

    if (!mounted) return;
    messenger.showSnackBar(SnackBar(
      content: Text(result['message'] ?? 'Done'),
      backgroundColor: result['success'] == true ? Colors.green : Colors.red,
      behavior: SnackBarBehavior.floating,
    ));
  }

  /// Dialog to explain photo requirement
  Future<bool> _showPhotoInstructionDialog(String action) async {
    return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                const Icon(Icons.camera_alt, color: Color(0xFF2563EB)),
                const SizedBox(width: 8),
                Text('$action Selfie'),
              ],
            ),
            content: const Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'A selfie photo is required to verify your attendance.',
                  style: TextStyle(fontSize: 14),
                ),
                SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.lightbulb_outline,
                        size: 16, color: Colors.amber),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Make sure your face is clearly visible and well-lit.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(ctx, true),
                icon: const Icon(Icons.camera_alt, size: 16),
                label: const Text('Open Camera'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ) ??
        false;
  }

  /// Show captured photo preview for confirmation
  Future<bool> _showPhotoPreviewDialog(File photo, String action) async {
    return await showDialog<bool>(
          context: context,
          builder: (ctx) => Dialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                  child: Image.file(
                    photo,
                    width: double.infinity,
                    height: 280,
                    fit: BoxFit.cover,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Text(
                        'Use this photo for $action?',
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'This will be saved with your attendance record.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => Navigator.pop(ctx, false),
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text('Retake'),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              onPressed: () => Navigator.pop(ctx, true),
                              icon: const Icon(Icons.check, size: 16),
                              label: const Text('Confirm'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ) ??
        false;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final attendance = Provider.of<AttendanceProvider>(context);
    final role = auth.role;

    if (attendance.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final schedule = attendance.schedule;
    final isWorkingDay = attendance.isWorkingDay;
    final todayRecord = attendance.todayRecord;
    final isStudent = role == 'student';

    return RefreshIndicator(
      onRefresh: () => attendance.fetchAttendance(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Work schedule info banner
          if (isStudent && schedule != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      size: 16, color: Color(0xFF2563EB)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _scheduleSummary(schedule),
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF1E40AF)),
                    ),
                  ),
                ],
              ),
            ),

          // Non-working day banner
          if (isStudent && !isWorkingDay)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.event_busy, size: 16, color: Colors.grey),
                  SizedBox(width: 8),
                  Text('Today is not a scheduled working day.',
                      style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),

          // Check-in / Check-out card (student, working day)
          if (isStudent && isWorkingDay) ...[
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: todayRecord != null
                      ? const Color(0xFFBBF7D0)
                      : const Color(0xFFBFDBFE),
                ),
              ),
              color: todayRecord != null
                  ? const Color(0xFFF0FDF4)
                  : const Color(0xFFEFF6FF),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Today's status
                    Row(
                      children: [
                        Icon(
                          todayRecord != null
                              ? (attendance.checkedOut
                                  ? Icons.check_circle
                                  : Icons.login)
                              : Icons.schedule,
                          color: todayRecord != null
                              ? const Color(0xFF10B981)
                              : const Color(0xFF2563EB),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            attendance.checkedOut
                                ? 'Attendance complete!'
                                : todayRecord != null
                                    ? 'Checked in at ${todayRecord['checkInTime'] ?? ''}'
                                    : "Today's attendance not marked",
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: todayRecord != null
                                  ? const Color(0xFF065F46)
                                  : const Color(0xFF1E40AF),
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Photo thumbnails if exist
                    if (todayRecord != null &&
                        (todayRecord['checkInPhoto'] != null ||
                            todayRecord['checkOutPhoto'] != null)) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          if (todayRecord['checkInPhoto'] != null)
                            _buildPhotoThumb(todayRecord['checkInPhoto'], 'In',
                                Colors.green),
                          if (todayRecord['checkOutPhoto'] != null) ...[
                            const SizedBox(width: 8),
                            _buildPhotoThumb(todayRecord['checkOutPhoto'],
                                'Out', Colors.orange),
                          ],
                        ],
                      ),
                    ],

                    const SizedBox(height: 14),

                    // Action buttons
                    if (!attendance.todayMarked)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed:
                              attendance.submitting ? null : _handleCheckIn,
                          icon: attendance.submitting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.camera_alt, size: 18),
                          label: Text(attendance.submitting
                              ? 'Recording...'
                              : 'Check In with Selfie'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2563EB),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      )
                    else if (!attendance.checkedOut)
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed:
                              attendance.submitting ? null : _handleCheckOut,
                          icon: attendance.submitting
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child:
                                      CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.logout, size: 18),
                          label: Text(attendance.submitting
                              ? 'Recording...'
                              : 'Check Out with Selfie'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            side: const BorderSide(color: Color(0xFF10B981)),
                            foregroundColor: const Color(0xFF10B981),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      )
                    else
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle,
                                color: Color(0xFF10B981), size: 18),
                            SizedBox(width: 8),
                            Text('Done for today!',
                                style: TextStyle(
                                    color: Color(0xFF065F46),
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Records list header
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
              final hasPhoto = record['checkInPhoto'] != null;

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      // Status indicator
                      CircleAvatar(
                        backgroundColor:
                            _statusColor(status).withValues(alpha: 0.1),
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
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(date,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w600, fontSize: 14)),
                            if (record['checkInTime'] != null)
                              Text(
                                'In: ${record['checkInTime']}'
                                '${record['checkOutTime'] != null ? '  Out: ${record['checkOutTime']}' : ''}',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey.shade600),
                              ),
                            if (role != 'student' && record['student'] != null)
                              Text(record['student']['name'] ?? '',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade500)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color:
                                  _statusColor(status).withValues(alpha: 0.1),
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
                          if (hasPhoto)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.camera_alt,
                                      size: 10, color: Colors.grey.shade400),
                                  Text(' photo',
                                      style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey.shade400)),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildPhotoThumb(String url, String label, Color borderColor) {
    final resolvedUrl = ApiConfig.resolveUri(url).toString();
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            resolvedUrl,
            width: 60,
            height: 60,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 60,
              height: 60,
              color: Colors.grey.shade200,
              child: const Icon(Icons.broken_image, size: 20),
            ),
          ),
        ),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
                fontSize: 10, color: borderColor, fontWeight: FontWeight.w600)),
      ],
    );
  }

  String _scheduleSummary(Map<String, dynamic> schedule) {
    final startTime = schedule['startTime']?.toString() ?? '--:--';
    final endTime = schedule['endTime']?.toString() ?? '--:--';
    final workingDays = (schedule['workingDays'] as List?)
            ?.map((day) => day.toString())
            .toList() ??
        const <String>[];
    final requirePhoto = schedule['requirePhoto'] == true;

    final dayText =
        workingDays.isEmpty ? 'No working days set' : workingDays.join(', ');
    final photoText = requirePhoto ? ' | Photo required' : '';

    return '$startTime - $endTime | $dayText$photoText';
  }
}
