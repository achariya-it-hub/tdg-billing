import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'checkout_screen.dart';
import 'main_nav_screen.dart';
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

  int get subtotal => _cartItems.fold(0, (sum, item) => sum + (int.tryParse(item['price'].toString()) ?? 0) * (int.tryParse(item['qty'].toString()) ?? 1));
  int get total => subtotal;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
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
          'MY CART',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 3),
        ),
        actions: [
          if (_cartItems.isNotEmpty)
            TextButton(
              onPressed: () => setState(() => ApiService().cart.clear()),
              child: Text('Clear', style: TextStyle(color: TDGColors.red, fontSize: 14, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      body: ResponsiveWrapper(
        maxWidth: 800,
        child: _cartItems.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shopping_cart_outlined, color: TDGColors.grey, size: 72),
                      const SizedBox(height: 16),
                      Text(
                        'Your Cart is Empty',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Add handcrafted gyros, combos & sides to your cart.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: TDGColors.grey, fontSize: 13),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () {
                          if (Navigator.canPop(context)) {
                            Navigator.pop(context);
                          }
                          MainNavScreen.navKey.currentState?.setTab(2);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: TDGColors.gold,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('EXPLORE MENU', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                      ),
                    ],
                  ),
                ),
              )
            : Column(
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
            child: Icon(item['icon'] as IconData? ?? Icons.restaurant, color: TDGColors.gold, size: 32),
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
                if (item['customization'] != null) ...[
                  const SizedBox(height: 3),
                  Builder(
                    builder: (context) {
                      final c = item['customization'] as Map<String, dynamic>;
                      final gyro1 = (c['gyro1'] ?? '').toString();
                      final gyro2 = (c['gyro2'] ?? '').toString();
                      final drink = (c['drink'] ?? '').toString();
                      final dips = (c['dips'] ?? '').toString();

                      final List<String> parts = [];
                      if (c['protein'] != null) parts.add(c['protein'].toString());
                      if (c['flavor'] != null) parts.add(c['flavor'].toString());
                      if (c['bread'] != null) parts.add(c['bread'].toString());

                      final saucesStr = c['sauces'] is List ? (c['sauces'] as List).join(', ') : (c['sauces'] ?? '').toString();
                      final veggiesStr = c['veggies'] is List ? (c['veggies'] as List).join(', ') : (c['veggies'] ?? '').toString();
                      final notesStr = (c['notes'] ?? '').toString();

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (gyro1.isNotEmpty)
                            Text('• $gyro1', style: TextStyle(color: TDGColors.gold, fontSize: 10.5, fontWeight: FontWeight.w600)),
                          if (gyro2.isNotEmpty)
                            Text('• $gyro2', style: TextStyle(color: TDGColors.gold, fontSize: 10.5, fontWeight: FontWeight.w600)),
                          if (parts.isNotEmpty)
                            Text(parts.join(' • '), style: TextStyle(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w600)),
                          if (saucesStr.isNotEmpty)
                            Text('Sauces: $saucesStr', style: TextStyle(color: TDGColors.grey, fontSize: 10.5)),
                          if (veggiesStr.isNotEmpty)
                            Text('Veggies: $veggiesStr', style: TextStyle(color: TDGColors.grey, fontSize: 10.5)),
                          if (drink.isNotEmpty)
                            Text('🥤 Drink: $drink', style: const TextStyle(color: Colors.lightBlueAccent, fontSize: 10.5)),
                          if (dips.isNotEmpty)
                            Text('🧄 Dips: $dips', style: const TextStyle(color: Colors.orangeAccent, fontSize: 10.5)),
                          if (notesStr.isNotEmpty)
                            Text('Notes: $notesStr', style: const TextStyle(color: Colors.amber, fontSize: 10.5, fontStyle: FontStyle.italic)),
                        ],
                      );
                    },
                  ),
                ],
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
                        if ((item['qty'] ?? 1) > 1) {
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

  Widget _buildCheckoutButton() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
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
          ).then((_) {
            if (mounted) setState(() {});
          }),
          icon: Icon(Icons.arrow_forward, size: 18, color: TDGColors.white),
        ),
      ),
    );
  }
}
