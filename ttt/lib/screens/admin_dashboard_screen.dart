import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  Map<String, dynamic>? _stats;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final orders = await ApiService().getOrders();
      int totalRevenue = 0;
      int pending = 0;
      int completed = 0;
      for (final o in orders) {
        final t = (o['total'] ?? 0).toInt();
        totalRevenue += t;
        final s = (o['status'] ?? '').toString().toLowerCase();
        if (s == 'pending' || s == 'placed' || s == 'preparing') pending++;
        if (s == 'completed' || s == 'delivered' || s == 'served') completed++;
      }
      if (mounted) setState(() => _stats = {
        'totalOrders': orders.length,
        'totalRevenue': totalRevenue,
        'pending': pending,
        'completed': completed,
      });
    } catch (e) {
      debugPrint("Error loading stats: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ApiService().currentUser;
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
        centerTitle: true,
        title: Text(
          'ADMIN DASHBOARD',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
        actions: [
          if (_isLoading)
            Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(TDGColors.gold))),
              ),
            )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        color: TDGColors.gold,
        backgroundColor: TDGColors.cardDark,
        child: ListView(
          physics: AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(16),
          children: [
            // Admin badge
            Center(
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  gradient: TDGColors.embossedRedGradient,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('ADMIN', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 2)),
              ),
            ),
            SizedBox(height: 8),
            Center(
              child: Text(user?['name'] ?? 'Admin', style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            ),
            SizedBox(height: 24),

            if (_stats == null)
              Center(
                child: Padding(
                  padding: EdgeInsets.only(top: 40),
                  child: Text('No data yet', style: TextStyle(color: TDGColors.grey, fontSize: 14)),
                ),
              )
            else ...[
              _buildStatCard('Total Orders', _stats!['totalOrders'].toString(), Icons.receipt_long_rounded, TDGColors.gold),
              SizedBox(height: 12),
              _buildStatCard('Total Revenue', '₹${_stats!['totalRevenue']}', Icons.currency_rupee_rounded, TDGColors.green),
              SizedBox(height: 12),
              _buildStatCard('Pending Orders', _stats!['pending'].toString(), Icons.hourglass_empty_rounded, Colors.orangeAccent),
              SizedBox(height: 12),
              _buildStatCard('Completed Orders', _stats!['completed'].toString(), Icons.check_circle_outline_rounded, TDGColors.green),
            ],
            SizedBox(height: 24),
            Text('QUICK ACTIONS', style: TextStyle(color: TDGColors.grey, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
            SizedBox(height: 10),
            _buildActionButton(context, Icons.refresh_rounded, 'Refresh Data', _fetchStats),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: TDGColors.grey, fontSize: 12, fontWeight: FontWeight.w500)),
              SizedBox(height: 4),
              Text(value, style: TextStyle(color: TDGColors.white, fontSize: 22, fontWeight: FontWeight.w800)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 8),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: TDGColors.cardDark,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: TDGColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: TDGColors.gold, size: 22),
            SizedBox(width: 14),
            Expanded(
              child: Text(label, style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w500)),
            ),
            Icon(Icons.chevron_right_rounded, color: TDGColors.grey, size: 20),
          ],
        ),
      ),
    );
  }
}
