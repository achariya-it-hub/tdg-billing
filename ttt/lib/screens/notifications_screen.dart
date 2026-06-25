import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final IconData icon;
  final Color iconBgColor;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.icon,
    required this.iconBgColor,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      title: 'WELCOME TO THE PRIDE',
      message: 'Your account was created successfully! Get ready to explore your new Den.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
      icon: Icons.workspace_premium_rounded,
      iconBgColor: const Color(0xFFBC2221),
      isRead: false,
    ),
    NotificationItem(
      id: '2',
      title: '500 POINTS CREDITED',
      message: 'Congratulations! 500 welcome bonus points have been added to your TDG Wallet.',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      icon: Icons.card_giftcard_rounded,
      iconBgColor: const Color(0xFFFFCC00),
      isRead: false,
    ),
    NotificationItem(
      id: '3',
      title: 'SPECIAL LEVEL OFFER',
      message: 'Unlock exclusive items now. Go to the Den and claim level-up rewards.',
      timestamp: DateTime.now().subtract(const Duration(hours: 12)),
      icon: Icons.local_offer_rounded,
      iconBgColor: const Color(0xFF4CAF50),
      isRead: true,
    ),
    NotificationItem(
      id: '4',
      title: 'SECURITY UPDATE',
      message: 'Your password was updated successfully. If this wasn\'t you, contact support immediately.',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      icon: Icons.shield_rounded,
      iconBgColor: const Color(0xFF2196F3),
      isRead: true,
    ),
  ];

  void _clearAll() {
    setState(() {
      _notifications.clear();
    });
  }

  String _formatTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Premium dark gradient backdrop for visual depth
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF140F02), // Very rich dark gold/brown tone
                    Colors.black,
                  ],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          // 2. Ambient golden spotlight glow at the top-left
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
          // Scaffold content
          SafeArea(
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
                      if (_notifications.isNotEmpty)
                        TextButton(
                          onPressed: _clearAll,
                          child: Text(
                            'Clear All',
                            style: GoogleFonts.outfit(
                              color: TDGColors.gold,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                
                // Notifications List
                Expanded(
                  child: _notifications.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          itemCount: _notifications.length,
                          itemBuilder: (context, index) {
                            final notification = _notifications[index];
                            return _buildNotificationCard(notification, index);
                          },
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item, int index) {
    String timeAgo = _formatTimeAgo(item.timestamp);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: item.isRead
            ? const Color(0xFF161616).withOpacity(0.8)
            : const Color(0xFF1E1C15).withOpacity(0.9), // Subtle golden highlight for unread
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item.isRead
              ? TDGColors.border
              : TDGColors.gold.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              setState(() {
                item.isRead = true;
              });
            },
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
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
                              child: _buildRichText(
                                item.title,
                                GoogleFonts.outfit(
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
                        _buildRichText(
                          item.message,
                          GoogleFonts.outfit(
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
              'We\'ll notify you when you have updates, rewards or level-up events.',
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

  Widget _buildRichText(String text, TextStyle baseStyle, {Color accentColor = const Color(0xFFD4A520)}) {
    final parts = text.split(RegExp(r'(Points|POINTS)'));
    if (parts.length == 1) {
      return Text(text, style: baseStyle);
    }
    
    final matches = RegExp(r'(Points|POINTS)').allMatches(text).toList();
    final List<InlineSpan> children = [];
    
    for (int i = 0; i < parts.length; i++) {
      if (parts[i].isNotEmpty) {
        children.add(TextSpan(text: parts[i], style: baseStyle));
      }
      if (i < matches.length) {
        children.add(
          WidgetSpan(
            alignment: PlaceholderAlignment.middle,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2.0),
              child: Icon(
                Icons.diamond_rounded,
                color: accentColor,
                size: (baseStyle.fontSize ?? 13) * 1.1,
              ),
            ),
          ),
        );
      }
    }
    
    return RichText(
      text: TextSpan(children: children),
    );
  }
}
