import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/main_nav_screen.dart';
import 'theme/colors.dart';
import 'services/api_service.dart';

void main() async {
  HttpOverrides.global = _TDGHttpOverrides();
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarDividerColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  await ApiService().init();
  runApp(const TDGApp());
}

class _TDGHttpOverrides extends HttpOverrides {
  @override
  String findProxy(Uri uri) => 'DIRECT';
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
          systemNavigationBarColor: Colors.transparent,
          systemNavigationBarDividerColor: Colors.transparent,
          systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
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
          home: api.isAuthenticated ? const MainNavScreen() : const LoginScreen(),
        );
      },
    );
  }
}
