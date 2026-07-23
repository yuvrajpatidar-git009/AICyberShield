// ThreatCard — displays a scan result with risk breakdown

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import type { ScanRecord } from '@/services/database';

interface ThreatCardProps {
  scan: ScanRecord;
  lang?: 'en' | 'hi';
}

const typeIcons: Record<string, string> = {
  URL: 'link',
  SCAM_TEXT: 'sms',
  APP_PERMISSION: 'security',
  PASSWORD: 'lock',
};

const typeLabels: Record<string, { en: string; hi: string }> = {
  URL: { en: 'URL Scan', hi: 'URL Scan' },
  SCAM_TEXT: { en: 'Scam Text', hi: 'Scam Text' },
  APP_PERMISSION: { en: 'App Check', hi: 'App Check' },
  PASSWORD: { en: 'Password', hi: 'Password' },
};

export function ThreatCard({ scan, lang = 'hi' }: ThreatCardProps) {
  const typeLabel = typeLabels[scan.type] || { en: scan.type, hi: scan.type };
  const iconName = typeIcons[scan.type] || 'search';
  const date = new Date(scan.created_at);
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const borderColor =
    scan.risk_level === 'SAFE' ? Colors.border.safe :
    scan.risk_level === 'WARNING' ? Colors.border.warning :
    Colors.border.danger;

  return (
    <GlassCard borderColor={borderColor} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: borderColor + '22' }]}>
          <MaterialIcons name={iconName as any} size={18} color={borderColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.type}>{lang === 'hi' ? typeLabel.hi : typeLabel.en}</Text>
          <Text style={styles.input} numberOfLines={1}>{scan.raw_input}</Text>
        </View>
        <View style={styles.right}>
          <RiskBadge level={scan.risk_level} lang={lang} size="sm" />
          <Text style={styles.time}>{dateStr} · {timeStr}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  type: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  input: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    marginTop: 2,
    includeFontPadding: false,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
});
