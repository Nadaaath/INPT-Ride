import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/ride.dart';

class RideService {
  static const String ridesUrl = 'http://10.0.2.2:8001/api/rides/';
  static const String startRideUrl = 'http://10.0.2.2:8001/api/rides/start/';
  static const String endRideUrl = 'http://10.0.2.2:8001/api/rides/end/';

  Future<Ride> startRide({
    required String token,
    required int reservationId,
  }) async {
    final response = await http.post(
      Uri.parse(startRideUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $token',
      },
      body: jsonEncode({'reservation_id': reservationId}),
    );

    if (response.statusCode != 201) {
      throw Exception(
        'Start ride failed (${response.statusCode}): ${response.body}',
      );
    }

    final data = jsonDecode(response.body);
    return Ride.fromJson(data);
  }

  Future<List<Ride>> fetchRides({required String token}) async {
    final response = await http.get(
      Uri.parse(ridesUrl),
      headers: {'Authorization': 'Token $token'},
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load rides (${response.statusCode}): ${response.body}',
      );
    }

    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => Ride.fromJson(item)).toList();
  }

  Future<Ride?> fetchOngoingRide({required String token}) async {
    final rides = await fetchRides(token: token);

    try {
      return rides.firstWhere(
        (ride) => ride.status.trim().toLowerCase() == 'ongoing',
      );
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> endRide({
    required String token,
    required int rideId,
  }) async {
    final response = await http.post(
      Uri.parse(endRideUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $token',
      },
      body: jsonEncode({'ride_id': rideId}),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'End ride failed (${response.statusCode}): ${response.body}',
      );
    }

    return jsonDecode(response.body);
  }
}
