import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'order_placed_screen.dart';
import '../widgets/tdg_button.dart';
import '../services/api_service.dart';

class CheckoutScreen extends StatefulWidget {
  final int total;
  final List<Map<String, dynamic>> items;
  const CheckoutScreen({super.key, required this.total, required this.items});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedPayment = 'wallet';
  bool _isPaying = false;

  void _handlePayment() async {
    setState(() => _isPaying = true);
    try {
      final itemsForApi = widget.items.map((item) => {
        'name': item['name'],
        'price': double.parse(item['price'].toString()),
        'quantity': int.parse(item['qty'].toString()),
      }).toList();

      await ApiService().createOrder(
        items: itemsForApi,
        subtotal: (widget.total - 35).toDouble(),
        tax: 0.0,
        deliveryFee: 25.0,
        total: widget.total.toDouble(),
        paymentMethod: _selectedPayment,
        deliveryAddress: 'Home',
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const OrderPlacedScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPaying = false);
      }
    }
  }

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
          'CHECKOUT',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildDeliveryAddress(),
                const SizedBox(height: 16),
                _buildPaymentMethod(),
              ],
            ),
          ),
          _buildPayNowSection(),
        ],
      ),
    );
  }

  Widget _buildDeliveryAddress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'DELIVERY ADDRESS',
          style: TextStyle(
            color: TDGColors.gold,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: TDGColors.cardDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: TDGColors.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Home',
                      style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'A-102, Green Park, New Delhi - 110016',
                      style: TextStyle(color: TDGColors.grey, fontSize: 12, height: 1.4),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () {},
                child: Text('Change', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentMethod() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'PAYMENT METHOD',
          style: TextStyle(
            color: TDGColors.gold,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 10),
        _paymentOption(
          'wallet',
          Icons.account_balance_wallet_rounded,
          'Ruby Wallet',
          '',
          subtitleWidget: Row(
            children: [
              Text(
                'Balance: ${ApiService().currentUser?['rubyBalance'] ?? 0} ',
                style: TextStyle(color: TDGColors.grey, fontSize: 11),
              ),
              Icon(
                Icons.diamond_rounded,
                color: TDGColors.primaryRed,
                size: 13,
              ),
            ],
          ),
          showGold: true,
        ),
        const SizedBox(height: 8),
        _paymentOption('upi', Icons.send_rounded, 'UPI', 'Pay using any UPI app'),
        const SizedBox(height: 8),
        _paymentOption('card', Icons.credit_card_rounded, 'Credit / Debit Card', 'Visa, Mastercard, Rupay'),
        const SizedBox(height: 8),
        _paymentOption('netbanking', Icons.account_balance_rounded, 'Net Banking', 'All major banks'),
      ],
    );
  }

  Widget _paymentOption(String id, IconData icon, String title, String subtitle, {Widget? subtitleWidget, bool showGold = false}) {
    final isSelected = _selectedPayment == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = id),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: TDGColors.cardDark,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? TDGColors.gold.withOpacity(0.5) : TDGColors.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isSelected ? TDGColors.gold.withOpacity(0.15) : TDGColors.cardLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isSelected ? TDGColors.gold : TDGColors.grey, size: 20),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(color: TDGColors.white,
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  if (subtitleWidget != null)
                    subtitleWidget
                  else
                    Text(
                      subtitle,
                      style: TextStyle(color: TDGColors.grey, fontSize: 11),
                    ),
                ],
              ),
            ),
            if (isSelected)
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: TDGColors.gold,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.black, size: 14),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayNowSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 30),
      decoration: BoxDecoration(
        color: TDGColors.background,
        border: Border(top: BorderSide(color: TDGColors.border)),
      ),
      child: Column(
        children: [
          // Bonus reminder (Requirement 3)
          if (widget.total < 1000)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: TDGColors.gold.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: TDGColors.gold, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Spend ₹1000+ to unlock 400 Rubies bonus!',
                      style: TextStyle(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.redeem_rounded, color: Colors.blue, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Minimum 3,000 Rubies required for redemption.',
                    style: TextStyle(color: Colors.blue, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Payable', style: TextStyle(color: TDGColors.grey, fontSize: 14)),
              Text(
                '₹${widget.total}',
                style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TDGButton(
            text: 'Pay Now',
            isLoading: _isPaying,
            onPressed: _handlePayment,
            icon: Icon(Icons.lock_outline, size: 16, color: TDGColors.white),
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield_outlined, color: TDGColors.grey, size: 14),
              SizedBox(width: 4),
              Text('100% Secure Payments', style: TextStyle(color: TDGColors.grey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
