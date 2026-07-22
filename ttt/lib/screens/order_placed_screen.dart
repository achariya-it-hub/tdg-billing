import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'main_nav_screen.dart';
import '../widgets/tdg_button.dart';

class OrderPlacedScreen extends StatelessWidget {
  const OrderPlacedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TDGColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  BackButton(color: TDGColors.white),
                ],
              ),
            ),
            const Spacer(),
            // Confetti / success animation area
            Stack(
              alignment: Alignment.center,
              children: [
                // Gold glow
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        TDGColors.gold.withOpacity(0.2),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
                // Confetti dots
                ...List.generate(16, (i) {
                  final angle = i * 22.5;
                  final colors = [Colors.red, Colors.blue, Colors.green, TDGColors.gold, Colors.purple];
                  final r = 90.0;
                  final rad = angle * 3.14159 / 180;
                  return Positioned(
                    left: 100 + r * 0.8 * (i % 2 == 0 ? 1 : -1) * (i < 8 ? 1 : -1),
                    top: 100 + r * (i < 8 ? -1 : 1) * 0.6,
                    child: Container(
                      width: 6,
                      height: 10,
                      decoration: BoxDecoration(
                        color: colors[i % colors.length],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
                // Check circle
                Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: TDGColors.goldGradient,
                    boxShadow: [
                      BoxShadow(
                        color: TDGColors.gold.withOpacity(0.5),
                        blurRadius: 30,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Container(
                    margin: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF1A1200),
                    ),
                    child: Icon(
                      Icons.check_rounded,
                      color: TDGColors.gold,
                      size: 60,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            Text(
              'ORDER PLACED!',
              style: TextStyle(color: TDGColors.white,
                fontSize: 26,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Done thanks for your order',
              style: TextStyle(color: TDGColors.gold, fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Text(
              "We've received your order\nand it's being prepared.",
              textAlign: TextAlign.center,
              style: TextStyle(color: TDGColors.grey, fontSize: 14, height: 1.5),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 30),
              child: TDGButton(
                text: 'Back to Home',
                onPressed: () => Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const MainNavScreen()),
                  (_) => false,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
