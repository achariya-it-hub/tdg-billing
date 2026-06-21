import 'package:flutter/material.dart';
import '../theme/colors.dart';

class TDGButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Widget? icon;
  final double? width;
  final double height;
  final bool isFullWidth;
  final LinearGradient? gradient;
  final bool isLoading;
  final BorderRadius? borderRadius;

  const TDGButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.width,
    this.height = 52,
    this.isFullWidth = true,
    this.gradient,
    this.isLoading = false,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: isFullWidth ? (width ?? double.infinity) : width,
      height: height,
      decoration: BoxDecoration(
        gradient: gradient ?? TDGColors.embossedRedGradient,
        borderRadius: borderRadius ?? BorderRadius.circular(12),
        border: Border.all(
          color: (gradient != null ? TDGColors.gold : const Color(0xFFD63D3C)).withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          // Bottom outer shadow (dark)
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            offset: const Offset(0, 6),
            blurRadius: 10,
            spreadRadius: -2,
          ),
          // Top inner highlight
          BoxShadow(
            color: Colors.white.withOpacity(0.2),
            offset: const Offset(0, -2),
            blurRadius: 2,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: borderRadius ?? BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: isLoading
                ? Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          gradient != null ? Colors.black : Colors.white,
                        ),
                      ),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        text,
                        style: TextStyle(
                          color: gradient != null ? Colors.black : Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                          shadows: [
                            Shadow(
                              color: gradient != null ? Colors.transparent : Colors.black26,
                              offset: const Offset(0, 2),
                              blurRadius: 2,
                            ),
                          ],
                        ),
                      ),
                      if (icon != null) ...[
                        const SizedBox(width: 8),
                        icon!,
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
