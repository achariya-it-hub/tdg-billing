import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../utils/responsive.dart';

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
        title: Text('TERMS & CONDITIONS', style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 1)),
      ),
      body: ResponsiveWrapper(
        maxWidth: 800,
        child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome to The Lion Pride (TDG) Loyalty Program.',
              style: TextStyle(color: TDGColors.white, fontSize: 22, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 24),
            _section('1. Tiered Member & Guest Discounts', 
              'Referred guests receive 15% OFF on their 1st visit upon entry via a referral link/code, and 10% OFF on every subsequent repeat visit. Primary users start with a 30% initial discount, and staff members receive 50% OFF (logged for outlet reimbursement).'),
            _section('2. Referrer Commission & Points Cashback', 
              'Primary referrers earn 5% in wallet points on every bill completed by their invited friends. 1 Point = ₹1 discount value.'),
            _section('3. 500 Welcome Points Bonus', 
              'New members receive 500 welcome bonus points upon app installation & registration. 1 Point = ₹1 value.'),
            _section('4. Point Redemption Threshold (100 Pts)', 
              'Points can only be redeemed after reaching a strict minimum threshold of 100 points. Redemptions cover up to 50% of bill total at checkout.'),
            _section('5. Single Daily Redemption Limit', 
              'Enforced strict single-use rules: Only 1 offer/bill redemption allowed per customer per day, with no multi-bill redemptions on the same day.'),
            _section('6. Partner Enrollment & Progression', 
              'Partner / Referral codes can be entered during signup/login. Cumulative order spend is tracked automatically, and reaching ₹5,000 in total order spend automatically unlocks Partner level status.'),
            const SizedBox(height: 40),
            Center(
              child: Text(
                'Last Updated: August 13, 2026',
                style: TextStyle(color: TDGColors.grey, fontSize: 14, fontWeight: FontWeight.w500),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
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
          Text(title, style: TextStyle(color: TDGColors.gold, fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
          const SizedBox(height: 10),
          Text(
            content,
            style: TextStyle(color: TDGColors.white.withOpacity(0.85), fontSize: 15, height: 1.65),
          ),
        ],
      ),
    );
  }
}
