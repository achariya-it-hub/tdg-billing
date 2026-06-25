import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import 'main_nav_screen.dart';
import 'login_screen.dart';
import '../widgets/tdg_button.dart';
import '../services/api_service.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _isLoading = false;

  void _handleGetStarted() async {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Full-screen background image
          Positioned.fill(
            child: Image.asset(
              'assets/images/hero_gyro.png',
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
            ),
          ),
          // 2. Premium dark gradient overlay for text readability at the bottom
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.1),
                    Colors.black.withOpacity(0.4),
                    Colors.black.withOpacity(0.95),
                  ],
                  stops: const [0.0, 0.45, 0.8],
                ),
              ),
            ),
          ),
          // 3. Ambient golden spotlight glow at the top-left
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
          // 4. Scrollable content overlay with bottom-aligned elements
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: IntrinsicHeight(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 28),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Push the tagline and CTA down to let the top logo and artwork breathe
                            const Spacer(flex: 12),
                            _buildTagline(),
                            const SizedBox(height: 32),
                            _buildButtons(context),
                            const SizedBox(height: 36),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTagline() {
    return Column(
      children: [
        Text(
          'EAT . SHARE .',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontSize: 38,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            height: 1.1,
          ),
        ),
        Text(
          'ENJOY',
          style: GoogleFonts.outfit(
            color: TDGColors.gold,
            fontSize: 38,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Add friends. Share points.\nRule your Den.',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            color: Colors.white70,
            fontSize: 16,
            height: 1.4,
            fontWeight: FontWeight.w400,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildButtons(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: TDGButton(
            text: 'Get Started',
            isLoading: _isLoading,
            onPressed: _handleGetStarted,
            icon: const Icon(Icons.arrow_forward_rounded, size: 20, color: Colors.black),
            gradient: TDGColors.goldGradient,
            borderRadius: BorderRadius.circular(30), // Premium pill shape matching mockup
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const LoginScreen()),
          ),
          child: Text(
            'Login',
            style: GoogleFonts.outfit(
              color: TDGColors.gold,
              fontSize: 16,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }
}
