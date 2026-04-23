import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TestQuestion {
  final String id;
  final String questionText;
  final String type; // 'mcq' or 'short_answer'
  final Map<String, String> options;
  final int points;
  final int order;

  TestQuestion({
    required this.id,
    required this.questionText,
    required this.type,
    required this.options,
    required this.points,
    required this.order,
  });

  factory TestQuestion.fromJson(Map<String, dynamic> json) => TestQuestion(
        id: json['_id'] ?? '',
        questionText: json['questionText'] ?? '',
        type: json['type'] ?? 'mcq',
        options: json['options'] != null
            ? Map<String, String>.from(
                json['options'].map((k, v) => MapEntry(k, v?.toString() ?? '')))
            : {},
        points: json['points'] ?? 1,
        order: json['order'] ?? 0,
      );
}

class TestModel {
  final String id;
  final String title;
  final String description;
  final String instructions;
  final int duration;
  final int totalPoints;
  final String status;
  final String? dueDate;
  final int passingScore;
  final bool showResultsToStudent;
  final List<TestQuestion> questions;
  final Map<String, dynamic>? mySubmission;

  TestModel({
    required this.id,
    required this.title,
    required this.description,
    required this.instructions,
    required this.duration,
    required this.totalPoints,
    required this.status,
    this.dueDate,
    required this.passingScore,
    required this.showResultsToStudent,
    required this.questions,
    this.mySubmission,
  });

  factory TestModel.fromJson(Map<String, dynamic> json) => TestModel(
        id: json['_id'] ?? '',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        instructions: json['instructions'] ?? '',
        duration: json['duration'] ?? 30,
        totalPoints: json['totalPoints'] ?? 0,
        status: json['status'] ?? 'draft',
        dueDate: json['dueDate'],
        passingScore: json['passingScore'] ?? 60,
        showResultsToStudent: json['showResultsToStudent'] != false,
        questions: (json['questions'] as List? ?? [])
            .map((q) => TestQuestion.fromJson(q))
            .toList(),
        mySubmission: json['mySubmission'],
      );

  bool get isOverdue =>
      dueDate != null && DateTime.now().isAfter(DateTime.parse(dueDate!));
}

class TestProvider extends ChangeNotifier {
  List<TestModel> _tests = [];
  bool _loading = false;
  bool _submitting = false;

  List<TestModel> get tests => _tests;
  bool get loading => _loading;
  bool get submitting => _submitting;

  Future<void> fetchTests() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiService.get('/tests');
      final list = (data['tests'] as List? ?? []);
      _tests = list.map((t) => TestModel.fromJson(t)).toList();
    } catch (e) {
      debugPrint('Test fetch error: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>> startTest(String testId) async {
    final data = await ApiService.post('/tests/$testId/start', body: {});
    return data;
  }

  Future<Map<String, dynamic>> submitTest(
    String testId,
    Map<String, String> answers,
    int timeTakenSeconds, {
    bool autoSubmitted = false,
  }) async {
    _submitting = true;
    notifyListeners();
    try {
      final answerList = answers.entries
          .map((e) => {'questionId': e.key, 'answer': e.value})
          .toList();
      final data = await ApiService.post('/tests/$testId/submit', body: {
        'answers': answerList,
        'timeTakenSeconds': timeTakenSeconds,
        'autoSubmitted': autoSubmitted,
      });
      _submitting = false;
      notifyListeners();
      await fetchTests();
      return data;
    } catch (e) {
      _submitting = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getMyResult(String testId) async {
    return await ApiService.get('/tests/$testId/my-result');
  }

  Future<Map<String, dynamic>> getTestResults(String testId) async {
    return await ApiService.get('/tests/$testId/results');
  }
}
