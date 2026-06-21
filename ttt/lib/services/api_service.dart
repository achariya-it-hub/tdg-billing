import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // In-memory token storage
  String? _token;
  Map<String, dynamic>? currentUser;

  bool get isAuthenticated => _token != null;

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
  }

  // --- AUTH ENDPOINTS ---

  Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/signup');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        _token = data['token'];
        currentUser = data['user'];
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to signup');
      }
    } catch (e) {
      rethrow;
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
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        _token = data['token'];
        currentUser = data['user'];
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to login');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    final url = Uri.parse('${AppConfig.baseUrl}/auth/profile');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        currentUser = data;
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load profile');
      }
    } catch (e) {
      rethrow;
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
        body: jsonEncode({
          'name': name,
          'phone': phone,
          'email': email,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        currentUser = data;
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      rethrow;
    }
  }

  // --- MENU ENDPOINTS ---

  Future<Map<String, dynamic>> getMenu() async {
    final url = Uri.parse('${AppConfig.baseUrl}/menu');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load menu');
      }
    } catch (e) {
      rethrow;
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
          'items': items,
          'subtotal': subtotal,
          'tax': tax,
          'deliveryFee': deliveryFee,
          'total': total,
          'paymentMethod': paymentMethod,
          'deliveryAddress': deliveryAddress,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        // Sync balance if returned
        if (currentUser != null && data['rubyBalance'] != null) {
          currentUser!['rubyBalance'] = data['rubyBalance'];
        }
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to place order');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getOrders() async {
    final url = Uri.parse('${AppConfig.baseUrl}/orders');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load orders');
      }
    } catch (e) {
      rethrow;
    }
  }

  // --- WALLET ENDPOINTS ---

  Future<Map<String, dynamic>> getWallet() async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (currentUser != null) {
          currentUser!['rubyBalance'] = data['rubyBalance'];
          currentUser!['scratchCards'] = data['scratchCards'];
        }
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load wallet');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> scratchCard(String cardId) async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet/scratch');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'cardId': cardId}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (currentUser != null) {
          currentUser!['rubyBalance'] = data['rubyBalance'];
          currentUser!['scratchCards'] = data['scratchCards'];
        }
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to scratch card');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addRubies(double amount) async {
    final url = Uri.parse('${AppConfig.baseUrl}/wallet/add');
    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'amount': amount}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (currentUser != null) {
          currentUser!['rubyBalance'] = data['rubyBalance'];
          currentUser!['scratchCards'] = data['scratchCards'];
        }
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to add rubies');
      }
    } catch (e) {
      rethrow;
    }
  }

  // --- DEN PROGRESS ENDPOINTS ---

  Future<Map<String, dynamic>> getDenProgress() async {
    final url = Uri.parse('${AppConfig.baseUrl}/den');
    try {
      final response = await http.get(url, headers: _getHeaders());
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (currentUser != null) {
          currentUser!['denLevel'] = data['denLevel'];
          currentUser!['completedDens'] = data['completedDens'];
          currentUser!['denProgress'] = data['denProgress'];
        }
        return data;
      } else {
        throw Exception(data['message'] ?? 'Failed to load Den progress');
      }
    } catch (e) {
      rethrow;
    }
  }
}
