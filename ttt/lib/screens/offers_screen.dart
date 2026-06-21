import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/colors.dart';
import 'referral_screen.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  bool _showAll = true;

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
          'OFFERS',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Tab
          Row(
            children: [
              _tab('All Offers', true),
              const SizedBox(width: 8),
              _tab('My Rewards', false),
            ],
          ),
          const SizedBox(height: 16),
          _buildReferralOffer(),
          const SizedBox(height: 12),
          _buildDiscountOffer(
            'FLAT 20% OFF',
            'On all orders above ₹299',
            'Use Code: TDG20!',
            Icons.percent_rounded,
            const Color(0xFF1A0A2E),
          ),
          const SizedBox(height: 12),
          _buildDiscountOffer(
            'FREE FRIES',
            'On orders above ₹399',
            'Use Code: FRIES',
            Icons.set_meal_rounded,
            const Color(0xFF1A1000),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: TDGColors.gold),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text('View All Offers', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tab(String label, bool isActive) {
    final selected = _showAll == (label == 'All Offers');
    return GestureDetector(
      onTap: () => setState(() => _showAll = label == 'All Offers'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
        decoration: BoxDecoration(
          color: selected ? TDGColors.gold : TDGColors.cardDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? TDGColors.gold : TDGColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.black : TDGColors.greyLight,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildReferralOffer() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3A1A00), Color(0xFF200E00)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShaderMask(
                  shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                  child: const Text(
                    'MEGA REFERRAL BONUS',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Refer 5 friends & earn',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 6),
                ShaderMask(
                  shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                  child: const Text(
                    '₹500',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen()));
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: TDGColors.gold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Refer Now',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Character illustration
          Container(
            width: 80,
            height: 100,
            decoration: BoxDecoration(
              color: TDGColors.cardLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Icon(Icons.person_outline_rounded, color: TDGColors.gold, size: 50),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscountOffer(String title, String subtitle, String rawCode, IconData icon, Color bgColor) {
    final cleanCode = rawCode.replaceAll('Use Code: ', '').replaceAll('!', '').trim();
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 8),
                // Interactive Copy Code Badge
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: cleanCode));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Promo code "$cleanCode" copied to clipboard!'),
                        backgroundColor: TDGColors.gold,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: TDGColors.border.withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Code: $cleanCode',
                          style: TextStyle(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                        ),
                        const SizedBox(width: 6),
                        Icon(Icons.copy_rounded, color: TDGColors.gold, size: 12),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: cleanCode));
                    Navigator.pop(context); // Go back to Home / Menu
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Promo code "$cleanCode" copied! Go to Menu to place order.'),
                        backgroundColor: TDGColors.gold,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: TDGColors.gold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Order Now',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: TDGColors.gold, size: 40),
          ),
        ],
      ),
    );
  }
}
