import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';
import '../utils/responsive.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _nameController = TextEditingController(text: 'Rohit Sharma');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _emailController = TextEditingController(text: 'rohit.sharma@example.com');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      appBar: AppBar(
        backgroundColor: TDGColors.background,
        elevation: 0,
        leading: BackButton(color: TDGColors.white),
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
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Profile updated successfully')),
                  );
                },
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
