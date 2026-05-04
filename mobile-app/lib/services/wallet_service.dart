import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/wallet_transaction.dart';

class WalletService {
  static const String transactionsUrl =
      'http://10.0.2.2:8001/api/wallet/transactions/';

  Future<List<WalletTransaction>> fetchTransactions({
    required String token,
  }) async {
    final response = await http.get(
      Uri.parse(transactionsUrl),
      headers: {'Authorization': 'Token $token'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load wallet transactions (${response.statusCode}): ${response.body}',
      );
    }

    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => WalletTransaction.fromJson(item)).toList();
  }
}
