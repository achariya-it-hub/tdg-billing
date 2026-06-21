import 'package:flutter/material.dart';

class TDGLogo extends StatelessWidget {
  final double width;
  const TDGLogo({super.key, this.width = 180});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: width,
      fit: BoxFit.contain,
    );
  }
}
