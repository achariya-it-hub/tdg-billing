import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

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
  List<dynamic> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchWalletData();
  }

  Future<void> _fetchWalletData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final wallet = await ApiService().getWallet();
      if (mounted) {
        setState(() {
          _points = wallet['points'] ?? 0;
          _cashbackEarned = wallet['cashbackEarned'] ?? 0;
          _availablePoints = wallet['availablePoints'] ?? 0;
          _transactions = wallet['transactions'] ?? [];
        });
      }
    } catch (e) {
      debugPrint("Error fetching wallet data: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleAddPoints() async {
    final controller = TextEditingController(text: '500');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('ADD POINTS', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          style: TextStyle(color: TDGColors.white),
          decoration: InputDecoration(
            labelText: 'Amount',
            labelStyle: TextStyle(color: TDGColors.grey),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: TDGColors.border)),
            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: TDGColors.gold)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('CANCEL', style: TextStyle(color: TDGColors.grey))),
          TextButton(
            onPressed: () async {
              final amount = double.tryParse(controller.text) ?? 0;
              Navigator.pop(context);
              if (amount > 0) {
                if (mounted) setState(() => _isLoading = true);
                try {
                  await ApiService().addPoints(amount);
                  _fetchWalletData();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _isLoading = false);
                }
              }
            },
            child: Text('ADD', style: TextStyle(color: TDGColors.gold)),
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
          : RefreshIndicator(
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
    );
  }

  Widget _buildWalletCard() {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: TDGColors.gold.withOpacity(0.15), blurRadius: 20, offset: Offset(0, 8))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset('assets/images/gold_card.jpg', fit: BoxFit.cover),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.black.withOpacity(0.6), Colors.black.withOpacity(0.3)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Points', style: TextStyle(color: Colors.white70, fontSize: 12, letterSpacing: 1)),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('1 Point = ₹1', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  Text(
                    _points.toString(),
                    style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Cashback Earned', style: TextStyle(color: Colors.white60, fontSize: 10)),
                          Text('₹$_cashbackEarned', style: TextStyle(color: TDGColors.gold, fontSize: 16, fontWeight: FontWeight.w800)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Available to Spend', style: TextStyle(color: Colors.white60, fontSize: 10)),
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
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: _handleAddPoints,
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: TDGColors.cardDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: TDGColors.border),
              ),
              child: Column(
                children: [
                  Icon(Icons.add_circle_outline_rounded, color: TDGColors.gold, size: 28),
                  SizedBox(height: 8),
                  Text('Add Points', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                ],
              ),
            ),
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Redeem feature coming soon')),
              );
            },
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: TDGColors.cardDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: TDGColors.border),
              ),
              child: Column(
                children: [
                  Icon(Icons.redeem_rounded, color: TDGColors.gold, size: 28),
                  SizedBox(height: 8),
                  Text('Redeem', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                ],
              ),
            ),
          ),
        ),
      ],
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
