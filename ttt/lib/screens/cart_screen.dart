import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'checkout_screen.dart';
import '../widgets/tdg_button.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<Map<String, dynamic>> get _cartItems => ApiService().cart;

  final TextEditingController _promoController = TextEditingController();

  int get subtotal => _cartItems.fold(0, (sum, item) => sum + (int.parse(item['price'].toString())) * (int.parse(item['qty'].toString())));
  int get packagingFee => 10;
  int get total => subtotal + packagingFee;

  @override
  void initState() {
    super.initState();
    if (ApiService().cart.isEmpty) {
      ApiService().cart.addAll([
        {'name': 'The Classic Gyro', 'price': 199, 'qty': 1, 'icon': Icons.restaurant},
        {'name': 'Loaded Fries', 'price': 149, 'qty': 1, 'icon': Icons.set_meal},
        {'name': 'Coke Can', 'price': 60, 'qty': 1, 'icon': Icons.local_drink},
      ]);
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
          'MY CART',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
        actions: [
          TextButton(
            onPressed: () => setState(() => _cartItems.clear()),
            child: Text('Clear', style: TextStyle(color: TDGColors.red, fontSize: 14)),
          ),
        ],
      ),
      body: ResponsiveWrapper(
        maxWidth: 800,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  ..._cartItems.asMap().entries.map((entry) => _buildCartItem(entry.key, entry.value)),
                  const SizedBox(height: 16),
                  _buildPromoSection(),
                  const SizedBox(height: 16),
                  _buildPriceSummary(),
                ],
              ),
            ),
            _buildCheckoutButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildCartItem(int index, Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 75,
            height: 75,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              gradient: const LinearGradient(
                colors: [Color(0xFF2A1A00), Color(0xFF1A1000)],
              ),
            ),
            child: Icon(item['icon'] as IconData, color: TDGColors.gold, size: 32),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${item['price']}',
                  style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _qtyButton(Icons.remove, () {
                      setState(() {
                        if (item['qty'] > 1) {
                          item['qty']--;
                        } else {
                          _cartItems.removeAt(index);
                        }
                      });
                    }),
                    Container(
                      width: 36,
                      alignment: Alignment.center,
                      child: Text(
                        '${item['qty']}',
                        style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ),
                    _qtyButton(Icons.add, () => setState(() => item['qty']++)),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => setState(() => _cartItems.removeAt(index)),
                      child: Icon(Icons.delete_outline, color: TDGColors.red, size: 20),
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

  Widget _qtyButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: TDGColors.cardLight,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: TDGColors.border),
        ),
        child: Icon(icon, color: TDGColors.white, size: 16),
      ),
    );
  }

  Widget _buildPromoSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                hintText: 'Have a promo code?',
                hintStyle: TextStyle(color: TDGColors.grey, fontSize: 13),
                border: InputBorder.none,
              ),
            ),
          ),
          TextButton(
            onPressed: () {},
            child: Text('Apply', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Column(
        children: [
          _priceRow('Subtotal', '₹$subtotal'),
          const SizedBox(height: 8),
          _priceRow('Packaging Fee', '₹$packagingFee'),
          const SizedBox(height: 12),
          Container(height: 1, color: TDGColors.border),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800)),
              Text(
                '₹$total',
                style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: TDGColors.grey, fontSize: 13)),
        Text(value, style: TextStyle(color: TDGColors.greyLight, fontSize: 13)),
      ],
    );
  }

  Widget _buildCheckoutButton() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: BoxDecoration(
        color: TDGColors.background,
        border: Border(top: BorderSide(color: TDGColors.border)),
      ),
      child: TDGButton(
        text: 'Checkout',
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CheckoutScreen(total: total, items: _cartItems),
          ),
        ),
        icon: Icon(Icons.arrow_forward, size: 18, color: TDGColors.white),
      ),
    );
  }
}
