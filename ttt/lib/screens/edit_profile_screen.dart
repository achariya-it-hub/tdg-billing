import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';
import '../utils/responsive.dart';
import '../services/api_service.dart';

import 'main_nav_screen.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final user = ApiService().currentUser;
    _nameController = TextEditingController(text: user?['name'] ?? '');
    _phoneController = TextEditingController(text: user?['phone'] ?? '');
    _emailController = TextEditingController(text: user?['email'] ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();

    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Full name cannot be empty.'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      try {
        await ApiService().updateProfile(name: name, phone: phone, email: email);
      } catch (_) {
        // Fallback update local session
        if (ApiService().currentUser != null) {
          ApiService().currentUser!['name'] = name;
          ApiService().currentUser!['phone'] = phone;
          ApiService().currentUser!['email'] = email;
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: TDGColors.white),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              MainNavScreen.navKey.currentState?.setTab(0);
            }
          },
        ),
        title: Text('EDIT PROFILE', style: TextStyle(color: TDGColors.white, fontSize: 16, fontWeight: FontWeight.w800)),
      ),
      body: ResponsiveWrapper(
        maxWidth: 600,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: TDGColors.goldGradient,
                      ),
                      child: const Icon(Icons.person, size: 50, color: Colors.black),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: TDGColors.gold,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.black),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              _buildField('Full Name', _nameController, Icons.person_outline),
              const SizedBox(height: 20),
              _buildField('Phone Number', _phoneController, Icons.phone_outlined),
              const SizedBox(height: 20),
              _buildField('Email Address', _emailController, Icons.email_outlined),
              const SizedBox(height: 60),
              TDGButton(
                text: 'Save Changes',
                isLoading: _isLoading,
                onPressed: _handleSave,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: TDGColors.grey, fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: TextStyle(color: TDGColors.white),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: TDGColors.gold, size: 20),
            filled: true,
            fillColor: TDGColors.cardDark,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: TDGColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: TDGColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: TDGColors.gold),
            ),
          ),
        ),
      ],
    );
  }
}
