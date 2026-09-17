import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class FirebaseAuthService {
  static final FirebaseAuthService _instance = FirebaseAuthService._internal();
  factory FirebaseAuthService() => _instance;
  FirebaseAuthService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Clean & format phone number to E.164 (e.g. +919876543210)
  String formatPhoneNumber(String phone, {String defaultCountryCode = '+91'}) {
    final digitsOnly = phone.replaceAll(RegExp(r'\D'), '');
    if (phone.startsWith('+')) {
      return '+$digitsOnly';
    }
    if (digitsOnly.length == 10) {
      return '$defaultCountryCode$digitsOnly';
    }
    return '+$digitsOnly';
  }

  /// Sends Firebase SMS OTP to phone number
  Future<void> sendOtp({
    required String phone,
    required Function(String verificationId, int? resendToken) onCodeSent,
    required Function(String errorMessage) onError,
    Function(PhoneAuthCredential credential)? onAutoVerified,
    int? resendToken,
  }) async {
    final formattedPhone = formatPhoneNumber(phone);
    debugPrint('[Firebase Auth] Requesting OTP for $formattedPhone');

    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: formattedPhone,
        forceResendingToken: resendToken,
        timeout: const Duration(seconds: 60),
        verificationCompleted: (PhoneAuthCredential credential) async {
          debugPrint('[Firebase Auth] Auto-verification completed');
          if (onAutoVerified != null) {
            onAutoVerified(credential);
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          debugPrint('[Firebase Auth] Verification failed: ${e.code} - ${e.message}');
          String errorMsg = e.message ?? 'Phone verification failed';
          if (e.code == 'invalid-phone-number') {
            errorMsg = 'The provided phone number is invalid.';
          } else if (e.code == 'too-many-requests') {
            errorMsg = 'Too many requests. Please try again later.';
          }
          onError(errorMsg);
        },
        codeSent: (String verificationId, int? token) {
          debugPrint('[Firebase Auth] Code sent to $formattedPhone. VerificationId: $verificationId');
          onCodeSent(verificationId, token);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          debugPrint('[Firebase Auth] Auto retrieval timeout for $verificationId');
        },
      );
    } catch (e) {
      debugPrint('[Firebase Auth] Send OTP Exception: $e');
      onError(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Verifies entered 6-digit SMS OTP against Firebase
  Future<UserCredential> verifyOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode.trim(),
      );
      final userCredential = await _auth.signInWithCredential(credential);
      debugPrint('[Firebase Auth] OTP verified successfully for user: ${userCredential.user?.uid}');
      return userCredential;
    } on FirebaseAuthException catch (e) {
      debugPrint('[Firebase Auth] Verify OTP Error: ${e.code} - ${e.message}');
      if (e.code == 'invalid-verification-code') {
        throw Exception('Invalid OTP code. Please check and try again.');
      } else if (e.code == 'session-expired') {
        throw Exception('OTP code has expired. Please request a new code.');
      }
      throw Exception(e.message ?? 'Failed to verify OTP.');
    } catch (e) {
      throw Exception('Verification failed: $e');
    }
  }
}
