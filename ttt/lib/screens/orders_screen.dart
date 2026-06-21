import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String _filter = 'All';
  List<dynamic> _orders = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final orders = await ApiService().getOrders();
      if (mounted) {
        setState(() {
          _orders = orders;
        });
      }
    } catch (e) {
      debugPrint("Error fetching orders: $e");
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<dynamic> get _filteredOrders {
    if (_filter == 'All') return _orders;
    if (_filter == 'Completed') {
      return _orders.where((o) => o['status'] == 'Delivered' || o['status'] == 'Preparing' || o['status'] == 'Pending').toList();
    }
    return _orders.where((o) => o['status'] == 'Cancelled').toList();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Preparing':
      case 'Pending':
        return TDGColors.gold;
      case 'Delivered':
        return TDGColors.green;
      case 'Cancelled':
        return TDGColors.red;
      default:
        return TDGColors.grey;
    }
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
          'ORDER HISTORY',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
      ),
      body: Column(
        children: [
          // Filter tabs
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: ['All', 'Completed', 'Cancelled'].map((f) {
                final isSelected = _filter == f;
                return GestureDetector(
                  onTap: () => setState(() => _filter = f),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? TDGColors.gold : TDGColors.cardDark,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isSelected ? TDGColors.gold : TDGColors.border),
                    ),
                    child: Text(
                      f,
                      style: TextStyle(
                        color: isSelected ? Colors.black : TDGColors.greyLight,
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: _isLoading && _orders.isEmpty
                ? Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: TDGColors.gold,
                    backgroundColor: TDGColors.cardDark,
                    child: _filteredOrders.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 60),
                                child: Center(
                                  child: Text(
                                    'No orders found.',
                                    style: TextStyle(color: TDGColors.grey, fontSize: 14),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _filteredOrders.length,
                            itemBuilder: (context, i) => _buildOrderCard(_filteredOrders[i]),
                          ),
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton(
                onPressed: _fetchOrders,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: TDGColors.gold),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Refresh Orders', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    final List<dynamic> itemsList = order['items'] ?? [];
    final itemsCount = itemsList.fold<int>(0, (sum, it) => sum + (int.tryParse(it['quantity'].toString()) ?? 1));

    String timeText = 'Just now';
    try {
      final parsedDate = DateTime.parse(order['createdAt']);
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final day = parsedDate.day;
      final month = months[parsedDate.month - 1];

      int hour = parsedDate.hour;
      final ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour == 0) hour = 12;

      final minute = parsedDate.minute.toString().padLeft(2, '0');
      timeText = '$day $month, $hour:$minute $ampm';
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order['id'] ?? '#ORD',
                  style: TextStyle(color: TDGColors.white, fontSize: 15, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 3),
                Text(
                  '$itemsCount Items',
                  style: TextStyle(color: TDGColors.grey, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  timeText,
                  style: TextStyle(color: TDGColors.grey, fontSize: 11),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${order['total']}',
                style: TextStyle(color: TDGColors.white, fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                order['status'] ?? 'Pending',
                style: TextStyle(
                  color: _statusColor(order['status'] ?? 'Pending'),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
