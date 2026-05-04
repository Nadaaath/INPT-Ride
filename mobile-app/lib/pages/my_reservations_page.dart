import 'package:flutter/material.dart';
import '../utils/date_formatters.dart';

import '../models/reservation.dart';
import '../models/student_user.dart';
import '../services/auth_service.dart';
import '../services/reservation_service.dart';
import '../services/ride_service.dart';
import 'auth_choice_page.dart';

class MyReservationsPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const MyReservationsPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<MyReservationsPage> createState() => _MyReservationsPageState();
}

class _MyReservationsPageState extends State<MyReservationsPage> {
  final ReservationService _reservationService = ReservationService();
  final RideService _rideService = RideService();
  bool _loading = true;
  String? _error;
  List<Reservation> _reservations = [];

  @override
  void initState() {
    super.initState();
    _loadReservations();
  }

  Future<void> _loadReservations() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final reservations = await _reservationService.fetchReservations(
        token: widget.studentUser.token,
      );

      setState(() {
        _reservations = reservations;
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

  Future<void> _startRide(int reservationId) async {
    try {
      final ride = await _rideService.startRide(
        token: widget.studentUser.token,
        reservationId: reservationId,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ride started successfully. Ride #${ride.id}')),
      );

      await _loadReservations();
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
    switch (status.toLowerCase()) {
      case 'scheduled':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      case 'converted':
        return Colors.orange;
      case 'completed':
        return Colors.green;
      case 'no_show':
        return Colors.deepOrange;
      case 'partially_used':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Reservations'),
        actions: [
          IconButton(
            onPressed: _loadReservations,
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
            : _reservations.isEmpty
            ? const Center(child: Text('No reservations found.'))
            : ListView.builder(
                itemCount: _reservations.length,
                itemBuilder: (context, index) {
                  final reservation = _reservations[index];

                  return Card(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.event_available, size: 30),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Reservation #${reservation.id}',
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      DateFormatters.formatDate(
                                        reservation.reservedDate,
                                      ),
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
                                    reservation.status,
                                  ).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  reservation.status,
                                  style: TextStyle(
                                    color: _statusColor(reservation.status),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Time: ${DateFormatters.formatTimeHour(reservation.startHour)} → ${DateFormatters.formatTimeHour(reservation.endHour)}',
                          ),
                          Text(
                            'Duration: ${reservation.durationHours} hour(s)',
                          ),
                          Text('Vehicle: ${reservation.vehicleCode}'),
                          Text(
                            'Type: ${reservation.vehicleType.toUpperCase()}',
                          ),
                          Text('Slot: ${reservation.vehicleSlotNumber}'),
                          const SizedBox(height: 8),
                          Text(
                            'Created at: ${DateFormatters.formatDateTime(reservation.createdAt)}',
                            style: const TextStyle(color: Colors.black54),
                          ),
                          const SizedBox(height: 12),

                          if (reservation.status.toLowerCase() == 'scheduled')
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => _startRide(reservation.id),
                                child: const Text('Start Ride'),
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
