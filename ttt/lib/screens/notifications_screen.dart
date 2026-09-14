import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../utils/responsive.dart';
import '../services/notification_service.dart';
import 'asset_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  NotificationCategory _selectedCategory = NotificationCategory.all;

  @override
  void initState() {
    super.initState();
    // Mark notifications as read when opening notification screen
    NotificationService().markAllAsRead();
  }

  String _formatTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }

  List<NotificationItem> _filterNotifications(List<NotificationItem> items) {
    if (_selectedCategory == NotificationCategory.all) return items;
    return items.where((item) => item.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Premium dark gradient backdrop
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF140F02), // Dark gold tone
                    Colors.black,
                  ],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          // 2. Ambient spotlight glow
          Positioned(
            top: -80,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    TDGColors.gold.withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Content
          SafeArea(
            child: ResponsiveWrapper(
              maxWidth: 850,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Custom AppBar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: Row(
                      children: [
                        const BackButton(color: Colors.white),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'NOTIFICATIONS',
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                        // Clear All Action
                        ValueListenableBuilder<List<NotificationItem>>(
                          valueListenable: NotificationService().notificationsNotifier,
                          builder: (context, notifications, _) {
                            if (notifications.isEmpty) return const SizedBox();
                            return TextButton(
                              onPressed: () => NotificationService().clearAll(),
                              child: Text(
                                'Clear All',
                                style: GoogleFonts.outfit(
                                  color: TDGColors.gold,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  // Filter Tabs
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterChip('⚡ ALL', NotificationCategory.all),
                          _buildFilterChip('🔑 OTP & SECURITY', NotificationCategory.otp),
                          _buildFilterChip('🏢 ASSET REQUESTS', NotificationCategory.assetRequest),
                          _buildFilterChip('🎁 REWARDS', NotificationCategory.rewards),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Live Notifications List
                  Expanded(
                    child: ValueListenableBuilder<List<NotificationItem>>(
                      valueListenable: NotificationService().notificationsNotifier,
                      builder: (context, allNotifications, _) {
                        final filtered = _filterNotifications(allNotifications);
                        if (filtered.isEmpty) {
                          return _buildEmptyState();
                        }
                        return ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            final notification = filtered[index];
                            return _buildNotificationCard(notification);
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, NotificationCategory category) {
    final isSelected = _selectedCategory == category;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = category),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? TDGColors.gold : const Color(0xFF1E1C15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? TDGColors.gold : TDGColors.border,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            color: isSelected ? Colors.black : Colors.white70,
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    String timeAgo = _formatTimeAgo(item.timestamp);
    final hasOtp = item.otpCode != null && item.otpCode!.isNotEmpty;
    final isAsset = item.category == NotificationCategory.assetRequest;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: item.isRead
            ? const Color(0xFF161616).withOpacity(0.8)
            : const Color(0xFF221C12).withOpacity(0.95), // Golden highlight for unread
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item.isRead
              ? TDGColors.border
              : TDGColors.gold.withOpacity(0.4),
          width: 1.5,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => NotificationService().markAsRead(item.id),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon container
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: item.iconBgColor.withOpacity(0.15),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: item.iconBgColor.withOpacity(0.4),
                            width: 1,
                          ),
                        ),
                        child: Icon(
                          item.icon,
                          color: item.iconBgColor,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Message info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    item.title,
                                    style: GoogleFonts.outfit(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                // Unread dot
                                if (!item.isRead)
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: TDGColors.gold,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              item.message,
                              style: GoogleFonts.outfit(
                                color: Colors.white70,
                                fontSize: 13,
                                height: 1.4,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              timeAgo,
                              style: GoogleFonts.outfit(
                                color: TDGColors.grey,
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Quick Action Buttons (Copy OTP / View Asset)
                  if (hasOtp || isAsset) ...[
                    const SizedBox(height: 12),
                    const Divider(color: Colors.white10, height: 1),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (hasOtp)
                          ElevatedButton.icon(
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: item.otpCode!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('📋 OTP Code ${item.otpCode} copied to clipboard!'),
                                  backgroundColor: Colors.green.shade700,
                                  duration: const Duration(seconds: 3),
                                ),
                              );
                            },
                            icon: const Icon(Icons.copy_rounded, size: 14, color: Colors.black),
                            label: Text(
                              'COPY OTP (${item.otpCode})',
                              style: GoogleFonts.outfit(color: Colors.black, fontSize: 11, fontWeight: FontWeight.w900),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: TDGColors.gold,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        if (isAsset) ...[
                          if (hasOtp) const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const AssetScreen()),
                              );
                            },
                            icon: const Icon(Icons.group_add_outlined, size: 14, color: Colors.white),
                            label: Text(
                              'VIEW ASSETS',
                              style: GoogleFonts.outfit(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: TDGColors.border),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1B1B1B).withOpacity(0.5),
                shape: BoxShape.circle,
                border: Border.all(color: TDGColors.border, width: 1.5),
              ),
              child: Icon(
                Icons.notifications_off_rounded,
                color: TDGColors.grey,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'NO NOTIFICATIONS',
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Live OTP codes and Asset Addition requests will automatically appear here.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: TDGColors.grey,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
