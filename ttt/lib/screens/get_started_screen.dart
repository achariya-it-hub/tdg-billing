import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import 'main_nav_screen.dart';
import 'login_screen.dart';

class GetStartedScreen extends StatefulWidget {
  const GetStartedScreen({super.key});

  @override
  State<GetStartedScreen> createState() => _GetStartedScreenState();
}

class _GetStartedScreenState extends State<GetStartedScreen> {
  int _currentIndex = 0;

  final List<Map<String, String>> _onboardingData = [
    {
      'image': 'assets/images/hero_gyro.png',
      'title': 'TEN DEN GYROS',
      'desc': 'Savor handcrafted wraps loaded with tender grilled fillings, fresh red onions, tomatoes, and house spreads.',
    },
    {
      'image': 'assets/images/refer_earn.png',
      'title': 'BUILD YOUR DEN ASSETS',
      'desc': 'Invite friends using your unique referral code. Earn diamond points every time they dine with us!',
    },
    {
      'image': 'assets/images/pride_lion.png',
      'title': 'DISTRIBUTE & MULTIPLY',
      'desc': 'Share points instantly among your active Den assets to claim collective discounts and BOGO treats.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF16161D),
      body: Stack(
        children: [
          // Background Gradient decoration
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1F1F26), Color(0xFF0F0F12)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Rounded Rectangle Top Brand Logo
          Positioned(
            top: 50,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 125,
                height: 125,
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: TDGColors.gold.withOpacity(0.35), width: 2.5),
                  boxShadow: [
                    BoxShadow(
                      color: TDGColors.gold.withOpacity(0.08),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(19),
                  child: Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.restaurant_menu_rounded,
                      size: 50,
                      color: TDGColors.gold,
                    ),
                  ),
                ),
              ),
            ),
          ),

          PageView.builder(
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemCount: _onboardingData.length,
            itemBuilder: (context, index) {
              final slide = _onboardingData[index];
              return Padding(
                padding: const EdgeInsets.fromLTRB(24, 180, 24, 60),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),
                    Container(
                      height: 240,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: TDGColors.gold.withOpacity(0.08),
                            blurRadius: 30,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Image.asset(
                          slide['image']!,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => Icon(
                            Icons.restaurant_menu_rounded,
                            size: 120,
                            color: TDGColors.gold.withOpacity(0.2),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    Text(
                      slide['title']!,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: TDGColors.gold,
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      slide['desc']!,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: Colors.white70,
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                    const Spacer(),
                  ],
                ),
              );
            },
          ),

          // Bottom Action Panel
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_onboardingData.length, (index) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: _currentIndex == index ? 24 : 8,
                      height: 8,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: _currentIndex == index ? TDGColors.gold : Colors.white12,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () {
                    final api = ApiService();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => api.isAuthenticated ? MainNavScreen(key: MainNavScreen.navKey) : const LoginScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: TDGColors.gold,
                    foregroundColor: Colors.black,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 5,
                  ),
                  child: Text(
                    _currentIndex == _onboardingData.length - 1 ? 'GET STARTED' : 'NEXT',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
