import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';
import '../widgets/tdg_logo.dart';
import 'main_nav_screen.dart';
import '../services/api_service.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _referralController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  void _handleSignUp() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (name.isEmpty || phone.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill in all required fields.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final referral = _referralController.text.trim();
      final otp = _otpController.text.trim();
      await ApiService().signup(
        name: name,
        email: email,
        phone: phone,
        password: password,
        referredBy: referral.isNotEmpty ? referral : null,
        otp: otp.isNotEmpty ? otp : null,
      );
      if (mounted) {
        _showSuccessDialog(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Premium dark gradient backdrop for visual depth
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF140F02), // Very rich dark gold/brown tone
                    Colors.black,
                  ],
                  stops: const [0.0, 0.7],
                ),
              ),
            ),
          ),
          // 2. Ambient golden spotlight glow at the top-left
          Positioned(
            top: -80,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    TDGColors.gold.withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // 3. Scrollable content overlay
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 500),
                        child: IntrinsicHeight(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 28),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 12),
                                // Back Button
                                const Align(
                                  alignment: Alignment.topLeft,
                                  child: BackButton(color: Colors.white),
                                ),
                                
                                const Spacer(),
                                
                                // Center Brand Logo
                                const Center(
                                  child: TDGLogo(width: 160),
                                ),
                                
                                const SizedBox(height: 24),
                                
                                Center(
                                  child: Text(
                                    'JOIN THE PRIDE',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.outfit(
                                      color: Colors.white,
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Center(
                                  child: RichText(
                                    textAlign: TextAlign.center,
                                    text: TextSpan(
                                      style: GoogleFonts.outfit(
                                        color: TDGColors.gold,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.2,
                                      ),
                                      children: [
                                        const TextSpan(text: 'Start your journey with 500 '),
                                        WidgetSpan(
                                          alignment: PlaceholderAlignment.middle,
                                          child: Icon(
                                            Icons.diamond_rounded,
                                            color: TDGColors.primaryRed,
                                            size: 16,
                                          ),
                                        ),
                                        const TextSpan(text: ' bonus!'),
                                      ],
                                    ),
                                  ),
                                ),
                                
                                const SizedBox(height: 24),
                                
                                // Referral Code (Optional)
                                _buildTextField(
                                  label: 'REFERRAL CODE (OPTIONAL)',
                                  controller: _referralController,
                                  hint: 'Enter code for asset linking',
                                  icon: Icons.card_giftcard_rounded,
                                ),
                                
                                const SizedBox(height: 16),
                                
                                // OTP (shown when referral code is entered)
                                ValueListenableBuilder<TextEditingValue>(
                                  valueListenable: _referralController,
                                  builder: (context, value, _) {
                                    if (value.text.trim().isEmpty) return const SizedBox.shrink();
                                    return Column(
                                      children: [
                                        _buildTextField(
                                          label: 'REFERRAL OTP',
                                          controller: _otpController,
                                          hint: 'Enter OTP from your referrer',
                                          icon: Icons.pin_outlined,
                                          keyboardType: TextInputType.number,
                                        ),
                                        const SizedBox(height: 16),
                                      ],
                                    );
                                  },
                                ),
                                
                                // Full Name
                                _buildTextField(
                                  label: 'FULL NAME',
                                  controller: _nameController,
                                  hint: 'Enter your name',
                                  icon: Icons.person_outline,
                                ),
                                
                                const SizedBox(height: 16),
                                
                                // Phone Number
                                _buildTextField(
                                  label: 'PHONE NUMBER',
                                  controller: _phoneController,
                                  hint: 'Enter your mobile number',
                                  icon: Icons.phone_android_outlined,
                                  keyboardType: TextInputType.phone,
                                ),
                                
                                const SizedBox(height: 16),
                                
                                // Email Address
                                _buildTextField(
                                  label: 'EMAIL ADDRESS',
                                  controller: _emailController,
                                  hint: 'Enter your email id',
                                  icon: Icons.mail_outline_rounded,
                                  keyboardType: TextInputType.emailAddress,
                                ),
                                
                                const SizedBox(height: 16),
                                
                                // Password
                                _buildTextField(
                                  label: 'PASSWORD',
                                  controller: _passwordController,
                                  hint: 'Create a password',
                                  icon: Icons.lock_outline,
                                  isPassword: true,
                                  obscureText: _obscurePassword,
                                  onToggleVisibility: () {
                                    setState(() => _obscurePassword = !_obscurePassword);
                                  },
                                ),
                                
                                const SizedBox(height: 24),
                                
                                // Create Account Button
                                TDGButton(
                                  text: 'Create Account',
                                  gradient: TDGColors.goldGradient,
                                  isLoading: _isLoading,
                                  onPressed: _handleSignUp,
                                  borderRadius: BorderRadius.circular(30), // Premium pill shape
                                ),
                                
                                const SizedBox(height: 24),
                                
                                // Already a member?
                                Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        "Already a member? ",
                                        style: GoogleFonts.outfit(
                                          color: Colors.white70,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                      TextButton(
                                        onPressed: () => Navigator.pop(context),
                                        style: TextButton.styleFrom(
                                          padding: EdgeInsets.zero,
                                          minimumSize: Size.zero,
                                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                        child: Text(
                                          'Login',
                                          style: GoogleFonts.outfit(
                                            color: TDGColors.gold,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                
                                const Spacer(),
                                const SizedBox(height: 24),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: TDGColors.cardMid,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: TDGColors.gold.withOpacity(0.3)),
        ),
        title: Text(
          'WELCOME TO THE PRIDE',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            color: TDGColors.gold,
            fontWeight: FontWeight.w900,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/pride_lion.png', width: 80, height: 80),
            const SizedBox(height: 16),
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
                children: [
                  const TextSpan(text: '500 '),
                  WidgetSpan(
                    alignment: PlaceholderAlignment.middle,
                    child: Icon(
                      Icons.diamond_rounded,
                      color: TDGColors.primaryRed,
                      size: 20,
                    ),
                  ),
                  const TextSpan(text: ' Credited!'),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Convert them to ₹500 on your first ₹1000 spend.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: TDGColors.greyLight,
                fontSize: 13,
              ),
            ),
          ],
        ),
        actions: [
          Center(
            child: TextButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const MainNavScreen()),
                  (route) => false,
                );
              },
              child: Text(
                'LET\'S GO',
                style: GoogleFonts.outfit(
                  color: TDGColors.gold,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggleVisibility,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            color: TDGColors.grey,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1B1B1B).withOpacity(0.8),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: TDGColors.border, width: 1.5),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            obscureText: obscureText,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 15),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.outfit(color: const Color(0xFF666666), fontSize: 14),
              prefixIcon: Icon(icon, color: TDGColors.gold, size: 20),
              suffixIcon: isPassword
                  ? IconButton(
                      icon: Icon(
                        obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: TDGColors.grey,
                        size: 20,
                      ),
                      onPressed: onToggleVisibility,
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }
}
