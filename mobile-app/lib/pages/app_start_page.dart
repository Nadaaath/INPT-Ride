import 'package:flutter/material.dart';

import '../models/student_user.dart';
import '../services/auth_service.dart';
import '../services/session_service.dart';
import 'auth_choice_page.dart';
import 'student_home_page.dart';

class AppStartPage extends StatefulWidget {
  final AuthService authService;

  const AppStartPage({super.key, required this.authService});

  @override
  State<AppStartPage> createState() => _AppStartPageState();
}

class _AppStartPageState extends State<AppStartPage> {
  final SessionService _sessionService = SessionService();

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final StudentUser? studentUser = await _sessionService.getStudentUser();

    if (!mounted) return;

    if (studentUser != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => StudentHomePage(
            studentUser: studentUser,
            authService: widget.authService,
          ),
        ),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => AuthChoicePage(authService: widget.authService),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
