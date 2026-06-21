import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colors.dart';
import '../widgets/tdg_button.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedCategory = 'Order Issue';
  bool _isSubmitting = false;

  final List<String> _categories = [
    'Order Issue',
    'Ruby Wallet & Rewards',
    'Den & Team Levels',
    'Referral Bonus',
    'Technical Support',
    'Other'
  ];

  final List<Map<String, String>> _faqs = [
    {
      'question': 'How do I unlock my 400 welcome Rubies?',
      'answer': 'Your welcome Rubies are credited to your wallet immediately but remain locked. They automatically unlock and become redeemable once your total order amount across all dens exceeds ₹1,000.'
    },
    {
      'question': 'What is the minimum value for Ruby redemption?',
      'answer': 'To initiate a redemption or withdrawal to your bank account, you must have a minimum balance of 3,000 unlocked Rubies. Peer-to-peer transfers are limited to 200 Rubies per transaction.'
    },
    {
      'question': 'How does the Den tier progression work?',
      'answer': 'Members start at Bronze and progress through Silver, Gold, Platinum, Diamond, and Emerald tiers by building and active participation in Dens. Completing 10 full Dens rewards you with the "Pride Lion" status.'
    },
    {
      'question': 'How much do I earn from referrals?',
      'answer': 'You earn 25 Rubies for every friend who signs up using your unique referral code. Additionally, your referred friend gets a bonus of 50 Rubies credited to their wallet upon account creation.'
    }
  ];

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.greenAccent, size: 20),
            const SizedBox(width: 8),
            Text('$label copied to clipboard!', style: GoogleFonts.outfit(color: Colors.white)),
          ],
        ),
        backgroundColor: TDGColors.cardMid,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _submitTicket() {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);
    
    // Simulate API submission
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      
      _subjectController.clear();
      _messageController.clear();
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: TDGColors.cardMid,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: TDGColors.gold.withOpacity(0.3)),
          ),
          title: Text(
            'TICKET SUBMITTED',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              color: TDGColors.gold,
              fontWeight: FontWeight.w900,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: TDGColors.green.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_circle_outline_rounded, size: 48, color: TDGColors.green),
              ),
              const SizedBox(height: 16),
              Text(
                'Support Ticket Created!',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We have received your request. Our support representative will contact you shortly.',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  color: TDGColors.greyLight,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ],
          ),
          actions: [
            Center(
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'CLOSE',
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
    });
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
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
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF140F02), // Very rich dark gold/brown tone
                    Colors.black,
                  ],
                  stops: [0.0, 0.7],
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
          // Scaffold content
          SafeArea(
            child: Column(
              children: [
                // Custom App Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    children: [
                      const BackButton(color: Colors.white),
                      const SizedBox(width: 8),
                      Text(
                        'HELP & SUPPORT',
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    children: [
                      // Header Message
                      Text(
                        'Need assistance? We\'re here to help you get the best experience in The Lion Pride.',
                        style: GoogleFonts.outfit(
                          color: Colors.white70,
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Contact Methods Section
                      _buildContactCards(),

                      const SizedBox(height: 32),

                      // Submit a Support Ticket Section
                      _buildTicketForm(),

                      const SizedBox(height: 32),

                      // FAQ Accordion Section
                      _buildFaqSection(),
                      
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCards() {
    return Row(
      children: [
        // Phone Support Card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1C15).withOpacity(0.9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: TDGColors.gold.withOpacity(0.3), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: TDGColors.gold.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.phone_rounded, color: TDGColors.gold, size: 20),
                ),
                const SizedBox(height: 12),
                Text(
                  'Call Us',
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '+91 9442255279',
                  style: GoogleFonts.outfit(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () => _copyToClipboard('9442255279', 'Phone number'),
                  child: Row(
                    children: [
                      Icon(Icons.copy_rounded, color: TDGColors.gold, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        'Copy Number',
                        style: GoogleFonts.outfit(
                          color: TDGColors.gold,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        // Email Support Card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF161616).withOpacity(0.9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: TDGColors.border, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.mail_outline_rounded, color: Colors.white, size: 20),
                ),
                const SizedBox(height: 12),
                Text(
                  'Email Us',
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'info@tdg.in',
                  style: GoogleFonts.outfit(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () => _copyToClipboard('info@tdg.in', 'Email ID'),
                  child: Row(
                    children: [
                      Icon(Icons.copy_rounded, color: TDGColors.gold, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        'Copy Email',
                        style: GoogleFonts.outfit(
                          color: TDGColors.gold,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTicketForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SUBMIT A SUPPORT TICKET',
            style: GoogleFonts.outfit(
              color: TDGColors.gold,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          // Category Selector
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1B1B).withOpacity(0.8),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: TDGColors.border, width: 1.5),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedCategory,
                dropdownColor: TDGColors.cardMid,
                icon: Icon(Icons.keyboard_arrow_down_rounded, color: TDGColors.gold),
                isExpanded: true,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
                onChanged: (String? newValue) {
                  if (newValue != null) {
                    setState(() => _selectedCategory = newValue);
                  }
                },
                items: _categories.map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Subject
          TextFormField(
            controller: _subjectController,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
            validator: (value) => value == null || value.trim().isEmpty ? 'Please enter a subject' : null,
            decoration: InputDecoration(
              hintText: 'Subject',
              hintStyle: GoogleFonts.outfit(color: const Color(0xFF666666), fontSize: 14),
              fillColor: const Color(0xFF1B1B1B).withOpacity(0.8),
              filled: true,
              prefixIcon: Icon(Icons.title_rounded, color: TDGColors.gold, size: 20),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: TDGColors.border, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: TDGColors.gold.withOpacity(0.5), width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Message
          TextFormField(
            controller: _messageController,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
            maxLines: 5,
            validator: (value) => value == null || value.trim().isEmpty ? 'Please enter your message' : null,
            decoration: InputDecoration(
              hintText: 'Describe your issue in detail...',
              hintStyle: GoogleFonts.outfit(color: const Color(0xFF666666), fontSize: 14),
              fillColor: const Color(0xFF1B1B1B).withOpacity(0.8),
              filled: true,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: TDGColors.border, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: TDGColors.gold.withOpacity(0.5), width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 20),
          TDGButton(
            text: 'Submit Ticket',
            isLoading: _isSubmitting,
            onPressed: _submitTicket,
          ),
        ],
      ),
    );
  }

  Widget _buildFaqSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'FREQUENTLY ASKED QUESTIONS',
          style: GoogleFonts.outfit(
            color: TDGColors.gold,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        ..._faqs.map((faq) => _buildFaqItem(faq['question']!, faq['answer']!)).toList(),
      ],
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: TDGColors.border),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          iconColor: TDGColors.gold,
          collapsedIconColor: TDGColors.grey,
          title: Text(
            question,
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: GoogleFonts.outfit(
                  color: Colors.white70,
                  fontSize: 13,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
