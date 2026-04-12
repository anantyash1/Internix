import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/certificate_provider.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});

  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<CertificateProvider>(context, listen: false)
            .fetchCertificates());
  }

  @override
  Widget build(BuildContext context) {
    final certProvider = Provider.of<CertificateProvider>(context);

    if (certProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () => certProvider.fetchCertificates(),
      child: certProvider.certificates.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.emoji_events_outlined,
                      size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 8),
                  Text('No certificates yet',
                      style: TextStyle(color: Colors.grey[400], fontSize: 16)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: certProvider.certificates.length,
              itemBuilder: (context, index) {
                final cert = certProvider.certificates[index];
                final internship = cert['internship'];
                final certNumber = cert['certificateNumber'] ?? '';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.emoji_events,
                              color: Color(0xFFF59E0B), size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                internship?['title'] ?? 'Internship',
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '#$certNumber',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey[500]),
                              ),
                              if (cert['grade'] != null)
                                Text(
                                  'Grade: ${cert['grade']}',
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF059669),
                                      fontWeight: FontWeight.w500),
                                ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () async {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Downloading certificate...')),
                            );
                            final path = await certProvider
                                .downloadCertificate(cert['_id'], certNumber);
                            if (path != null && mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text('Saved to: $path')),
                              );
                            } else if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Download failed'),
                                    backgroundColor: Colors.red),
                              );
                            }
                          },
                          icon: const Icon(Icons.download,
                              color: Color(0xFF2563EB)),
                          tooltip: 'Download PDF',
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
