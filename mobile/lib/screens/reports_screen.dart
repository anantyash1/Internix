import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../providers/report_provider.dart';
import '../config/api_config.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Provider.of<ReportProvider>(context, listen: false).fetchReports();
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'under_review':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  void _showUploadDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    File? selectedFile;
    String? fileName;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Upload Report',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'Title'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: 'Description'),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  final result = await FilePicker.platform.pickFiles(
                    type: FileType.custom,
                    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
                  );
                  if (result != null) {
                    setModalState(() {
                      selectedFile = File(result.files.single.path!);
                      fileName = result.files.single.name;
                    });
                  }
                },
                icon: const Icon(Icons.attach_file),
                label: Text(fileName ?? 'Select File (PDF/Image)'),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    if (titleController.text.isEmpty || selectedFile == null) {
                      messenger.showSnackBar(
                        const SnackBar(
                            content: Text('Title and file required')),
                      );
                      return;
                    }
                    Navigator.pop(ctx);
                    final ok = await Provider.of<ReportProvider>(context,
                            listen: false)
                        .uploadReport(titleController.text, descController.text,
                            selectedFile!);
                    if (mounted) {
                      messenger.showSnackBar(SnackBar(
                        content:
                            Text(ok ? 'Report uploaded!' : 'Upload failed'),
                        backgroundColor: ok ? Colors.green : Colors.red,
                      ));
                    }
                  },
                  child: const Text('Upload'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openReportUrl(String rawUrl) async {
    if (rawUrl.trim().isEmpty) return;
    final uri = ApiConfig.resolveUri(rawUrl);
    if (uri.toString().isEmpty) return;

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to open report link'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _downloadReport(
    BuildContext context,
    Map<String, dynamic> report,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    final reportProvider = Provider.of<ReportProvider>(context, listen: false);
    final fileUrl = report['fileUrl']?.toString() ?? '';
    if (fileUrl.isEmpty) return;

    messenger.showSnackBar(
      const SnackBar(content: Text('Downloading report...')),
    );

    final path = await reportProvider.downloadReportFile(
      fileUrl,
      fallbackName: report['title']?.toString() ?? 'report',
    );

    if (!mounted) return;
    if (path == null) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(reportProvider.error ?? 'Download failed'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    messenger.showSnackBar(
      SnackBar(content: Text('Saved to: $path')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final reportProvider = Provider.of<ReportProvider>(context);
    final role = auth.role;

    if (reportProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      floatingActionButton: role == 'student'
          ? FloatingActionButton.extended(
              onPressed: _showUploadDialog,
              icon: const Icon(Icons.upload),
              label: const Text('Upload'),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: () => reportProvider.fetchReports(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (reportProvider.error != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Text(
                  reportProvider.error!,
                  style:
                      const TextStyle(color: Color(0xFFB91C1C), fontSize: 12),
                ),
              ),
            if (reportProvider.reports.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 96),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.description_outlined,
                        size: 64, color: Colors.grey[300]),
                    const SizedBox(height: 8),
                    Text(
                      'No reports found',
                      style: TextStyle(color: Colors.grey[400], fontSize: 16),
                    ),
                  ],
                ),
              )
            else
              ...reportProvider.reports.map((report) {
                final status = report['status'] ?? 'submitted';
                final title = report['title']?.toString() ?? '';
                final description = report['description']?.toString() ?? '';
                final feedback = report['feedback']?.toString() ?? '';
                final fileUrl = report['fileUrl']?.toString() ?? '';
                final studentName = report['student']?['name']?.toString();

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 2),
                              child: Icon(Icons.description,
                                  size: 20, color: Colors.grey),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                title,
                                style: const TextStyle(
                                    fontSize: 15, fontWeight: FontWeight.w600),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color:
                                    _statusColor(status).withValues(alpha: 0.1),
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
                          ],
                        ),
                        if (description.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              description,
                              style: TextStyle(
                                  color: Colors.grey[600], fontSize: 13),
                            ),
                          ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            if (studentName != null)
                              Text(
                                'By: $studentName',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey[500]),
                              ),
                            if (fileUrl.isNotEmpty)
                              TextButton.icon(
                                onPressed: () => _openReportUrl(fileUrl),
                                icon: const Icon(Icons.open_in_new, size: 16),
                                label: const Text('View',
                                    style: TextStyle(fontSize: 12)),
                              ),
                            if (fileUrl.isNotEmpty)
                              TextButton.icon(
                                onPressed: () =>
                                    _downloadReport(context, report),
                                icon: const Icon(Icons.download_rounded,
                                    size: 16),
                                label: const Text('Download',
                                    style: TextStyle(fontSize: 12)),
                              ),
                          ],
                        ),
                        if (feedback.isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(top: 8),
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
                                  child: Text(
                                    feedback,
                                    style: const TextStyle(
                                        fontSize: 12, color: Color(0xFF1E40AF)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
