import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class Meeting {
  final String id;
  final String title;
  final String description;
  final String meetingLink;
  final String frequency;
  final String meetingTime;
  final int dayOfWeek;
  final List<String> targetRoles;
  final bool isActive;
  final int notifyMinutesBefore;
  final Map<String, dynamic>? createdBy;

  Meeting({
    required this.id,
    required this.title,
    required this.description,
    required this.meetingLink,
    required this.frequency,
    required this.meetingTime,
    required this.dayOfWeek,
    required this.targetRoles,
    required this.isActive,
    required this.notifyMinutesBefore,
    this.createdBy,
  });

  factory Meeting.fromJson(Map<String, dynamic> json) => Meeting(
        id: json['_id'] ?? '',
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        meetingLink: json['meetingLink'] ?? '',
        frequency: json['frequency'] ?? 'weekly',
        meetingTime: json['meetingTime'] ?? '09:00',
        dayOfWeek: json['dayOfWeek'] ?? 1,
        targetRoles: List<String>.from(json['targetRoles'] ?? ['all']),
        isActive: json['isActive'] ?? true,
        notifyMinutesBefore: json['notifyMinutesBefore'] ?? 5,
        createdBy: json['createdBy'],
      );

  String get frequencyLabel {
    switch (frequency) {
      case 'daily':  return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly':return 'Monthly';
      case 'once':   return 'One-time';
      default:       return frequency;
    }
  }

  static const _days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  String get dayLabel => (dayOfWeek >= 0 && dayOfWeek < 7) ? _days[dayOfWeek] : '';
}

class UpcomingMeeting {
  final Meeting meeting;
  final int minutesLeft;

  UpcomingMeeting({required this.meeting, required this.minutesLeft});
}

class MeetingProvider extends ChangeNotifier {
  List<Meeting> _meetings = [];
  List<UpcomingMeeting> _upcoming = [];
  bool _loading = false;
  String? _error;

  List<Meeting> get meetings => _meetings;
  List<UpcomingMeeting> get upcoming => _upcoming;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> fetchMeetings() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final data = await ApiService.get('/meetings');
      _meetings = (data['meetings'] as List).map((m) => Meeting.fromJson(m)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> fetchUpcoming() async {
    try {
      final data = await ApiService.get('/meetings/upcoming');
      _upcoming = (data['upcoming'] as List).map((m) {
        return UpcomingMeeting(
          meeting: Meeting.fromJson(m),
          minutesLeft: m['minutesLeft'] ?? 0,
        );
      }).toList();
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> createMeeting(Map<String, dynamic> body) async {
    try {
      await ApiService.post('/meetings', body: body);
      await fetchMeetings();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteMeeting(String id) async {
    try {
      await ApiService.delete('/meetings/$id');
      _meetings.removeWhere((m) => m.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
