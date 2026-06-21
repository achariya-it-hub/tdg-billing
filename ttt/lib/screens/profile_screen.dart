import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'orders_screen.dart';
import 'my_team_screen.dart';
import 'edit_profile_screen.dart';
import 'payment_methods_screen.dart';
import 'terms_conditions_screen.dart';
import 'login_screen.dart';
import 'help_support_screen.dart';
import 'admin_dashboard_screen.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      await ApiService().getProfile();
    } catch (e) {
      debugPrint("Error fetching profile: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleLogout() {
    ApiService().logout();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService().currentUser;
    final String name = user?['name'] ?? 'Denizen';
    final String phone = user?['phone'] ?? '';
    final String level = user?['level'] ?? 'Gold';

    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        centerTitle: true,
        title: Text(
          'PROFILE',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
        actions: [
          if (_isLoading)
            Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(TDGColors.gold)),
                ),
              ),
            )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchProfile,
        color: TDGColors.gold,
        backgroundColor: TDGColors.cardDark,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 20),
            // Avatar
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: TDGColors.gold, width: 3),
                      gradient: TDGColors.goldGradient,
                    ),
                    child: const Icon(Icons.person, color: Colors.black, size: 50),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Center(
              child: Text(
                name,
                style: TextStyle(color: TDGColors.white, fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ),
            if (phone.isNotEmpty)
              Center(
                child: Text(
                  phone,
                  style: TextStyle(color: TDGColors.grey, fontSize: 13),
                ),
              ),
            const SizedBox(height: 6),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  gradient: TDGColors.goldGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$level Den',
                  style: const TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 28),
            // Menu items
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  _buildMenuItem(context, Icons.person_outline_rounded, 'Personal Information', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()));
                  }),
                  _buildMenuItem(context, Icons.receipt_long_rounded, 'My Orders', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
                  }),
                  _buildMenuItem(context, Icons.people_outline_rounded, 'My Team', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const MyTeamScreen()));
                  }),
                  // Admin dashboard - only visible to admin users
                  if (user?['role'] == 'admin')
                    _buildMenuItem(context, Icons.dashboard_rounded, 'Admin Dashboard', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDashboardScreen()));
                    }),
                  _buildMenuItem(context, Icons.location_on_outlined, 'Addresses', () {}),
                  _buildMenuItem(context, Icons.credit_card_rounded, 'Payment Methods', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentMethodsScreen()));
                  }),
                  _buildThemeToggleItem(context),
                  _buildMenuItem(context, Icons.description_outlined, 'Terms & Conditions', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const TermsConditionsScreen()));
                  }),
                  _buildMenuItem(context, Icons.help_outline_rounded, 'Help & Support', () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const HelpSupportScreen()));
                  }),
                  const SizedBox(height: 8),
                  _buildMenuItem(context, Icons.logout_rounded, 'Logout', _handleLogout, isDestructive: true),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String title,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: TDGColors.cardDark,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: TDGColors.border),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isDestructive ? TDGColors.red : TDGColors.greyLight,
              size: 22,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: isDestructive ? TDGColors.red : TDGColors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: isDestructive ? TDGColors.red.withOpacity(0.5) : TDGColors.grey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeToggleItem(BuildContext context) {
    final isDark = ThemeManager().isDarkMode;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Icon(
            isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
            color: TDGColors.greyLight,
            size: 22,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              'Dark Mode',
              style: TextStyle(
                color: TDGColors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Switch.adaptive(
            value: isDark,
            activeColor: TDGColors.gold,
            onChanged: (val) {
              ThemeManager().toggleTheme();
            },
          ),
        ],
      ),
    );
  }
}
