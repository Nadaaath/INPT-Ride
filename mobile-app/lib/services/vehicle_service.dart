import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/vehicle.dart';

class VehicleService {
  static const String vehiclesUrl = 'http://10.0.2.2:8001/api/vehicles/';

  Future<List<Vehicle>> fetchVehicles() async {
    final response = await http.get(Uri.parse(vehiclesUrl));

    if (response.statusCode != 200) {
      throw Exception('Failed to load vehicles (${response.statusCode}).');
    }

    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => Vehicle.fromJson(item)).toList();
  }
}
