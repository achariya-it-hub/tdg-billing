import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import 'wallet_screen.dart';
import 'asset_screen.dart';
import 'offers_screen.dart';
import 'notifications_screen.dart';
import 'cart_screen.dart';
import 'customizer_screen.dart';
import '../widgets/tdg_logo.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedCategory = 'All';
  List<String> _categories = ['All', 'Gyros', 'Burgers', 'Sides', 'Shakes', 'Crispy Chicken'];
  List<Map<String, dynamic>> _allMenuItems = [];
  List<Map<String, dynamic>> _popularItems = [];
  bool _isLoading = false;

  PageController _carouselController = PageController();
  int _carouselIndex = 0;
  Timer? _timer;

  // Custom Gyro selection properties
  int activeBuilderStep = 0;
  String? selectedProtein;
  String? selectedBread;
  String? selectedSpread;
  List<String>? selectedSauces;
  List<String>? selectedVeggies;

  @override
  void initState() {
    super.initState();
    _fetchHomeData();
    _carouselController = PageController(initialPage: 0);
    _startCarouselTimer();
  }

  void _startCarouselTimer() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (mounted && _carouselController.hasClients) {
        final nextPage = (_carouselIndex + 1) % 4;
        _carouselController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _carouselController.dispose();
    super.dispose();
  }

  Future<void> _fetchHomeData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      await ApiService().getProfile();
      await ApiService().getWallet();
      if (mounted) setState(() {});
      
      final menuData = await ApiService().getMenu();
      final List<dynamic> items = menuData['items'] ?? [];
      final List<String> fetchedCats = List<String>.from(menuData['categories'] ?? []);
      
      final List<Map<String, dynamic>> mappedItems = items.map((item) {
        final String cat = item['category'] ?? 'Other';
        final String name = item['name'] ?? '';
        return {
          'id': item['id'],
          'name': name,
          'price': item['price'],
          'formattedPrice': '₹${item['price']}',
          'category': cat,
          'desc': item['desc'] ?? '',
          'image': item['image'] ?? _getImageForCategory(cat, name),
        };
      }).toList();

      // Popular items: ONLY Gyros menu items
      final gyrosItems = mappedItems.where((item) {
        final cat = item['category'].toString().toLowerCase();
        final name = item['name'].toString().toLowerCase();
        return cat.contains('gyro') || name.contains('gyro');
      }).toList();

      if (mounted) {
        setState(() {
          _allMenuItems = mappedItems;
          final Set<String> catSet = {'All', 'Gyros'};
          for (final c in fetchedCats) catSet.add(c);
          _categories = catSet.toList();
          _popularItems = gyrosItems.isNotEmpty ? gyrosItems : mappedItems;
        });
      }
    } catch (e) {
      debugPrint("Error fetching home data: $e");
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _getImageForCategory(String category, String name) {
    final lowerCat = category.toLowerCase();
    final lowerName = name.toLowerCase();
    if (lowerCat.contains('fries') || lowerName.contains('fries')) return 'assets/images/fries.png';
    if (lowerCat.contains('drink') || lowerCat.contains('shake') || lowerName.contains('tea') || lowerName.contains('coke')) return 'assets/images/drink.png';
    return 'assets/images/gyro.png';
  }

  List<Map<String, dynamic>> get _filteredMenuItems {
    if (_selectedCategory == 'All') return _allMenuItems;
    return _allMenuItems.where((item) {
      final cat = item['category'].toString().toLowerCase();
      final sel = _selectedCategory.toLowerCase();
      if (sel == 'gyros') return cat.contains('gyro') || item['name'].toString().toLowerCase().contains('gyro');
      if (sel == 'burgers') return cat.contains('burger') || item['name'].toString().toLowerCase().contains('burger');
      if (sel == 'sides' || sel == 'fries') return cat.contains('side') || cat.contains('fries') || item['name'].toString().toLowerCase().contains('fries');
      if (sel == 'shakes') return cat.contains('shake') || cat.contains('softy') || cat.contains('drink') || item['name'].toString().toLowerCase().contains('shake');
      if (sel.contains('crispy') || sel.contains('chicken')) return cat.contains('crispy') || cat.contains('chicken');
      return cat == sel;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isWide = !Responsive.isMobile(context);

    return Scaffold(
      backgroundColor: TDGColors.background,
      body: SafeArea(
        child: ResponsiveWrapper(
          maxWidth: 1200,
          child: RefreshIndicator(
            onRefresh: _fetchHomeData,
            color: TDGColors.gold,
            backgroundColor: TDGColors.cardDark,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildHeader()),
                SliverToBoxAdapter(child: _buildHeroSection()),
                if (isWide)
                  SliverToBoxAdapter(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _buildWalletCard()),
                        Expanded(child: _buildOfferOfTheDay()),
                      ],
                    ),
                  )
                else ...[
                  SliverToBoxAdapter(child: _buildWalletCard()),
                  SliverToBoxAdapter(child: _buildOfferOfTheDay()),
                ],
                SliverToBoxAdapter(child: _buildReferEarnBanner()),
                SliverToBoxAdapter(child: _buildPopularItems()),
                SliverToBoxAdapter(child: _buildChooseYourOwnGyroSection()),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final cart = ApiService().cart;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: const TDGLogo(width: 80),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Hello,',
                style: TextStyle(color: TDGColors.grey, fontSize: 10, fontWeight: FontWeight.w500),
              ),
              Text(
                (ApiService().currentUser?['name'] ?? 'USER').toUpperCase(),
                style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w800, letterSpacing: 1),
              ),
            ],
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const CartScreen(),
                      ),
                    );
                  },
                  child: Stack(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: TDGColors.cardDark,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: TDGColors.border),
                        ),
                        child: Icon(Icons.shopping_cart_outlined, color: TDGColors.gold, size: 18),
                      ),
                      if (cart.isNotEmpty)
                        Positioned(
                          top: 4,
                          right: 4,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: TDGColors.red,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '${cart.length}',
                              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const NotificationsScreen(),
                      ),
                    );
                  },
                  child: Stack(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: TDGColors.cardDark,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: TDGColors.border),
                        ),
                        child: Icon(Icons.notifications_outlined, color: TDGColors.white, size: 18),
                      ),
                      Positioned(
                        top: 6,
                        right: 6,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: TDGColors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () {},
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: TDGColors.goldGradient,
                      border: Border.all(color: TDGColors.gold, width: 2),
                    ),
                    child: const Icon(Icons.person, color: Colors.black, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    // Select image based on carousel loop index (loop of 4 items)
    String heroImage = 'assets/images/hero_gyro.png';
    if (_carouselIndex == 1) {
      heroImage = 'assets/images/gyro.png';
    } else if (_carouselIndex == 2) {
      heroImage = 'assets/images/Lebanese rice bowl.png';
    } else if (_carouselIndex == 3) {
      heroImage = 'assets/images/fries.png';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF1F1500), Color(0xFF100B00), Colors.black],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 2),
        boxShadow: [
          BoxShadow(
            color: TDGColors.gold.withOpacity(0.12),
            blurRadius: 30,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: TDGColors.gold.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: TDGColors.gold.withOpacity(0.4)),
                  ),
                  child: Text(
                    '🌯 MEDITERRANEAN PRIDE',
                    style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
                const SizedBox(height: 12),
                ShaderMask(
                  shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                  child: Text(
                    'THE DAILY GYRO',
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Indulge in fresh handcrafted Greek Gyros, premium golden fries, and thick delicious dessert shakes.',
                  style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13, height: 1.35),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        setState(() => _selectedCategory = 'All');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('ORDER NOW', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w900)),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const OffersScreen()));
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: TDGColors.gold, width: 1.5),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('OFFERS', style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 12, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Container(
            width: 110,
            height: 120,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: TDGColors.gold.withOpacity(0.3), blurRadius: 20),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 600),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(opacity: animation, child: child);
                },
                child: Image.asset(
                  heroImage,
                  key: ValueKey<String>(heroImage),
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferOfTheDay() {
    return GestureDetector(
      onTap: () => _showOfferItemsModal(context),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        height: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(
            colors: [Color(0xFF1A1200), Color(0xFF0D0900)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: TDGColors.gold.withOpacity(0.15),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            children: [
              Opacity(
                opacity: 0.25,
                child: Image.asset(
                  'assets/images/offer_banner.png',
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(color: const Color(0xFF1E1400)),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.black.withOpacity(0.85), Colors.black.withOpacity(0.2), Colors.transparent],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                ),
              ),
              Positioned(
                left: 16,
                top: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: TDGColors.embossedRedGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'LIMITED TIME OFFER',
                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
              ),
              Positioned(
                left: 20,
                bottom: 20,
                right: 20,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ShaderMask(
                            shaderCallback: (bounds) => TDGColors.goldGradient.createShader(bounds),
                            child: const Text(
                              'OFFER OF THE DAY',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'The Golden Gyro Feast (50% OFF)',
                            style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Tap to view all daily offer deals & combos',
                            style: TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _showOfferItemsModal(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('VIEW OFFERS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showOfferItemsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF121215),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final offerItems = [
          {
            'name': 'Golden Gyro Meal Feast',
            'desc': '1x Spicy Chicken Gyro + 1x Loaded Fries + Cold Drink',
            'origPrice': '₹398',
            'price': '₹199',
            'tag': '50% OFF',
            'image': 'assets/images/gyro.png'
          },
          {
            'name': 'Crispy Chicken & Dip Combo',
            'desc': '4 Pcs Crispy Chicken + 2 Garlic Dips + Fries',
            'origPrice': '₹450',
            'price': '₹299',
            'tag': 'SAVE ₹151',
            'image': 'assets/images/hero_gyro.png'
          },
          {
            'name': 'BOGO Thick Shake Delight',
            'desc': 'Buy 1 Kunafa Pistachio Shake & get Vanilla Shake Free',
            'origPrice': '₹298',
            'price': '₹149',
            'tag': 'BUY 1 GET 1',
            'image': 'assets/images/drink.png'
          },
        ];

        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey[700], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ShaderMask(
                    shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                    child: const Text('OFFERS OF THE DAY', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1)),
                  ),
                  IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              ...offerItems.map((item) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: TDGColors.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.asset(item['image']!, width: 70, height: 70, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: TDGColors.red, borderRadius: BorderRadius.circular(4)),
                                child: Text(item['tag']!, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(item['name']!, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                          Text(item['desc']!, style: TextStyle(color: TDGColors.greyLight, fontSize: 11)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text(item['price']!, style: TextStyle(color: TDGColors.gold, fontSize: 15, fontWeight: FontWeight.w900)),
                              const SizedBox(width: 6),
                              Text(item['origPrice']!, style: TextStyle(color: TDGColors.grey, fontSize: 12, decoration: TextDecoration.lineThrough)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${item['name']} added to order!'), backgroundColor: Colors.green),
                        );
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: TDGColors.gold, foregroundColor: Colors.black, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                      child: const Text('ADD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              )),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWalletCard() {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1C1C1C), Color(0xFF141414)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: TDGColors.border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'POINTS BALANCE',
                  style: TextStyle(
                    color: TDGColors.grey,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                  ),
                ),
                const Spacer(),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: TDGColors.embossedGoldGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.add, color: Colors.black, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  '${ApiService().currentUser?['points'] ?? 0}',
                  style: TextStyle(color: TDGColors.white, fontSize: 28, fontWeight: FontWeight.w800),
                ),
                const SizedBox(width: 6),
                Icon(Icons.diamond_rounded, color: TDGColors.primaryRed, size: 26),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _walletAction(Icons.add_circle_outline, 'Add Points', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
                _walletAction(Icons.send_outlined, 'Distribute', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AssetScreen(triggerDistribute: true)))),
                _walletAction(Icons.history_rounded, 'History', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
                _walletAction(Icons.group_add_outlined, 'Assets', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AssetScreen()))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _walletAction(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: TDGColors.cardDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: TDGColors.border),
            ),
            child: Icon(icon, color: TDGColors.gold, size: 20),
          ),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(color: TDGColors.greyLight, fontSize: 10, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildReferEarnBanner() {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AssetScreen())),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1A1400), Color(0xFF2A2000), Color(0xFF1A1400)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShaderMask(
                    shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                    child: Text(
                      'BUILD YOUR DEN',
                      style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('Add 10 assets. Earn 500 bonus.', style: TextStyle(color: TDGColors.greyLight, fontSize: 12)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(color: TDGColors.gold, borderRadius: BorderRadius.circular(8)),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Add Assets', style: TextStyle(color: Colors.black, fontSize: 13, fontWeight: FontWeight.w700)),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward, color: Colors.black, size: 14),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 90, height: 90,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset('assets/images/refer_earn.png', fit: BoxFit.cover),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPopularItems() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.local_fire_department_rounded, color: TDGColors.gold, size: 20),
                  const SizedBox(width: 6),
                  Text(
                    'POPULAR GYROS',
                    style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                  ),
                ],
              ),
              Text(
                '${_popularItems.length} Items',
                style: TextStyle(color: TDGColors.grey, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _popularItems.map((item) => _buildItemCard(item)).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderNowSection() {
    final List<Map<String, String>> carouselSlides = [
      {
        'title': 'Spicy Chicken Gyro Feast',
        'desc': 'Our legendary chicken gyro loaded with signature sauces & fries.',
        'image': 'assets/images/offer_banner.png'
      },
      {
        'title': 'Loaded Fries Supreme',
        'desc': 'Indulge in cheesy golden fries topped with fresh veggies & premium spices.',
        'image': 'assets/images/fries.png'
      },
      {
        'title': 'Classic Double Burger Combo',
        'desc': 'Enjoy the ultimate grilled juicy double decker burger with direct toppings.',
        'image': 'assets/images/hero_gyro.png'
      }
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_fire_department_rounded, color: TDGColors.gold, size: 20),
              const SizedBox(width: 6),
              Text(
                'TDG SPECIAL OFFERS',
                style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 180,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  PageView.builder(
                    controller: _carouselController,
                    onPageChanged: (idx) {
                      setState(() {
                        _carouselIndex = idx;
                      });
                    },
                    itemCount: carouselSlides.length,
                    itemBuilder: (context, index) {
                      final slide = carouselSlides[index];
                      return Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.asset(
                            slide['image']!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(color: Colors.black54),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.black.withOpacity(0.9), Colors.black.withOpacity(0.3), Colors.transparent],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                            ),
                          ),
                          Positioned(
                            left: 20,
                            top: 20,
                            right: 120,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: TDGColors.primaryRed,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'TODAY\'S FEATURED',
                                    style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  slide['title']!,
                                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  slide['desc']!,
                                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  Positioned(
                    bottom: 12,
                    left: 20,
                    child: Row(
                      children: List.generate(carouselSlides.length, (idx) {
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: _carouselIndex == idx ? 16 : 6,
                          height: 6,
                          margin: const EdgeInsets.only(right: 4),
                          decoration: BoxDecoration(
                            color: _carouselIndex == idx ? TDGColors.gold : Colors.white24,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      }),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemCard(Map<String, dynamic> item) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 100,
            width: double.infinity,
            decoration: const BoxDecoration(
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              child: Image.asset(
                item['image'],
                fit: BoxFit.cover,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: TextStyle(color: TDGColors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item['formattedPrice'] ?? '₹${item['price']}',
                      style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          final cart = ApiService().cart;
                          final existingIndex = cart.indexWhere((c) => c['name'] == item['name']);
                          if (existingIndex >= 0) {
                            cart[existingIndex]['qty'] = (cart[existingIndex]['qty'] ?? 1) + 1;
                          } else {
                            cart.add({
                              'name': item['name'],
                              'price': item['price'],
                              'qty': 1,
                              'icon': Icons.restaurant,
                            });
                          }
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${item['name']} added!'), backgroundColor: Colors.green),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      child: const Text('ADD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
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

  Widget _buildChooseYourOwnGyroSection() {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const CustomizerScreen()),
        );
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(
            colors: [Color(0xFF2E0F05), Color(0xFF190600)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: TDGColors.gold.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'INTERACTIVE BUILDER',
                      style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'CREATE YOUR OWN GYROS',
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Mix and match fresh chicken, flatbreads, house spreads, and custom veggies to craft the ultimate Mediterranean flavor wrap.',
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 11, height: 1.3),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text(
                        'START CUSTOMIZING NOW',
                        style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.arrow_forward_rounded, color: TDGColors.gold, size: 14),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(12),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(
                  'assets/images/gyro.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Icon(Icons.tune, color: Colors.white24, size: 36),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
