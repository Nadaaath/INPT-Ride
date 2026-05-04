class Ride {
  final int id;
  final int user;
  final int vehicle;
  final String vehicleCode;
  final String vehicleType;
  final int vehicleSlotNumber;
  final int reservation;
  final String reservationDate;
  final int reservationStartHour;
  final int reservationEndHour;
  final String actualStartTime;
  final String? actualEndTime;
  final int usedHours;
  final double distanceKm;
  final String status;
  final String createdAt;

  Ride({
    required this.id,
    required this.user,
    required this.vehicle,
    required this.vehicleCode,
    required this.vehicleType,
    required this.vehicleSlotNumber,
    required this.reservation,
    required this.reservationDate,
    required this.reservationStartHour,
    required this.reservationEndHour,
    required this.actualStartTime,
    this.actualEndTime,
    required this.usedHours,
    required this.distanceKm,
    required this.status,
    required this.createdAt,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    return Ride(
      id: json['id'],
      user: json['user'],
      vehicle: json['vehicle'],
      vehicleCode: json['vehicle_code'] ?? '',
      vehicleType: json['vehicle_type'] ?? '',
      vehicleSlotNumber: json['vehicle_slot_number'] ?? 0,
      reservation: json['reservation'],
      reservationDate: json['reservation_date'] ?? '',
      reservationStartHour: json['reservation_start_hour'] ?? 0,
      reservationEndHour: json['reservation_end_hour'] ?? 0,
      actualStartTime: json['actual_start_time'] ?? '',
      actualEndTime: json['actual_end_time'],
      usedHours: json['used_hours'] ?? 0,
      distanceKm: double.tryParse(json['distance_km'].toString()) ?? 0.0,
      status: json['status'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
