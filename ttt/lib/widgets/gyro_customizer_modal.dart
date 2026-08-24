import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void showGyroCustomizerModal({
  required BuildContext context,
  required Map<String, dynamic> item,
  required Function(Map<String, dynamic> customizedItem) onAdd,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: const Color(0xFFF1F5F9),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (ctx) => _GyroCustomizerContent(item: item, onAdd: onAdd),
  );
}

bool isItemCustomizable(Map<String, dynamic> item) {
  final nameLower = (item['name'] ?? '').toString().toLowerCase();
  final catLower = (item['category'] ?? '').toString().toLowerCase();

  return nameLower.contains('gyro') || catLower.contains('gyro') ||
         nameLower.contains('wrap') || catLower.contains('wrap') ||
         nameLower.contains('combo') || catLower.contains('combo') ||
         nameLower.contains('meal') || catLower.contains('meal') ||
         nameLower.contains('box') || nameLower.contains('feast') ||
         nameLower.contains('bucket') || nameLower.contains('rice') ||
         nameLower.contains('salad') || catLower.contains('salad') ||
         catLower.contains('protein');
}

class _GyroCustomizerContent extends StatefulWidget {
  final Map<String, dynamic> item;
  final Function(Map<String, dynamic> customizedItem) onAdd;

  const _GyroCustomizerContent({
    required this.item,
    required this.onAdd,
  });

  @override
  State<_GyroCustomizerContent> createState() => _GyroCustomizerContentState();
}

class _GyroCustomizerContentState extends State<_GyroCustomizerContent> {
  late bool _isDualCombo;
  late bool _isMealCombo;
  late bool _isRiceSalad;
  late int _drinkCount;
  late int _dipCount;

  // Single Gyro & Rice/Salad State
  late String _selectedProtein;
  late String _selectedFlavor;
  late String _selectedBread;
  final List<String> _selectedSauces = ['Garlic Mayo'];
  final List<String> _selectedVeggies = ['Lettuce', 'Onion'];

  // Dual Gyro State
  String _gyro1Protein = 'Non-Veg Chicken';
  String _gyro1Flavor = 'Spicy';
  String _gyro1Bread = 'Baked Pita';
  String _gyro1Spread = 'Tzatziki';

  String _gyro2Protein = 'Veg Paneer';
  String _gyro2Flavor = 'Spicy';
  String _gyro2Bread = 'Baked Pita';
  String _gyro2Spread = 'Tzatziki';

  // Drink Selections
  final List<String> _selectedDrinks = [
    'Coca-Cola',
    'Sprite',
    'Fanta',
    'Peach Ice Tea',
    'Lime Ice Tea',
  ];

  // Dip Selections
  final List<String> _selectedDips = [
    'Garlic Mayo Dip',
    'Spicy Mayo Dip',
    'Tzatziki Dip',
  ];

  final TextEditingController _notesController = TextEditingController();

  final List<String> _proteins = ['Non-Veg Chicken', 'Veg Paneer'];
  final List<String> _flavors = ['Spicy', 'Creamy', 'BBQ', 'Signature'];
  final List<String> _breads = ['Baked Pita', 'Fried Pita'];
  final List<String> _spreads = ['Tzatziki', 'Hummus', 'Cheese', 'Ricotta'];
  final List<String> _availableDrinks = [
    'Coca-Cola',
    'Sprite',
    'Fanta',
    'Peach Ice Tea',
    'Lime Ice Tea',
    'Water Bottle',
  ];

  final List<String> _availableDips = [
    'Garlic Mayo Dip',
    'Spicy Mayo Dip',
    'Tzatziki Dip',
    'Peri Peri Dip',
    'Jalapeno Cheese Dip',
    'Turkish Chili Dip',
  ];

  final List<String> _sauces = [
    'Turkish Chili',
    'Jalapeno Cheese',
    'Garlic Mayo',
    'Spicy Mayo',
    'Peri Peri',
    'Honey Mustard',
    'Tzatziki',
  ];

  final List<String> _veggies = [
    'Lettuce',
    'Onion',
    'Jalapeno',
    'Olive',
    'Capsicum',
    'Tomato',
    'Cucumber',
    'Beans',
  ];

  @override
  void initState() {
    super.initState();
    final nameLower = (widget.item['name'] ?? '').toString().toLowerCase();
    final catLower = (widget.item['category'] ?? '').toString().toLowerCase();

    _isDualCombo = nameLower.contains('duo') ||
        nameLower.contains('double') ||
        nameLower.contains('party') ||
        nameLower.contains('mega') ||
        nameLower.contains('super 5') ||
        nameLower.contains('bucket');

    _isMealCombo = nameLower.contains('meal') ||
        nameLower.contains('combo') ||
        nameLower.contains('box') ||
        nameLower.contains('feast') ||
        catLower.contains('meal') ||
        catLower.contains('combo');

    _isRiceSalad = nameLower.contains('rice') ||
        nameLower.contains('salad') ||
        catLower.contains('salad');

    if (nameLower.contains('party meal') || nameLower.contains("den's party")) {
      _drinkCount = 3;
    } else if (nameLower.contains('super 5')) {
      _drinkCount = 5;
    } else if (_isDualCombo) {
      _drinkCount = 2;
    } else if (_isMealCombo) {
      _drinkCount = 1;
    } else {
      _drinkCount = 0;
    }

    _dipCount = nameLower.contains('mega feast') ? 3 : 0;

    // Auto-detect protein
    if (nameLower.contains('paneer') || nameLower.contains('veg')) {
      _selectedProtein = 'Veg Paneer';
    } else {
      _selectedProtein = 'Non-Veg Chicken';
    }

    // Auto-detect flavor
    if (nameLower.contains('creamy')) {
      _selectedFlavor = 'Creamy';
    } else if (nameLower.contains('bbq')) {
      _selectedFlavor = 'BBQ';
    } else if (nameLower.contains('pesto') || nameLower.contains('signature')) {
      _selectedFlavor = 'Signature';
    } else {
      _selectedFlavor = 'Spicy';
    }

    // Auto-detect bread
    if (nameLower.contains('fried')) {
      _selectedBread = 'Fried Pita';
    } else {
      _selectedBread = 'Baked Pita';
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _toggleSauce(String sauce) {
    setState(() {
      if (_selectedSauces.contains(sauce)) {
        _selectedSauces.remove(sauce);
      } else {
        _selectedSauces.add(sauce);
      }
    });
  }

  void _toggleVeggie(String veggie) {
    setState(() {
      if (_selectedVeggies.contains(veggie)) {
        _selectedVeggies.remove(veggie);
      } else {
        _selectedVeggies.add(veggie);
      }
    });
  }

  void _handleAdd() {
    final Map<String, dynamic> customDetails = {};

    if (_isDualCombo) {
      customDetails['gyro1'] = 'Gyro 1: $_gyro1Protein ($_gyro1Flavor, $_gyro1Spread Spread, $_gyro1Bread)';
      customDetails['gyro2'] = 'Gyro 2: $_gyro2Protein ($_gyro2Flavor, $_gyro2Spread Spread, $_gyro2Bread)';
    } else if (!_isRiceSalad) {
      customDetails['protein'] = _selectedProtein;
      customDetails['flavor'] = _selectedFlavor;
      customDetails['bread'] = _selectedBread;
      customDetails['sauces'] = List<String>.from(_selectedSauces);
      customDetails['veggies'] = List<String>.from(_selectedVeggies);
    } else {
      customDetails['protein'] = _selectedProtein;
      customDetails['sauces'] = List<String>.from(_selectedSauces);
      customDetails['veggies'] = List<String>.from(_selectedVeggies);
    }

    if (_drinkCount > 0) {
      customDetails['drink'] = _selectedDrinks.sublist(0, _drinkCount).join(', ');
    }

    if (_dipCount > 0) {
      customDetails['dips'] = _selectedDips.sublist(0, _dipCount).join(', ');
    }

    if (_notesController.text.trim().isNotEmpty) {
      customDetails['notes'] = _notesController.text.trim();
    }

    final customizedItem = {
      'name': widget.item['name'],
      'price': widget.item['price'] ?? widget.item['rate'] ?? 199,
      'qty': 1,
      'icon': Icons.restaurant_menu,
      'customization': customDetails,
    };

    Navigator.pop(context);
    widget.onAdd(customizedItem);
  }

  Widget _buildSectionHeader(String title, {bool isMulti = false}) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              color: const Color(0xFF0F172A),
              fontSize: 13,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (isMulti)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFDC2626).withOpacity(0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'MULTI',
                style: GoogleFonts.outfit(
                  color: const Color(0xFFDC2626),
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDualGyroSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Gyro 1
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'GYRO 1 CUSTOMIZATION',
                style: GoogleFonts.outfit(color: const Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Row(
                children: _proteins.map((p) {
                  final isSel = _gyro1Protein == p;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _gyro1Protein = p),
                      child: Container(
                        margin: EdgeInsets.only(right: p == _proteins.first ? 6 : 0),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFFFF5F5) : Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isSel ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1), width: isSel ? 2 : 1),
                        ),
                        child: Text(p, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w800, color: isSel ? const Color(0xFFEF4444) : const Color(0xFF334155))),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                crossAxisSpacing: 4,
                childAspectRatio: 2.2,
                children: _flavors.map((f) {
                  final isSel = _gyro1Flavor == f;
                  return GestureDetector(
                    onTap: () => setState(() => _gyro1Flavor = f),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFFEF4444) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSel ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1)),
                      ),
                      child: Text(f, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155))),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              Text('Base Spread:', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
              const SizedBox(height: 4),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                crossAxisSpacing: 4,
                childAspectRatio: 2.2,
                children: _spreads.map((s) {
                  final isSel = _gyro1Spread == s;
                  return GestureDetector(
                    onTap: () => setState(() => _gyro1Spread = s),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFFEF4444) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSel ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1)),
                      ),
                      child: Text(s, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155))),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Gyro 2
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'GYRO 2 CUSTOMIZATION',
                style: GoogleFonts.outfit(color: const Color(0xFF2563EB), fontSize: 13, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Row(
                children: _proteins.map((p) {
                  final isSel = _gyro2Protein == p;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _gyro2Protein = p),
                      child: Container(
                        margin: EdgeInsets.only(right: p == _proteins.first ? 6 : 0),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFEFF6FF) : Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1), width: isSel ? 2 : 1),
                        ),
                        child: Text(p, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w800, color: isSel ? const Color(0xFF1E40AF) : const Color(0xFF334155))),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                crossAxisSpacing: 4,
                childAspectRatio: 2.2,
                children: _flavors.map((f) {
                  final isSel = _gyro2Flavor == f;
                  return GestureDetector(
                    onTap: () => setState(() => _gyro2Flavor = f),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFF2563EB) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1)),
                      ),
                      child: Text(f, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155))),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              Text('Base Spread:', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF475569))),
              const SizedBox(height: 4),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                crossAxisSpacing: 4,
                childAspectRatio: 2.2,
                children: _spreads.map((s) {
                  final isSel = _gyro2Spread == s;
                  return GestureDetector(
                    onTap: () => setState(() => _gyro2Spread = s),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFF2563EB) : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1)),
                      ),
                      child: Text(s, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155))),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDrinksSection() {
    if (_drinkCount <= 0) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '🥤 CHOOSE YOUR $_drinkCount DRINK${_drinkCount > 1 ? "S" : ""}',
            style: GoogleFonts.outfit(color: const Color(0xFF15803D), fontSize: 12.5, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          ...List.generate(_drinkCount, (idx) {
            final currentVal = _selectedDrinks[idx];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${idx + 1}. Select Drink', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF166534))),
                  const SizedBox(height: 4),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 3,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                    childAspectRatio: 2.5,
                    children: _availableDrinks.map((drink) {
                      final isSel = currentVal == drink;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedDrinks[idx] = drink),
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFF16A34A) : Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: isSel ? const Color(0xFF16A34A) : const Color(0xFFCBD5E1)),
                          ),
                          child: Text(
                            '${isSel ? "✓ " : ""}$drink',
                            style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155)),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDipsSection() {
    if (_dipCount <= 0) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '🧄 CHOOSE YOUR $_dipCount DIPS',
            style: GoogleFonts.outfit(color: const Color(0xFFC2410C), fontSize: 12.5, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          ...List.generate(_dipCount, (idx) {
            final currentVal = _selectedDips[idx];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${idx + 1}. Select Dip', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF9A3412))),
                  const SizedBox(height: 4),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 3,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                    childAspectRatio: 2.5,
                    children: _availableDips.map((dip) {
                      final isSel = currentVal == dip;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedDips[idx] = dip),
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFFEA580C) : Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: isSel ? const Color(0xFFEA580C) : const Color(0xFFCBD5E1)),
                          ),
                          child: Text(
                            '${isSel ? "✓ " : ""}$dip',
                            style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF334155)),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final priceVal = widget.item['price'] ?? widget.item['rate'] ?? 199;

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF1F5F9),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 16, 12),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'Customize ${widget.item['name']}',
                        style: GoogleFonts.outfit(
                          color: const Color(0xFF0F172A),
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.close, color: Color(0xFF475569), size: 20),
                      ),
                    ),
                  ],
                ),
              ),

              // Customizer Options List
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (_isDualCombo) ...[
                      _buildDualGyroSection(),
                      _buildDrinksSection(),
                      _buildDipsSection(),
                    ] else ...[
                      // 1. Choose Protein
                      _buildSectionHeader('1. Choose Protein *'),
                      Row(
                        children: _proteins.map((protein) {
                          final isSelected = _selectedProtein == protein;
                          final isNonVeg = protein.contains('Non-Veg');
                          return Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _selectedProtein = protein),
                              child: Container(
                                margin: EdgeInsets.only(right: protein == _proteins.first ? 8 : 0),
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected
                                        ? (isNonVeg ? const Color(0xFFEF4444) : const Color(0xFF10B981))
                                        : const Color(0xFFCBD5E1),
                                    width: isSelected ? 2 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: isNonVeg ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      protein,
                                      style: GoogleFonts.outfit(
                                        color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF475569),
                                        fontSize: 12,
                                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      if (!_isRiceSalad) ...[
                        // 2. Flavor / Style
                        _buildSectionHeader('2. Flavor / Style *'),
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 4,
                          crossAxisSpacing: 6,
                          mainAxisSpacing: 6,
                          childAspectRatio: 2.2,
                          children: _flavors.map((flavor) {
                            final isSelected = _selectedFlavor == flavor;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedFlavor = flavor),
                              child: Container(
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFFEF4444) : Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isSelected ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1),
                                  ),
                                ),
                                child: Text(
                                  '${isSelected ? "✓ " : ""}$flavor',
                                  style: GoogleFonts.outfit(
                                    color: isSelected ? Colors.white : const Color(0xFF334155),
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        // 3. Choose Pita Bread
                        _buildSectionHeader('3. Choose Pita Bread *'),
                        Row(
                          children: _breads.map((bread) {
                            final isSelected = _selectedBread == bread;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedBread = bread),
                                child: Container(
                                  margin: EdgeInsets.only(right: bread == _breads.first ? 8 : 0),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
                                      width: isSelected ? 2 : 1,
                                    ),
                                  ),
                                  child: Text(
                                    bread,
                                    style: GoogleFonts.outfit(
                                      color: isSelected ? const Color(0xFF1E40AF) : const Color(0xFF475569),
                                      fontSize: 12.5,
                                      fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],

                      // Sauces / Dressings
                      _buildSectionHeader(_isRiceSalad ? '2. Sauces & Dressings' : '4. Choose Sauces (Select Multiple)', isMulti: true),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 3,
                        crossAxisSpacing: 6,
                        mainAxisSpacing: 6,
                        childAspectRatio: 2.5,
                        children: _sauces.map((sauce) {
                          final isSelected = _selectedSauces.contains(sauce);
                          return GestureDetector(
                            onTap: () => _toggleSauce(sauce),
                            child: Container(
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFFEF4444) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFFEF4444) : const Color(0xFFCBD5E1),
                                ),
                              ),
                              child: Text(
                                '${isSelected ? "✓ " : ""}$sauce',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      // Fresh Veggies & Toppings
                      _buildSectionHeader(_isRiceSalad ? '3. Fresh Veggies & Toppings' : '5. Fresh Veggies & Toppings (Select Multiple)', isMulti: true),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 4,
                        crossAxisSpacing: 6,
                        mainAxisSpacing: 6,
                        childAspectRatio: 2.2,
                        children: _veggies.map((veggie) {
                          final isSelected = _selectedVeggies.contains(veggie);
                          return GestureDetector(
                            onTap: () => _toggleVeggie(veggie),
                            child: Container(
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(horizontal: 2),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF10B981) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
                                ),
                              ),
                              child: Text(
                                '${isSelected ? "✓ " : ""}$veggie',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      _buildDrinksSection(),
                      _buildDipsSection(),
                    ],

                    // Special Cooking Notes
                    _buildSectionHeader('📝 Special Cooking Notes (Optional)'),
                    TextField(
                      controller: _notesController,
                      style: GoogleFonts.outfit(color: const Color(0xFF0F172A), fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'e.g. Extra sauce, no onion, toasted crispy...',
                        hintStyle: GoogleFonts.outfit(color: const Color(0xFF94A3B8), fontSize: 12),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),

              // Bottom Button Container
              SafeArea(
                top: false,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 12,
                        offset: Offset(0, -4),
                      ),
                    ],
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _handleAdd,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFCC00),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 2,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Add Customized Item to Cart (₹$priceVal)',
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.shopping_cart_outlined, size: 18),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
