import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  // Automatically determine base URL based on platform/environment
  static String get baseUrl {
    // Try localhost:3001 first (our billing backend)
    if (kIsWeb) {
      return 'http://localhost:3001/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:3001/api';
      }
    } catch (_) {
      // Platform check can fail in some web or desktop setups
    }
    return 'http://localhost:3001/api';
  }
}
