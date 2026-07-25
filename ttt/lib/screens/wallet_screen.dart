import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';
import 'asset_screen.dart';
import 'package:share_plus/share_plus.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  bool _isLoading = false;
  int _points = 0;
  int _cashbackEarned = 0;
  int _availablePoints = 0;
  String _userName = '';
  List<dynamic> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchWalletData();
  }

  Future<void> _fetchWalletData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        ApiService().getWallet().catchError((e) {
          debugPrint("getWallet error: $e");
          return <String, dynamic>{};
        }),
        ApiService().getProfile().catchError((e) {
          debugPrint("getProfile error: $e");
          return <String, dynamic>{};
        }),
      ]);
      final wallet = results[0];
      final profile = results[1];
      final user = ApiService().currentUser ?? {};

      final rawPoints = wallet['points'] ?? user['points'] ?? profile['points'] ?? 0;
      final rawCashback = wallet['cashbackEarned'] ?? user['cashbackEarned'] ?? profile['cashbackEarned'] ?? 0;
      final rawAvailable = wallet['availablePoints'] ?? user['availablePoints'] ?? rawPoints;
      final rawTx = wallet['transactions'] ?? [];
      final rawName = profile['name'] ?? user['name'] ?? '';

      if (mounted) {
        setState(() {
          _points = (rawPoints is num) ? rawPoints.toInt() : (int.tryParse(rawPoints.toString()) ?? 0);
          _cashbackEarned = (rawCashback is num) ? rawCashback.toInt() : (int.tryParse(rawCashback.toString()) ?? 0);
          _availablePoints = (rawAvailable is num) ? rawAvailable.toInt() : (int.tryParse(rawAvailable.toString()) ?? 0);
          _transactions = rawTx;
          _userName = rawName;
        });
      }
    } catch (e) {
      debugPrint("Error fetching wallet data: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleRedeem() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Row(
          children: [
            Icon(Icons.redeem_rounded, color: TDGColors.gold),
            const SizedBox(width: 10),
            Text('REDEEM POINTS', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Text(
          'You can redeem your points as a direct discount during checkout when placing upcoming orders!\n\n1 Point = ₹1 Discount',
          style: TextStyle(color: Colors.white.withOpacity(0.7), height: 1.5, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
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
          'POINTS WALLET',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
      ),
      body: _isLoading && _transactions.isEmpty
          ? Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold)))
          : ResponsiveWrapper(
              maxWidth: 1000,
              child: RefreshIndicator(
                onRefresh: _fetchWalletData,
                color: TDGColors.gold,
                backgroundColor: TDGColors.cardDark,
                child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildWalletCard(),
                  const SizedBox(height: 16),
                  _buildActionButtons(),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent Transactions', style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                      if (_isLoading)
                        SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(TDGColors.gold))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_transactions.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(child: Text('No transactions yet.', style: TextStyle(color: TDGColors.grey, fontSize: 13))),
                    )
                  else
                    ..._transactions.map(_buildTransaction),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: OutlinedButton(
                      onPressed: _fetchWalletData,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: TDGColors.gold),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Refresh', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildWalletCard() {
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: TDGColors.gold.withOpacity(0.2), blurRadius: 24, offset: Offset(0, 10))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A1200), Color(0xFF2C1E00), Color(0xFF1A1200)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            Positioned(
              top: -40,
              right: -40,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [TDGColors.gold.withOpacity(0.12), Colors.transparent],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -30,
              left: -20,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [TDGColors.gold.withOpacity(0.08), Colors.transparent],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Image.asset('assets/images/logo.png', height: 32, errorBuilder: (_, __, ___) => Icon(Icons.restaurant, color: TDGColors.gold, size: 28)),
                          SizedBox(width: 10),
                          Text('TEN DEN GYROS', style: TextStyle(color: TDGColors.gold, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                        ],
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: TDGColors.gold.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
                        ),
                        child: Text('1 Pt = ₹1', style: TextStyle(color: TDGColors.gold, fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_userName.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(_userName.toUpperCase(), style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
                        ),
                      Text(
                        _points.toString(),
                        style: TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.w900, height: 1),
                      ),
                      Text('TOTAL POINTS', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Cashback Earned', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10)),
                          Text('₹$_cashbackEarned', style: TextStyle(color: TDGColors.gold, fontSize: 16, fontWeight: FontWeight.w800)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Available to Spend', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 10)),
                          Text('$_availablePoints pts', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Grid/Row actions identical to home screen
        Row(
          children: [
            Expanded(
              child: _walletActionItem(
                Icons.send_outlined, 
                'Distribute Points', 
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => AssetScreen(triggerDistribute: true)),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _walletActionItem(
                Icons.group_add_outlined, 
                'View Den Assets', 
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AssetScreen()),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        
        // Share Referral Invite block
        // Redesigned Premium Invite Card
        // Embedded Premium Referral Card Section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1D1B22), Color(0xFF0F0F12)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: TDGColors.gold.withOpacity(0.08),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              // Gold Inner Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1500), Color(0xFF120C00)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 1),
                  image: const DecorationImage(
                    image: AssetImage('assets/images/gold_card.png'),
                    fit: BoxFit.cover,
                    opacity: 0.12,
                  ),
                ),
                child: Column(
                  children: [
                    Image.asset(
                      'assets/images/logo_header.png',
                      height: 32,
                      errorBuilder: (_, __, ___) => Text(
                        'TEN DEN GYROS',
                        style: GoogleFonts.outfit(color: TDGColors.gold, fontWeight: FontWeight.w900, fontSize: 15),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'YOUR REFERRAL CODE',
                      style: GoogleFonts.outfit(
                        color: Colors.white60,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? 'TDG7890',
                      style: GoogleFonts.outfit(
                        color: TDGColors.gold,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        final code = ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? 'TDG7890';
                        Share.share(
                          'Join me at Ten Den Gyros! Use my referral code: $code to get 500 bonus points on signup! Download the app and start earning details: https://tendengyros.com',
                          subject: 'Ten Den Gyros Referral Invite',
                        );
                      },
                      icon: const Icon(Icons.share_rounded, size: 14, color: Colors.black),
                      label: Text(
                        'Share Code',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 12),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: TDGColors.gold,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'How it Works?',
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildReferStepItem(Icons.edit_note_rounded, 'Share', 'your code'),
                  _buildReferStepItem(Icons.shopping_bag_outlined, 'Friend Orders', 'using code'),
                  _buildReferStepItem(Icons.workspace_premium_rounded, 'You Earn', 'Rewards'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Rewards Section Card
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF16161D),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Rewards Earned',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              Text(
                '${_cashbackEarned > 0 ? '₹$_cashbackEarned' : '$_points Pts'}',
                style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 16, fontWeight: FontWeight.w900),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Point Sharing Rules & Conditions Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: TDGColors.cardDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: TDGColors.primaryRed.withOpacity(0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: TDGColors.primaryRed, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'POINT SHARING CONDITIONS',
                    style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.8),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _ruleBullet('You can share a maximum of 100 points to 1 den member/asset.'),
              _ruleBullet('You can avail points redemption only after adding a minimum of 5 assets to your den.'),
              _ruleBullet('Initial 500 sign-up points can be shared across up to 10 den assets.'),
              _ruleBullet('When all 10 assets finish a meal, another 500 bonus points will be credited back!'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _walletActionItem(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: TDGColors.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: TDGColors.border, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: TDGColors.gold, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _ruleBullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('• ', style: TextStyle(color: TDGColors.gold, fontSize: 14)),
          Expanded(
            child: Text(
              text,
              style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransaction(dynamic tx) {
    final isCredit = tx['type'] == 'credit';
    final amount = tx['amount'] ?? 0;
    final desc = tx['description'] ?? '';
    final date = tx['createdAt'] != null ? DateTime.tryParse(tx['createdAt']) : null;
    final dateStr = date != null ? '${date.day}/${date.month}/${date.year}' : '';

    return Container(
      margin: EdgeInsets.only(bottom: 10),
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isCredit ? Colors.green.withOpacity(0.15) : TDGColors.primaryRed.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
              color: isCredit ? Colors.green : TDGColors.primaryRed,
              size: 20,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(desc, style: TextStyle(color: TDGColors.white, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 2, overflow: TextOverflow.ellipsis),
                SizedBox(height: 4),
                Text(dateStr, style: TextStyle(color: TDGColors.grey, fontSize: 11)),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'}$amount pts',
            style: TextStyle(
              color: isCredit ? Colors.green : TDGColors.primaryRed,
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReferStepItem(IconData icon, String title, String subtitle) {
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E24),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Icon(icon, color: TDGColors.gold, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: GoogleFonts.outfit(color: Colors.grey, fontSize: 8),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
