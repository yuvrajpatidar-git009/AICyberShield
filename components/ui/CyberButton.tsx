// CyberButton — Neon-styled interactive button

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface CyberButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: { bg: Colors.neon.cyanGlow, border: Colors.neon.cyan, text: Colors.neon.cyan, glow: Colors.neon.cyan },
  danger: { bg: Colors.neon.redGlow, border: Colors.neon.red, text: Colors.neon.red, glow: Colors.neon.red },
  success: { bg: Colors.neon.greenGlow, border: Colors.neon.green, text: Colors.neon.green, glow: Colors.neon.green },
  warning: { bg: Colors.neon.amberGlow, border: Colors.neon.amber, text: Colors.neon.amber, glow: Colors.neon.amber },
  ghost: { bg: 'transparent', border: Colors.border.subtle, text: Colors.text.secondary, glow: 'transparent' },
};

const sizeStyles = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: FontSize.sm, borderRadius: BorderRadius.sm },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: FontSize.md, borderRadius: BorderRadius.md },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FontSize.base, borderRadius: BorderRadius.lg },
};

export function CyberButton({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, fullWidth,
}: CyberButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          shadowColor: v.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: pressed ? 0.6 : 0.3,
          shadowRadius: pressed ? 16 : 8,
          elevation: pressed ? 10 : 5,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
});
