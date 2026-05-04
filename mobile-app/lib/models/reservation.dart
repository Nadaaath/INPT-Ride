class Reservation {
  final int id;
  final int vehicle;
  final String vehicleCode;
  final String vehicleType;
  final int vehicleSlotNumber;
  final String reservedDate;
  final int startHour;
  final int endHour;
  final int durationHours;
  final String status;
  final String createdAt;
  final String? cancelledAt;

  Reservation({
    required this.id,
    required this.vehicle,
    required this.vehicleCode,
    required this.vehicleType,
    required this.vehicleSlotNumber,
    required this.reservedDate,
    required this.startHour,
    required this.endHour,
    required this.durationHours,
    required this.status,
    required this.createdAt,
    this.cancelledAt,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id'],
      vehicle: json['vehicle'],
      vehicleCode: json['vehicle_code'] ?? '',
      vehicleType: json['vehicle_type'] ?? '',
      vehicleSlotNumber: json['vehicle_slot_number'] ?? 0,
      reservedDate: json['reserved_date'] ?? '',
      startHour: json['start_hour'] ?? 0,
      endHour: json['end_hour'] ?? 0,
      durationHours: json['duration_hours'] ?? 0,
      status: json['status'] ?? '',
      createdAt: json['created_at'] ?? '',
      cancelledAt: json['cancelled_at'],
    );
  }
}
