import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';
import '../services/firebase_auth_service.dart';
import '../services/notification_service.dart';
import '../utils/responsive.dart';

class AssetScreen extends StatefulWidget {
  final bool triggerDistribute;
  const AssetScreen({super.key, this.triggerDistribute = false});

  @override
  State<AssetScreen> createState() => _AssetScreenState();
}

class _AssetScreenState extends State<AssetScreen> {
  bool _isLoading = false;
  int _points = 0;
  int _totalDistributed = 0;
  int _availablePoints = 0;
  int _assetsDinedCount = 0;
  bool _allAssetsActive = false;
  bool _bonusClaimed = false;
  List<dynamic> _assets = [];
  String? _referredByName;

  @override
  void initState() {
    super.initState();
    _fetchAssets();
    if (widget.triggerDistribute) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showDistributeOptionsModal();
      });
    }
  }

  Future<void> _fetchAssets() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService().getAssets();
      if (res != null) {
        setState(() {
          _points = res['userPoints'] ?? 0;
          _totalDistributed = res['totalDistributed'] ?? 0;
          _availablePoints = res['availablePoints'] ?? 0;
          _assetsDinedCount = res['assetsDinedCount'] ?? 0;
          _allAssetsActive = res['allAssetsActive'] ?? false;
          _bonusClaimed = res['bonusClaimed'] ?? false;
          _assets = res['assets'] ?? [];
          _referredByName = res['referredByName'];
        });
      }
    } catch (e) {
      print('Fetch assets error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showDistributeOptionsModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: TDGColors.cardMid,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Container(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('DISTRIBUTE REWARD POINTS', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold, fontSize: 16)),
            SizedBox(height: 8),
            Text('Select an asset to transfer points directly into their account.', style: TextStyle(color: TDGColors.greyLight, fontSize: 12)),
            SizedBox(height: 16),
            if (_assets.isEmpty)
              Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Center(child: Text('No assets added yet. Please add an asset first.', style: TextStyle(color: Colors.white70))),
              )
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _assets.length,
                  separatorBuilder: (_, __) => Divider(color: Colors.white10),
                  itemBuilder: (ctx, idx) {
                    final asset = _assets[idx];
                    final name = asset['name'] ?? 'Asset ${idx + 1}';
                    final phone = asset['phone'] ?? '';
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(name, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(phone, style: TextStyle(color: TDGColors.greyLight, fontSize: 12)),
                      trailing: Icon(Icons.send_rounded, color: TDGColors.gold, size: 18),
                      onTap: () {
                        Navigator.pop(ctx);
                        _showDistributeDialog(asset['id'], name);
                      },
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showAddAssetDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('ADD ASSET (WHATSAPP / SMS OTP)', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'Asset Friend Name',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'Phone Number',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'A 4-digit OTP code will be sent to this phone number.',
              style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              if (nameCtrl.text.isEmpty || phoneCtrl.text.isEmpty) return;
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              Navigator.pop(ctx);

              try {
                final res = await ApiService().sendAssetOtp(phone);
                if (mounted) {
                  final code = res['otp']?.toString();
                  NotificationService().addAssetRequestNotification(
                    assetName: name,
                    phone: phone,
                    status: 'pending',
                    otp: code,
                  );
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(code != null ? 'OTP Code for $phone: $code' : (res['message'] ?? 'OTP sent to $phone')),
                      backgroundColor: Colors.green.shade700,
                      duration: const Duration(seconds: 12),
                    ),
                  );
                  _showVerifyAssetOtpDialog(name, phone, defaultOtp: code);
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('Send OTP', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showVerifyAssetOtpDialog(String name, String phone, {String? defaultOtp}) {
    final otpCtrl = TextEditingController(text: defaultOtp ?? '');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('ENTER OTP', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              defaultOtp != null && defaultOtp.isNotEmpty
                  ? 'Verification Code for $phone: $defaultOtp'
                  : 'Enter the 4-digit OTP sent to $phone to verify and add $name.',
              style: TextStyle(
                color: defaultOtp != null && defaultOtp.isNotEmpty ? Colors.greenAccent : Colors.white70,
                fontSize: 13,
                fontWeight: defaultOtp != null && defaultOtp.isNotEmpty ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            SizedBox(height: 14),
            TextField(
              controller: otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: TextStyle(color: TDGColors.white, fontSize: 20, letterSpacing: 4, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                hintText: '• • • •',
                hintStyle: TextStyle(color: Colors.white30),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              final otp = otpCtrl.text.trim();
              if (otp.isEmpty) return;
              Navigator.pop(ctx);
              try {
                final result = await ApiService().verifyAssetOtp(phone, otp, name);
                _fetchAssets();
                NotificationService().addAssetRequestNotification(
                  assetName: name,
                  phone: phone,
                  status: 'active',
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? '$name verified & added successfully!'),
                      backgroundColor: Colors.green.shade700,
                    ),
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
            child: Text('Verify & Add', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
  void _showDistributeDialog(String assetId, String assetName) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('DISTRIBUTE POINTS', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Send points to $assetName', style: TextStyle(color: TDGColors.greyLight)),
            SizedBox(height: 12),
            TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'Points',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Available: $_availablePoints pts',
              style: TextStyle(color: TDGColors.gold, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              final amount = int.tryParse(ctrl.text) ?? 0;
              if (amount <= 0) return;
              Navigator.pop(ctx);
              try {
                await ApiService().distributePoints(assetId, amount);
                _fetchAssets();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('Send', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showReplaceDialog(String assetId, String currentName) {
    final nameCtrl = TextEditingController(text: currentName);
    final phoneCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.orange),
        ),
        title: Text('REPLACE ASSET', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Replace $currentName with a new person', style: TextStyle(color: TDGColors.greyLight)),
            SizedBox(height: 12),
            TextField(
              controller: nameCtrl,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'New Name',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            SizedBox(height: 10),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'New Phone',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              if (name.isEmpty || phone.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await ApiService().replaceAsset(assetId, name, phone);
                _fetchAssets();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('Replace', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _removeAsset(String assetId, String name) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: TDGColors.primaryRed)),
        title: Text('Remove $name?', style: TextStyle(color: TDGColors.white)),
        content: Text('Points will be refunded to your balance.', style: TextStyle(color: TDGColors.greyLight)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ApiService().removeAsset(assetId);
                _fetchAssets();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('Remove', style: TextStyle(color: TDGColors.primaryRed, fontWeight: FontWeight.bold)),
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
          'MY ASSETS',
          style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 1.5),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: TDGColors.gold))
          : ResponsiveWrapper(
              maxWidth: 1100,
              child: RefreshIndicator(
                onRefresh: _fetchAssets,
                child: ListView(
                padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).padding.bottom + 40),
                children: [
                  // Points Card
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3A2A00), Color(0xFF1A1200), Color(0xFF2A1800)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 1.2),
                      boxShadow: [
                        BoxShadow(color: TDGColors.gold.withOpacity(0.15), blurRadius: 30, offset: const Offset(0, 10)),
                        BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 10, offset: const Offset(0, 5)),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text('YOUR POINTS', style: TextStyle(color: TDGColors.gold.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 3)),
                        const SizedBox(height: 12),
                        ShaderMask(
                          shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                          child: Text(
                            '$_points',
                            style: const TextStyle(color: Colors.white, fontSize: 56, fontWeight: FontWeight.w900, height: 1.0),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text('1 Point = ₹1', style: TextStyle(color: TDGColors.greyLight, fontSize: 13, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _statItem('Distributed', '$_totalDistributed'),
                            Container(width: 1, height: 40, color: Colors.white12),
                            _statItem('Available', '$_availablePoints'),
                            Container(width: 1, height: 40, color: Colors.white12),
                            _statItem('Assets Dined', '$_assetsDinedCount/10'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Referral Code & Invite Sharing Card
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: TDGColors.cardDark.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.diversity_3_rounded, color: TDGColors.gold, size: 22),
                            const SizedBox(width: 10),
                            Text(
                              'INVITE FRIENDS TO YOUR DEN',
                              style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 1.2),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Share your phone or email to invite friends. When they sign up using your info as their referral, they get added to your den assets list and you both get points!',
                          style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.6),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                decoration: BoxDecoration(
                                  color: Colors.black45,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.white10),
                                ),
                                child: Text(
                                  ApiService().currentUser?['referCode'] ?? ApiService().currentUser?['phone'] ?? ApiService().currentUser?['email'] ?? 'No referral details',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16, letterSpacing: 1),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            InkWell(
                              onTap: () {
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
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                decoration: BoxDecoration(
                                  gradient: TDGColors.goldGradient,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [BoxShadow(color: TDGColors.gold.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                                ),
                                child: const Text('Share', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w800, fontSize: 15)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Catchy Den Squad Goal & Level Unlock Progress Bar
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: TDGColors.cardDark.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: TDGColors.gold.withOpacity(0.2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Text('🔥', style: TextStyle(fontSize: 18)),
                                const SizedBox(width: 8),
                                Text(
                                  'DEN SQUAD GOAL',
                                  style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w800, fontSize: 14, letterSpacing: 1),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: TDGColors.gold.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${_assets.length}/10 Friends',
                                style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w800, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: (_assets.length / 10).clamp(0.0, 1.0),
                            backgroundColor: Colors.black38,
                            valueColor: AlwaysStoppedAnimation(_assets.length >= 10 ? Colors.greenAccent : TDGColors.gold),
                            minHeight: 12,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _assets.length >= 10
                              ? '⭐ Active Referrer Qualified! Network threshold reached.'
                              : 'Add ${10 - _assets.length} more friend${10 - _assets.length == 1 ? '' : 's'} to qualify as an active Referrer Asset.',
                          style: TextStyle(color: _assets.length >= 10 ? Colors.greenAccent : Colors.white60, fontSize: 12, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 20),
                        const Divider(color: Colors.white10, height: 1),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Text('🚀', style: TextStyle(fontSize: 18)),
                                const SizedBox(width: 8),
                                const Text('Level Status', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: TDGColors.gold.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: TDGColors.gold.withOpacity(0.5), width: 1),
                              ),
                              child: Text(
                                ApiService().currentUser?['tier'] ?? 'Asset',
                                style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Reach ₹5,000 cumulative spend to auto-upgrade from Asset to Partner level!',
                          style: TextStyle(color: Colors.white54, fontSize: 12, height: 1.4),
                        ),
                      ],
                    ),
                  ),

                  // Added By Referral info
                  if (_referredByName != null && _referredByName!.isNotEmpty) ...[
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: TDGColors.cardDark,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.green.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.person_pin_rounded, color: Colors.green, size: 26),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Added to profile by',
                                style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
                              ),
                              SizedBox(height: 2),
                              Text(
                                _referredByName!,
                                style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w700, fontSize: 16),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 20),
                  ],

                  // Add Asset Button
                  if (_assets.length < 10)
                    GestureDetector(
                      onTap: _showAddAssetDialog,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 24),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: TDGColors.gold.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: TDGColors.gold.withOpacity(0.4), width: 1.5),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline, color: TDGColors.gold, size: 26),
                            const SizedBox(width: 10),
                            Text('Add Asset', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: 0.5)),
                          ],
                        ),
                      ),
                    ),

                  // Asset List
                  ..._assets.map((asset) => _buildAssetCard(asset)),
                ],
              ),
            ),
          ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: TDGColors.white, fontSize: 22, fontWeight: FontWeight.w800)),
        SizedBox(height: 4),
        Text(label, style: TextStyle(color: TDGColors.greyLight, fontSize: 13)),
      ],
    );
  }

  Widget _buildAssetCard(dynamic asset) {
    final bool isDined = asset['hasDined'] ?? false;
    final String status = asset['status'] ?? 'pending';
    final int distributed = asset['pointsDistributed'] ?? 0;

    Color statusColor;
    String statusText;
    switch (status) {
      case 'active':
        statusColor = Colors.green;
        statusText = 'Active';
        break;
      default:
        statusColor = Colors.orange;
        statusText = 'Pending';
    }

    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDined ? TDGColors.gold.withOpacity(0.5) : TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isDined ? TDGColors.gold.withOpacity(0.2) : TDGColors.cardMid,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isDined ? Icons.check_circle_rounded : Icons.person_outline_rounded,
              color: isDined ? TDGColors.gold : TDGColors.greyLight,
              size: 26,
            ),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(asset['name'] ?? '', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w700, fontSize: 17)),
                SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      '${asset['phone'] ?? ''} • $statusText',
                      style: TextStyle(color: statusColor, fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    SizedBox(width: 6),
                    Text(
                      '• Added by you',
                      style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
                    ),
                  ],
                ),
                    if (distributed > 0)
                      Text(
                        '$distributed pts distributed',
                        style: TextStyle(color: TDGColors.greyLight, fontSize: 13),
                      ),
                  ],
                ),
              ),
              if (status == 'pending')
                GestureDetector(
                  onTap: () async {
                    final phone = asset['phone'] ?? '';
                    final name = asset['name'] ?? 'Asset';
                    if (phone.isEmpty) return;

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Resending OTP to $phone...'), backgroundColor: Colors.blue.shade700),
                    );

                    try {
                      final res = await ApiService().sendAssetOtp(phone);
                      if (mounted) {
                        final code = res['otp']?.toString();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(code != null ? 'OTP Code for $phone: $code' : (res['message'] ?? 'Fresh OTP sent to $phone')),
                            backgroundColor: Colors.green.shade700,
                            duration: const Duration(seconds: 12),
                          ),
                        );
                        _showVerifyAssetOtpDialog(name, phone, defaultOtp: code);
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
                        );
                      }
                    }
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue.withOpacity(0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.refresh_rounded, color: Colors.blueAccent, size: 14),
                        SizedBox(width: 4),
                        Text('Resend OTP', style: TextStyle(color: Colors.blueAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              PopupMenuButton(
            icon: Icon(Icons.more_vert, color: TDGColors.greyLight),
            color: TDGColors.cardMid,
            itemBuilder: (ctx) => [
              PopupMenuItem(
                value: 'distribute',
                child: Row(children: [
                  Icon(Icons.send_rounded, color: TDGColors.gold, size: 18),
                  SizedBox(width: 8),
                  Text('Distribute Points', style: TextStyle(color: TDGColors.white)),
                ]),
              ),
              if (status == 'pending')
                PopupMenuItem(
                  value: 'resend_otp',
                  child: Row(children: [
                    Icon(Icons.mark_email_read_rounded, color: Colors.blueAccent, size: 18),
                    SizedBox(width: 8),
                    Text('Resend OTP', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
                  ]),
                ),
              if (!isDined)
                PopupMenuItem(
                  value: 'replace',
                  child: Row(children: [
                    Icon(Icons.swap_horiz_rounded, color: Colors.orange, size: 18),
                    SizedBox(width: 8),
                    Text('Replace', style: TextStyle(color: TDGColors.white)),
                  ]),
                ),
              PopupMenuItem(
                value: 'remove',
                child: Row(children: [
                  Icon(Icons.delete_outline, color: TDGColors.primaryRed, size: 18),
                  SizedBox(width: 8),
                  Text('Remove', style: TextStyle(color: TDGColors.primaryRed)),
                ]),
              ),
            ],
            onSelected: (value) async {
              if (value == 'distribute') {
                _showDistributeDialog(asset['id'], asset['name']);
              } else if (value == 'resend_otp') {
                final phone = asset['phone'] ?? '';
                final name = asset['name'] ?? 'Asset';
                if (phone.isEmpty) return;

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Resending OTP to $phone...'), backgroundColor: Colors.blue.shade700),
                );

                try {
                  final res = await ApiService().sendAssetOtp(phone);
                  if (mounted) {
                    final code = res['otp']?.toString();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(code != null ? 'OTP Code for $phone: $code' : (res['message'] ?? 'Fresh OTP sent to $phone')),
                        backgroundColor: Colors.green.shade700,
                        duration: const Duration(seconds: 12),
                      ),
                    );
                    _showVerifyAssetOtpDialog(name, phone, defaultOtp: code);
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
                    );
                  }
                }
              } else if (value == 'replace') {
                _showReplaceDialog(asset['id'], asset['name']);
              } else if (value == 'remove') {
                _removeAsset(asset['id'], asset['name']);
              }
            },
          ),
        ],
      ),
    );
  }
}
