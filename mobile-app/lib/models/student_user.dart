class StudentUser {
  final int id;
  final String username;
  final String email;
  final String fullName;
  final double walletBalance;
  final int warningCount;
  final bool isBanned;
  final String token;
  final bool hasPassword;
  final bool isNewUser;

  StudentUser({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    required this.walletBalance,
    required this.warningCount,
    required this.isBanned,
    required this.token,
    required this.hasPassword,
    required this.isNewUser,
  });

  factory StudentUser.fromJson(Map<String, dynamic> json) {
    return StudentUser(
      id: json['user']['id'],
      username: json['user']['username'],
      email: json['user']['email'],
      fullName: json['user']['full_name'],
      walletBalance:
          double.tryParse(json['profile']['wallet_balance'].toString()) ?? 0.0,
      warningCount: json['profile']['warning_count'] ?? 0,
      isBanned: json['profile']['is_banned'] ?? false,
      token: json['token'] ?? '',
      hasPassword: json['has_password'] ?? false,
      isNewUser: json['is_new_user'] ?? false,
    );
  }
}
