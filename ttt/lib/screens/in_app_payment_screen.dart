import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/colors.dart';

class InAppPaymentScreen extends StatefulWidget {
  final String url;
  final String title;

  const InAppPaymentScreen({
    super.key,
    required this.url,
    this.title = 'Cashfree Secure Payment',
  });

  @override
  State<InAppPaymentScreen> createState() => _InAppPaymentScreenState();
}

class _InAppPaymentScreenState extends State<InAppPaymentScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasPopped = false;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF101619))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) setState(() => _isLoading = true);
            _checkCallback(url);
          },
          onPageFinished: (String url) {
            if (mounted) setState(() => _isLoading = false);
            _checkCallback(url);
          },
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;
            if (_checkCallback(url)) {
              return NavigationDecision.prevent;
            }
            if (url.startsWith('upi://') ||
                url.startsWith('phonepe://') ||
                url.startsWith('gpay://') ||
                url.startsWith('paytmmp://') ||
                url.startsWith('intent://')) {
              try {
                launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
              } catch (e) {
                debugPrint('Failed to launch external app intent: $e');
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('Payment WebView Error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  bool _checkCallback(String url) {
    if (_hasPopped) return true;
    final lowerUrl = url.toLowerCase();
    if (lowerUrl.contains('/api/cashfree/callback') ||
        lowerUrl.contains('payment=success') ||
        lowerUrl.contains('payment_status=success') ||
        lowerUrl.contains('txstatus=success')) {
      _hasPopped = true;
      if (mounted) {
        Navigator.of(context).pop(true);
      }
      return true;
    }
    if (lowerUrl.contains('payment_status=failed') ||
        lowerUrl.contains('payment=failed') ||
        lowerUrl.contains('txstatus=failed') ||
        lowerUrl.contains('txstatus=cancelled')) {
      _hasPopped = true;
      if (mounted) {
        Navigator.of(context).pop(false);
      }
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.cardDark,
        elevation: 0,
        title: Text(
          widget.title,
          style: TextStyle(
            color: TDGColors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.close, color: TDGColors.white),
          onPressed: () {
            if (!_hasPopped) {
              _hasPopped = true;
              Navigator.of(context).pop(false);
            }
          },
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: TDGColors.gold),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (_isLoading)
              LinearProgressIndicator(
                backgroundColor: TDGColors.cardMid,
                color: TDGColors.gold,
                minHeight: 3,
              ),
            Expanded(
              child: WebViewWidget(controller: _controller),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: TDGColors.cardDark,
              child: Row(
                children: [
                  Icon(Icons.lock_rounded, color: TDGColors.green, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    '256-Bit Encrypted Secure Checkout',
                    style: TextStyle(color: TDGColors.greyLight, fontSize: 12),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      if (!_hasPopped) {
                        _hasPopped = true;
                        Navigator.of(context).pop(true);
                      }
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: TDGColors.gold,
                    ),
                    child: const Text('I Have Paid'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
