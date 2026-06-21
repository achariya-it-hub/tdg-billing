import 'package:flutter/material.dart';
import '../theme/colors.dart';

class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        title: Text('TERMS & CONDITIONS', style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome to The Lion Pride (TDG) Loyalty Program.',
              style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 24),
            _section('1. Membership & Dens', 
              'Membership is open to individuals who register through the official TDG app. A single member can form up to 10 Dens. Each Den is capped at a maximum of 10 members to ensure an exclusive experience.'),
            _section('2. Ruby Rewards', 
              'Rubies are the official digital currency of the TDG ecosystem. 1 Ruby is equivalent to ₹1 for redemption purposes. Rubies earned via registration (400 bonus) are unlocked upon your first order exceeding ₹1,000.'),
            _section('3. Referral Program', 
              'Members earn 25 Rubies for every successful referral, while the referred user receives 50 Rubies. Any attempt to cross-add members between Dens will result in disqualification from the reward program.'),
            _section('4. Redemptions & Transfers', 
              'A minimum of 3,000 Rubies is required to initiate a redemption. Peer-to-peer transfers are enabled up to a maximum of 200 Rubies per transaction to maintain network security.'),
            _section('5. Progression & Pride Lion', 
              'Members progress through Bronze, Silver, Gold, Platinum, Diamond, and Emerald tiers. The "Ruby Crown" is awarded at 25,000 Rubies. Completing 10 full Dens grants the user the prestigious "Pride Lion" status.'),
            _section('6. Liability', 
              'TDG reserves the right to modify or terminate the loyalty program or any features thereof at any time without prior notice.'),
            const SizedBox(height: 40),
            Center(
              child: Text(
                'Last Updated: May 12, 2026',
                style: TextStyle(color: TDGColors.grey, fontSize: 12),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: TDGColors.gold, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(color: TDGColors.white.withOpacity(0.7), fontSize: 13, height: 1.6),
          ),
        ],
      ),
    );
  }
}
