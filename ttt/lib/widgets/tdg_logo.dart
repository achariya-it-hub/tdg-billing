import 'package:flutter/material.dart';

class TDGLogo extends StatelessWidget {
  final double width;
  final double? height;
  const TDGLogo({super.key, this.width = 180, this.height});

  @override
  Widget build(BuildContext context) {
    final size = height ?? width;
    return SizedBox(
      width: width,
      height: size,
      child: AspectRatio(
        aspectRatio: 1.0,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(size * 0.18),
          child: Image.asset(
            'assets/images/logo.png',
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}
