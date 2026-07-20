import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'order_placed_screen.dart';
import '../widgets/tdg_button.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';

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
  int _discount = 0;
  String _discountMessage = '';
  int _assetDiscount = 0;
  int _loggedInDiscount = 0;
  bool _isAsset = false;
  bool _usePoints = false;
  int _pointsToRedeem = 0;
  int _userPoints = 0;

  int get _discountAmount => (widget.total * _discount / 100).round();
  int get _finalTotal => widget.total - _discountAmount - _pointsToRedeem;

  @override
  void initState() {
    super.initState();
    _fetchDiscount();
    _userPoints = ApiService().currentUser?['points'] ?? 0;
  }

  Future<void> _fetchDiscount() async {
    try {
      final phone = ApiService().currentUser?['phone'];
      if (phone != null) {
        final result = await ApiService().getDiscount(phone, billAmount: widget.total);
        if (mounted) {
          setState(() {
            _discount = result['discount'] ?? 0;
            _discountMessage = result['message'] ?? '';
            _assetDiscount = result['assetDiscount'] ?? 0;
            _loggedInDiscount = result['loggedInDiscount'] ?? 0;
            _isAsset = result['isAsset'] ?? false;
          });
        }
      }
    } catch (e) {
      debugPrint('Discount fetch failed: $e');
    }
  }

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
        total: _finalTotal.toDouble(),
        paymentMethod: _selectedPayment,
        deliveryAddress: 'Home',
      );

      // Deduct points if redeemed
      if (_usePoints && _pointsToRedeem > 0) {
        await ApiService().redeemPoints(_pointsToRedeem);
      }

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const OrderPlacedScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) setState(() => _isPaying = false);
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
      body: ResponsiveWrapper(
        maxWidth: 800,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildDeliveryAddress(),
                  const SizedBox(height: 16),
                  _buildPaymentMethod(),
                  const SizedBox(height: 16),
                  _buildPointsRedeem(),
                ],
              ),
            ),
            _buildPayNowSection(),
          ],
        ),
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
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: TDGColors.gold.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.home_rounded, color: TDGColors.gold, size: 20),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Home',
                      style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    Text(
                      'Deliver to your address',
                      style: TextStyle(color: TDGColors.grey, fontSize: 11),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: TDGColors.grey, size: 20),
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
          'Points Wallet',
          '',
          subtitleWidget: Row(
            children: [
              Text(
                'Balance: ${ApiService().currentUser?['points'] ?? 0} ',
                style: TextStyle(color: TDGColors.grey, fontSize: 11),
              ),
              Icon(
                Icons.diamond_rounded,
                color: TDGColors.gold,
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

  Widget _buildPointsRedeem() {
    if (_userPoints <= 0) return const SizedBox.shrink();
    final maxRedeem = _userPoints < _finalTotal ? _userPoints : _finalTotal;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'REDEEM POINTS',
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
            border: Border.all(
              color: _usePoints ? TDGColors.gold.withOpacity(0.5) : TDGColors.border,
              width: _usePoints ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Icon(Icons.redeem_rounded, color: TDGColors.gold, size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Use Points', style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        Text('1 pt = ₹1  •  Available: $_userPoints pts', style: TextStyle(color: TDGColors.grey, fontSize: 11)),
                      ],
                    ),
                  ),
                  Switch(
                    value: _usePoints,
                    onChanged: (val) {
                      setState(() {
                        _usePoints = val;
                        _pointsToRedeem = val ? (maxRedeem > 0 ? maxRedeem : 0) : 0;
                      });
                    },
                    activeColor: TDGColors.gold,
                  ),
                ],
              ),
              if (_usePoints) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text('Points to redeem: ', style: TextStyle(color: TDGColors.grey, fontSize: 12)),
                    Expanded(
                      child: Slider(
                        value: _pointsToRedeem.toDouble(),
                        min: 0,
                        max: maxRedeem.toDouble(),
                        divisions: maxRedeem > 0 ? (maxRedeem > 50 ? 50 : maxRedeem) : 1,
                        activeColor: TDGColors.gold,
                        inactiveColor: TDGColors.border,
                        onChanged: (val) => setState(() => _pointsToRedeem = val.round()),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: TDGColors.gold.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text('$_pointsToRedeem pts', style: TextStyle(color: TDGColors.gold, fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ],
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
          // Discount info
          if (_discount > 0)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.local_offer_rounded, color: Colors.green, size: 16),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '$_discountMessage  •  -₹$_discountAmount',
                          style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  if (_isAsset && _assetDiscount > 0 && _loggedInDiscount > 0)
                    Padding(
                      padding: const EdgeInsets.only(top: 4, left: 24),
                      child: Text(
                        'Asset: ${_assetDiscount}% + App login: ${_loggedInDiscount}%',
                        style: TextStyle(color: Colors.green.withOpacity(0.7), fontSize: 10),
                      ),
                    ),
                ],
              ),
            ),
          // Points redeemed
          if (_usePoints && _pointsToRedeem > 0)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: TDGColors.gold.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.diamond_rounded, color: TDGColors.gold, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Points redeemed: $_pointsToRedeem pts (-₹$_pointsToRedeem)',
                      style: TextStyle(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          // Original total
          if (_discountAmount > 0 || _pointsToRedeem > 0)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Subtotal', style: TextStyle(color: TDGColors.grey, fontSize: 12)),
                  Text('₹${widget.total}', style: TextStyle(color: TDGColors.grey, fontSize: 12, decoration: TextDecoration.lineThrough)),
                ],
              ),
            ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Payable', style: TextStyle(color: TDGColors.grey, fontSize: 14)),
              Text(
                '₹$_finalTotal',
                style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TDGButton(
            text: _finalTotal <= 0 ? 'Place Order (Free!)' : 'Pay Now ₹$_finalTotal',
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
