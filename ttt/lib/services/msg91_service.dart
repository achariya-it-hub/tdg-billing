import 'package:sendotp_flutter_sdk/sendotp_flutter_sdk.dart';

class Msg91Service {
  static const String widgetId = '36686e624b35303331383732';

  static void initWidget({String? authToken}) {
    try {
      OTPWidget.initializeWidget(widgetId, authToken ?? '');
    } catch (e) {
      print('[MSG91 SDK Init Error]: $e');
    }
  }

  static Future<dynamic> sendOtp(String mobileNumber) async {
    try {
      final cleanPhone = mobileNumber.replaceAll(RegExp(r'\D'), '');
      final formattedPhone = cleanPhone.length == 10 ? '91$cleanPhone' : cleanPhone;
      final data = {'identifier': formattedPhone};
      return await OTPWidget.sendOTP(data);
    } catch (e) {
      print('[MSG91 SDK Send OTP Error]: $e');
      return null;
    }
  }

  static Future<dynamic> retryOtp(String reqId, {int channel = 11}) async {
    try {
      final data = {'reqId': reqId, 'retryChannel': channel};
      return await OTPWidget.retryOTP(data);
    } catch (e) {
      print('[MSG91 SDK Retry OTP Error]: $e');
      return null;
    }
  }

  static Future<dynamic> verifyOtp(String reqId, String otpCode) async {
    try {
      final data = {'reqId': reqId, 'otp': otpCode};
      return await OTPWidget.verifyOTP(data);
    } catch (e) {
      print('[MSG91 SDK Verify OTP Error]: $e');
      return null;
    }
  }
}
