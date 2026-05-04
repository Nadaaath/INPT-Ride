import 'package:flutter/material.dart';

import '../models/student_user.dart';
import '../services/auth_service.dart';
import 'student_home_page.dart';
import '../services/session_service.dart';

class SetPasswordPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const SetPasswordPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<SetPasswordPage> createState() => _SetPasswordPageState();
}

class _SetPasswordPageState extends State<SetPasswordPage> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();
  final SessionService _sessionService = SessionService();

  bool _loading = false;
  String? _message;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  Future<void> _submit() async {
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (password.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _message = 'Please fill in both password fields.';
      });
      return;
    }

    setState(() {
      _loading = true;
      _message = null;
    });

    try {
      await widget.authService.setPassword(
        token: widget.studentUser.token,
        password: password,
        confirmPassword: confirmPassword,
      );

      if (!mounted) return;

      final updatedUser = StudentUser(
        id: widget.studentUser.id,
        username: widget.studentUser.username,
        email: widget.studentUser.email,
        fullName: widget.studentUser.fullName,
        walletBalance: widget.studentUser.walletBalance,
        warningCount: widget.studentUser.warningCount,
        isBanned: widget.studentUser.isBanned,
        token: widget.studentUser.token,
        hasPassword: true,
        isNewUser: false,
      );
      await _sessionService.saveStudentUser(updatedUser);

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (_) => StudentHomePage(
            studentUser: updatedUser,
            authService: widget.authService,
          ),
        ),
        (route) => false,
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

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Set Password')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.lock, size: 64),
              const SizedBox(height: 20),
              const Text(
                'Create your password',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your account was created with Google. Now choose a password so you can log in directly next time.',
                style: TextStyle(color: Colors.black54, fontSize: 15),
              ),
              const SizedBox(height: 28),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscureConfirmPassword = !_obscureConfirmPassword;
                      });
                    },
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const CircularProgressIndicator()
                      : const Text('Save Password'),
                ),
              ),
              const SizedBox(height: 16),
              if (_message != null)
                Text(_message!, style: const TextStyle(color: Colors.red)),
            ],
          ),
        ),
      ),
    );
  }
}
