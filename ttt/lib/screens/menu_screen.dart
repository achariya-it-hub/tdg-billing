import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'cart_screen.dart';
import 'main_nav_screen.dart';
import '../widgets/gyro_customizer_modal.dart';
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
      {'name': 'Spicy Gyro', 'desc': 'Spicy gyro with fresh veggies & spread (Chicken or Paneer)', 'price': '₹199'},
      {'name': 'Creamy Gyro', 'desc': 'Creamy tzatziki gyro wrap (Chicken or Paneer)', 'price': '₹199'},
      {'name': 'BBQ Gyro', 'desc': 'Rich BBQ gyro wrap (Chicken or Paneer)', 'price': '₹199'},
      {'name': 'Signature Gyro', 'desc': 'TDG signature gyro wrap with secret sauce (Chicken or Paneer)', 'price': '₹199'},
    ],
    'Leg & Thigh': [
      {'name': '1 Pc Leg & Thigh (1 Dip)', 'desc': '1 Pc Crispy Leg & Thigh + 1 Choice Dip', 'price': '₹70'},
      {'name': '2 Pc Leg & Thigh (1 Dip)', 'desc': '2 Pc Crispy Leg & Thigh + 1 Choice Dip', 'price': '₹140'},
      {'name': '4 Pc Leg & Thigh (2 Dips)', 'desc': '4 Pc Crispy Leg & Thigh + 2 Choice Dips', 'price': '₹280'},
      {'name': '8 Pc Leg & Thigh (4 Dips)', 'desc': '8 Pc Crispy Leg & Thigh + 4 Choice Dips', 'price': '₹560'},
      {'name': '12 Pc Leg & Thigh (6 Dips)', 'desc': '12 Pc Crispy Leg & Thigh + 6 Choice Dips', 'price': '₹840'},
    ],
    'Wings': [
      {'name': '3 Pc Wings (1 Dip)', 'desc': '3 Pc Crispy Chicken Wings + 1 Choice Dip', 'price': '₹90'},
      {'name': '6 Pc Wings (2 Dips)', 'desc': '6 Pc Crispy Chicken Wings + 2 Choice Dips', 'price': '₹180'},
      {'name': '9 Pc Wings (3 Dips)', 'desc': '9 Pc Crispy Chicken Wings + 3 Choice Dips', 'price': '₹270'},
      {'name': '20 Pc Wings (6 Dips)', 'desc': '20 Pc Crispy Chicken Wings + 6 Choice Dips', 'price': '₹600'},
    ],
    'Strips': [
      {'name': '3 Pc Strips (1 Dip)', 'desc': '3 Pc Crispy Chicken Strips + 1 Choice Dip', 'price': '₹120'},
      {'name': '6 Pc Strips (2 Dips)', 'desc': '6 Pc Crispy Chicken Strips + 2 Choice Dips', 'price': '₹240'},
      {'name': '9 Pc Strips (3 Dips)', 'desc': '9 Pc Strips (3 Dips)', 'price': '₹360'},
      {'name': '20 Pc Strips (6 Dips)', 'desc': '20 Pc Strips (6 Dips)', 'price': '₹800'},
    ],
    'Fries': [
      {'name': 'Fries (Salted, Peri Peri or Cajun)', 'desc': 'Crispy Fries (Salted, Peri Peri, or Cajun)', 'price': '₹99'},
      {'name': 'Loaded Fries', 'desc': 'Loaded Fries topped with melted cheese, sauces (Chicken or Paneer)', 'price': '₹199'},
    ],
    'Rice & Salads': [
      {'name': 'Rice Bowl (Signature)', 'desc': 'Signature Lebanese Rice Bowl (Chicken or Paneer)', 'price': '₹199'},
      {'name': 'Signature Salad', 'desc': 'Fresh Mediterranean Signature Salad (Chicken or Paneer)', 'price': '₹149'},
    ],
    'Beverages': [
      {'name': 'Sprite (Regular)', 'desc': 'Sprite 330ml Regular', 'price': '₹59'},
      {'name': 'Sprite (Large)', 'desc': 'Sprite 500ml Large', 'price': '₹99'},
      {'name': 'Coca Cola (Regular)', 'desc': 'Coca Cola 330ml Regular', 'price': '₹59'},
      {'name': 'Coca Cola (Large)', 'desc': 'Coca Cola 500ml Large', 'price': '₹99'},
      {'name': 'Ice Tea (Regular)', 'desc': 'Ice Tea - Peach or Lime (Regular)', 'price': '₹59'},
      {'name': 'Ice Tea (Large)', 'desc': 'Ice Tea - Peach or Lime (Large)', 'price': '₹99'},
      {'name': 'Hot Chocolate', 'desc': 'Rich Warm Hot Chocolate', 'price': '₹99'},
      {'name': 'Signature Tea', 'desc': 'Special TDG Signature Brewed Tea', 'price': '₹99'},
    ],
    'Meals & Combos': [
      {'name': 'Express Meal', 'desc': 'Gyro & Regular Drink', 'price': '₹249'},
      {'name': 'Signature Gyro Meal', 'desc': 'Gyro, Fries, Regular Drink', 'price': '₹279'},
      {'name': 'Lebanese Rice Box', 'desc': 'Lebanese rice, Fries, Regular Drink', 'price': '₹299'},
      {'name': 'Classic Gyro Meal', 'desc': 'Gyro, 2 Wings, Fries, Regular Drink, 1 Dip', 'price': '₹349'},
      {'name': 'Duo Gyro Feast', 'desc': '2 Gyros, Fries, 2 Regular Drinks', 'price': '₹449'},
      {'name': 'Double Crunch Box', 'desc': '2 Gyros, 6 Wings, Fries, 2 Regular Drinks', 'price': '₹699'},
      {'name': 'Mega Feast Meal', 'desc': '2 Gyros, 2 Leg & Thighs, 2 Wings, 2 Strips, Fries, 2 Regular Drinks, 3 Dips', 'price': '₹799'},
      {'name': 'Den\'s Party Meal', 'desc': '2 Gyros, 6 Wings, 4 Leg & Thighs, 2 Fries, 3 Regular Drinks', 'price': '₹1049'},
      {'name': 'Super 5 Bucket', 'desc': '5 Leg & Thighs, 10 Wings, 10 Strips, 5 Regular Drinks', 'price': '₹1299'},
    ],
    'Protein Max': [
      {'name': 'Protein Max Gyro', 'desc': 'High Protein Gyro (Chicken or Paneer)', 'price': '₹299'},
      {'name': 'Protein Max Rice Bowl', 'desc': 'High Protein Rice Bowl (Chicken or Paneer)', 'price': '₹299'},
      {'name': 'Protein Max Salad', 'desc': 'High Protein Mediterranean Salad (Chicken or Paneer)', 'price': '₹299'},
    ],
    'Shakes': [
      {'name': 'Vanilla Shake (Regular)', 'desc': 'Ask for White Chocolate', 'price': '₹120'},
      {'name': 'Vanilla Shake (Large)', 'desc': 'Ask for White Chocolate', 'price': '₹199'},
      {'name': 'Strawberry Shake (Regular)', 'desc': 'Fresh Strawberry Shake Regular', 'price': '₹120'},
      {'name': 'Strawberry Shake (Large)', 'desc': 'Fresh Strawberry Shake Large', 'price': '₹199'},
      {'name': 'Biscoff Shake (Regular)', 'desc': 'Lotus Biscoff Shake Regular', 'price': '₹120'},
      {'name': 'Biscoff Shake (Large)', 'desc': 'Lotus Biscoff Shake Large', 'price': '₹199'},
      {'name': 'Chocolate Shake (Regular)', 'desc': 'Rich Chocolate Shake Regular', 'price': '₹120'},
      {'name': 'Chocolate Shake (Large)', 'desc': 'Rich Chocolate Shake Large', 'price': '₹199'},
      {'name': 'Kunafa Pistachio Shake (Regular)', 'desc': 'Signature Kunafa Pistachio Shake', 'price': '₹120'},
      {'name': 'Kunafa Pistachio Shake (Large)', 'desc': 'Signature Kunafa Pistachio Shake', 'price': '₹199'},
    ],
    'Desserts': [
      {'name': 'Chocolate Brownie', 'desc': 'Fudgy Chocolate Brownie', 'price': '₹99'},
      {'name': 'Blondie Cake (Signature)', 'desc': 'Signature White Chocolate Blondie Cake', 'price': '₹99'},
      {'name': 'Vanilla Softy', 'desc': 'Creamy Vanilla Soft Serve Cone', 'price': '₹39'},
      {'name': 'Choice of Dip', 'desc': 'Choice of Dip', 'price': '₹15'},
    ],
    'Kombucha': [
      {'name': 'Mint Kombucha', 'desc': 'Refreshing Brewed Mint Kombucha', 'price': '₹120'},
      {'name': 'Hibiscus Kombucha', 'desc': 'Refreshing Brewed Hibiscus Kombucha', 'price': '₹120'},
      {'name': 'Classic Kombucha', 'desc': 'Refreshing Brewed Classic Kombucha', 'price': '₹120'},
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
            'price': '₹${item['price'] ?? item['rate'] ?? 0}',
            'image': item['image'] ?? item['imageUrl'] ?? '',
            'rate': item['price'] ?? item['rate'] ?? 0,
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

  int get _totalCartCount {
    return ApiService().cart.fold(0, (sum, item) => sum + (int.tryParse(item['qty'].toString()) ?? 1));
  }

  void _onAddItemPressed(Map<String, dynamic> item) {
    if (isItemCustomizable(item)) {
      showGyroCustomizerModal(
        context: context,
        item: item,
        onAdd: (customizedItem) {
          setState(() {
            ApiService().cart.add(customizedItem);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${customizedItem['name']} customized & added to cart!'),
              backgroundColor: Colors.green,
            ),
          );
        },
      );
    } else {
      _addItemToCart(item);
    }
  }

  void _addItemToCart(Map<String, dynamic> item) {
    setState(() {
      final cart = ApiService().cart;
      final idx = cart.indexWhere((c) => c['name'] == item['name']);
      final num priceVal = item['rate'] ?? int.tryParse(item['price'].toString().replaceAll(RegExp(r'\D'), '')) ?? 99;
      if (idx >= 0) {
        cart[idx]['qty'] = (int.tryParse(cart[idx]['qty'].toString()) ?? 1) + 1;
      } else {
        cart.add({
          'name': item['name'],
          'price': priceVal,
          'qty': 1,
          'icon': Icons.restaurant,
        });
      }
    });
  }

  void _removeItemFromCart(Map<String, dynamic> item) {
    setState(() {
      final cart = ApiService().cart;
      final idx = cart.indexWhere((c) => c['name'] == item['name']);
      if (idx >= 0) {
        final currentQty = int.tryParse(cart[idx]['qty'].toString()) ?? 1;
        if (currentQty > 1) {
          cart[idx]['qty'] = currentQty - 1;
        } else {
          cart.removeAt(idx);
        }
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
                ).then((_) {
                  if (mounted) setState(() {});
                }),
              ),
              if (_totalCartCount > 0)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: TDGColors.red,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Center(
                      child: Text(
                        '$_totalCartCount',
                        style: TextStyle(color: TDGColors.white, fontSize: 9, fontWeight: FontWeight.w700),
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

  String _getAssetImagePath(String itemName, String category) {
    final name = itemName.toLowerCase();
    final cat = category.toLowerCase();

    if (name.contains('leg') || cat.contains('leg')) return 'assets/images/menu/Leg& Thigh.png';
    if (name.contains('wing') || cat.contains('wing')) return 'assets/images/menu/wings.png';
    if (name.contains('strip') || cat.contains('strip')) return 'assets/images/menu/strips.png';
    if (name.contains('loaded fries')) return 'assets/images/menu/loaded fries.png';
    if (name.contains('fries') || cat.contains('fries')) return 'assets/images/menu/fries.png';
    if (name.contains('salad') || cat.contains('salad')) return 'assets/images/menu/signature salad.png';
    if (name.contains('rice') || cat.contains('rice')) return 'assets/images/menu/lebanese rice bowl.png';
    if (name.contains('express meal')) return 'assets/images/menu/express meal.png';
    if (name.contains('classic gyro meal')) return 'assets/images/menu/classic gyro meal.png';
    if (name.contains('signature gyro meal')) return 'assets/images/menu/signature gyro meal.png';
    if (name.contains('lebanese rice box')) return 'assets/images/menu/lebanese rice box.png';
    if (name.contains('duo gyro feast')) return 'assets/images/menu/duo gyro feast.png';
    if (name.contains('double crunch box')) return 'assets/images/menu/double crunch box.png';
    if (name.contains('mega feast meal')) return 'assets/images/menu/mega feast meal.png';
    if (name.contains('den\'s party meal')) return 'assets/images/menu/den\'s party meal.png';
    if (name.contains('super 5 bucket')) return 'assets/images/menu/super 5 bucket.png';
    if (cat.contains('protein max')) return 'assets/images/menu/protein max.png';
    if (name.contains('vanilla shake')) return 'assets/images/menu/vanilla shake.png';
    if (name.contains('strawberry shake')) return 'assets/images/menu/strawberry shake.png';
    if (name.contains('biscoff shake')) return 'assets/images/menu/biscoff shake.png';
    if (name.contains('chocolate shake')) return 'assets/images/menu/chocolate shake.png';
    if (name.contains('kunafa pistachio shake')) return 'assets/images/menu/kunafa pistachio shake.png';
    if (name.contains('softy')) return 'assets/images/menu/vanilla softy.png';
    if (name.contains('hot chocolate')) return 'assets/images/menu/Hot Chocolate.png';
    if (name.contains('signature tea')) return 'assets/images/menu/Signature tea.png';
    if (name.contains('kombucha')) return 'assets/images/menu/kombucha.png';
    if (name.contains('brownie')) return 'assets/images/menu/chcolate brownie.png';
    if (name.contains('blondie')) return 'assets/images/menu/blondie cake.png';
    if (cat.contains('gyro') || name.contains('gyro')) return 'assets/images/menu/gyro.png';

    return 'assets/images/menu/logo.png';
  }

  Widget _buildMenuItem(Map<String, dynamic> item) {
    final String rawImage = item['image'] ?? item['imageUrl'] ?? '';
    String fullImageUrl = '';
    if (rawImage.isNotEmpty) {
      if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
        fullImageUrl = rawImage;
      } else {
        final base = ApiService().baseUrl;
        fullImageUrl = rawImage.startsWith('/') ? '$base$rawImage' : '$base/$rawImage';
      }
    }
    final String fallbackAsset = _getAssetImagePath(item['name'] ?? '', _selectedCategory);
    final bool hasServerImage = fullImageUrl.isNotEmpty;

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
          // Food image (Live POS image with asset fallback)
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: hasServerImage
                  ? Image.network(
                      fullImageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Image.asset(fallbackAsset, fit: BoxFit.cover),
                    )
                  : Image.asset(
                      fallbackAsset,
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
                    Builder(
                      builder: (context) {
                        final cart = ApiService().cart;
                        final idx = cart.indexWhere((c) => c['name'] == item['name']);
                        final int itemQty = idx >= 0 ? (int.tryParse(cart[idx]['qty'].toString()) ?? 0) : 0;

                        if (itemQty > 0) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                            decoration: BoxDecoration(
                              color: TDGColors.cardLight,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: TDGColors.gold.withOpacity(0.6)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                GestureDetector(
                                  onTap: () => _removeItemFromCart(item),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                                    child: const Icon(Icons.remove, color: Colors.white, size: 14),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  child: Text(
                                    '$itemQty',
                                    style: TextStyle(color: TDGColors.gold, fontSize: 13, fontWeight: FontWeight.w800),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => _addItemToCart(item),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                                    child: const Icon(Icons.add, color: Colors.white, size: 14),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }

                        return GestureDetector(
                          onTap: () => _onAddItemPressed(item),
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
                        );
                      },
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
