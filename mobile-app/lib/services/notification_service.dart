import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/app_notification.dart';

class NotificationService {
  static const String notificationsUrl =
      'http://10.0.2.2:8001/api/notifications/';

  Future<List<AppNotification>> fetchNotifications({
    required String token,
  }) async {
    final response = await http.get(
      Uri.parse(notificationsUrl),
      headers: {'Authorization': 'Token $token'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load notifications (${response.statusCode}): ${response.body}',
      );
    }

    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => AppNotification.fromJson(item)).toList();
  }

  Future<int> fetchUnreadCount({required String token}) async {
    final notifications = await fetchNotifications(token: token);
    return notifications.where((n) => !n.isRead).length;
  }

  Future<void> markAsRead({
    required String token,
    required int notificationId,
  }) async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:8001/api/notifications/$notificationId/read/'),
      headers: {'Authorization': 'Token $token'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to mark notification as read (${response.statusCode}): ${response.body}',
      );
    }
  }
}
