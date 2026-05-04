class WalletTransaction {
  final int id;
  final int user;
  final String type;
  final double amount;
  final double balanceAfter;
  final String referenceType;
  final int? referenceId;
  final String createdAt;

  WalletTransaction({
    required this.id,
    required this.user,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    required this.referenceType,
    this.referenceId,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'],
      user: json['user'],
      type: json['type'] ?? '',
      amount: double.tryParse(json['amount'].toString()) ?? 0.0,
      balanceAfter: double.tryParse(json['balance_after'].toString()) ?? 0.0,
      referenceType: json['reference_type'] ?? '',
      referenceId: json['reference_id'],
      createdAt: json['created_at'] ?? '',
    );
  }
}
