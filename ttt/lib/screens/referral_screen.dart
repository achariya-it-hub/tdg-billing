import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';
import '../widgets/tdg_logo.dart';

class ReferralScreen extends StatelessWidget {
  const ReferralScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        centerTitle: true,
        title: Text(
          'MY REFERRAL CARD',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 1),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Referral Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2A1E00), Color(0xFF1A1200), Color(0xFF2A1800)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: TDGColors.gold.withOpacity(0.5), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: TDGColors.gold.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                const TDGLogo(width: 120),
                const SizedBox(height: 20),
                Text(
                  'YOUR REFERRAL CODE',
                  style: TextStyle(color: TDGColors.greyLight, fontSize: 11, letterSpacing: 2),
                ),
                const SizedBox(height: 10),
                ShaderMask(
                  shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                  child: Text(
                    'TDG7890',
                    style: TextStyle(color: TDGColors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 6,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TDGButton(
                  text: 'Share Code',
                  onPressed: () {},
                  height: 46,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'How it Works?',
            style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _howItWorksStep(Icons.share_rounded, 'Share\nyour code'),
              _howItWorksStep(Icons.person_add_rounded, 'Friend gets\n50 Rubies'),
              _howItWorksStep(Icons.card_giftcard_rounded, 'You get\n25 Rubies'),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: TDGColors.cardDark,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: TDGColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total Rewards Earned', style: TextStyle(color: TDGColors.greyLight, fontSize: 13)),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ShaderMask(
                      shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                      child: Text(
                        '2,150',
                        style: TextStyle(color: TDGColors.white, fontSize: 20, fontWeight: FontWeight.w800),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.diamond_rounded,
                      color: TDGColors.primaryRed,
                      size: 20,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _howItWorksStep(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: TDGColors.cardDark,
            shape: BoxShape.circle,
            border: Border.all(color: TDGColors.gold.withOpacity(0.4)),
          ),
          child: Icon(icon, color: TDGColors.gold, size: 26),
        ),
        SizedBox(height: 8),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(color: TDGColors.greyLight, fontSize: 11, height: 1.4),
        ),
      ],
    );
  }
}
