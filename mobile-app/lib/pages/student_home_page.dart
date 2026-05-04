import 'package:flutter/material.dart';

import '../models/ride.dart';
import '../models/student_user.dart';
import '../utils/date_formatters.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../services/wallet_service.dart';
import '../services/ride_service.dart';
import '../services/session_service.dart';
import 'available_vehicles_page.dart';
import 'my_notifications_page.dart';
import 'auth_choice_page.dart';
import 'my_reservations_page.dart';
import 'my_rides_page.dart';
import 'wallet_page.dart';

class StudentHomePage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const StudentHomePage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<StudentHomePage> createState() => _StudentHomePageState();
}

class _StudentHomePageState extends State<StudentHomePage> {
  final NotificationService _notificationService = NotificationService();
  final RideService _rideService = RideService();
  final WalletService _walletService = WalletService();
  final SessionService _sessionService = SessionService();
  int _unreadCount = 0;
  bool _loadingUnread = true;
  bool _loadingRide = true;
  Ride? _ongoingRide;
  double? _liveBalance;

  @override
  void initState() {
    super.initState();
    _refreshHome();
  }

  Future<void> _refreshHome() async {
    await Future.wait([
      _loadUnreadCount(),
      _loadOngoingRide(),
      _loadLiveBalance(),
    ]);
  }

  Future<void> _loadLiveBalance() async {
    try {
      final transactions = await _walletService.fetchTransactions(
        token: widget.studentUser.token,
      );

      if (!mounted) return;

      setState(() {
        if (transactions.isNotEmpty) {
          _liveBalance = transactions.first.balanceAfter;
        } else {
          _liveBalance = widget.studentUser.walletBalance;
        }
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _liveBalance = widget.studentUser.walletBalance;
      });
    }
  }

  Future<void> _loadUnreadCount() async {
    try {
      final unreadCount = await _notificationService.fetchUnreadCount(
        token: widget.studentUser.token,
      );

      if (!mounted) return;

      setState(() {
        _unreadCount = unreadCount;
        _loadingUnread = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _loadingUnread = false;
      });
    }
  }

  Future<void> _loadOngoingRide() async {
    try {
      final ongoingRide = await _rideService.fetchOngoingRide(
        token: widget.studentUser.token,
      );

      if (!mounted) return;

      setState(() {
        _ongoingRide = ongoingRide;
        _loadingRide = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _loadingRide = false;
      });
    }
  }

  Future<void> _logout(BuildContext context) async {
    await widget.authService.signOut();
    await _sessionService.clearSession();

    if (!context.mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => AuthChoicePage(authService: widget.authService),
      ),
      (route) => false,
    );
  }

  Future<void> _openNotifications() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => MyNotificationsPage(
          studentUser: widget.studentUser,
          authService: widget.authService,
        ),
      ),
    );

    await _loadUnreadCount();
  }

  Widget _buildNotificationsIcon() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: _openNotifications,
          icon: const Icon(Icons.notifications),
          tooltip: 'Notifications',
        ),
        if (!_loadingUnread && _unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(10),
              ),
              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
              child: Text(
                _unreadCount > 9 ? '9+' : '$_unreadCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildWelcomeCard(StudentUser user) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.pedal_bike,
                size: 30,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Welcome back',
                    style: TextStyle(fontSize: 14, color: Colors.black54),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.fullName.isNotEmpty ? user.fullName : user.email,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user.email,
                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStatCard({
    required IconData icon,
    required String label,
    required String value,
    Color? iconColor,
  }) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(
              icon,
              color: iconColor ?? Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOngoingRideCard(StudentUser user) {
    if (_loadingRide) {
      return const Card(
        elevation: 0,
        child: Padding(
          padding: EdgeInsets.all(18),
          child: Row(
            children: [
              SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              SizedBox(width: 12),
              Text('Checking active ride...'),
            ],
          ),
        ),
      );
    }

    if (_ongoingRide == null) {
      return const SizedBox.shrink();
    }

    final ride = _ongoingRide!;

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.directions_bike, color: Colors.orange.shade700),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Active Ride',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'ongoing',
                    style: TextStyle(
                      color: Colors.orange,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text('Ride ID: ${ride.id}'),
            Text('Vehicle: ${ride.vehicleCode}'),
            Text('Type: ${ride.vehicleType.toUpperCase()}'),
            Text('Slot: ${ride.vehicleSlotNumber}'),
            Text('Reservation #${ride.reservation}'),
            Text(
              'Reserved: ${DateFormatters.formatDate(ride.reservationDate)} | '
              '${DateFormatters.formatTimeHour(ride.reservationStartHour)} → '
              '${DateFormatters.formatTimeHour(ride.reservationEndHour)}',
            ),
            Text(
              'Started at: ${DateFormatters.formatDateTime(ride.actualStartTime)}',
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => MyRidesPage(
                        studentUser: user,
                        authService: widget.authService,
                      ),
                    ),
                  );
                  await _loadOngoingRide();
                },
                icon: const Icon(Icons.launch),
                label: const Text('Open My Rides'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required String title,
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(title),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final studentUser = widget.studentUser;
    final authService = widget.authService;
    final displayedBalance = _liveBalance ?? studentUser.walletBalance;

    return Scaffold(
      appBar: AppBar(
        title: const Text('INPT Ride'),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _refreshHome,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
          _buildNotificationsIcon(),
          IconButton(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshHome,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildWelcomeCard(studentUser),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: _buildMiniStatCard(
                      icon: Icons.account_balance_wallet,
                      label: 'Balance',
                      value: '${displayedBalance.toStringAsFixed(2)} MAD',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMiniStatCard(
                      icon: Icons.warning_amber,
                      label: 'Warnings',
                      value: studentUser.warningCount.toString(),
                      iconColor: Colors.orange,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              _buildMiniStatCard(
                icon: studentUser.isBanned ? Icons.block : Icons.check_circle,
                label: 'Account Status',
                value: studentUser.isBanned ? 'Banned' : 'Active',
                iconColor: studentUser.isBanned ? Colors.red : Colors.green,
              ),
              const SizedBox(height: 14),

              _buildOngoingRideCard(studentUser),
              if (_ongoingRide != null) const SizedBox(height: 14),

              const Text(
                'Quick Actions',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              _buildActionButton(
                title: 'Available Vehicles',
                icon: Icons.pedal_bike,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AvailableVehiclesPage(
                        studentUser: studentUser,
                        authService: authService,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 10),

              _buildActionButton(
                title: 'My Reservations',
                icon: Icons.event_available,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => MyReservationsPage(
                        studentUser: studentUser,
                        authService: authService,
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 10),

              _buildActionButton(
                title: 'My Rides',
                icon: Icons.directions_bike,
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => MyRidesPage(
                        studentUser: studentUser,
                        authService: authService,
                      ),
                    ),
                  );
                  await _loadOngoingRide();
                },
              ),
              const SizedBox(height: 10),

              _buildActionButton(
                title: 'My Wallet',
                icon: Icons.account_balance_wallet,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => WalletPage(
                        studentUser: studentUser,
                        authService: authService,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
