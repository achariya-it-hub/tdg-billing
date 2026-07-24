import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import '../utils/responsive.dart';

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
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _walletActionItem(
              Icons.add_circle_outline, 
              'Add Points', 
              _handleRedeem
            ),
            _walletActionItem(
              Icons.send_outlined, 
              'Distribute', 
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AssetScreen(triggerDistribute: true)),
              ),
            ),
            _walletActionItem(
              Icons.group_add_outlined, 
              'Assets', 
              () => Navigator.pushNamed(context, '/assets')
            ),
          ],
        ),
        const SizedBox(height: 20),
        
        // Share Referral Invite block
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: TDGColors.cardDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: TDGColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'INVITE FRIENDS & SHARE REFERRAL CODE',
                style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
              ),
              const SizedBox(height: 6),
              Text(
                'Share your referral details below to build your Den! Add up to 10 assets to start distributing points.',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.black38,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: TDGColors.border),
                      ),
                      child: Text(
                        ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? 'No referral details',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () {
                      final inviteInfo = ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? '';
                      if (inviteInfo.isNotEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Referral code copied: $inviteInfo. Send via text, WhatsApp, or mail!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TDGColors.gold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Share', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
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
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: TDGColors.cardDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: TDGColors.border),
            ),
            child: Icon(icon, color: TDGColors.gold, size: 22),
          ),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(color: TDGColors.greyLight, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
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
}
