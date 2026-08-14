import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

import 'main_nav_screen.dart';

class ReferralScreen extends StatelessWidget {
  const ReferralScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final referCode = ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? 'TDG7890';

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F0F12),
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: TDGColors.white),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              MainNavScreen.navKey.currentState?.setTab(0);
            }
          },
        ),
        centerTitle: true,
        title: Text(
          'REFERRAL CARD',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          children: [
            // Referral Card Block Container
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1D1B22), Color(0xFF0F0F12)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: TDGColors.gold.withOpacity(0.08),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Gold Gradient Inner Referral Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E1500), Color(0xFF120C00)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 1),
                      image: const DecorationImage(
                        image: AssetImage('assets/images/gold_card.png'),
                        fit: BoxFit.cover,
                        opacity: 0.15,
                      ),
                    ),
                    child: Column(
                      children: [
                        // TDG Banner Logo
                        Image.asset(
                          'assets/images/logo_header.png',
                          height: 38,
                          errorBuilder: (_, __, ___) => Text(
                            'TEN DEN GYROS',
                            style: GoogleFonts.outfit(color: TDGColors.gold, fontWeight: FontWeight.w900, fontSize: 18),
                          ),
                        ),
                        const SizedBox(height: 30),
                        Text(
                          'YOUR REFERRAL CODE',
                          style: GoogleFonts.outfit(
                            color: Colors.white60,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          referCode,
                          style: GoogleFonts.outfit(
                            color: TDGColors.gold,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 30),
                        // Share Code Button
                        ElevatedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Referral details copied: $referCode. Share with friends!'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: TDGColors.gold,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 4,
                          ),
                          child: Text(
                            'Share Code',
                            style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Referral & Loyalty Benefits',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildRuleRow('🎁 Welcome Signup Bonus:', '500 Points'),
                  _buildRuleRow('🎁 Referred Friend 1st Visit:', '15% OFF'),
                  _buildRuleRow('🔁 Referred Friend Repeat Visits:', '10% OFF'),
                  _buildRuleRow('⭐ Primary Member Initial Discount:', '30% OFF'),
                  _buildRuleRow('💰 Your Referrer Cashback:', '5% in Points'),
                  _buildRuleRow('🔒 Redemption Threshold:', '100 Points Min'),
                  _buildRuleRow('Strict Daily Redemption Limit:', '1 Offer/Bill Per Day'),
                  _buildRuleRow('👔 Staff Benefit & Reimbursement:', '50% OFF'),
                  _buildRuleRow('🚀 Partner Level Target:', '₹5,000 Spend'),
                  const SizedBox(height: 18),

                  // Horizontal Steps Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStepItem(Icons.edit_note_rounded, 'Share Link', 'your code'),
                      _buildStepItem(Icons.shopping_bag_outlined, 'Friend Orders', '15% 1st / 10% repeat'),
                      _buildStepItem(Icons.workspace_premium_rounded, 'Earn 5%', 'Wallet Points'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Rewards Earned Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF16161D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Rewards Earned',
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    '₹2,150',
                    style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRuleRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
          Text(val, style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildStepItem(IconData icon, String title, String subtitle) {
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E24),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Icon(icon, color: TDGColors.gold, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: GoogleFonts.outfit(color: Colors.grey, fontSize: 8),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
