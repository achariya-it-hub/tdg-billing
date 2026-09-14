import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum NotificationCategory { all, otp, assetRequest, rewards, security }

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final NotificationCategory category;
  final IconData icon;
  final Color iconBgColor;
  final String? otpCode;
  final String? assetPhone;
  final String? assetName;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.category,
    required this.icon,
    required this.iconBgColor,
    this.otpCode,
    this.assetPhone,
    this.assetName,
    this.isRead = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'message': message,
        'timestamp': timestamp.toIso8601String(),
        'category': category.name,
        'iconKey': _getIconKey(icon),
        'iconColorHex': iconBgColor.value,
        'otpCode': otpCode,
        'assetPhone': assetPhone,
        'assetName': assetName,
        'isRead': isRead,
      };

  static String _getIconKey(IconData icon) {
    if (icon == Icons.vpn_key_rounded) return 'otp';
    if (icon == Icons.add_business_rounded) return 'asset_pending';
    if (icon == Icons.verified_user_rounded) return 'asset_verified';
    if (icon == Icons.card_giftcard_rounded) return 'gift';
    if (icon == Icons.shield_rounded) return 'security';
    return 'default';
  }

  static IconData _getIconData(String key) {
    switch (key) {
      case 'otp':
        return Icons.vpn_key_rounded;
      case 'asset_pending':
        return Icons.add_business_rounded;
      case 'asset_verified':
        return Icons.verified_user_rounded;
      case 'gift':
        return Icons.card_giftcard_rounded;
      case 'security':
        return Icons.shield_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    NotificationCategory cat = NotificationCategory.all;
    try {
      cat = NotificationCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => NotificationCategory.all,
      );
    } catch (_) {}

    return NotificationItem(
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: json['title'] ?? 'NOTIFICATION',
      message: json['message'] ?? '',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      category: cat,
      icon: _getIconData(json['iconKey'] ?? ''),
      iconBgColor: Color(json['iconColorHex'] ?? 0xFFBC2221),
      otpCode: json['otpCode'],
      assetPhone: json['assetPhone'],
      assetName: json['assetName'],
      isRead: json['isRead'] ?? false,
    );
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final ValueNotifier<List<NotificationItem>> notificationsNotifier = ValueNotifier<List<NotificationItem>>([]);
  final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonStr = prefs.getString('tdg_in_app_notifications');
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> list = jsonDecode(jsonStr);
        final items = list.map((e) => NotificationItem.fromJson(e as Map<String, dynamic>)).toList();
        notificationsNotifier.value = items;
      } else {
        _loadSampleInitialNotifications();
      }
    } catch (e) {
      _loadSampleInitialNotifications();
    }
    _updateUnreadCount();
    _initialized = true;
  }

  void _loadSampleInitialNotifications() {
    notificationsNotifier.value = [
      NotificationItem(
        id: 'init_welcome',
        title: 'WELCOME TO THE PRIDE',
        message: 'Your TDG Billing account was initialized! You will receive live OTP & Asset Request notifications here.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        category: NotificationCategory.security,
        icon: Icons.shield_rounded,
        iconBgColor: const Color(0xFF2196F3),
        isRead: false,
      ),
      NotificationItem(
        id: 'init_bonus',
        title: '500 BONUS POINTS CREDITED',
        message: 'Welcome reward points credited to your TDG wallet.',
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        category: NotificationCategory.rewards,
        icon: Icons.card_giftcard_rounded,
        iconBgColor: const Color(0xFFFFCC00),
        isRead: true,
      ),
    ];
    _saveToPrefs();
  }

  Future<void> _saveToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonList = notificationsNotifier.value.map((item) => item.toJson()).toList();
      await prefs.setString('tdg_in_app_notifications', jsonEncode(jsonList));
    } catch (_) {}
    _updateUnreadCount();
  }

  void _updateUnreadCount() {
    unreadCountNotifier.value = notificationsNotifier.value.where((n) => !n.isRead).length;
  }

  // --- ADD OTP NOTIFICATION ---
  Future<void> addOtpNotification({
    required String phone,
    required String otp,
    String purpose = 'Verification',
  }) async {
    final item = NotificationItem(
      id: 'otp_${DateTime.now().millisecondsSinceEpoch}',
      title: '🔑 LIVE OTP CODE ($purpose)',
      message: 'Your 4-digit verification OTP for $phone is: $otp. Valid for 5 minutes.',
      timestamp: DateTime.now(),
      category: NotificationCategory.otp,
      icon: Icons.vpn_key_rounded,
      iconBgColor: const Color(0xFFFF9800),
      otpCode: otp,
      assetPhone: phone,
      isRead: false,
    );

    final current = List<NotificationItem>.from(notificationsNotifier.value);
    current.insert(0, item);
    notificationsNotifier.value = current;
    await _saveToPrefs();
  }

  // --- ADD ASSET REQUEST NOTIFICATION ---
  Future<void> addAssetRequestNotification({
    required String assetName,
    required String phone,
    required String status,
    String? otp,
  }) async {
    final isPending = status.toLowerCase() == 'pending';
    final title = isPending ? '🏢 NEW ASSET REQUEST PENDING' : '✅ ASSET VERIFIED & ACTIVATED';
    final msg = isPending
        ? 'Asset Addition Request initiated for "$assetName" ($phone). OTP generated: ${otp ?? 'sent via SMS/WhatsApp'}.'
        : 'Asset "$assetName" ($phone) has been successfully verified and activated into your Den network.';

    final item = NotificationItem(
      id: 'asset_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      message: msg,
      timestamp: DateTime.now(),
      category: NotificationCategory.assetRequest,
      icon: isPending ? Icons.add_business_rounded : Icons.verified_user_rounded,
      iconBgColor: isPending ? const Color(0xFFE91E63) : const Color(0xFF4CAF50),
      otpCode: otp,
      assetName: assetName,
      assetPhone: phone,
      isRead: false,
    );

    final current = List<NotificationItem>.from(notificationsNotifier.value);
    current.insert(0, item);
    notificationsNotifier.value = current;
    await _saveToPrefs();
  }

  // --- GENERAL NOTIFICATION ---
  Future<void> addNotification(NotificationItem item) async {
    final current = List<NotificationItem>.from(notificationsNotifier.value);
    current.insert(0, item);
    notificationsNotifier.value = current;
    await _saveToPrefs();
  }

  Future<void> markAsRead(String id) async {
    final current = List<NotificationItem>.from(notificationsNotifier.value);
    final idx = current.indexWhere((n) => n.id == id);
    if (idx >= 0) {
      current[idx].isRead = true;
      notificationsNotifier.value = current;
      await _saveToPrefs();
    }
  }

  Future<void> markAllAsRead() async {
    final current = List<NotificationItem>.from(notificationsNotifier.value);
    for (var item in current) {
      item.isRead = true;
    }
    notificationsNotifier.value = current;
    await _saveToPrefs();
  }

  Future<void> clearAll() async {
    notificationsNotifier.value = [];
    await _saveToPrefs();
  }
}
