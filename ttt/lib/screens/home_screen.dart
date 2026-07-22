import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import 'wallet_screen.dart';
import 'asset_screen.dart';
import 'offers_screen.dart';
import 'notifications_screen.dart';
import 'cart_screen.dart';
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
        final nextPage = (_carouselIndex + 1) % 3;
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
                if (ApiService().cart.isNotEmpty) ...[
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
                              '${ApiService().cart.length}',
                              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
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
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFF2E0F05), Color(0xFF190600), Color(0xFF0F0F11)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: TDGColors.primaryRed.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
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
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: TDGColors.primaryRed.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: TDGColors.primaryRed.withOpacity(0.5)),
                  ),
                  child: Text(
                    'AUTHENTIC MEDITERRANEAN',
                    style: TextStyle(color: TDGColors.primaryRed, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
                const SizedBox(height: 8),
                ShaderMask(
                  shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                  child: const Text(
                    'THE DAILY GYRO',
                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Savor fresh Greek Gyros, Crispy Chicken & Handcrafted Shakes',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        setState(() => _selectedCategory = 'Gyros');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('ORDER NOW', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const OffersScreen()));
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: TDGColors.gold),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('OFFERS', style: TextStyle(color: TDGColors.gold, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 100,
            height: 110,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: TDGColors.gold.withOpacity(0.25), blurRadius: 15),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.asset('assets/images/hero_gyro.png', fit: BoxFit.cover),
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
                _walletAction(Icons.send_outlined, 'Distribute', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
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
    return StatefulBuilder(
      builder: (context, setSubState) {
        // Local selection variables
        final breads = ['Baked', 'Fried'];
        final spreads = ['Hummus', 'Cheese', 'Tzatziki', 'Ricota'];
        final sauces = ['Turkish Chill', 'Jalapeno Cheese', 'Garlic Mayo', 'Spicy Mayo', 'Peri Peri', 'Honey Mustard'];
        final veggies = ['Lettuce', 'Onion', 'Jalapeno', 'Olive', 'Capsicum', 'Tomato', 'Cucumber', 'Beans'];

        // Static tracking or shared in memory or local closure variables
        this.selectedProtein ??= 'Chicken';
        this.selectedBread ??= 'Baked';
        this.selectedSpread ??= 'Tzatziki';
        this.selectedSauces ??= ['Garlic Mayo'];
        this.selectedVeggies ??= ['Lettuce', 'Onion', 'Tomato'];

        final stepTitles = [
          'Start with your Protein',
          'Choose Your Bread',
          'Choose Your Spread',
          'Choose Your Sauces',
          'Choose Your Veggies'
        ];

        return Container(
          margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: TDGColors.cardDark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: TDGColors.gold.withOpacity(0.2), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: TDGColors.gold.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.tune, color: TDGColors.gold, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CREATE YOUR OWN GYROS',
                          style: GoogleFonts.outfit(
                            color: TDGColors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Stage ${this.activeBuilderStep + 1} of 5: ${stepTitles[this.activeBuilderStep]}',
                          style: GoogleFonts.outfit(
                            color: TDGColors.gold,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Step Progress Dots Indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final isActive = this.activeBuilderStep == index;
                  final isDone = this.activeBuilderStep > index;
                  return Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 4,
                      decoration: BoxDecoration(
                        color: isActive 
                            ? TDGColors.gold 
                            : isDone ? const Color(0xFF10B981) : TDGColors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 20),

              // Active Stage Content
              if (this.activeBuilderStep == 0) ...[
                // Stage 0: Protein options
                Row(
                  children: ['Chicken', 'Paneer'].map((p) {
                    final isSelected = this.selectedProtein == p;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: AnimatedScale(
                          scale: isSelected ? 1.05 : 1.0,
                          duration: const Duration(milliseconds: 150),
                          child: InkWell(
                            onTap: () {
                              setSubState(() {
                                this.selectedProtein = p;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 24),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFFE63946).withOpacity(0.15) : TDGColors.background,
                                border: Border.all(
                                  color: isSelected ? const Color(0xFFE63946) : TDGColors.white.withOpacity(0.1),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    p == 'Chicken' ? '🍗' : '🧀',
                                    style: const TextStyle(fontSize: 40),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    p == 'Chicken' ? 'Chicken' : 'Paneer (Veg)',
                                    style: GoogleFonts.outfit(
                                      color: TDGColors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ] else if (this.activeBuilderStep == 1) ...[
                // Stage 1: Bread options
                Row(
                  children: breads.map((b) {
                    final isSelected = this.selectedBread == b;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: AnimatedScale(
                          scale: isSelected ? 1.05 : 1.0,
                          duration: const Duration(milliseconds: 150),
                          child: InkWell(
                            onTap: () {
                              setSubState(() {
                                this.selectedBread = b;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 24),
                              decoration: BoxDecoration(
                                color: isSelected ? TDGColors.gold.withOpacity(0.15) : TDGColors.background,
                                border: Border.all(
                                  color: isSelected ? TDGColors.gold : TDGColors.white.withOpacity(0.1),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    b == 'Baked' ? '🍞' : '🍳',
                                    style: const TextStyle(fontSize: 40),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    '$b Bread',
                                    style: GoogleFonts.outfit(
                                      color: TDGColors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ] else if (this.activeBuilderStep == 2) ...[
                // Stage 2: Spreads (Visual Cards)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: spreads.map((s) {
                    final isSelected = this.selectedSpread == s;
                    // Get matching image
                    String imgAsset = 'assets/images/favicon.png';
                    if (s == 'Hummus') imgAsset = 'assets/images/hummus.png';
                    if (s == 'Cheese') imgAsset = 'assets/images/cheese.png';
                    if (s == 'Tzatziki') imgAsset = 'assets/images/tzatziki.png';
                    if (s == 'Ricota') imgAsset = 'assets/images/ricotta.png';

                    return AnimatedScale(
                      scale: isSelected ? 1.05 : 1.0,
                      duration: const Duration(milliseconds: 150),
                      child: InkWell(
                        onTap: () {
                          setSubState(() {
                            this.selectedSpread = s;
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected ? TDGColors.gold.withOpacity(0.12) : TDGColors.background,
                            border: Border.all(
                              color: isSelected ? TDGColors.gold : TDGColors.white.withOpacity(0.1),
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                  child: Image.asset(
                                    imgAsset,
                                    fit: BoxFit.cover,
                                    errorBuilder: (ctx, err, st) => Center(
                                      child: Text('🥣', style: const TextStyle(fontSize: 32)),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  s,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    color: TDGColors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ] else if (this.activeBuilderStep == 3) ...[
                // Stage 3: Sauces (Visual Cards Grid)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: sauces.map((s) {
                    final isSelected = this.selectedSauces!.contains(s);
                    // Use composite sauces image
                    final imgAsset = 'assets/images/sauces_composite.jpg';
                    Alignment alignment = Alignment.center;
                    if (s.toLowerCase().contains('turkish')) alignment = const Alignment(-1.0, -1.0);
                    if (s.toLowerCase().contains('cheese')) alignment = const Alignment(0.0, -1.0);
                    if (s.toLowerCase().contains('garlic')) alignment = const Alignment(1.0, -1.0);
                    if (s.toLowerCase().contains('spicy')) alignment = const Alignment(-1.0, 1.0);
                    if (s.toLowerCase().contains('peri')) alignment = const Alignment(0.0, 1.0);
                    if (s.toLowerCase().contains('honey')) alignment = const Alignment(1.0, 1.0);

                    return AnimatedScale(
                      scale: isSelected ? 1.05 : 1.0,
                      duration: const Duration(milliseconds: 150),
                      child: InkWell(
                        onTap: () {
                          setSubState(() {
                            if (isSelected) {
                              this.selectedSauces!.remove(s);
                            } else {
                              this.selectedSauces!.add(s);
                            }
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFFF4D5A).withOpacity(0.12) : TDGColors.background,
                            border: Border.all(
                              color: isSelected ? const Color(0xFFFF4D5A) : TDGColors.white.withOpacity(0.1),
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                  child: Image.asset(
                                    imgAsset,
                                    fit: BoxFit.cover,
                                    alignment: alignment,
                                    errorBuilder: (ctx, err, st) => Center(
                                      child: Text('🌶️', style: const TextStyle(fontSize: 32)),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  s,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    color: TDGColors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ] else if (this.activeBuilderStep == 4) ...[
                // Stage 4: Veggies (Visual Cards Grid)
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.1,
                  children: veggies.map((v) {
                    final isSelected = this.selectedVeggies!.contains(v);
                    // Use composite veggies image
                    final imgAsset = 'assets/images/veggies_composite.jpg';
                    Alignment alignment = Alignment.center;
                    if (v.toLowerCase().contains('lettuce')) alignment = const Alignment(-1.0, -1.0);
                    if (v.toLowerCase().contains('onion')) alignment = const Alignment(-0.33, -1.0);
                    if (v.toLowerCase().contains('jalapeno')) alignment = const Alignment(0.33, -1.0);
                    if (v.toLowerCase().contains('olive')) alignment = const Alignment(1.0, -1.0);
                    if (v.toLowerCase().contains('capsicum')) alignment = const Alignment(-1.0, 1.0);
                    if (v.toLowerCase().contains('tomato')) alignment = const Alignment(-0.33, 1.0);
                    if (v.toLowerCase().contains('cucumber')) alignment = const Alignment(0.33, 1.0);
                    if (v.toLowerCase().contains('bean')) alignment = const Alignment(1.0, 1.0);

                    return AnimatedScale(
                      scale: isSelected ? 1.05 : 1.0,
                      duration: const Duration(milliseconds: 150),
                      child: InkWell(
                        onTap: () {
                          setSubState(() {
                            if (isSelected) {
                              this.selectedVeggies!.remove(v);
                            } else {
                              this.selectedVeggies!.add(v);
                            }
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF10B981).withOpacity(0.12) : TDGColors.background,
                            border: Border.all(
                              color: isSelected ? const Color(0xFF10B981) : TDGColors.white.withOpacity(0.1),
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                  child: Image.asset(
                                    imgAsset,
                                    fit: BoxFit.cover,
                                    alignment: alignment,
                                    errorBuilder: (ctx, err, st) => Center(
                                      child: Text('🥗', style: const TextStyle(fontSize: 32)),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  v,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.outfit(
                                    color: TDGColors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
              const SizedBox(height: 24),

              // Next and Back Stage Stepper Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  ElevatedButton(
                    onPressed: this.activeBuilderStep == 0
                        ? null
                        : () {
                            setSubState(() {
                              this.activeBuilderStep--;
                            });
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: TDGColors.white,
                      side: BorderSide(color: TDGColors.white.withOpacity(0.1)),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Back'),
                  ),
                  if (this.activeBuilderStep < 4)
                    ElevatedButton(
                      onPressed: () {
                        setSubState(() {
                          this.activeBuilderStep++;
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE63946),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Next Stage →'),
                    )
                  else
                    const SizedBox(),
                ],
              ),
              const SizedBox(height: 24),

              // Summary Box & Add to Cart Action
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: TDGColors.white.withOpacity(0.05)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Custom Gyro Configuration Summary',
                      style: GoogleFonts.outfit(color: TDGColors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.2),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Protein: ${this.selectedProtein}\nBread: ${this.selectedBread}\nSpread: ${this.selectedSpread}\nSauces: ${this.selectedSauces!.isEmpty ? 'None' : this.selectedSauces!.join(', ')}\nVeggies: ${this.selectedVeggies!.isEmpty ? 'None' : this.selectedVeggies!.join(', ')}',
                      style: TextStyle(color: TDGColors.grey, fontSize: 11, height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          final cart = ApiService().cart;
                          final customItemName = 'Custom Gyro (${this.selectedProtein}, ${this.selectedBread})';
                          final existingIdx = cart.indexWhere((c) => c['name'] == customItemName);
                          if (existingIdx >= 0) {
                            cart[existingIdx]['qty'] = (cart[existingIdx]['qty'] ?? 1) + 1;
                          } else {
                            cart.add({
                              'name': customItemName,
                              'price': 199,
                              'qty': 1,
                              'icon': Icons.restaurant_menu,
                            });
                          }
                          // Reset builder back to stage 0 protein selection
                          this.activeBuilderStep = 0;
                          this.selectedProtein = 'Chicken';
                          this.selectedBread = 'Baked';
                          this.selectedSpread = 'Tzatziki';
                          this.selectedSauces = ['Garlic Mayo'];
                          this.selectedVeggies = ['Lettuce', 'Onion', 'Tomato'];
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Custom Gyro Wrap added to cart successfully!'), backgroundColor: Colors.green),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.check_circle_outline, size: 16),
                      label: Text(
                        'ADD TO CART & DONE (₹199)',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
