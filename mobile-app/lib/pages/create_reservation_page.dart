import 'package:flutter/material.dart';

import '../models/student_user.dart';
import '../models/vehicle.dart';
import '../services/auth_service.dart';
import '../services/reservation_service.dart';

class CreateReservationPage extends StatefulWidget {
  final StudentUser studentUser;
  final Vehicle vehicle;
  final AuthService authService;

  const CreateReservationPage({
    super.key,
    required this.studentUser,
    required this.vehicle,
    required this.authService,
  });

  @override
  State<CreateReservationPage> createState() => _CreateReservationPageState();
}

class _CreateReservationPageState extends State<CreateReservationPage> {
  final ReservationService _reservationService = ReservationService();

  DateTime? _selectedDate;
  int? _startHour;
  int? _endHour;

  bool _loading = false;
  String? _message;

  final List<int> _startHours = List.generate(
    17,
    (index) => index + 7,
  ); // 7 -> 23
  final List<int> _endHours = List.generate(
    17,
    (index) => index + 8,
  ); // 8 -> 24

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final firstDate = DateTime(now.year, now.month, now.day);
    final lastDate = firstDate.add(const Duration(days: 2));

    final picked = await showDatePicker(
      context: context,
      initialDate: firstDate,
      firstDate: firstDate,
      lastDate: lastDate,
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  Future<void> _submitReservation() async {
    if (_selectedDate == null || _startHour == null || _endHour == null) {
      setState(() {
        _message = 'Please select date, start hour, and end hour.';
      });
      return;
    }

    if (_endHour! <= _startHour!) {
      setState(() {
        _message = 'End hour must be greater than start hour.';
      });
      return;
    }

    if ((_endHour! - _startHour!) < 1 || (_endHour! - _startHour!) > 10) {
      setState(() {
        _message = 'Reservation duration must be between 1 and 10 hours.';
      });
      return;
    }

    setState(() {
      _loading = true;
      _message = null;
    });

    try {
      final reservation = await _reservationService.createReservation(
        token: widget.studentUser.token,
        vehicleId: widget.vehicle.id,
        reservedDate: _formatDate(_selectedDate!),
        startHour: _startHour!,
        endHour: _endHour!,
      );

      setState(() {
        _message =
            'Reservation created successfully. Status: ${reservation.status}';
      });
    } catch (e) {
      setState(() {
        _message = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  String _vehicleSubtitle() {
    if (widget.vehicle.type.toLowerCase() == 'scooter' &&
        widget.vehicle.batteryLevel != null) {
      return '${widget.vehicle.type.toUpperCase()} • Battery ${widget.vehicle.batteryLevel}%';
    }
    return widget.vehicle.type.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Reservation')),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: Icon(
                  widget.vehicle.type.toLowerCase() == 'scooter'
                      ? Icons.electric_scooter
                      : Icons.pedal_bike,
                ),
                title: Text(widget.vehicle.code),
                subtitle: Text(_vehicleSubtitle()),
                trailing: Text('Slot ${widget.vehicle.slotNumber}'),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Choose reservation date',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _pickDate,
                child: Text(
                  _selectedDate == null
                      ? 'Select Date'
                      : _formatDate(_selectedDate!),
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Choose start hour',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            DropdownButtonFormField<int>(
              value: _startHour,
              items: _startHours
                  .map(
                    (hour) => DropdownMenuItem(
                      value: hour,
                      child: Text('${hour.toString().padLeft(2, '0')}:00'),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _startHour = value;

                  if (_endHour != null && _endHour! <= _startHour!) {
                    _endHour = null;
                  }
                });
              },
            ),

            const SizedBox(height: 20),

            const Text(
              'Choose end hour',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            DropdownButtonFormField<int>(
              value: _endHour,
              items: _endHours
                  .where((hour) => _startHour == null || hour > _startHour!)
                  .map(
                    (hour) => DropdownMenuItem(
                      value: hour,
                      child: Text(
                        hour == 24
                            ? '24:00'
                            : '${hour.toString().padLeft(2, '0')}:00',
                      ),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _endHour = value;
                });
              },
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submitReservation,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Confirm Reservation'),
              ),
            ),

            const SizedBox(height: 20),

            if (_message != null) Text(_message!, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
