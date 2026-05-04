class Vehicle {
  final int id;
  final String code;
  final String type;
  final String status;
  final int slotNumber;
  final int? batteryLevel;
  final String? imageUrl;

  Vehicle({
    required this.id,
    required this.code,
    required this.type,
    required this.status,
    required this.slotNumber,
    this.batteryLevel,
    this.imageUrl,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      code: json['code'] ?? '',
      type: json['type'] ?? '',
      status: json['status'] ?? '',
      slotNumber: json['slot_number'] ?? 0,
      batteryLevel: json['battery_level'],
      imageUrl: json['image_url'],
    );
  }
}
