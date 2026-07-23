// RiskBadge — Color-coded risk level indicator

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '@/constants/theme';

type RiskLevel = 'SAFE' | 'WARNING' | 'DANGEROUS';

const riskConfig = {
  SAFE: {
    icon: 'shield' as const,
    color: Colors.risk.safe,
    bg: Colors.risk.safeGlow,
    border: Colors.border.safe,
    label_en: 'SAFE',
    label_hi: 'SURAKSHIT',
  },
  WARNING: {
    icon: 'warning' as const,
    color: Colors.risk.warning,
    bg: Colors.risk.warningGlow,
    border: Colors.border.warning,
    label_en: 'WARNING',
    label_hi: 'SAWDHAAN',
  },
  DANGEROUS: {
    icon: 'dangerous' as const,
    color: Colors.risk.danger,
    bg: Colors.risk.dangerGlow,
    border: Colors.border.danger,
    label_en: 'DANGEROUS',
    label_hi: 'KHATARNAK',
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  lang?: 'en' | 'hi';
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, lang = 'en', size = 'md' }: RiskBadgeProps) {
  const config = riskConfig[level];
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  const fontSize = size === 'sm' ? FontSize.xs : size === 'md' ? FontSize.sm : FontSize.md;

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.bg,
        borderColor: config.border,
        shadowColor: config.color,
        paddingVertical: size === 'sm' ? 4 : 6,
        paddingHorizontal: size === 'sm' ? 8 : 12,
      }
    ]}>
      <MaterialIcons name={config.icon} size={iconSize} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize }]}>
        {lang === 'hi' ? config.label_hi : config.label_en}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    includeFontPadding: false,
  },
});
