import 'package:flutter/material.dart';

import '../utils/date_formatters.dart';
import '../models/student_user.dart';
import '../models/wallet_transaction.dart';
import '../services/auth_service.dart';
import '../services/wallet_service.dart';
import 'auth_choice_page.dart';

class WalletPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const WalletPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<WalletPage> createState() => _WalletPageState();
}

class _WalletPageState extends State<WalletPage> {
  final WalletService _walletService = WalletService();

  bool _loading = true;
  String? _error;
  List<WalletTransaction> _transactions = [];

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final transactions = await _walletService.fetchTransactions(
        token: widget.studentUser.token,
      );

      setState(() {
        _transactions = transactions;
      });
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

  Color _typeColor(String type) {
    switch (type.toLowerCase()) {
      case 'top_up':
        return Colors.green;
      case 'ride_payment':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _typeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'top_up':
        return Icons.add_circle;
      case 'ride_payment':
        return Icons.remove_circle;
      default:
        return Icons.account_balance_wallet;
    }
  }

  String _typeLabel(String type) {
    switch (type.toLowerCase()) {
      case 'top_up':
        return 'Top Up';
      case 'ride_payment':
        return 'Ride Payment';
      default:
        return type;
    }
  }

  double _currentBalance() {
    if (_transactions.isNotEmpty) {
      return _transactions.first.balanceAfter;
    }
    return widget.studentUser.walletBalance;
  }

  @override
  Widget build(BuildContext context) {
    final currentBalance = _currentBalance();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Wallet'),
        actions: [
          IconButton(
            onPressed: _loadTransactions,
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
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: ListTile(
                      leading: const Icon(
                        Icons.account_balance_wallet,
                        size: 32,
                      ),
                      title: const Text(
                        'Current Balance',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        '${currentBalance.toStringAsFixed(2)} MAD',
                        style: const TextStyle(fontSize: 20),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Transaction History',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: _transactions.isEmpty
                        ? const Center(
                            child: Text('No wallet transactions found.'),
                          )
                        : ListView.builder(
                            itemCount: _transactions.length,
                            itemBuilder: (context, index) {
                              final tx = _transactions[index];

                              return Card(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: _typeColor(
                                          tx.type,
                                        ).withOpacity(0.15),
                                        child: Icon(
                                          _typeIcon(tx.type),
                                          color: _typeColor(tx.type),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              _typeLabel(tx.type),
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              'Amount: ${tx.amount.toStringAsFixed(2)} MAD',
                                            ),
                                            Text(
                                              'Balance after: ${tx.balanceAfter.toStringAsFixed(2)} MAD',
                                            ),
                                            Text(
                                              'Reference: ${tx.referenceType} ${tx.referenceId ?? ''}',
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              DateFormatters.formatDateTime(
                                                tx.createdAt,
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
                ],
              ),
      ),
    );
  }
}
