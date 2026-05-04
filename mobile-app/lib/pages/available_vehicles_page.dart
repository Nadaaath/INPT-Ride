import 'package:flutter/material.dart';

import '../models/student_user.dart';
import '../models/vehicle.dart';
import '../services/auth_service.dart';
import '../services/vehicle_service.dart';
import 'auth_choice_page.dart';
import 'create_reservation_page.dart';

class AvailableVehiclesPage extends StatefulWidget {
  final StudentUser studentUser;
  final AuthService authService;

  const AvailableVehiclesPage({
    super.key,
    required this.studentUser,
    required this.authService,
  });

  @override
  State<AvailableVehiclesPage> createState() => _AvailableVehiclesPageState();
}

class _AvailableVehiclesPageState extends State<AvailableVehiclesPage> {
  final VehicleService _vehicleService = VehicleService();

  bool _loading = true;
  String? _error;
  List<Vehicle> _vehicles = [];

  @override
  void initState() {
    super.initState();
    _loadVehicles();
  }

  Future<void> _loadVehicles() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final vehicles = await _vehicleService.fetchVehicles();
      setState(() {
        _vehicles = vehicles;
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

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'available':
        return Colors.green;
      case 'reserved':
        return Colors.orange;
      case 'in_use':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _vehicleIcon(String type) {
    switch (type.toLowerCase()) {
      case 'scooter':
        return Icons.electric_scooter;
      case 'bike':
      default:
        return Icons.pedal_bike;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Vehicles'),
        actions: [
          IconButton(onPressed: _loadVehicles, icon: const Icon(Icons.refresh)),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
            ? Center(child: Text(_error!, textAlign: TextAlign.center))
            : _vehicles.isEmpty
            ? const Center(child: Text('No vehicles found.'))
            : ListView.builder(
                itemCount: _vehicles.length,
                itemBuilder: (context, index) {
                  final vehicle = _vehicles[index];

                  return Card(
                    margin: const EdgeInsets.only(bottom: 14),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(_vehicleIcon(vehicle.type), size: 32),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      vehicle.code,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      vehicle.type.toUpperCase(),
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
                                    vehicle.status,
                                  ).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  vehicle.status,
                                  style: TextStyle(
                                    color: _statusColor(vehicle.status),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text('Slot number: ${vehicle.slotNumber}'),
                          if (vehicle.type.toLowerCase() == 'scooter' &&
                              vehicle.batteryLevel != null)
                            Text('Battery: ${vehicle.batteryLevel}%'),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed:
                                  vehicle.status.toLowerCase() == 'available'
                                  ? () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => CreateReservationPage(
                                            studentUser: widget.studentUser,
                                            vehicle: vehicle,
                                            authService: widget.authService,
                                          ),
                                        ),
                                      );
                                    }
                                  : null,
                              child: const Text('Reserve'),
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
