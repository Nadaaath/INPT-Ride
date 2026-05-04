import 'package:flutter/material.dart';

import '../utils/date_formatters.dart';

import '../models/ride.dart';
import '../models/student_user.dart';
import '../services/auth_service.dart';
import '../services/ride_service.dart';
import 'auth_choice_page.dart';

class MyRidesPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const MyRidesPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<MyRidesPage> createState() => _MyRidesPageState();
}

class _MyRidesPageState extends State<MyRidesPage> {
  final RideService _rideService = RideService();

  bool _loading = true;
  String? _error;
  List<Ride> _rides = [];

  @override
  void initState() {
    super.initState();
    _loadRides();
  }

  Future<void> _loadRides() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final rides = await _rideService.fetchRides(
        token: widget.studentUser.token,
      );

      for (final ride in rides) {
        debugPrint('Ride ${ride.id} status = [${ride.status}]');
      }

      setState(() {
        _rides = rides;
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

  Future<void> _endRide(int rideId) async {
    try {
      final result = await _rideService.endRide(
        token: widget.studentUser.token,
        rideId: rideId,
      );

      if (!mounted) return;

      final pricing = result['pricing'];
      final wallet = result['wallet'];

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Ride ended. Charged: ${pricing['total_amount']} | New balance: ${wallet['new_balance']}',
          ),
        ),
      );

      await _loadRides();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
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

  Color _statusColor(String status) {
    switch (status.trim().toLowerCase()) {
      case 'ongoing':
        return Colors.orange;
      case 'completed':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Rides'),
        actions: [
          IconButton(onPressed: _loadRides, icon: const Icon(Icons.refresh)),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(child: Text(_error!, textAlign: TextAlign.center))
            : _rides.isEmpty
            ? const Center(child: Text('No rides found.'))
            : ListView.builder(
                itemCount: _rides.length,
                itemBuilder: (context, index) {
                  final ride = _rides[index];
                  final normalizedStatus = ride.status.trim().toLowerCase();

                  return Card(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.directions_bike, size: 30),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Ride #${ride.id}',
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${ride.vehicleCode} • ${ride.vehicleType.toUpperCase()} • Slot ${ride.vehicleSlotNumber}',
                                      style: const TextStyle(
                                        color: Colors.black54,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: _statusColor(
                                    ride.status,
                                  ).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  ride.status,
                                  style: TextStyle(
                                    color: _statusColor(ride.status),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text('Reservation #${ride.reservation}'),
                          Text(
                            'Reserved slot: ${DateFormatters.formatDate(ride.reservationDate)} | '
                            '${DateFormatters.formatTimeHour(ride.reservationStartHour)} → '
                            '${DateFormatters.formatTimeHour(ride.reservationEndHour)}',
                          ),
                          Text(
                            'Started at: ${DateFormatters.formatDateTime(ride.actualStartTime)}',
                          ),
                          Text(
                            'Ended at: ${DateFormatters.formatDateTime(ride.actualEndTime)}',
                          ),
                          Text('Used hours: ${ride.usedHours}'),
                          Text('Distance: ${ride.distanceKm} km'),
                          const SizedBox(height: 12),
                          Text(
                            'DEBUG STATUS = [${ride.status}]',
                            style: const TextStyle(color: Colors.red),
                          ),
                          const SizedBox(height: 12),
                          if (normalizedStatus == 'ongoing')
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => _endRide(ride.id),
                                child: const Text('End Ride'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
