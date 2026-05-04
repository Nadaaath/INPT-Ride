import 'package:intl/intl.dart';

class DateFormatters {
  static String formatDateTime(String? value) {
    if (value == null || value.isEmpty) return '-';

    try {
      final dateTime = DateTime.parse(value).toLocal();
      return DateFormat('dd MMM yyyy, HH:mm').format(dateTime);
    } catch (_) {
      return value;
    }
  }

  static String formatDate(String? value) {
    if (value == null || value.isEmpty) return '-';

    try {
      final date = DateTime.parse(value);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (_) {
      return value;
    }
  }

  static String formatTimeHour(int hour) {
    if (hour == 24) return '24:00';
    return '${hour.toString().padLeft(2, '0')}:00';
  }
}
