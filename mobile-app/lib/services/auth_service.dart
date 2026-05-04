import 'dart:convert';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

import '../models/student_user.dart';

class AuthService {
  static const String serverClientId =
      '1047469136081-k9i5ei3cdkgn58jseiebu57it68u54t4.apps.googleusercontent.com';

  static const String googleLoginUrl =
      'http://10.0.2.2:8001/api/accounts/google-login/';
  static const String emailLoginUrl =
      'http://10.0.2.2:8001/api/accounts/login/';
  static const String setPasswordUrl =
      'http://10.0.2.2:8001/api/accounts/set-password/';

  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  Future<void> initialize() async {
    await _googleSignIn.initialize(serverClientId: serverClientId);
  }

  Future<StudentUser> signInWithGoogle() async {
    final GoogleSignInAccount account = await _googleSignIn.authenticate();
    final GoogleSignInAuthentication authentication = account.authentication;

    final String? idToken = authentication.idToken;

    if (idToken == null) {
      throw Exception('Google ID token is null.');
    }

    final response = await http.post(
      Uri.parse(googleLoginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'id_token': idToken}),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Backend login failed (${response.statusCode}): ${response.body}',
      );
    }

    final data = jsonDecode(response.body);
    return StudentUser.fromJson(data);
  }

  Future<StudentUser> loginWithEmailPassword({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse(emailLoginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Login failed (${response.statusCode}): ${response.body}',
      );
    }

    final data = jsonDecode(response.body);
    return StudentUser.fromJson(data);
  }

  Future<void> setPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    final response = await http.post(
      Uri.parse(setPasswordUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $token',
      },
      body: jsonEncode({
        'password': password,
        'confirm_password': confirmPassword,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Set password failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
