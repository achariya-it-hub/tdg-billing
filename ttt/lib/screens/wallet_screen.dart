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
  double _rubyBalance = 0;
  List<dynamic> _scratchCards = [];
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
          _rubyBalance = double.tryParse(wallet['rubyBalance'].toString()) ?? 0;
          _scratchCards = wallet['scratchCards'] ?? [];
          _transactions = wallet['transactions'] ?? [];
        });
      }
    } catch (e) {
      debugPrint("Error fetching wallet data: $e");
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _handleAddRubies() async {
    final controller = TextEditingController(text: '500');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('ADD RUBIES', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          style: TextStyle(color: TDGColors.white),
          decoration: InputDecoration(
            labelText: 'Amount of Rubies',
            labelStyle: TextStyle(color: TDGColors.grey),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: TDGColors.border)),
            focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: TDGColors.gold)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('CANCEL', style: TextStyle(color: TDGColors.grey)),
          ),
          TextButton(
            onPressed: () async {
              final amount = double.tryParse(controller.text) ?? 0;
              Navigator.pop(context);
              if (amount > 0) {
                if (mounted) setState(() => _isLoading = true);
                try {
                  await ApiService().addRubies(amount);
                  _fetchWalletData();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error adding Rubies: $e')),
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

  void _handleScratchCard(Map<String, dynamic> card) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('SCRATCH CARD', textAlign: TextAlign.center, style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.card_giftcard, size: 64, color: TDGColors.gold),
            const SizedBox(height: 16),
            Text(
              card['title'] ?? 'Special Reward',
              style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Scratch this card to reveal your Rubies!',
              textAlign: TextAlign.center,
              style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
            ),
          ],
        ),
        actions: [
          Center(
            child: TextButton(
              onPressed: () async {
                Navigator.pop(context);
                if (mounted) setState(() => _isLoading = true);
                try {
                  await ApiService().scratchCard(card['id']);
                  _showRewardDialog(card['amount']);
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
              },
              child: Text('SCRATCH NOW', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  void _showRewardDialog(int amount) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('CONGRATULATIONS!', textAlign: TextAlign.center, style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.celebration_rounded, size: 64, color: TDGColors.gold),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '+$amount ',
                  style: TextStyle(color: TDGColors.white, fontSize: 28, fontWeight: FontWeight.w900),
                ),
                Icon(
                  Icons.diamond_rounded,
                  color: TDGColors.primaryRed,
                  size: 28,
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Credited directly to your Ruby Wallet.',
              textAlign: TextAlign.center,
              style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
            ),
          ],
        ),
        actions: [
          Center(
            child: TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('AWESOME', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
            ),
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
          'RUBY WALLET',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
      ),
      body: _isLoading && _transactions.isEmpty && _scratchCards.isEmpty
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold),
              ),
            )
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
                  _buildScratchCardsSection(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Transactions',
                        style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      if (_isLoading)
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(TDGColors.gold)),
                        )
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_transactions.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'No transactions yet.',
                          style: TextStyle(color: TDGColors.grey, fontSize: 13),
                        ),
                      ),
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
    final balanceText = _rubyBalance.toStringAsFixed(0);
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            Image.asset(
              'assets/images/gold_card.jpg',
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
            ),
            Positioned(
              right: 24,
              top: 90,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'TOTAL BALANCE',
                    style: TextStyle(
                      color: Colors.black.withOpacity(0.6),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        balanceText,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 40,
                          fontWeight: FontWeight.w900,
                          height: 1,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Icon(
                          Icons.diamond_rounded,
                          color: TDGColors.primaryRed,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Positioned(
              left: 24,
              bottom: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'CARD HOLDER',
                    style: TextStyle(color: Colors.black45, fontSize: 9, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    (ApiService().currentUser?['name'] ?? 'ROHIT SHARMA').toUpperCase(),
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
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
      children: [
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: _handleAddRubies,
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(
                    gradient: TDGColors.embossedGoldGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        offset: const Offset(0, 3),
                        blurRadius: 4,
                      ),
                      BoxShadow(
                        color: Colors.white.withOpacity(0.15),
                        offset: const Offset(0, -1),
                        blurRadius: 1,
                      ),
                    ],
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add, color: Colors.black, size: 18),
                      SizedBox(width: 6),
                      Text('Add Rubies', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w800)),
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
                    const SnackBar(content: Text('Transfer feature simulated.')),
                  );
                },
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(
                    color: TDGColors.cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: TDGColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.send_outlined, color: TDGColors.white, size: 18),
                      SizedBox(width: 6),
                      Text('Transfer', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 12),
        Text(
          '* Max 200 Rubies can be transferred at once.',
          style: TextStyle(color: TDGColors.grey, fontSize: 11, fontStyle: FontStyle.italic),
        ),
      ],
    );
  }

  Widget _buildScratchCardsSection() {
    final unclaimed = _scratchCards.where((c) => c['claimed'] == false).toList();
    if (unclaimed.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Scratch Cards',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 110,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: unclaimed.length,
            itemBuilder: (context, index) {
              final card = unclaimed[index];
              return GestureDetector(
                onTap: () => _handleScratchCard(card),
                child: Container(
                  width: 140,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF2A2000), Color(0xFF1E1600)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: TDGColors.gold.withOpacity(0.4)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.stars_rounded, color: TDGColors.gold, size: 28),
                      SizedBox(height: 8),
                      Text(
                        card['title'] ?? 'Reward',
                        style: TextStyle(color: TDGColors.white, fontSize: 12, fontWeight: FontWeight.w700),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Tap to Scratch',
                        style: TextStyle(color: TDGColors.gold, fontSize: 10, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(height: 20),
      ],
    );
  }

  Widget _buildTransaction(dynamic tx) {
    final isCredit = tx['type'] == 'credit';
    final amountText = '${isCredit ? "+" : "-"}₹${tx['amount']}';
    
    String dateText = 'Just now';
    try {
      final parsedDate = DateTime.parse(tx['createdAt']);
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final day = parsedDate.day;
      final month = months[parsedDate.month - 1];
      
      int hour = parsedDate.hour;
      final ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour == 0) hour = 12;
      
      final minute = parsedDate.minute.toString().padLeft(2, '0');
      dateText = '$day $month, $hour:$minute $ampm';
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isCredit
                  ? TDGColors.green.withOpacity(0.15)
                  : TDGColors.red.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCredit ? Icons.add_circle_outline : Icons.receipt_long,
              color: isCredit ? TDGColors.green : TDGColors.red,
              size: 18,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx['description'] ?? 'Transaction',
                  style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w600),
                ),
                SizedBox(height: 2),
                Text(
                  dateText,
                  style: TextStyle(color: TDGColors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
          Text(
            amountText,
            style: TextStyle(
              color: isCredit ? TDGColors.green : TDGColors.red,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
