import 'package:flutter/material.dart';

class ThemeManager extends ChangeNotifier {
  static final ThemeManager _instance = ThemeManager._internal();
  factory ThemeManager() => _instance;
  ThemeManager._internal();

  bool _isDarkMode = true;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  void setDarkMode(bool value) {
    _isDarkMode = value;
    notifyListeners();
  }
}

class TDGColors {
  static bool get isDark => ThemeManager().isDarkMode;

  static Color get background => isDark ? const Color(0xFF101619) : const Color(0xFFF5F7F8);
  static Color get cardDark => isDark ? const Color(0xFF141414) : const Color(0xFFFFFFFF);
  static Color get cardMid => isDark ? const Color(0xFF1A1A1A) : const Color(0xFFEFEFEF);
  static Color get cardLight => isDark ? const Color(0xFF222222) : const Color(0xFFE0E0E0);
  static Color get gold => const Color(0xFFFFCC00);
  static Color get goldDark => const Color(0xFFD4A800);
  static Color get goldDeep => const Color(0xFFB8860B);
  static Color get white => isDark ? const Color(0xFFFFFFFF) : const Color(0xFF101619);
  static Color get grey => isDark ? const Color(0xFF888888) : const Color(0xFF666666);
  static Color get greyLight => isDark ? const Color(0xFFAAAAAA) : const Color(0xFF444444);
  static Color get green => const Color(0xFF4CAF50);
  static Color get red => const Color(0xFFE53935);
  static Color get primaryRed => const Color(0xFFBC2221);
  static Color get amber => const Color(0xFFFFB300);
  static Color get border => isDark ? const Color(0xFF2A2A2A) : const Color(0xFFD0D0D0);
  static Color get bronze => const Color(0xFFCD7F32);
  static Color get silver => const Color(0xFFC0C0C0);

  static LinearGradient get goldGradient => const LinearGradient(
    colors: [Color(0xFFFFE066), Color(0xFFFFCC00), Color(0xFFD4A800)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient get cardGradient => isDark
      ? const LinearGradient(
          colors: [Color(0xFF1E1E1E), Color(0xFF111111)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        )
      : const LinearGradient(
          colors: [Color(0xFFFFFFFF), Color(0xFFF5F5F5)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        );

  static LinearGradient get bgGradient => isDark
      ? const LinearGradient(
          colors: [Color(0xFF162024), Color(0xFF101619)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        )
      : const LinearGradient(
          colors: [Color(0xFFFAFAFA), Color(0xFFF5F7F8)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        );

  static LinearGradient get walletGradient => const LinearGradient(
    colors: [Color(0xFFC8960C), Color(0xFF8B6914), Color(0xFFC8960C)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient get embossedRedGradient => const LinearGradient(
    colors: [Color(0xFFD63D3C), Color(0xFFBC2221), Color(0xFF8E1A19)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static LinearGradient get embossedGoldGradient => const LinearGradient(
    colors: [Color(0xFFFFD966), Color(0xFFFFCC00), Color(0xFFB48A00)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
