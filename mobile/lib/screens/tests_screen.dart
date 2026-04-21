import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/test_provider.dart';

class TestsScreen extends StatefulWidget {
  const TestsScreen({super.key});

  @override
  State<TestsScreen> createState() => _TestsScreenState();
}

class _TestsScreenState extends State<TestsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<TestProvider>(context, listen: false).fetchTests());
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active': return Colors.green;
      case 'draft': return Colors.grey;
      case 'closed': return Colors.red;
      default: return Colors.grey;
    }
  }

  String _fmtTime(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final testProvider = Provider.of<TestProvider>(context);
    final role = auth.role;

    if (testProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () => testProvider.fetchTests(),
      child: testProvider.tests.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.quiz_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 8),
                  Text(
                    role == 'student' ? 'No tests assigned yet' : 'No tests created yet',
                    style: TextStyle(color: Colors.grey[400], fontSize: 16),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: testProvider.tests.length,
              itemBuilder: (context, index) {
                final test = testProvider.tests[index];
                final mySub = test.mySubmission;
                final hasSubmitted = mySub != null &&
                    (mySub['status'] == 'submitted' || mySub['status'] == 'reviewed');
                final inProgress = mySub != null && mySub['status'] == 'in_progress';
                final isOverdue = test.isOverdue;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: isOverdue && !hasSubmitted
                          ? Colors.red.shade200
                          : Colors.grey.shade200,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                test.title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 15),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: _statusColor(test.status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                test.status,
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: _statusColor(test.status)),
                              ),
                            ),
                          ],
                        ),
                        if (test.description.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              test.description,
                              style: TextStyle(
                                  fontSize: 13, color: Colors.grey[600]),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            _chip(Icons.timer_outlined, '${test.duration} min'),
                            _chip(Icons.quiz_outlined, '${test.questions.length} Qs'),
                            _chip(Icons.star_outline, '${test.totalPoints} pts'),
                            if (test.passingScore > 0)
                              _chip(Icons.check_circle_outline, 'Pass: ${test.passingScore}%'),
                            if (test.dueDate != null)
                              _chip(
                                Icons.calendar_today,
                                'Due: ${test.dueDate!.substring(0, 10)}',
                                color: isOverdue ? Colors.red : Colors.grey,
                              ),
                          ],
                        ),
                        if (mySub != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: hasSubmitted
                                  ? Colors.green.shade50
                                  : const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: hasSubmitted
                                    ? Colors.green.shade200
                                    : const Color(0xFFBFDBFE),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  hasSubmitted
                                      ? Icons.check_circle
                                      : Icons.pending,
                                  size: 14,
                                  color: hasSubmitted
                                      ? Colors.green
                                      : const Color(0xFF2563EB),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  hasSubmitted
                                      ? 'Submitted${mySub['percentage'] != null ? ' · ${mySub['percentage']}%' : ''}'
                                      : 'In Progress',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: hasSubmitted
                                        ? Colors.green.shade700
                                        : const Color(0xFF1E40AF),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 12),
                        // Actions
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (role == 'student') ...[
                              if (hasSubmitted && test.showResultsToStudent)
                                OutlinedButton.icon(
                                  onPressed: () => _viewResult(context, test),
                                  icon: const Icon(Icons.bar_chart, size: 16),
                                  label: const Text('My Result'),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 8),
                                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              if (!hasSubmitted && test.status == 'active' && !isOverdue) ...[
                                const SizedBox(width: 8),
                                ElevatedButton.icon(
                                  onPressed: () => _startTest(context, test),
                                  icon: Icon(
                                    inProgress ? Icons.play_arrow : Icons.play_circle,
                                    size: 16,
                                  ),
                                  label: Text(inProgress ? 'Resume' : 'Start Test'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF2563EB),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 8),
                                    textStyle: const TextStyle(
                                        fontSize: 12, fontWeight: FontWeight.w700),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                              ],
                              if (isOverdue && !hasSubmitted)
                                const Text('Deadline passed',
                                    style: TextStyle(
                                        color: Colors.red,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600)),
                            ],
                            if (role == 'mentor' || role == 'admin')
                              OutlinedButton.icon(
                                onPressed: () => _viewResults(context, test),
                                icon: const Icon(Icons.bar_chart, size: 16),
                                label: const Text('Results'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 8),
                                  textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _chip(IconData icon, String label, {Color color = const Color(0xFF64748B)}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }

  Future<void> _startTest(BuildContext context, TestModel test) async {
    final testProvider = Provider.of<TestProvider>(context, listen: false);
    try {
      final data = await testProvider.startTest(test.id);
      if (!mounted) return;
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TestTakingScreen(
            testData: data['test'] as Map<String, dynamic>,
            submission: data['submission'] as Map<String, dynamic>,
            testProvider: testProvider,
          ),
        ),
      );
      await testProvider.fetchTests();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ));
      }
    }
  }

  Future<void> _viewResult(BuildContext context, TestModel test) async {
    final testProvider = Provider.of<TestProvider>(context, listen: false);
    try {
      final data = await testProvider.getMyResult(test.id);
      if (!mounted) return;
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
        builder: (_) => MyResultSheet(data: data),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Failed to load result'),
          backgroundColor: Colors.red,
        ));
      }
    }
  }

  Future<void> _viewResults(BuildContext context, TestModel test) async {
    final testProvider = Provider.of<TestProvider>(context, listen: false);
    try {
      final data = await testProvider.getTestResults(test.id);
      if (!mounted) return;
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
        builder: (_) => AdminResultsSheet(data: data, testTitle: test.title),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Failed to load results'),
          backgroundColor: Colors.red,
        ));
      }
    }
  }
}

// ─── Test Taking Screen ───────────────────────────────────────────────────────
class TestTakingScreen extends StatefulWidget {
  final Map<String, dynamic> testData;
  final Map<String, dynamic> submission;
  final TestProvider testProvider;

  const TestTakingScreen({
    super.key,
    required this.testData,
    required this.submission,
    required this.testProvider,
  });

  @override
  State<TestTakingScreen> createState() => _TestTakingScreenState();
}

class _TestTakingScreenState extends State<TestTakingScreen> {
  final Map<String, String> _answers = {};
  int _currentQ = 0;
  int _timeLeft = 0;
  Timer? _timer;
  bool _submitting = false;
  late int _startTime;

  @override
  void initState() {
    super.initState();
    _startTime = DateTime.now().millisecondsSinceEpoch;
    final startedAt = DateTime.parse(widget.submission['startedAt'] ?? DateTime.now().toIso8601String());
    final elapsed = DateTime.now().difference(startedAt).inSeconds;
    final duration = (widget.testData['duration'] as int? ?? 30) * 60;
    _timeLeft = (duration - elapsed).clamp(0, duration);

    // Pre-fill existing answers
    final existingAnswers = widget.submission['answers'] as List? ?? [];
    for (final ans in existingAnswers) {
      if (ans['answer'] != null && ans['answer'].toString().isNotEmpty) {
        _answers[ans['questionId'].toString()] = ans['answer'].toString();
      }
    }

    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        if (_timeLeft > 0) {
          _timeLeft--;
        } else {
          _timer?.cancel();
          _submit(autoSubmit: true);
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _fmtTime(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _submit({bool autoSubmit = false}) async {
    if (_submitting) return;
    if (!autoSubmit) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Submit Test'),
          content: const Text('Are you sure you want to submit? This cannot be undone.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white),
              child: const Text('Submit'),
            ),
          ],
        ),
      );
      if (confirm != true) return;
    }

    setState(() => _submitting = true);
    _timer?.cancel();

    try {
      final timeTaken = (DateTime.now().millisecondsSinceEpoch - _startTime) ~/ 1000;
      await widget.testProvider.submitTest(
        widget.testData['_id'] as String,
        _answers,
        timeTaken,
        autoSubmitted: autoSubmit,
      );

      if (!mounted) return;
      final sub = widget.testProvider.tests.firstWhere(
        (t) => t.id == widget.testData['_id'],
        orElse: () => TestModel(id: '', title: '', description: '', instructions: '', duration: 0, totalPoints: 0, status: '', passingScore: 0, showResultsToStudent: false, questions: []),
      ).mySubmission;

      _showResultDialog(sub);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ));
        setState(() => _submitting = false);
      }
    }
  }

  void _showResultDialog(Map<String, dynamic>? sub) {
    final pct = sub?['percentage'] ?? 0;
    final score = sub?['score'] ?? 0;
    final total = sub?['totalPoints'] ?? (widget.testData['totalPoints'] ?? 0);
    final passed = sub?['passed'];
    final passingScore = widget.testData['passingScore'] ?? 60;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(
              (passed == true || pct >= passingScore) ? Icons.emoji_events : Icons.info_outline,
              color: (passed == true || pct >= passingScore) ? Colors.amber : Colors.orange,
              size: 28,
            ),
            const SizedBox(width: 8),
            Text(autoSubmit ? 'Auto Submitted!' : 'Test Submitted!', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$score / $total', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, letterSpacing: -1)),
            Text('$pct%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: (passed == true || pct >= passingScore) ? Colors.green : Colors.red)),
            const SizedBox(height: 8),
            if (passed == true || pct >= passingScore)
              const Text('🎉 Passed!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w700))
            else if (passed == false)
              Text('Passing score: $passingScore%', style: const TextStyle(color: Colors.orange, fontSize: 13))
            else
              const Text('⏳ Short answers pending mentor review', style: TextStyle(color: Colors.orange, fontSize: 12), textAlign: TextAlign.center),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final questions = (widget.testData['questions'] as List? ?? []);
    final totalQ = questions.length;
    final answered = _answers.values.where((v) => v.isNotEmpty).length;
    final timerColor = _timeLeft < 60 ? Colors.red : _timeLeft < 300 ? Colors.orange : Colors.green;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(widget.testData['title'] ?? 'Test', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.grey[900],
        elevation: 0.5,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: totalQ > 0 ? answered / totalQ : 0,
            backgroundColor: Colors.grey[200],
            color: const Color(0xFF2563EB),
            minHeight: 4,
          ),
        ),
        actions: [
          // Timer
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: timerColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: timerColor.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.timer, size: 14, color: timerColor),
                const SizedBox(width: 4),
                Text(
                  _fmtTime(_timeLeft),
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: timerColor),
                ),
              ],
            ),
          ),
        ],
      ),
      body: _submitting
          ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [CircularProgressIndicator(), SizedBox(height: 16), Text('Submitting…')]))
          : questions.isEmpty
              ? const Center(child: Text('No questions found'))
              : Column(
                  children: [
                    // Question counter
                    Container(
                      color: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Question ${_currentQ + 1} of $totalQ',
                              style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                          Text('$answered/$totalQ answered',
                              style: const TextStyle(fontSize: 13, color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    // Question
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: _buildQuestion(questions[_currentQ]),
                      ),
                    ),
                    // Navigation
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(top: BorderSide(color: Colors.grey.shade200)),
                      ),
                      child: Row(
                        children: [
                          if (_currentQ > 0)
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => setState(() => _currentQ--),
                                icon: const Icon(Icons.chevron_left, size: 18),
                                label: const Text('Previous'),
                                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                              ),
                            ),
                          if (_currentQ > 0) const SizedBox(width: 12),
                          Expanded(
                            flex: _currentQ == 0 ? 1 : 1,
                            child: _currentQ < totalQ - 1
                                ? ElevatedButton.icon(
                                    onPressed: () => setState(() => _currentQ++),
                                    icon: const Icon(Icons.chevron_right, size: 18),
                                    label: const Text('Next'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                    ),
                                  )
                                : ElevatedButton.icon(
                                    onPressed: () => _submit(),
                                    icon: const Icon(Icons.check_circle, size: 18),
                                    label: const Text('Submit Test'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green, foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                    ),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildQuestion(Map<String, dynamic> q) {
    final qId = q['_id'] as String? ?? '';
    final type = q['type'] as String? ?? 'mcq';
    final options = q['options'] as Map<String, dynamic>? ?? {};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: type == 'mcq' ? const Color(0xFFDBEAFE) : const Color(0xFFEDE9FE),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      type == 'mcq' ? 'Multiple Choice' : 'Short Answer',
                      style: TextStyle(
                        fontSize: 10, fontWeight: FontWeight.w700,
                        color: type == 'mcq' ? const Color(0xFF1E40AF) : const Color(0xFF5B21B6),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text('${q['points'] ?? 1} pt${(q['points'] ?? 1) != 1 ? 's' : ''}',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500], fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                q['questionText'] as String? ?? '',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF0F172A), height: 1.4),
              ),
              const SizedBox(height: 16),
              if (type == 'mcq')
                ...['A', 'B', 'C', 'D'].where((opt) => options[opt] != null && options[opt].toString().isNotEmpty).map((opt) {
                  final selected = _answers[qId] == opt;
                  return GestureDetector(
                    onTap: () => setState(() => _answers[qId] = opt),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: selected ? const Color(0xFFEFF6FF) : Colors.grey[50],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected ? const Color(0xFF2563EB) : Colors.grey.shade200,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 26, height: 26, decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: selected ? const Color(0xFF2563EB) : Colors.grey[100],
                              border: Border.all(color: selected ? const Color(0xFF2563EB) : Colors.grey.shade300),
                            ),
                            child: Center(
                              child: selected
                                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                                  : Text(opt, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.grey[600])),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              options[opt]?.toString() ?? '',
                              style: TextStyle(
                                fontSize: 14,
                                color: selected ? const Color(0xFF1E40AF) : const Color(0xFF334155),
                                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList()
              else
                TextField(
                  controller: TextEditingController(text: _answers[qId] ?? ''),
                  onChanged: (v) => _answers[qId] = v,
                  maxLines: 5,
                  decoration: InputDecoration(
                    hintText: 'Type your answer here…',
                    hintStyle: TextStyle(color: Colors.grey[400]),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF2563EB), width: 2)),
                    filled: true, fillColor: Colors.grey[50],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── My Result Sheet ──────────────────────────────────────────────────────────
class MyResultSheet extends StatelessWidget {
  final Map<String, dynamic> data;
  const MyResultSheet({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final sub = data['submission'] as Map<String, dynamic>? ?? {};
    final test = data['test'] as Map<String, dynamic>? ?? {};
    final pct = sub['percentage'] ?? 0;
    final passed = sub['passed'];
    final answers = (sub['answers'] as List? ?? []);

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(test['title'] ?? 'Result', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: (passed == true || pct >= (test['passingScore'] ?? 60)) ? Colors.green.shade50 : Colors.red.shade50,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(children: [
                          Text('${sub['score']}/${sub['totalPoints']}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                          Text('Score', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ]),
                        Column(children: [
                          Text('$pct%', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: (passed == true || pct >= 60) ? Colors.green : Colors.red)),
                          Text('Percentage', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ]),
                        Column(children: [
                          Icon(passed == true ? Icons.check_circle : passed == false ? Icons.cancel : Icons.hourglass_empty,
                              color: passed == true ? Colors.green : passed == false ? Colors.red : Colors.orange, size: 32),
                          Text(passed == true ? 'Passed' : passed == false ? 'Failed' : 'Pending', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ]),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                controller: controller,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: answers.length,
                itemBuilder: (_, i) {
                  final ans = answers[i];
                  final correct = ans['isCorrect'];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: correct == true ? Colors.green.shade50 : correct == false ? Colors.red.shade50 : Colors.grey[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: correct == true ? Colors.green.shade200 : correct == false ? Colors.red.shade200 : Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Q${i + 1}: ${ans['questionText'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        Text('Your answer: ${ans['answer']?.toString().isEmpty == true ? '(not answered)' : ans['answer']}',
                            style: TextStyle(fontSize: 12, color: Colors.grey[700])),
                        if (correct == false && ans['correctAnswer'] != null)
                          Text('Correct: ${ans['correctAnswer']}', style: const TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.w600)),
                        if (correct == null)
                          const Text('⏳ Pending mentor review', style: TextStyle(fontSize: 11, color: Colors.orange)),
                        Text(
                          correct == true ? '+${ans['pointsAwarded']} pts ✓' : correct == false ? '0 pts ✗' : '${ans['pointsAwarded'] ?? 0} pts',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: correct == true ? Colors.green : correct == false ? Colors.red : Colors.grey),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Admin Results Sheet ──────────────────────────────────────────────────────
class AdminResultsSheet extends StatelessWidget {
  final Map<String, dynamic> data;
  final String testTitle;
  const AdminResultsSheet({super.key, required this.data, required this.testTitle});

  @override
  Widget build(BuildContext context) {
    final stats = data['stats'] as Map<String, dynamic>? ?? {};
    final submissions = data['submissions'] as List? ?? [];
    final notSubmitted = data['notSubmitted'] as List? ?? [];

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Column(
                children: [
                  Text(testTitle, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _statBox('Total', '${stats['total'] ?? 0}', Colors.blue),
                      _statBox('Submitted', '${stats['submitted'] ?? 0}', Colors.green),
                      _statBox('Avg Score', '${stats['avgScore'] ?? 0}%', Colors.purple),
                      _statBox('Not Yet', '${stats['notSubmitted'] ?? 0}', Colors.red),
                    ],
                  ),
                ],
              ),
            ),
            if (notSubmitted.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red.shade200)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('⚠ Not Submitted:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Colors.red)),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 6, runSpacing: 4,
                        children: (notSubmitted as List).map((s) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(20)),
                          child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.red)),
                        )).toList(),
                      ),
                    ],
                  ),
                ),
              ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Align(alignment: Alignment.centerLeft, child: Text('Submissions', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
            ),
            Expanded(
              child: ListView.builder(
                controller: controller,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: submissions.length,
                itemBuilder: (_, i) {
                  final sub = submissions[i] as Map<String, dynamic>;
                  final student = sub['student'] as Map<String, dynamic>? ?? {};
                  final pct = sub['percentage'] ?? 0;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[50], borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: const Color(0xFFDBEAFE), radius: 18,
                          child: Text((student['name'] as String? ?? '?')[0],
                              style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1E40AF))),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(student['name'] ?? '—', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              Text(sub['status'] ?? '', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('${sub['score']}/${sub['totalPoints']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            Text('$pct%', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pct >= 60 ? Colors.green : Colors.red)),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 3),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.2))),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: color)),
            Text(label, style: TextStyle(fontSize: 10, color: Colors.grey[600], fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}