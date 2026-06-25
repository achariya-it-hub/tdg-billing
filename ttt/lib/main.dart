import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/onboarding_screen.dart';
import 'screens/main_nav_screen.dart';
import 'theme/colors.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  await ApiService().init();
  runApp(const TDGApp());
}

class TDGApp extends StatelessWidget {
  const TDGApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ThemeManager(),
      builder: (context, _) {
        final isDark = ThemeManager().isDarkMode;
        SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
          statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
        ));

        final api = ApiService();

        return MaterialApp(
          title: 'Ten Dens Gyros',
          debugShowCheckedModeBanner: false,
          themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
          theme: ThemeData(
            brightness: Brightness.light,
            scaffoldBackgroundColor: TDGColors.background,
            primaryColor: TDGColors.gold,
            fontFamily: 'Roboto',
            colorScheme: ColorScheme.light(
              primary: TDGColors.gold,
              surface: TDGColors.cardDark,
            ),
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            scaffoldBackgroundColor: TDGColors.background,
            primaryColor: TDGColors.gold,
            fontFamily: 'Roboto',
            colorScheme: ColorScheme.dark(
              primary: TDGColors.gold,
              surface: TDGColors.cardDark,
            ),
          ),
          home: api.isAuthenticated ? const MainNavScreen() : const OnboardingScreen(),
        );
      },
    );
  }
}
