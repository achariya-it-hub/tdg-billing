import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import 'asset_screen.dart';
import '../utils/responsive.dart';

class DenLevelScreen extends StatefulWidget {
  const DenLevelScreen({super.key});

  @override
  State<DenLevelScreen> createState() => _DenLevelScreenState();
}

class _DenLevelScreenState extends State<DenLevelScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _denProgress;
  List<dynamic> _assets = [];
  String? _referredByName;

  @override
  void initState() {
    super.initState();
    _fetchDenProgress();
  }

  Future<void> _fetchDenProgress() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final progress = await ApiService().getDenProgress();
      if (mounted) {
        setState(() {
          _denProgress = progress;
          _assets = progress['assets'] ?? [];
          _referredByName = progress['referredByName'];
        });
      }
    } catch (e) {
      debugPrint("Error fetching den progress: $e");
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _getLevelFromCount(int count) {
    if (count >= 10) return 'DIAMOND';
    if (count >= 6) return 'PLATINUM';
    if (count >= 4) return 'GOLD';
    if (count >= 2) return 'SILVER';
    return 'BRONZE';
  }

  void _showAddAssetDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E22),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Row(
          children: [
            Icon(Icons.person_add_rounded, color: TDGColors.gold, size: 22),
            const SizedBox(width: 10),
            Text(
              'ADD ASSET TO DEN',
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Asset Name',
                labelStyle: TextStyle(color: TDGColors.grey),
                filled: true,
                fillColor: const Color(0xFF111113),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Phone Number',
                labelStyle: TextStyle(color: TDGColors.grey),
                filled: true,
                fillColor: const Color(0xFF111113),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '• Start at BRONZE (0-1 assets)\n• 2 assets ➔ SILVER\n• 4 assets ➔ GOLD\n• 6 assets ➔ PLATINUM\n• 10 assets ➔ DIAMOND 💎',
              style: GoogleFonts.inter(color: TDGColors.grey, fontSize: 11, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: TDGColors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) return;
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              Navigator.pop(ctx);
              try {
                await ApiService().addAsset(name, phone);
                _fetchDenProgress();
                if (mounted) {
                  _showVerifyOtpDialog(name, phone);
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: TDGColors.gold,
              foregroundColor: Colors.black,
            ),
            child: Text('Add Asset', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showVerifyOtpDialog(String name, String phone) {
    final otpCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E24),
        title: Text('Verify Asset OTP', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('An SMS OTP message has been sent to $name ($phone).', style: const TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 8),
            Text('Enter the 4-digit OTP received by $name to verify and activate:', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 12),
            TextField(
              controller: otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 6),
              decoration: const InputDecoration(hintText: '0000', hintStyle: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Later', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            onPressed: () async {
              final otp = otpCtrl.text.trim();
              if (otp.length != 4) return;
              Navigator.pop(ctx);
              try {
                await ApiService().verifyAssetOtp(phone, otp);
                _fetchDenProgress();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('$name is now activated!'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: TDGColors.gold, foregroundColor: Colors.black),
            child: Text('Verify OTP', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final count = _assets.length;
    final currentLevel = _getLevelFromCount(count);

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F11), // Deep charcoal background matching mockup
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F0F11),
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        centerTitle: true,
        title: Text(
          'DEN LEVEL',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.person_add_alt_1_rounded, color: TDGColors.gold),
            tooltip: 'Add Asset',
            onPressed: _showAddAssetDialog,
          ),
        ],
      ),

      body: _isLoading && _denProgress == null
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold),
              ),
            )
          : ResponsiveWrapper(
              maxWidth: 1100,
              child: RefreshIndicator(
                onRefresh: _fetchDenProgress,
                color: TDGColors.gold,
                backgroundColor: TDGColors.cardDark,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  children: [
                    _buildLevelCard(context, currentLevel),
                  const SizedBox(height: 20),
                  _buildPrideProgressCard(context),
                  const SizedBox(height: 20),
                  if (_referredByName != null && _referredByName!.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: TDGColors.cardDark,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF4CAF50).withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.person_pin_rounded, color: Color(0xFF4CAF50), size: 22),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ADDED TO PROFILE BY',
                                style: GoogleFonts.outfit(
                                  color: TDGColors.grey,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _referredByName!,
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                  _buildBenefitsCard(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildLevelCard(BuildContext context, String currentLevel) {
    final levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    final count = _assets.length;
    final currentUpper = currentLevel.toUpperCase();
    int currentIndex = levels.indexOf(currentUpper);
    if (currentIndex == -1) {
      currentIndex = 0; // Default to Bronze
    }

    String nextLevelInfo = '';
    if (count < 2) {
      final needed = 2 - count;
      nextLevelInfo = 'NEXT LEVEL: SILVER (Add $needed more asset${needed > 1 ? "s" : ""})';
    } else if (count < 4) {
      final needed = 4 - count;
      nextLevelInfo = 'NEXT LEVEL: GOLD (Add $needed more asset${needed > 1 ? "s" : ""})';
    } else if (count < 6) {
      final needed = 6 - count;
      nextLevelInfo = 'NEXT LEVEL: PLATINUM (Add $needed more asset${needed > 1 ? "s" : ""})';
    } else if (count < 10) {
      final needed = 10 - count;
      nextLevelInfo = 'NEXT LEVEL: DIAMOND (Add $needed more asset${needed > 1 ? "s" : ""})';
    } else {
      nextLevelInfo = 'MAX LEVEL REACHED! (10/10 Assets Added 💎)';
    }

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1A1E), Color(0xFF0F0F12)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFFCC00).withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFFCC00).withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: () => _showDenMembersBottomSheet(context),
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFFFCC00), width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFFFCC00).withOpacity(0.4),
                              blurRadius: 12,
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(45),
                          child: Image.asset(
                            'assets/images/den_lion.png',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Align(
                            alignment: Alignment.topRight,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFFFCC00).withOpacity(0.4), width: 1),
                                color: Colors.black.withOpacity(0.4),
                              ),
                              child: Text(
                                'CURRENT LEVEL',
                                style: GoogleFonts.inter(
                                  color: const Color(0xFFFFCC00),
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          ShaderMask(
                            shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                            child: Text(
                              '${currentLevel.toUpperCase()} DEN',
                              style: GoogleFonts.outfit(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Eat. Earn. Share.',
                            style: GoogleFonts.inter(
                              color: const Color(0xFFE5C158),
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: 100,
                            child: Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [Colors.transparent, const Color(0xFFFFCC00).withOpacity(0.3)],
                                      ),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                  child: Transform.rotate(
                                    angle: 0.785,
                                    child: Container(
                                      width: 5,
                                      height: 5,
                                      color: const Color(0xFFFFCC00),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [const Color(0xFFFFCC00).withOpacity(0.3), Colors.transparent],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildTimelineProgress(currentLevel),
              ],
            ),
          ),
          GestureDetector(
            onTap: _showAddAssetDialog,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFFFD966), Color(0xFFD4A800), Color(0xFFA37C00)],
                  stops: [0.0, 0.5, 1.0],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      nextLevelInfo,
                      style: GoogleFonts.outfit(
                        color: Colors.black,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  if (count < 10)
                    Row(
                      children: [
                        Text('ADD', style: GoogleFonts.outfit(color: Colors.black, fontSize: 11, fontWeight: FontWeight.w900)),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.add_circle_outline_rounded,
                          color: Colors.black,
                          size: 18,
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineProgress(String currentLevel) {
    final levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    final currentUpper = currentLevel.toUpperCase();
    int currentIndex = levels.indexOf(currentUpper);
    if (currentIndex == -1) {
      currentIndex = 0; // Default to Bronze
    }

    return Stack(
      alignment: Alignment.topCenter,
      children: [
        // Background grey line
        Padding(
          padding: const EdgeInsets.only(top: 8), // center of 16px node is at y=8
          child: Row(
            children: [
              const Spacer(flex: 1),
              Expanded(
                flex: 8,
                child: Container(
                  height: 3,
                  color: const Color(0xFF222222),
                ),
              ),
              const Spacer(flex: 1),
            ],
          ),
        ),
        // Foreground gold line
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Row(
            children: [
              const Spacer(flex: 1),
              Expanded(
                flex: 8,
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final double widthFraction = levels.length > 1 
                        ? currentIndex / (levels.length - 1) 
                        : 0.0;
                    return Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        width: constraints.maxWidth * widthFraction,
                        height: 3,
                        color: const Color(0xFFFFCC00),
                      ),
                    );
                  },
                ),
              ),
              const Spacer(flex: 1),
            ],
          ),
        ),
        // Circular nodes & labels row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(levels.length, (index) {
            final label = levels[index];
            final isReached = index <= currentIndex;
            final isCurrent = index == currentIndex;
            
            return Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isReached ? const Color(0xFFFFCC00) : const Color(0xFF1C1A17), // fill hides line behind it
                      border: Border.all(
                        color: isReached ? const Color(0xFFFFCC00) : const Color(0xFF444444),
                        width: isReached ? 0 : 2.5,
                      ),
                      boxShadow: isCurrent ? [
                        BoxShadow(
                          color: const Color(0xFFFFCC00).withOpacity(0.6),
                          blurRadius: 10,
                          spreadRadius: 2,
                        )
                      ] : null,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    label,
                    style: GoogleFonts.outfit(
                      color: isReached ? const Color(0xFFFFCC00) : const Color(0xFF666666),
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildPrideProgressCard(BuildContext context) {
    final totalAssets = _assets.length;
    final dinedAssets = _assets.where((a) => a['hasDined'] == true).length;
    final requiredAssets = 10;
    final double progressPercent = requiredAssets > 0 ? (totalAssets / requiredAssets) : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: TDGColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => _showDenMembersBottomSheet(context),
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFD4A800), width: 1.5),
                    color: const Color(0xFF1E1600),
                  ),
                  padding: const EdgeInsets.all(2),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      'assets/images/pride_lion.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'YOUR ASSETS ($totalAssets/10)',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Refer 10 friends to unlock Diamond Den.',
                      style: GoogleFonts.inter(
                        color: TDGColors.grey,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: _showAddAssetDialog,
                icon: const Icon(Icons.add, size: 14, color: Colors.black),
                label: Text('ADD', style: GoogleFonts.outfit(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w800)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: TDGColors.gold,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(10, (index) {
                final isAdded = index < totalAssets;
                final asset = isAdded ? _assets[index] : null;
                final hasDined = asset?['hasDined'] == true;
                return GestureDetector(
                  onTap: isAdded ? () => _showDenMembersBottomSheet(context) : null,
                  child: Container(
                    width: 32,
                    height: 32,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: isAdded ? const Color(0xFF1E1600) : const Color(0xFF151515),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: hasDined
                            ? const Color(0xFF4CAF50)
                            : isAdded
                                ? const Color(0xFFFFCC00)
                                : const Color(0xFF252525),
                        width: 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: isAdded
                        ? Center(
                            child: Text(
                              (asset?['name'] ?? '?')[0].toString().toUpperCase(),
                              style: GoogleFonts.outfit(
                                color: hasDined ? const Color(0xFF4CAF50) : TDGColors.gold,
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          )
                        : null,
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 14),
          Center(
            child: Text(
              '$totalAssets / 10 Assets Added',
              style: GoogleFonts.outfit(
                color: const Color(0xFFFFCC00),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const Divider(color: Color(0xFF222222), height: 28),
          Text(
            'Assets Dined: $dinedAssets / $totalAssets',
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progressPercent,
              backgroundColor: const Color(0xFF1D1D1D),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFFCC00)),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitsCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: TDGColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4.0, bottom: 16.0),
            child: Text(
              'BENEFITS',
              style: GoogleFonts.outfit(
                color: const Color(0xFFFFCC00),
                fontSize: 13,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          _buildBenefitItem(
            icon: Icons.trending_up_rounded,
            title: 'Higher Asset Bonus',
            subtitle: 'Earn more with every successful asset activation.',
            onTap: () {},
          ),
          const Divider(color: Color(0xFF222222), height: 1),
          _buildBenefitItem(
            icon: Icons.local_offer_rounded,
            title: 'Exclusive Offers',
            subtitle: 'Access limited-time offers and special deals.',
            onTap: () {},
          ),
          const Divider(color: Color(0xFF222222), height: 1),
          _buildBenefitItem(
            icon: Icons.card_giftcard_rounded,
            title: 'Priority Support',
            subtitle: 'Get faster assistance from our priority team.',
            onTap: () {},
          ),
          const Divider(color: Color(0xFF222222), height: 1),
          _buildBenefitItem(
            icon: Icons.stars_rounded,
            title: 'Early Access',
            subtitle: 'Be the first to explore new features and rewards.',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFFFFCC00), size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      color: TDGColors.grey,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: TDGColors.grey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _showDenMembersBottomSheet(BuildContext context) {
    final assetsCount = _assets.length;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF111113),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
            border: Border.all(color: TDGColors.border, width: 1),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 10,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: TDGColors.gold.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShaderMask(
                        shaderCallback: (bounds) => TDGColors.goldGradient.createShader(bounds),
                        child: Text(
                          'MY ASSETS',
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$assetsCount / 10 Assets Added',
                        style: GoogleFonts.inter(color: TDGColors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: TDGColors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(color: Color(0xFF2A2A2A), height: 24),
              if (_referredByName != null && _referredByName!.isNotEmpty) ...[
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      'You were added to profile by: $_referredByName',
                      style: GoogleFonts.inter(color: const Color(0xFF4CAF50), fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.5,
                ),
                child: _assets.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.symmetric(vertical: 32),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.person_add_outlined, color: TDGColors.grey, size: 40),
                              const SizedBox(height: 12),
                              Text(
                                'No assets yet.\nInvite friends to build your Den!',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(color: TDGColors.grey, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        itemCount: _assets.length,
                        itemBuilder: (context, index) {
                          final asset = _assets[index];
                          final String name = asset['name'] ?? 'Unknown';
                          final String phone = asset['phone'] ?? '';
                          final String status = asset['status'] ?? 'pending';
                          final bool hasDined = asset['hasDined'] == true;
                          final int pointsDistributed = asset['pointsDistributed'] ?? 0;
                          final bool isActive = status == 'active';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: TDGColors.cardDark,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: hasDined
                                    ? const Color(0xFF4CAF50).withOpacity(0.4)
                                    : TDGColors.border,
                              ),
                            ),
                            child: Row(
                              children: [
                                Stack(
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: hasDined
                                            ? const LinearGradient(colors: [Color(0xFF66BB6A), Color(0xFF43A047)])
                                            : TDGColors.goldGradient,
                                      ),
                                      padding: const EdgeInsets.all(2),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: TDGColors.cardLight,
                                        ),
                                        child: Center(
                                          child: Text(
                                            name.substring(0, 1).toUpperCase(),
                                            style: GoogleFonts.outfit(
                                              color: hasDined ? const Color(0xFF4CAF50) : TDGColors.gold,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Positioned(
                                      right: 0,
                                      bottom: 0,
                                      child: Container(
                                        width: 12,
                                        height: 12,
                                        decoration: BoxDecoration(
                                          color: isActive ? const Color(0xFF4CAF50) : const Color(0xFFFFB300),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: TDGColors.cardDark, width: 2),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: GoogleFonts.outfit(
                                          color: TDGColors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: hasDined
                                                  ? const Color(0xFF4CAF50).withOpacity(0.1)
                                                  : TDGColors.gold.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(4),
                                              border: Border.all(
                                                color: hasDined
                                                    ? const Color(0xFF4CAF50).withOpacity(0.3)
                                                    : TDGColors.gold.withOpacity(0.3),
                                                width: 0.5,
                                              ),
                                            ),
                                            child: Text(
                                              hasDined ? 'Dined' : status.toUpperCase(),
                                              style: GoogleFonts.inter(
                                                color: hasDined ? const Color(0xFF4CAF50) : TDGColors.gold,
                                                fontSize: 9,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                          if (phone.isNotEmpty) ...[
                                            const SizedBox(width: 8),
                                            Text(
                                              '$phone • Added by you',
                                              style: GoogleFonts.inter(
                                                color: TDGColors.grey,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const Spacer(),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '+$pointsDistributed pts',
                                      style: GoogleFonts.outfit(
                                        color: const Color(0xFF4CAF50),
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    Text(
                                      'Distributed',
                                      style: GoogleFonts.inter(
                                        color: TDGColors.grey,
                                        fontSize: 9,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _showAddAssetDialog();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: TDGColors.gold,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Add New Asset',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
