import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/student_user.dart';

class SessionService {
  static const String _studentUserKey = 'student_user_session';

  Future<void> saveStudentUser(StudentUser studentUser) async {
    final prefs = await SharedPreferences.getInstance();

    final data = {
      'user': {
        'id': studentUser.id,
        'username': studentUser.username,
        'email': studentUser.email,
        'full_name': studentUser.fullName,
      },
      'profile': {
        'wallet_balance': studentUser.walletBalance,
        'warning_count': studentUser.warningCount,
        'is_banned': studentUser.isBanned,
      },
      'token': studentUser.token,
      'has_password': studentUser.hasPassword,
      'is_new_user': studentUser.isNewUser,
    };

    await prefs.setString(_studentUserKey, jsonEncode(data));
  }

  Future<StudentUser?> getStudentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_studentUserKey);

    if (raw == null || raw.isEmpty) {
      return null;
    }

    try {
      final Map<String, dynamic> data = jsonDecode(raw);
      return StudentUser.fromJson(data);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_studentUserKey);
  }
}
