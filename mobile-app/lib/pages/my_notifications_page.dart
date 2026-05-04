import 'package:flutter/material.dart';
import '../utils/date_formatters.dart';

import '../models/app_notification.dart';
import '../models/student_user.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import 'auth_choice_page.dart';

class MyNotificationsPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const MyNotificationsPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<MyNotificationsPage> createState() => _MyNotificationsPageState();
}

class _MyNotificationsPageState extends State<MyNotificationsPage> {
  final NotificationService _notificationService = NotificationService();

  bool _loading = true;
  String? _error;
  List<AppNotification> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final notifications = await _notificationService.fetchNotifications(
        token: widget.studentUser.token,
      );

      setState(() {
        _notifications = notifications;
      });

      await _markUnreadNotificationsAsRead(notifications);
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _markUnreadNotificationsAsRead(
    List<AppNotification> notifications,
  ) async {
    final unreadNotifications = notifications.where((n) => !n.isRead).toList();

    for (final notification in unreadNotifications) {
      try {
        await _notificationService.markAsRead(
          token: widget.studentUser.token,
          notificationId: notification.id,
        );
      } catch (_) {}
    }

    if (!mounted) return;

    setState(() {
      _notifications = notifications
          .map(
            (n) => AppNotification(
              id: n.id,
              recipientUser: n.recipientUser,
              recipientRole: n.recipientRole,
              type: n.type,
              title: n.title,
              message: n.message,
              isRead: true,
              createdAt: n.createdAt,
            ),
          )
          .toList();
    });
  }

  Future<void> _logout() async {
    await widget.authService.signOut();

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => AuthChoicePage(authService: widget.authService),
      ),
      (route) => false,
    );
  }

  IconData _notificationIcon(String type) {
    switch (type.toLowerCase()) {
      case 'ride_started':
        return Icons.play_circle_fill;
      case 'ride_ended':
        return Icons.stop_circle;
      case 'wallet_top_up':
        return Icons.account_balance_wallet;
      default:
        return Icons.notifications;
    }
  }

  Color _notificationColor(String type) {
    switch (type.toLowerCase()) {
      case 'ride_started':
        return Colors.blue;
      case 'ride_ended':
        return Colors.green;
      case 'wallet_top_up':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Notifications'),
        actions: [
          IconButton(
            onPressed: _loadNotifications,
            icon: const Icon(Icons.refresh),
          ),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(child: Text(_error!, textAlign: TextAlign.center))
            : _notifications.isEmpty
            ? const Center(child: Text('No notifications found.'))
            : ListView.builder(
                itemCount: _notifications.length,
                itemBuilder: (context, index) {
                  final notification = _notifications[index];

                  return Card(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            backgroundColor: _notificationColor(
                              notification.type,
                            ).withOpacity(0.15),
                            child: Icon(
                              _notificationIcon(notification.type),
                              color: _notificationColor(notification.type),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        notification.title,
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: notification.isRead
                                              ? FontWeight.w500
                                              : FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    if (!notification.isRead)
                                      Container(
                                        width: 10,
                                        height: 10,
                                        decoration: const BoxDecoration(
                                          color: Colors.red,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(notification.message),
                                const SizedBox(height: 8),
                                Text(
                                  DateFormatters.formatDateTime(
                                    notification.createdAt,
                                  ),
                                  style: const TextStyle(
                                    color: Colors.black54,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
