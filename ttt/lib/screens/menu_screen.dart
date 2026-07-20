import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'cart_screen.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  String _selectedCategory = 'Gyros';
  int _cartCount = 2;
  List<String> _categories = ['Gyros', 'Fries', 'Combos', 'Drinks'];
  Map<String, List<Map<String, dynamic>>> _menuItems = {};
  bool _isLoading = false;

  static const Map<String, List<Map<String, dynamic>>> _fallbackMenu = {
    'Gyros': [
      {'name': 'Non-Veg - Spicy Chicken Gyro (Regular)', 'desc': 'Fresh pita wrap with spicy chicken, hummus & veggies', 'price': '₹99'},
      {'name': 'Non-Veg - Spicy Chicken Gyro (Large)', 'desc': 'Double portion spicy chicken gyro with extra dips', 'price': '₹249'},
      {'name': 'Non-Veg - Cream Chicken Gyro (Regular)', 'desc': 'Creamy garlic chicken in fluffy pita bread', 'price': '₹99'},
      {'name': 'Veg - Spicy Paneer Gyro (Regular)', 'desc': 'Grilled paneer with spicy mayo & crisp iceberg', 'price': '₹99'},
    ],
    'Burger': [
      {'name': 'Non-Veg - Crispy Chicken Burger', 'desc': 'Crispy chicken patty with lettuce & signature sauce', 'price': '₹99'},
      {'name': 'Non-Veg - Spicy Egg Burger', 'desc': 'Spiced fried egg with cheese slice in sesame bun', 'price': '₹79'},
      {'name': 'Veg - Spicy Paneer Burger', 'desc': 'Golden paneer patty with spicy jalapenos', 'price': '₹99'},
    ],
    'TDG Crispy Chicken': [
      {'name': 'Non-Veg - 3 Pc Crispy Wings (1 Dip)', 'desc': '3 pcs hot & spicy crispy fried chicken wings', 'price': '₹90'},
      {'name': 'Non-Veg - 6 Pc Crispy Wings (2 Dip)', 'desc': '6 pcs crispy wings with choice of 2 dips', 'price': '₹180'},
      {'name': 'Non-Veg - 3 Pc Crispy Strips (1 Dip)', 'desc': '3 pcs boneless crispy chicken tenders', 'price': '₹120'},
    ],
    'Sides': [
      {'name': 'Veg - Fries (Salted, Peri Peri Or Cajun)', 'desc': 'Golden French fries tossed in your favorite seasoning', 'price': '₹99'},
      {'name': 'Non-Veg - Loaded Chicken Fries', 'desc': 'Crispy fries topped with chicken bits & cheese sauce', 'price': '₹199'},
    ],
    'Thick Shakes': [
      {'name': 'Veg - Vanilla Shake (Regular)', 'desc': 'Rich creamy vanilla thick shake', 'price': '₹99'},
      {'name': 'Veg - Biscoff Shake (Regular)', 'desc': 'Lotus biscoff crunch thick shake', 'price': '₹99'},
      {'name': 'Veg - Dark Chocolate Shake (Regular)', 'desc': 'Indulgent Belgian dark chocolate shake', 'price': '₹99'},
    ],
    'Beverages': [
      {'name': 'Veg - Sprite / Coca-Cola (Regular)', 'desc': 'Chilled 330ml soda with ice & lemon', 'price': '₹59'},
      {'name': 'Veg - Hot Chocolate', 'desc': 'Warm creamy hot chocolate drink', 'price': '₹149'},
    ]
  };

  @override
  void initState() {
    super.initState();
    _fetchMenu();
  }

  Future<void> _fetchMenu() async {
    setState(() => _isLoading = true);
    try {
      final menuData = await ApiService().getMenu();
      final List<dynamic> items = menuData['items'] ?? [];
      
      if (items.isNotEmpty) {
        final Map<String, List<Map<String, dynamic>>> grouped = {};
        for (var item in items) {
          final cat = item['category'] ?? 'Others';
          if (!grouped.containsKey(cat)) {
            grouped[cat] = [];
          }
          grouped[cat]!.add({
            'name': item['name'] ?? '',
            'desc': item['desc'] ?? '',
            'price': '₹${item['price']}',
          });
        }

        setState(() {
          _categories = List<String>.from(menuData['categories'] ?? _categories);
          _menuItems = grouped;
          if (_categories.isNotEmpty && !_categories.contains(_selectedCategory)) {
            _selectedCategory = _categories.first;
          }
        });
      } else {
        _useFallbackMenu();
      }
    } catch (e) {
      debugPrint("Error loading menu: $e");
      _useFallbackMenu();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _useFallbackMenu() {
    setState(() {
      _categories = _fallbackMenu.keys.toList();
      _menuItems = _fallbackMenu;
      if (!_categories.contains(_selectedCategory)) {
        _selectedCategory = _categories.first;
      }
    });
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
          'MENU',
          style: TextStyle(color: TDGColors.white,
            fontSize: 16,
            fontWeight: FontWeight.w800,
            letterSpacing: 3,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.search, color: TDGColors.white),
            onPressed: () {},
          ),
          Stack(
            children: [
              IconButton(
                icon: Icon(Icons.shopping_cart_outlined, color: TDGColors.white),
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CartScreen()),
                ),
              ),
              if (_cartCount > 0)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: TDGColors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '$_cartCount',
                        style: TextStyle(color: TDGColors.white, fontSize: 10, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold),
              ),
            )
          : Column(
        children: [
          // Category tabs
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedCategory = cat),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
                      decoration: BoxDecoration(
                        gradient: isSelected ? TDGColors.embossedRedGradient : null,
                        color: isSelected ? null : TDGColors.cardDark,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? TDGColors.primaryRed.withOpacity(0.5) : TDGColors.border,
                        ),
                        boxShadow: isSelected ? [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            offset: const Offset(0, 2),
                            blurRadius: 4,
                          )
                        ] : null,
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          color: isSelected ? Colors.white : TDGColors.greyLight,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const SizedBox(height: 12),
          // Menu list
          Expanded(
            child: ResponsiveWrapper(
              maxWidth: 1200,
              child: Responsive.isMobile(context)
                  ? ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: (_menuItems[_selectedCategory] ?? []).length,
                      itemBuilder: (context, index) {
                        final item = (_menuItems[_selectedCategory] ?? [])[index];
                        return _buildMenuItem(item);
                      },
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: Responsive.gridColumns(context, mobile: 1, tablet: 2, desktop: 3),
                        childAspectRatio: 2.8,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: (_menuItems[_selectedCategory] ?? []).length,
                      itemBuilder: (context, index) {
                        final item = (_menuItems[_selectedCategory] ?? [])[index];
                        return _buildMenuItem(item);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(Map<String, dynamic> item) {
    String imagePath = 'assets/images/gyro.png';
    if (_selectedCategory == 'Fries') imagePath = 'assets/images/fries.png';
    if (_selectedCategory == 'Drinks') imagePath = 'assets/images/drink.png';

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
          // Food image
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                imagePath,
                fit: BoxFit.cover,
              ),
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: TextStyle(color: TDGColors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item['desc'],
                  style: TextStyle(color: TDGColors.grey, fontSize: 11, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item['price'],
                      style: TextStyle(color: TDGColors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _cartCount++),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: TDGColors.embossedRedGradient,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              offset: const Offset(0, 2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Text(
                              'ADD',
                              style: TextStyle(color: TDGColors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(width: 3),
                            Icon(Icons.add, color: TDGColors.white, size: 14),
                          ],
                        ),
                      ),
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
}
