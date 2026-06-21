import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';

class PaymentMethodsScreen extends StatelessWidget {
  const PaymentMethodsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        title: Text('PAYMENT METHODS', style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('SAVED CARDS', style: TextStyle(color: TDGColors.grey, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
            const SizedBox(height: 16),
            _buildCardItem('**** **** **** 4242', 'Visa', '04/26'),
            const SizedBox(height: 12),
            _buildCardItem('**** **** **** 9876', 'Mastercard', '12/25'),
            const SizedBox(height: 32),
            Text('UPI IDS', style: TextStyle(color: TDGColors.grey, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
            const SizedBox(height: 16),
            _buildUPIItem('rohit.sharma@okaxis', 'Active'),
            const SizedBox(height: 40),
            TDGButton(
              text: 'Add New Method',
              onPressed: () {},
              icon: const Icon(Icons.add_rounded, color: Colors.black),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardItem(String number, String type, String expiry) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Icon(Icons.credit_card_rounded, color: TDGColors.gold, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(number, style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text('$type | Expires $expiry', style: TextStyle(color: TDGColors.grey, fontSize: 11)),
              ],
            ),
          ),
          Icon(Icons.more_vert_rounded, color: TDGColors.grey, size: 20),
        ],
      ),
    );
  }

  Widget _buildUPIItem(String id, String status) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Icon(Icons.send_rounded, color: TDGColors.gold, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(id, style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text(status, style: TextStyle(color: Color(0xFF4CAF50), fontSize: 11, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          Icon(Icons.delete_outline_rounded, color: TDGColors.red, size: 20),
        ],
      ),
    );
  }
}
