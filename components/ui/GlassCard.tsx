// GlassCard — Glassmorphism panel component

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  glowColor?: string;
  noPadding?: boolean;
}

export function GlassCard({ children, style, borderColor, glowColor, noPadding }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        borderColor ? { borderColor, borderWidth: 1 } : {},
        glowColor ? {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        } : {},
        noPadding ? { padding: 0 } : {},
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.glass,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
});
