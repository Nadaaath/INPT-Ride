import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/reservation.dart';

class ReservationService {
  static const String reservationsUrl =
      'http://10.0.2.2:8001/api/reservations/';

  Future<Reservation> createReservation({
    required String token,
    required int vehicleId,
    required String reservedDate,
    required int startHour,
    required int endHour,
  }) async {
    final int durationHours = endHour - startHour;

    final response = await http.post(
      Uri.parse(reservationsUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $token',
      },
      body: jsonEncode({
        'vehicle': vehicleId,
        'reserved_date': reservedDate,
        'start_hour': startHour,
        'end_hour': endHour,
        'duration_hours': durationHours,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception(
        'Reservation failed (${response.statusCode}): ${response.body}',
      );
    }

    final data = jsonDecode(response.body);
    return Reservation.fromJson(data);
  }

  Future<List<Reservation>> fetchReservations({required String token}) async {
    final response = await http.get(
      Uri.parse(reservationsUrl),
      headers: {'Authorization': 'Token $token'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load reservations (${response.statusCode}): ${response.body}',
      );
    }

    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => Reservation.fromJson(item)).toList();
  }
}
