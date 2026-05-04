import 'package:flutter/material.dart';

import '../models/student_user.dart';
import '../services/auth_service.dart';
import '../services/session_service.dart';
import 'email_password_login_page.dart';
import 'set_password_page.dart';
import 'student_home_page.dart';

class AuthChoicePage extends StatefulWidget {
  final AuthService authService;

  const AuthChoicePage({super.key, required this.authService});

  @override
  State<AuthChoicePage> createState() => _AuthChoicePageState();
}

class _AuthChoicePageState extends State<AuthChoicePage> {
  final SessionService _sessionService = SessionService();

  bool _loading = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _initializeGoogle();
  }

  Future<void> _initializeGoogle() async {
    try {
      await widget.authService.initialize();
    } catch (e) {
      setState(() {
        _message = 'Google Sign-In initialization failed: $e';
      });
    }
  }

  Future<void> _handleGoogleSignup() async {
    setState(() {
      _loading = true;
      _message = null;
    });

    try {
      final StudentUser studentUser = await widget.authService
          .signInWithGoogle();

      if (!mounted) return;

      if (studentUser.isNewUser || !studentUser.hasPassword) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => SetPasswordPage(
              studentUser: studentUser,
              authService: widget.authService,
            ),
          ),
        );
        return;
      }

      await _sessionService.saveStudentUser(studentUser);

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => StudentHomePage(
            studentUser: studentUser,
            authService: widget.authService,
          ),
        ),
      );
    } catch (e) {
      setState(() {
        _message = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _openLogin() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EmailPasswordLoginPage(authService: widget.authService),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.pedal_bike, size: 80),
                  const SizedBox(height: 20),
                  const Text(
                    'INPT Ride',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Choose how you want to continue',
                    style: TextStyle(fontSize: 16, color: Colors.black54),
                  ),
                  const SizedBox(height: 36),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _openLogin,
                      icon: const Icon(Icons.login),
                      label: const Text('Login'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _loading ? null : _handleGoogleSignup,
                      icon: const Icon(Icons.g_mobiledata, size: 28),
                      label: _loading
                          ? const Padding(
                              padding: EdgeInsets.symmetric(vertical: 4),
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              ),
                            )
                          : const Text('Sign Up with Google'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (_message != null)
                    Text(
                      _message!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
