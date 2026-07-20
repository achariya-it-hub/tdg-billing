import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  Map<String, dynamic>? currentUser;
  bool _initialized = false;

  bool get isAuthenticated => _token != null;
  String get baseUrl => AppConfig.baseUrl;

  Future<void> init() async {
    if (_initialized) return;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final userJson = prefs.getString('current_user');
    if (userJson != null) {
      currentUser = jsonDecode(userJson);
    }
    _initialized = true;
  }

  Future<void> _saveSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) {
      await prefs.setString('auth_token', _token!);
    }
    if (currentUser != null) {
      await prefs.setString('current_user', jsonEncode(currentUser));
    }
  }

  Future<void> _clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('current_user');
  }

  Never _handleError(dynamic e) {
    if (e is FormatException) {
      throw Exception('Server returned an invalid response. Please try again later.');
    } else if (e.toString().contains('SocketException') || e.toString().contains('Connection refused') || e.toString().contains('Failed host lookup')) {
      throw Exception('Cannot connect to the server. Please check your internet connection.');
    } else {
      throw e;
    }
  }

  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  void logout() {
    _token = null;
    currentUser = null;
    _clearSession();
  }

  // --- AUTH ENDPOINTS ---

  Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? referredBy,
    String? otp,
  }) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/signup');
    final body = {
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
    };
    if (referredBy != null) body['referredBy'] = referredBy;
    if (otp != null) body['otp'] = otp;

    try {
      final response = await http.post(url, headers: _getHeaders(), body: jsonEncode(body));
      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        _token = data['token'];
        currentUser = data['user'];
        await _saveSession();
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to signup');
      }
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/login');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'email': email, 'password': password}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        _token = data['token'];
        currentUser = data['user'];
        await _saveSession();
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to login');
      }
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/profile');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        currentUser = data;
        await _saveSession();
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load profile');
      }
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateProfile({
    required String name,
    required String phone,
    required String email,
  }) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/profile');
    try {
      final response = await http.put(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'name': name, 'phone': phone, 'email': email}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        currentUser = data;
        await _saveSession();
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      _handleError(e);
    }
  }

  // --- MENU ENDPOINTS ---

  Future<Map<String, dynamic>> getMenu() async {
    final url = Uri.parse('${AppConfig.baseUrl}/menu');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to load menu');
    } catch (e) {
      _handleError(e);
    }
  }

  // --- ORDER ENDPOINTS ---

  Future<Map<String, dynamic>> createOrder({
    required List<Map<String, dynamic>> items,
    required double subtotal,
    required double tax,
    required double deliveryFee,
    required double total,
    required String paymentMethod,
    required String deliveryAddress,
  }) async {
    final url = Uri.parse('${AppConfig.baseUrl}/orders');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({
          'items': items, 'subtotal': subtotal, 'tax': tax,
          'deliveryFee': deliveryFee, 'total': total,
          'paymentMethod': paymentMethod, 'deliveryAddress': deliveryAddress,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201) return data;
      throw Exception(data['message'] ?? 'Failed to place order');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<List<dynamic>> getOrders() async {
    final url = Uri.parse('${AppConfig.baseUrl}/orders');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to load orders');
    } catch (e) {
      _handleError(e);
    }
  }

  // --- WALLET ENDPOINTS ---

  Future<Map<String, dynamic>> getWallet() async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (currentUser != null) {
          currentUser!['points'] = data['points'];
          currentUser!['availablePoints'] = data['availablePoints'];
          await _saveSession();
        }
        return data;
      }
      throw Exception('Failed to load wallet');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> addPoints(double amount) async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet/add');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'amount': amount}),
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to add points');
    } catch (e) {
      _handleError(e);
    }
  }

  // --- ASSET ENDPOINTS ---

  Future<Map<String, dynamic>> getAssets() async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to load assets');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> addAsset(String name, String phone) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'name': name, 'phone': phone}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) return data;
      throw Exception(data['message'] ?? 'Failed to add asset');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> replaceAsset(String assetId, String name, String phone) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets/$assetId');
    try {
      final response = await http.put(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'name': name, 'phone': phone}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) return data;
      throw Exception(data['message'] ?? 'Failed to replace asset');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> removeAsset(String assetId) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets/$assetId');
    try {
      final response = await http.delete(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to remove asset');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> distributePoints(String assetId, int amount) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets/distribute');
    final response = await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({'assetId': assetId, 'amount': amount}),
    );
    if (response.statusCode != 200) throw Exception(jsonDecode(response.body)['message'] ?? 'Failed to distribute');
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> verifyAssetOtp(String phone, String otp) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets/verify-otp');
    final response = await http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );
    if (response.statusCode != 200) throw Exception(jsonDecode(response.body)['message'] ?? 'OTP verification failed');
    return jsonDecode(response.body);
  }

  // --- DEN/ASSET PROGRESS ---

  Future<Map<String, dynamic>> getDenProgress() async {
    final url = Uri.parse('${AppConfig.baseUrl}/den');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to load progress');
    } catch (e) {
      _handleError(e);
    }
  }

  // --- DISCOUNT & REDEEM ---

  Future<Map<String, dynamic>> getDiscount(String phone, {int billAmount = 0}) async {
    final url = Uri.parse('${AppConfig.baseUrl}/assets/discount/$phone?billAmount=$billAmount');
    try {
      final response = await http.get(url, headers: _getHeaders());
      if (response.statusCode == 200) return jsonDecode(response.body);
      throw Exception('Failed to get discount');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<Map<String, dynamic>> redeemPoints(int amount) async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet/redeem');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'amount': amount}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (currentUser != null) {
          currentUser!['points'] = data['points'];
        }
        return data;
      }
      throw Exception(data['message'] ?? 'Failed to redeem points');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<void> sendForgotPasswordOtp(String phone) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/forgot-password');
    try {
      final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: jsonEncode({'phone': phone}));
      final data = jsonDecode(response.body);
      if (response.statusCode != 200) throw Exception(data['message'] ?? 'Failed to send OTP');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<void> sendForgotPasswordEmailOtp(String email) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/forgot-password-email');
    try {
      final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: jsonEncode({'email': email}));
      final data = jsonDecode(response.body);
      if (response.statusCode != 200) throw Exception(data['message'] ?? 'Failed to send OTP');
    } catch (e) {
      _handleError(e);
    }
  }

  Future<void> resetPassword({String? phone, String? email, required String otp, required String newPassword}) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/reset-password');
    final body = {
      'otp': otp,
      'newPassword': newPassword,
    };
    if (phone != null) body['phone'] = phone;
    if (email != null) body['email'] = email;

    try {
      final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: jsonEncode(body));
      final data = jsonDecode(response.body);
      if (response.statusCode != 200) throw Exception(data['message'] ?? 'Failed to reset password');
    } catch (e) {
      _handleError(e);
    }
  }
}
