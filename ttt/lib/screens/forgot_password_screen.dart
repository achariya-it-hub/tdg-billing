import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';
import '../widgets/tdg_logo.dart';
import '../services/api_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isEmailMode = false;
  int _step = 1; // 1=identifier, 2=otp+new password
  int _otpResendTimer = 60;
  Timer? _timer;
  String? _verificationId;

  @override
  void dispose() {
    _timer?.cancel();
    _phoneController.dispose();
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _otpResendTimer = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (mounted) {
        setState(() {
          _otpResendTimer--;
          if (_otpResendTimer <= 0) t.cancel();
        });
      } else {
        t.cancel();
      }
    });
  }

  Future<void> _sendOtp() async {
    if (_isEmailMode) {
      final email = _emailController.text.trim();
      if (email.isEmpty || !email.contains('@')) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter a valid email address.'), backgroundColor: Colors.redAccent),
        );
        return;
      }
      setState(() => _isLoading = true);
      try {
        await ApiService().sendForgotPasswordEmailOtp(email);
        _startResendTimer();
        if (mounted) {
          setState(() {
            _step = 2;
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('OTP sent to $email'), backgroundColor: Colors.green),
          );
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.redAccent),
          );
        }
      }
      return;
    }

    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your phone number.'), backgroundColor: Colors.redAccent),
      );
      return;
    }
    setState(() => _isLoading = true);
    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: phone,
        verificationCompleted: (PhoneAuthCredential credential) async {
          if (mounted) setState(() => _isLoading = false);
        },
        verificationFailed: (FirebaseAuthException e) {
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(e.message ?? 'Verification failed.'), backgroundColor: Colors.redAccent),
            );
          }
        },
        codeSent: (String verificationId, int? resendToken) {
          if (mounted) {
            setState(() {
              _verificationId = verificationId;
              _step = 2;
              _isLoading = false;
            });
            _startResendTimer();
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('OTP sent to $phone'), backgroundColor: Colors.green),
            );
          }
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          if (mounted) {
            setState(() {
              _verificationId = verificationId;
            });
          }
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  Future<void> _resetPassword() async {
    final otp = _otpController.text.trim();
    final newPassword = _newPasswordController.text.trim();

    if (otp.isEmpty || newPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter OTP and new password.'), backgroundColor: Colors.redAccent),
      );
      return;
    }
    if (newPassword.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 6 characters.'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      if (_isEmailMode) {
        final email = _emailController.text.trim();
        await ApiService().resetPassword(email: email, otp: otp, newPassword: newPassword);
      } else {
        final phone = _phoneController.text.trim();
        if (_verificationId == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Verification ID is missing. Please request OTP again.'), backgroundColor: Colors.redAccent),
          );
          setState(() => _isLoading = false);
          return;
        }
        // 1. Create a credential with the SMS code
        PhoneAuthCredential credential = PhoneAuthProvider.credential(
          verificationId: _verificationId!,
          smsCode: otp,
        );

        // 2. Sign in with credential to verify the OTP code
        await FirebaseAuth.instance.signInWithCredential(credential);

        // 3. Reset the password in the custom backend using 'firebase' as the bypass code
        await ApiService().resetPassword(phone: phone, otp: 'firebase', newPassword: newPassword);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset successful! Please login.'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF140F02), Colors.black],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          Positioned(
            top: -80,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(colors: [TDGColors.gold.withOpacity(0.08), Colors.transparent]),
              ),
            ),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: IntrinsicHeight(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 28),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 12),
                            const Align(
                              alignment: Alignment.topLeft,
                              child: BackButton(color: Colors.white),
                            ),
                            const Spacer(),
                            const Center(child: TDGLogo(width: 140)),
                            const SizedBox(height: 24),
                            Center(
                              child: Text(
                                _step == 1 ? 'FORGOT PASSWORD' : 'RESET PASSWORD',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Center(
                              child: Text(
                                _step == 1
                                    ? (_isEmailMode ? 'Enter your email address to receive an OTP' : 'Enter your phone number to receive an OTP')
                                    : 'Enter the OTP and set your new password',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w400),
                              ),
                            ),
                            const SizedBox(height: 28),
                            if (_step == 1) _buildStep1() else _buildStep2(),
                            const Spacer(),
                            const SizedBox(height: 24),
                          ],
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

  Widget _buildStep1() {
    return Column(
      children: [
        // Mode Selector Tabs
        Container(
          margin: const EdgeInsets.only(bottom: 24),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: const Color(0xFF1B1B1B).withOpacity(0.8),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: TDGColors.border, width: 1.5),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _isEmailMode = false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: !_isEmailMode ? TDGColors.goldGradient : null,
                      borderRadius: BorderRadius.circular(26),
                    ),
                    child: Center(
                      child: Text(
                        'PHONE',
                        style: GoogleFonts.outfit(
                          color: !_isEmailMode ? Colors.black : Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _isEmailMode = true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: _isEmailMode ? TDGColors.goldGradient : null,
                      borderRadius: BorderRadius.circular(26),
                    ),
                    child: Center(
                      child: Text(
                        'EMAIL',
                        style: GoogleFonts.outfit(
                          color: _isEmailMode ? Colors.black : Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (!_isEmailMode)
          _buildTextField(
            label: 'PHONE NUMBER',
            controller: _phoneController,
            hint: 'Enter your registered phone number',
            icon: Icons.phone_android_outlined,
            keyboardType: TextInputType.phone,
          )
        else
          _buildTextField(
            label: 'EMAIL ADDRESS',
            controller: _emailController,
            hint: 'Enter your registered email address',
            icon: Icons.mail_outline,
            keyboardType: TextInputType.emailAddress,
          ),
        const SizedBox(height: 24),
        TDGButton(
          text: 'Send OTP',
          gradient: TDGColors.goldGradient,
          isLoading: _isLoading,
          onPressed: _sendOtp,
          borderRadius: BorderRadius.circular(30),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        _buildTextField(
          label: 'OTP',
          controller: _otpController,
          hint: 'Enter 4-digit OTP',
          icon: Icons.pin_outlined,
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 12),
        // Resend OTP
        Align(
          alignment: Alignment.centerRight,
          child: _otpResendTimer > 0
              ? Text(
                  'Resend OTP in ${_otpResendTimer}s',
                  style: GoogleFonts.outfit(color: TDGColors.grey, fontSize: 12),
                )
              : TextButton(
                  onPressed: _sendOtp,
                  child: Text('Resend OTP', style: GoogleFonts.outfit(color: TDGColors.gold, fontSize: 12, fontWeight: FontWeight.w600)),
                ),
        ),
        const SizedBox(height: 16),
        _buildTextField(
          label: 'NEW PASSWORD',
          controller: _newPasswordController,
          hint: 'Create a new password',
          icon: Icons.lock_outline,
          isPassword: true,
          obscureText: _obscurePassword,
          onToggleVisibility: () => setState(() => _obscurePassword = !_obscurePassword),
        ),
        const SizedBox(height: 24),
        TDGButton(
          text: 'Reset Password',
          gradient: TDGColors.goldGradient,
          isLoading: _isLoading,
          onPressed: _resetPassword,
          borderRadius: BorderRadius.circular(30),
        ),
      ],
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
        Text(label, style: GoogleFonts.outfit(color: TDGColors.grey, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
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
                      icon: Icon(obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: TDGColors.grey, size: 20),
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
