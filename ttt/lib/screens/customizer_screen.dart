import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

class CustomizerScreen extends StatefulWidget {
  const CustomizerScreen({super.key});

  @override
  State<CustomizerScreen> createState() => _CustomizerScreenState();
}

class _CustomizerScreenState extends State<CustomizerScreen> {
  String selectedProtein = 'Chicken';
  String selectedBread = 'Baked';
  String selectedSpread = 'Tzatziki';
  List<String> selectedSauces = ['Garlic Mayo'];
  List<String> selectedVeggies = ['Lettuce', 'Onion'];

  final breads = ['Baked', 'Fried'];
  final spreads = ['Hummus', 'Cheese', 'Tzatziki', 'Ricota'];
  final sauces = ['Turkish Chill', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard'];
  final veggies = ['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'];

  void toggleSauce(String s) {
    setState(() {
      if (selectedSauces.contains(s)) {
        selectedSauces.remove(s);
      } else {
        selectedSauces.add(s);
      }
    });
  }

  void toggleVeggie(String v) {
    setState(() {
      if (selectedVeggies.contains(v)) {
        selectedVeggies.remove(v);
      } else {
        selectedVeggies.add(v);
      }
    });
  }

  String getBreadAsset(String b) {
    if (b == 'Baked') return 'assets/images/baked.png';
    return 'assets/images/fried.png';
  }

  String getSpreadAsset(String s) {
    if (s == 'Hummus') return 'assets/images/hummus.png';
    if (s == 'Cheese') return 'assets/images/cheese.png';
    if (s == 'Tzatziki') return 'assets/images/Tzatziki.png';
    return 'assets/images/ricotta.png';
  }

  String getSauceAsset(String s) {
    if (s.toLowerCase().includes('turkish')) return 'assets/images/turkish mayo.png';
    if (s.toLowerCase().includes('jalapeno cheese')) return 'assets/images/jalapeno cheese.png';
    if (s.toLowerCase().includes('garlic')) return 'assets/images/garlic mayo.png';
    if (s.toLowerCase().includes('spicy')) return 'assets/images/spicy_mayo.png';
    if (s.toLowerCase().includes('peri')) return 'assets/images/peri peri.png';
    return 'assets/images/honey mustard.png';
  }

  String getVeggieAsset(String v) {
    if (v.toLowerCase().includes('lettuce')) return 'assets/images/lettuce.png';
    if (v.toLowerCase().includes('onion')) return 'assets/images/onion.png';
    if (v.toLowerCase().includes('jalapeno')) return 'assets/images/jalapenos.png';
    if (v.toLowerCase().includes('olive')) return 'assets/images/olives.png';
    if (v.toLowerCase().includes('capsicum')) return 'assets/images/bell peppers.png';
    if (v.toLowerCase().includes('tomato')) return 'assets/images/tomatos.png';
    if (v.toLowerCase().includes('cucumber')) return 'assets/images/cucumber.png';
    return 'assets/images/beans.png';
  }

  void addToCartAndDone() {
    final cart = ApiService().cart;
    
    // Add customized items config parameters
    cart.add({
      'name': 'Custom Gyro Wrap',
      'price': 199,
      'qty': 1,
      'icon': Icons.restaurant_menu,
      'customization': {
        'protein': selectedProtein,
        'bread': selectedBread,
        'spread': selectedSpread,
        'sauces': selectedSauces,
        'veggies': selectedVeggies
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Custom Gyro Wrap added to cart successfully!'), backgroundColor: Colors.green),
    );

    // Redirect to home screen
    Navigator.pop(context);
  }

  Widget _buildSectionHeader(String title, {bool isMulti = false}) {
    return Container(
      margin: const EdgeInsets.only(top: 16, bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: TDGColors.gold.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              color: TDGColors.gold,
              fontSize: 13,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.5,
            ),
          ),
          if (isMulti)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: TDGColors.red,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'MULTI',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF16161D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161D),
        elevation: 0,
        leading: BackButton(color: TDGColors.gold),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'BUILD YOUR GYRO',
              style: GoogleFonts.outfit(color: TDGColors.gold, fontWeight: FontWeight.w900, fontSize: 18),
            ),
            Text(
              'Made fresh, made yours 🌯',
              style: GoogleFonts.outfit(color: Colors.grey, fontSize: 10, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                
                // Choose Protein
                _buildSectionHeader('🥩 CHOOSE YOUR PROTEIN'),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: ['Chicken', 'Paneer'].map((p) {
                    final isSel = selectedProtein == p;
                    return GestureDetector(
                      onTap: () => setState(() => selectedProtein = p),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSel ? TDGColors.gold.withOpacity(0.12) : TDGColors.cardDark,
                          border: Border.all(color: isSel ? TDGColors.gold : TDGColors.white.withOpacity(0.1), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                width: double.infinity,
                                color: Colors.black12,
                                child: Image.asset(
                                  p == 'Chicken' ? 'assets/images/crispy_chicken.png' : 'assets/images/veggies_composite.jpg',
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.restaurant_menu, color: Colors.white24, size: 40),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(p, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                // Choose Bread
                _buildSectionHeader('🍞 CHOOSE YOUR BREAD'),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: breads.map((b) {
                    final isSel = selectedBread == b;
                    return GestureDetector(
                      onTap: () => setState(() => selectedBread = b),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSel ? TDGColors.gold.withOpacity(0.12) : TDGColors.cardDark,
                          border: Border.all(color: isSel ? TDGColors.gold : TDGColors.white.withOpacity(0.1), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                child: Image.asset(
                                  getBreadAsset(b),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Colors.white24),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(b, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                // Choose Spread
                _buildSectionHeader('🥣 CHOOSE YOUR SPREAD'),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: spreads.map((s) {
                    final isSel = selectedSpread == s;
                    return GestureDetector(
                      onTap: () => setState(() => selectedSpread = s),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSel ? TDGColors.gold.withOpacity(0.12) : TDGColors.cardDark,
                          border: Border.all(color: isSel ? TDGColors.gold : TDGColors.white.withOpacity(0.1), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                child: Image.asset(
                                  getSpreadAsset(s),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Colors.white24),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(s, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                // Choose Sauce
                _buildSectionHeader('🌶️ CHOOSE YOUR SAUCE'),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: sauces.map((s) {
                    final isSel = selectedSauces.contains(s);
                    return GestureDetector(
                      onTap: () => toggleSauce(s),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSel ? TDGColors.gold.withOpacity(0.12) : TDGColors.cardDark,
                          border: Border.all(color: isSel ? TDGColors.gold : TDGColors.white.withOpacity(0.1), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                child: Image.asset(
                                  getSauceAsset(s),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Colors.white24),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(s, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                // Choose Veggies
                _buildSectionHeader('🥗 CHOOSE YOUR VEGGIES', isMulti: true),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: veggies.map((v) {
                    final isSel = selectedVeggies.contains(v);
                    return GestureDetector(
                      onTap: () => toggleVeggie(v),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSel ? TDGColors.gold.withOpacity(0.12) : TDGColors.cardDark,
                          border: Border.all(color: isSel ? TDGColors.gold : TDGColors.white.withOpacity(0.1), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                child: Image.asset(
                                  getVeggieAsset(v),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Colors.white24),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(v, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

              ],
            ),
          ),

          // Bottom float summaries bar
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F12),
                border: Border(top: BorderSide(color: TDGColors.gold.withOpacity(0.3), width: 1.5)),
                boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 15, offset: Offset(0, -4))],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Custom Gyro Wrap',
                          style: GoogleFonts.outfit(color: TDGColors.gold, fontWeight: FontWeight.w900, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$selectedProtein • $selectedBread • $selectedSpread spread',
                          style: GoogleFonts.outfit(color: Colors.grey, fontSize: 10),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: addToCartAndDone,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TDGColors.gold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 5,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('ADD TO CART (₹199)', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 12)),
                        const SizedBox(width: 6),
                        const Icon(Icons.shopping_bag_outlined, size: 16),
                      ],
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
