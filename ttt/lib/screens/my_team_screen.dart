import 'package:flutter/material.dart';
import '../theme/colors.dart';

class MyTeamScreen extends StatefulWidget {
  const MyTeamScreen({super.key});

  @override
  State<MyTeamScreen> createState() => _MyTeamScreenState();
}

class _MyTeamScreenState extends State<MyTeamScreen> {
  bool _showMembers = true;

  final List<Map<String, dynamic>> _teamMembers = [
    {'name': 'Rohit Sharma', 'level': 'Gold Den', 'joined': '12 May', 'earned': '450'},
    {'name': 'Aman Verma', 'level': 'Silver Den', 'joined': '11 May', 'earned': '350'},
    {'name': 'Priya Mehta', 'level': 'Silver Den', 'joined': '10 May', 'earned': '300'},
    {'name': 'Sahil Khan', 'level': 'Bronze Den', 'joined': '9 May', 'earned': '250'},
  ];

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
          'MY TEAM',
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
      ),
      body: Column(
        children: [
          _buildStatsRow(),
          const SizedBox(height: 24),
          _buildTabs(),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _teamMembers.length,
              itemBuilder: (context, index) {
                return _buildMemberCard(_teamMembers[index]);
              },
            ),
          ),
          _buildViewAllButton(),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _statItem('23', 'Total Members'),
          _statItem('8', 'Active Members'),
          _statItem('5,250', 'Total Earned', isRuby: true),
        ],
      ),
    );
  }

  Widget _statItem(String value, String label, {bool isRuby = false}) {
    return Container(
      width: (MediaQuery.of(context).size.width - 48) / 3,
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: TDGColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                value,
                style: TextStyle(color: TDGColors.gold, fontSize: 20, fontWeight: FontWeight.w800),
              ),
              if (isRuby) ...[
                const SizedBox(width: 4),
                Icon(
                  Icons.diamond_rounded,
                  color: TDGColors.primaryRed,
                  size: 16,
                ),
              ],
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(color: TDGColors.grey, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 46,
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _showMembers = true),
              child: Container(
                decoration: BoxDecoration(
                  gradient: _showMembers ? TDGColors.goldGradient : null,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  'Members',
                  style: TextStyle(
                    color: _showMembers ? Colors.black : TDGColors.grey,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _showMembers = false),
              child: Container(
                decoration: BoxDecoration(
                  gradient: !_showMembers ? TDGColors.goldGradient : null,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  'Earnings',
                  style: TextStyle(
                    color: !_showMembers ? Colors.black : TDGColors.grey,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMemberCard(Map<String, dynamic> member) {
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
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: TDGColors.goldGradient,
              border: Border.all(color: TDGColors.gold.withOpacity(0.3)),
            ),
            child: const Icon(Icons.person, color: Colors.black),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member['name'],
                  style: TextStyle(color: TDGColors.white, fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  member['level'],
                  style: TextStyle(color: TDGColors.gold, fontSize: 11, fontWeight: FontWeight.w600),
                ),
                Text(
                  'Joined ${member['joined']}',
                  style: TextStyle(color: TDGColors.grey, fontSize: 10),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF152A15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '+${member['earned']} R',
              style: const TextStyle(color: Color(0xFF4CAF50), fontSize: 12, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewAllButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: TextButton(
          onPressed: () {},
          style: TextButton.styleFrom(
            backgroundColor: TDGColors.cardDark,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: TDGColors.border),
            ),
          ),
          child: Text(
            'View All Members',
            style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}
