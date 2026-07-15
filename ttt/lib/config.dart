import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  static const String _productionUrl =
      'https://tendengyros.com/api';

  static String get baseUrl {
    const define = String.fromEnvironment('API_URL');
    if (define.isNotEmpty) return define;

    return _productionUrl;
  }
}
