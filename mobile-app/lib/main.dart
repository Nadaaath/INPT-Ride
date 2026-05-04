import 'package:flutter/material.dart';

import 'pages/app_start_page.dart';
import 'services/auth_service.dart';

void main() {
  runApp(const INPTRideApp());
}

class INPTRideApp extends StatelessWidget {
  const INPTRideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'INPT Ride',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: AppStartPage(authService: AuthService()),
    );
  }
}
