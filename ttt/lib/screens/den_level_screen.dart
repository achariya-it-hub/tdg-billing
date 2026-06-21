import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import 'referral_screen.dart';

class DenLevelScreen extends StatefulWidget {
  const DenLevelScreen({super.key});

  @override
  State<DenLevelScreen> createState() => _DenLevelScreenState();
}

class _DenLevelScreenState extends State<DenLevelScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _denProgress;

  final List<Map<String, dynamic>> _mockDenMembers = [
    {'name': 'Rohit Sharma', 'role': 'Den Leader', 'joined': '10 May', 'earned': 1200, 'avatarColor': Colors.amber, 'status': 'Online'},
    {'name': 'Bala Subramanian', 'role': 'Co-Leader', 'joined': '11 May', 'earned': 950, 'avatarColor': Colors.orange, 'status': 'Online'},
    {'name': 'Priya Mehta', 'role': 'Elite Champion', 'joined': '12 May', 'earned': 800, 'avatarColor': Colors.purple, 'status': 'Active'},
    {'name': 'Aman Verma', 'role': 'Active Member', 'joined': '13 May', 'earned': 550, 'avatarColor': Colors.blue, 'status': 'Active'},
    {'name': 'Sahil Khan', 'role': 'Active Member', 'joined': '14 May', 'earned': 450, 'avatarColor': Colors.teal, 'status': 'Offline'},
    {'name': 'Neha Gupta', 'role': 'New Recruit', 'joined': '15 May', 'earned': 200, 'avatarColor': Colors.pink, 'status': 'Online'},
  ];

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

  @override
  Widget build(BuildContext context) {
    final currentLevel = _denProgress?['denLevel'] ?? _denProgress?['currentLevel'] ?? 'Gold';

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
      ),
      body: _isLoading && _denProgress == null
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(TDGColors.gold),
              ),
            )
          : RefreshIndicator(
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
                  _buildBenefitsCard(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Widget _buildLevelCard(BuildContext context, String currentLevel) {
    final levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    final currentUpper = currentLevel.toUpperCase();
    int currentIndex = levels.indexOf(currentUpper);
    if (currentIndex == -1) {
      currentIndex = 2; // Default to Gold
    }
    
    final hasNextLevel = currentIndex < levels.length - 1;
    final nextLevelName = hasNextLevel ? levels[currentIndex + 1] : '';

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
                            'Loyalty. Rewards. Prestige.',
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
            onTap: () {},
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
                  Text(
                    hasNextLevel ? 'NEXT LEVEL: $nextLevelName' : 'MAX LEVEL REACHED',
                    style: GoogleFonts.outfit(
                      color: Colors.black,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  if (hasNextLevel)
                    const Icon(
                      Icons.chevron_right,
                      color: Colors.black,
                      size: 20,
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
      currentIndex = 2; // Default to Gold
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
    final completedDens = _denProgress?['completedDens'] ?? 4;
    final members = _denProgress?['membersInCurrentDen'] ?? _denProgress?['denProgress'] ?? 6;
    final requiredMembers = _denProgress?['requiredMembersPerDen'] ?? 10;
    final double progressPercent = requiredMembers > 0 ? (members / requiredMembers) : 0.0;
    final int degreesCompleted = (progressPercent * 5).toInt();

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
                      'THE PRIDE LION',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Complete 10 Dens to become a Pride Lion.',
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
          const SizedBox(height: 20),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(10, (index) {
                final isCompleted = index < completedDens;
                return GestureDetector(
                  onTap: () => _showDenMembersBottomSheet(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFF1E1600) : const Color(0xFF151515),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isCompleted ? const Color(0xFFFFCC00) : const Color(0xFF252525),
                        width: 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: isCompleted
                        ? Image.asset(
                            'assets/images/den_lion.png',
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
              '$completedDens / 10 Dens Completed',
              style: GoogleFonts.outfit(
                color: const Color(0xFFFFCC00),
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const Divider(color: Color(0xFF222222), height: 28),
          Text(
            'Get 45 Degrees ( $degreesCompleted / 5 Completed )',
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
            title: 'Higher Referral Bonus',
            subtitle: 'Earn more with every successful referral.',
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
    final currentLevel = _denProgress?['denLevel'] ?? _denProgress?['currentLevel'] ?? 'Gold';
    final members = _denProgress?['membersInCurrentDen'] ?? _denProgress?['denProgress'] ?? 6;
    final requiredMembers = _denProgress?['requiredMembersPerDen'] ?? 10;

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
              // Pull handle
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: TDGColors.gold.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShaderMask(
                        shaderCallback: (bounds) => TDGColors.goldGradient.createShader(bounds),
                        child: Text(
                          '${currentLevel.toUpperCase()} DEN MEMBERS',
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
                        '$members / $requiredMembers Active Members in Current Den',
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
              const SizedBox(height: 8),
              
              // Members list
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.5,
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _mockDenMembers.length,
                  itemBuilder: (context, index) {
                    final member = _mockDenMembers[index];
                    final isOnline = member['status'] == 'Online';
                    
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
                          // Avatar stack with online indicator
                          Stack(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: TDGColors.goldGradient,
                                ),
                                padding: const EdgeInsets.all(2),
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: TDGColors.cardLight,
                                  ),
                                  child: Center(
                                    child: Text(
                                      member['name'].substring(0, 1),
                                      style: GoogleFonts.outfit(
                                        color: TDGColors.gold,
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
                                    color: isOnline ? const Color(0xFF4CAF50) : const Color(0xFF9E9E9E),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: TDGColors.cardDark, width: 2),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 14),
                          
                          // Member Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  member['name'],
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
                                        color: TDGColors.gold.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 0.5),
                                      ),
                                      child: Text(
                                        member['role'],
                                        style: GoogleFonts.inter(
                                          color: TDGColors.gold, 
                                          fontSize: 9, 
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Joined ${member['joined']}',
                                      style: GoogleFonts.inter(
                                        color: TDGColors.grey, 
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          
                          // Earnings
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '+${member['earned']} R',
                                style: GoogleFonts.outfit(
                                  color: const Color(0xFF4CAF50), 
                                  fontSize: 13, 
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(
                                'Contributed',
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
              
              // Invite Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ReferralScreen()),
                    );
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
                    'Invite Friends to Den',
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
