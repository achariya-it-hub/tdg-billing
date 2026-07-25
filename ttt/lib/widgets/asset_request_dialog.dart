import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../services/api_service.dart';

/// Shows a full-screen dialog (one request at a time) when the user has
/// pending Den asset requests from other users.
class AssetRequestDialog extends StatefulWidget {
  final List<Map<String, dynamic>> requests;
  final VoidCallback? onDone;

  const AssetRequestDialog({
    super.key,
    required this.requests,
    this.onDone,
  });

  /// Convenience: show if there are pending requests, returns immediately if none.
  static Future<void> showIfNeeded(BuildContext context, {VoidCallback? onDone}) async {
    final requests = ApiService().pendingAssetRequests;
    if (requests.isEmpty) return;
    await showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black87,
      builder: (_) => AssetRequestDialog(requests: requests, onDone: onDone),
    );
  }

  @override
  State<AssetRequestDialog> createState() => _AssetRequestDialogState();
}

class _AssetRequestDialogState extends State<AssetRequestDialog>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  bool _isLoading = false;
  late AnimationController _animCtrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _scaleAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.elasticOut);
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeIn);
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic> get _current => widget.requests[_currentIndex];

  Future<void> _respond(String action) async {
    setState(() => _isLoading = true);
    try {
      await ApiService().respondToAssetRequest(
        masterId: _current['masterId'],
        assetId: _current['assetId'],
        action: action,
      );
      // Refresh profile to update currentUser
      await ApiService().getProfile();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
        );
      }
    }
    if (!mounted) return;
    if (_currentIndex < widget.requests.length - 1) {
      setState(() {
        _currentIndex++;
        _isLoading = false;
      });
      _animCtrl.reset();
      _animCtrl.forward();
    } else {
      Navigator.of(context).pop();
      widget.onDone?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final masterName = _current['masterName'] ?? 'Someone';
    final total = widget.requests.length;
    final current = _currentIndex + 1;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: FadeTransition(
        opacity: _fadeAnim,
        child: ScaleTransition(
          scale: _scaleAnim,
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1A1200), Color(0xFF0F0F11), Color(0xFF1A1200)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: TDGColors.gold.withOpacity(0.5), width: 1.5),
              boxShadow: [
                BoxShadow(color: TDGColors.gold.withOpacity(0.15), blurRadius: 40, spreadRadius: 2),
                BoxShadow(color: Colors.black.withOpacity(0.6), blurRadius: 20),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Gold top bar
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: TDGColors.goldGradient,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'DEN REQUEST',
                        style: GoogleFonts.outfit(
                          color: Colors.black,
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          letterSpacing: 1.5,
                        ),
                      ),
                      if (total > 1)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '$current / $total',
                            style: GoogleFonts.outfit(
                              color: Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    children: [
                      // Icon
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: TDGColors.goldGradient,
                        ),
                        child: const Center(
                          child: Icon(Icons.people_alt_rounded, color: Colors.black, size: 36),
                        ),
                      ),
                      const SizedBox(height: 20),

                      Text(
                        'YOU WERE ADDED TO A DEN',
                        style: GoogleFonts.outfit(
                          color: TDGColors.gold,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 10),

                      RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 15, height: 1.5),
                          children: [
                            TextSpan(
                              text: masterName,
                              style: GoogleFonts.outfit(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                              ),
                            ),
                            const TextSpan(text: ' has added you as\nan asset to their '),
                            TextSpan(
                              text: 'Den',
                              style: GoogleFonts.outfit(
                                color: TDGColors.gold,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const TextSpan(text: '.'),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: TDGColors.gold.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: TDGColors.gold.withOpacity(0.2)),
                        ),
                        child: Text(
                          'Accepting gives you exclusive discounts & access to rewards when dining with Ten Den Gyros!',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            color: TDGColors.grey,
                            fontSize: 12,
                            height: 1.4,
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      if (_isLoading)
                        const CircularProgressIndicator(color: Color(0xFFFFCC00))
                      else
                        Row(
                          children: [
                            // Reject
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => _respond('reject'),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.redAccent, width: 1.5),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                child: Text(
                                  'Reject',
                                  style: GoogleFonts.outfit(
                                    color: Colors.redAccent,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Accept
                            Expanded(
                              flex: 2,
                              child: ElevatedButton(
                                onPressed: () => _respond('accept'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: TDGColors.gold,
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.check_circle_rounded, size: 18),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Accept',
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
