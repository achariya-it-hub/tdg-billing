import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

class AssetScreen extends StatefulWidget {
  const AssetScreen({super.key});

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
  }

  Future<void> _fetchAssets() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final data = await ApiService().getAssets();
      if (mounted) {
        setState(() {
          _points = data['points'] ?? 0;
          _totalDistributed = data['totalDistributed'] ?? 0;
          _availablePoints = data['availablePoints'] ?? 0;
          _assetsDinedCount = data['assetsDinedCount'] ?? 0;
          _allAssetsActive = data['allAssetsActive'] ?? false;
          _bonusClaimed = data['bonusClaimed'] ?? false;
          _assets = data['assets'] ?? [];
          _referredByName = data['referredByName'];
        });
      }
    } catch (e) {
      debugPrint("Error fetching assets: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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
        title: Text('ADD ASSET', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: TextStyle(color: TDGColors.white),
              decoration: InputDecoration(
                labelText: 'Name',
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
                labelText: 'Phone',
                labelStyle: TextStyle(color: TDGColors.greyLight),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Max 10 assets. Share the OTP with your friend to verify.',
              style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
            onPressed: () async {
              if (nameCtrl.text.isEmpty || phoneCtrl.text.isEmpty) return;
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              Navigator.pop(ctx);
              try {
                await ApiService().addAsset(name, phone);
                _fetchAssets();
                if (mounted) {
                  _showVerifyOtpDialog(name, phone);
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('Add', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showOtpDialog(String name, String phone, String otp) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: TDGColors.gold),
        ),
        title: Text('ASSET ADDED', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$name ($phone) has been added.', style: TextStyle(color: TDGColors.greyLight, fontSize: 13)),
            SizedBox(height: 16),
            Text('Share this OTP with them:', style: TextStyle(color: TDGColors.white, fontSize: 12)),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                color: TDGColors.cardDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: TDGColors.gold, width: 2),
              ),
              child: Text(
                otp,
                style: TextStyle(color: TDGColors.gold, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: 8),
              ),
            ),
            SizedBox(height: 12),
            Text(
              'Your friend must enter this OTP when signing up with your referral code.',
              textAlign: TextAlign.center,
              style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('DONE', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.bold)),
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
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.green),
        ),
        title: Text('VERIFY OTP', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter the OTP shared with $name', style: TextStyle(color: TDGColors.greyLight, fontSize: 13)),
            SizedBox(height: 14),
            TextField(
              controller: otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: TextStyle(color: TDGColors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 8),
              decoration: InputDecoration(
                counterText: '',
                hintText: '0000',
                hintStyle: TextStyle(color: TDGColors.grey, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 8),
                filled: true,
                fillColor: TDGColors.cardDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: TDGColors.gold)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: TDGColors.gold, width: 2)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: TDGColors.greyLight))),
          TextButton(
            onPressed: () async {
              final otp = otpCtrl.text.trim();
              if (otp.length != 4) return;
              Navigator.pop(ctx);
              try {
                await ApiService().verifyAssetOtp(phone, otp);
                _fetchAssets();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('OTP verified! Asset activated.'), backgroundColor: Colors.green),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: Text('VERIFY', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
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
          style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 1),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: TDGColors.gold))
          : RefreshIndicator(
              onRefresh: _fetchAssets,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Points Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF2A1E00), Color(0xFF1A1200), Color(0xFF2A1800)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: TDGColors.gold.withOpacity(0.5), width: 1.5),
                      boxShadow: [BoxShadow(color: TDGColors.gold.withOpacity(0.2), blurRadius: 20, offset: Offset(0, 6))],
                    ),
                    child: Column(
                      children: [
                        Text('YOUR POINTS', style: TextStyle(color: TDGColors.greyLight, fontSize: 11, letterSpacing: 2)),
                        SizedBox(height: 10),
                        ShaderMask(
                          shaderCallback: (b) => TDGColors.goldGradient.createShader(b),
                          child: Text(
                            '$_points',
                            style: TextStyle(color: TDGColors.white, fontSize: 42, fontWeight: FontWeight.w900),
                          ),
                        ),
                        Text('1 Point = ₹1', style: TextStyle(color: TDGColors.greyLight, fontSize: 12)),
                        SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _statItem('Distributed', '$_totalDistributed'),
                            _statItem('Available', '$_availablePoints'),
                            _statItem('Assets Dined', '$_assetsDinedCount/10'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 20),

                  // Progress Bar
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: TDGColors.cardDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: TDGColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Assets Progress', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                            Text('${_assets.length}/10', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w700)),
                          ],
                        ),
                        SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: _assets.length / 10,
                            backgroundColor: TDGColors.cardMid,
                            valueColor: AlwaysStoppedAnimation(TDGColors.gold),
                            minHeight: 8,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          _allAssetsActive
                              ? 'All 10 assets dined! +500 bonus earned'
                              : '$_assetsDinedCount of 10 assets have dined',
                          style: TextStyle(color: _allAssetsActive ? TDGColors.gold : TDGColors.greyLight, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 20),

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
                          Icon(Icons.person_pin_rounded, color: Colors.green, size: 22),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Added to profile by',
                                style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
                              ),
                              SizedBox(height: 2),
                              Text(
                                _referredByName!,
                                style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w700, fontSize: 14),
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
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: TDGColors.cardDark,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline, color: TDGColors.gold, size: 22),
                            SizedBox(width: 8),
                            Text('Add Asset', style: TextStyle(color: TDGColors.gold, fontWeight: FontWeight.w700, fontSize: 15)),
                          ],
                        ),
                      ),
                    ),
                  SizedBox(height: 16),

                  // Asset List
                  ..._assets.map((asset) => _buildAssetCard(asset)),
                ],
              ),
            ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: TDGColors.white, fontSize: 18, fontWeight: FontWeight.w800)),
        SizedBox(height: 4),
        Text(label, style: TextStyle(color: TDGColors.greyLight, fontSize: 11)),
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
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: TDGColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDined ? TDGColors.gold.withOpacity(0.5) : TDGColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isDined ? TDGColors.gold.withOpacity(0.2) : TDGColors.cardMid,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isDined ? Icons.check_circle_rounded : Icons.person_outline_rounded,
              color: isDined ? TDGColors.gold : TDGColors.greyLight,
              size: 22,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(asset['name'] ?? '', style: TextStyle(color: TDGColors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                SizedBox(height: 2),
                Row(
                  children: [
                    Text(
                      '${asset['phone'] ?? ''} • $statusText',
                      style: TextStyle(color: statusColor, fontSize: 12),
                    ),
                    SizedBox(width: 6),
                    Text(
                      '• Added by you',
                      style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
                    ),
                  ],
                ),
                    if (distributed > 0)
                      Text(
                        '$distributed pts distributed',
                        style: TextStyle(color: TDGColors.greyLight, fontSize: 11),
                      ),
                  ],
                ),
              ),
              if (!isDined && status == 'pending')
                TextButton(
                  onPressed: () => _showVerifyOtpDialog(asset['name'] ?? '', asset['phone'] ?? ''),
                  child: Text('Verify', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w600)),
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
            onSelected: (value) {
              if (value == 'distribute') _showDistributeDialog(asset['id'], asset['name']);
              else if (value == 'replace') _showReplaceDialog(asset['id'], asset['name']);
              else if (value == 'remove') _removeAsset(asset['id'], asset['name']);
            },
          ),
        ],
      ),
    );
  }
}
