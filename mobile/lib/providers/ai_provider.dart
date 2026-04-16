import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AiMessage {
  final String role;
  final String content;
  AiMessage({required this.role, required this.content});
}

class AiProvider extends ChangeNotifier {
  final List<AiMessage> _messages = [];
  bool _loading = false;

  List<AiMessage> get messages => _messages;
  bool get loading => _loading;

  Future<void> sendMessage(String text) async {
    _messages.add(AiMessage(role: 'user', content: text));
    _loading = true;
    notifyListeners();

    try {
      final apiMessages = _messages
          .map((m) => {'role': m.role, 'content': m.content})
          .toList();
      final data = await ApiService.post('/ai/chat',
          body: {'messages': apiMessages});
      _messages.add(AiMessage(role: 'assistant', content: data['reply'] ?? ''));
    } catch (_) {
      _messages.add(AiMessage(
          role: 'assistant', content: 'Sorry, something went wrong.'));
    }
    _loading = false;
    notifyListeners();
  }

  void clear() {
    _messages.clear();
    notifyListeners();
  }
}