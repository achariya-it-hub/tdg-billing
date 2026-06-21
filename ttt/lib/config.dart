import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  // ──────────────────────────────────────────────
  // 🔧 PRODUCTION: Set this to your Hostinger URL
  //    e.g. 'https://yourdomain.com/api'
  // ──────────────────────────────────────────────
  static const String _productionUrl = 'https://tdg-billing-production.up.railway.app/api';

  // Automatically determine base URL based on platform/environment
  static String get baseUrl {
    // Use --dart-define=API_URL=... at build time for overrides
    const define = String.fromEnvironment('API_URL');
    if (define.isNotEmpty) return define;

    // Production override (uncomment below and set URL to deploy)
    // return _productionUrl;

    // Development: local backend
    if (kIsWeb) {
      return 'http://localhost:3001/api';
    }
    try {
      if (Platform.isAndroid) {
        // Android emulator → host machine
        return 'http://10.0.2.2:3001/api';
      }
    } catch (_) {
      // Platform check can fail in some web or desktop setups
    }
    return 'http://localhost:3001/api';
  }
}
