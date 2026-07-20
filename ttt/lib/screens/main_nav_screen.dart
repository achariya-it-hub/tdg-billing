import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import 'home_screen.dart';
import 'menu_screen.dart';
import 'den_level_screen.dart';
import 'wallet_screen.dart';
import 'profile_screen.dart';

import '../utils/responsive.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const DenLevelScreen(),
    const MenuScreen(),
    const WalletScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDesktop = Responsive.isDesktop(context);
    return Scaffold(
      backgroundColor: TDGColors.background,
      body: ResponsiveWrapper(
        maxWidth: 1200,
        alignment: Alignment.topCenter,
        child: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: ResponsiveWrapper(
          maxWidth: isDesktop ? 800 : 1100,
          alignment: Alignment.bottomCenter,
          child: _buildBottomNav(),
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      height: 72,
      margin: EdgeInsets.symmetric(horizontal: Responsive.isDesktop(context) ? 32 : 0),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: Responsive.isDesktop(context) ? BorderRadius.circular(24) : null,
        border: Border.all(color: TDGColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_rounded, 'HOME'),
          _buildNavItem(1, Icons.grid_view_rounded, 'THE DEN'),
          _buildCenterMenuButton(),
          _buildNavItem(3, Icons.account_balance_wallet_rounded, 'WALLET'),
          _buildNavItem(4, Icons.person_rounded, 'PROFILE'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? TDGColors.gold : TDGColors.grey,
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.outfit(
                color: isActive ? TDGColors.gold : TDGColors.grey,
                fontSize: 9,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterMenuButton() {
    return Transform.translate(
      offset: const Offset(0, -12),
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = 2),
        child: Container(
          width: 62,
          height: 62,
          decoration: BoxDecoration(
            gradient: TDGColors.embossedRedGradient,
            shape: BoxShape.circle,
            boxShadow: [
              // Deep outer shadow for elevation
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                offset: const Offset(0, 8),
                blurRadius: 12,
              ),
              // Red glow
              BoxShadow(
                color: const Color(0xFFBC2221).withOpacity(0.4),
                offset: const Offset(0, 4),
                blurRadius: 20,
              ),
              // Top highlight for 3D effect
              BoxShadow(
                color: Colors.white.withOpacity(0.3),
                offset: const Offset(0, -2),
                blurRadius: 2,
              ),
            ],
          ),
          child: Container(
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.black.withOpacity(0.15), width: 1.5),
            ),
            child: const Center(
              child: Icon(
                Icons.qr_code_scanner_rounded,
                color: Colors.white,
                size: 28,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
