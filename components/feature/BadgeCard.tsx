// BadgeCard — earned/locked badge display

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface BadgeCardProps {
  icon: string;
  name: string;
  color: string;
  earned: boolean;
}

export function BadgeCard({ icon, name, color, earned }: BadgeCardProps) {
  return (
    <View style={[
      styles.card,
      {
        borderColor: earned ? color + '66' : Colors.border.subtle,
        opacity: earned ? 1 : 0.4,
        backgroundColor: earned ? color + '12' : Colors.bg.glass,
        shadowColor: earned ? color : 'transparent',
      }
    ]}>
      <Text style={[styles.icon, !earned && styles.iconLocked]}>{earned ? icon : '🔒'}</Text>
      <Text style={[styles.name, { color: earned ? color : Colors.text.muted }]} numberOfLines={2}>
        {name}
      </Text>
      {earned && <View style={[styles.earnedDot, { backgroundColor: color }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  iconLocked: {
    opacity: 0.5,
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 15,
  },
  earnedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
});
