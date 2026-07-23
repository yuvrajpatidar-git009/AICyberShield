// Dashboard — Security Score Hub

import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useApp } from '@/hooks/useApp';
import { useLanguage } from '@/hooks/useLanguage';
import { SecurityGauge } from '@/components/ui/SecurityGauge';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThreatCard } from '@/components/feature/ThreatCard';
import { BadgeCard } from '@/components/feature/BadgeCard';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { BADGES } from '@/constants/config';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, scoreBreakdown, recentScans, isLoading, refreshAll } = useApp();
  const { lang, t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    refreshAll();
  }, []);

  const score = scoreBreakdown?.total ?? 0;
  const scoreColor = scoreBreakdown?.color ?? Colors.neon.red;
  const statusLabel = scoreBreakdown ? (lang === 'hi' ? scoreBreakdown.labelHi : scoreBreakdown.label) : '...';
  const earnedBadges = new Set(user?.badges_earned ?? []);

  const scoreComponents = [
    {
      key: 'password',
      label_en: 'Password',
      label_hi: 'Password',
      icon: 'lock' as const,
      value: scoreBreakdown?.password ?? 0,
      max: 15,
      color: Colors.neon.cyan,
    },
    {
      key: 'healthCheck',
      label_en: 'Health Check',
      label_hi: 'Health Check',
      icon: 'favorite' as const,
      value: scoreBreakdown?.healthCheck ?? 0,
      max: 35,
      color: Colors.neon.green,
    },
    {
      key: 'learning',
      label_en: 'Learning',
      label_hi: 'Learning',
      icon: 'school' as const,
      value: scoreBreakdown?.learning ?? 0,
      max: 25,
      color: Colors.neon.amber,
    },
    {
      key: 'cleanScans',
      label_en: 'Clean Scans',
      label_hi: 'Clean Scans',
      icon: 'shield' as const,
      value: scoreBreakdown?.cleanScans ?? 0,
      max: 25,
      color: Colors.neon.cyan,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/shield-hero.png')} style={styles.logo} contentFit="contain" />
          <View>
            <Text style={styles.appName}>AI Cyber Shield</Text>
            <Text style={styles.tagline}>{t('Your Digital Bodyguard', 'Har User ka Digital Bodyguard')}</Text>
          </View>
        </View>
        <LanguageToggle />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Security Score Gauge */}
        <GlassCard
          borderColor={scoreColor}
          glowColor={scoreColor}
          style={styles.gaugeCard}
        >
          <View style={styles.gaugeRow}>
            <SecurityGauge
              score={score}
              label={statusLabel}
              labelHi={scoreBreakdown?.labelHi ?? '...'}
              color={scoreColor}
              size={180}
            />
            <View style={styles.gaugeInfo}>
              <Text style={styles.gaugeTitle}>
                {t('Security Score', 'Security Score')}
              </Text>
              <Text style={[styles.gaugeStatus, { color: scoreColor }]}>
                {statusLabel}
              </Text>
              <View style={styles.scoreBreakdownList}>
                {scoreComponents.map(comp => (
                  <View key={comp.key} style={styles.breakdownRow}>
                    <MaterialIcons name={comp.icon} size={12} color={comp.color} />
                    <Text style={styles.breakdownLabel}>
                      {lang === 'hi' ? comp.label_hi : comp.label_en}
                    </Text>
                    <View style={styles.breakdownBarBg}>
                      <View style={[
                        styles.breakdownBarFill,
                        {
                          width: `${(comp.value / comp.max) * 100}%`,
                          backgroundColor: comp.color,
                        }
                      ]} />
                    </View>
                    <Text style={[styles.breakdownVal, { color: comp.color }]}>
                      {comp.value}/{comp.max}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Quick Action Cards */}
        <Text style={styles.sectionTitle}>
          {t('Quick Actions', 'Quick Actions')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          {[
            { icon: 'search', label_en: 'Scan URL', label_hi: 'URL Scan', color: Colors.neon.cyan, route: '/scanner' },
            { icon: 'sms', label_en: 'Scam Check', label_hi: 'Scam Check', color: Colors.neon.amber, route: '/analyzer' },
            { icon: 'lock', label_en: 'Password', label_hi: 'Password', color: Colors.neon.green, route: '/password' },
            { icon: 'chat', label_en: 'AI Help', label_hi: 'AI Help', color: Colors.neon.cyan, route: '/chat' },
          ].map(item => (
            <GlassCard
              key={item.label_en}
              borderColor={item.color + '55'}
              glowColor={item.color}
              style={styles.quickCard}
            >
              <MaterialIcons name={item.icon as any} size={28} color={item.color} />
              <Text style={[styles.quickLabel, { color: item.color }]}>
                {lang === 'hi' ? item.label_hi : item.label_en}
              </Text>
            </GlassCard>
          ))}
        </ScrollView>

        {/* Badges */}
        <Text style={styles.sectionTitle}>
          {t('Your Badges', 'Aapke Badges')}
        </Text>
        <View style={styles.badgesRow}>
          {BADGES.map(badge => (
            <BadgeCard
              key={badge.id}
              icon={badge.icon}
              name={lang === 'hi' ? badge.name_hi : badge.name_en}
              color={badge.color}
              earned={earnedBadges.has(badge.id)}
            />
          ))}
        </View>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {t('Recent Scans', 'Recent Scans')}
            </Text>
            {recentScans.slice(0, 5).map(scan => (
              <ThreatCard key={scan.id} scan={scan} lang={lang} />
            ))}
          </>
        )}

        {recentScans.length === 0 && (
          <GlassCard style={styles.emptyState}>
            <MaterialIcons name="radar" size={36} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>
              {t('No scans yet', 'Abhi tak koi scan nahi')}
            </Text>
            <Text style={styles.emptyText}>
              {t(
                'Use the Scanner or Scam AI tabs to analyze suspicious links and messages.',
                'Scanner ya Scam AI tab use karo suspicious links aur messages check karne ke liye.'
              )}
            </Text>
          </GlassCard>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neon.cyan,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
  gaugeCard: {
    marginBottom: Spacing.lg,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  gaugeInfo: {
    flex: 1,
  },
  gaugeTitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  gaugeStatus: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: 4,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  scoreBreakdownList: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    width: 70,
    includeFontPadding: false,
  },
  breakdownBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.bg.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: 4,
    borderRadius: 2,
  },
  breakdownVal: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    width: 28,
    textAlign: 'right',
    includeFontPadding: false,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    includeFontPadding: false,
  },
  quickActionsScroll: {
    marginBottom: Spacing.md,
  },
  quickCard: {
    width: 90,
    alignItems: 'center',
    padding: Spacing.md,
    marginRight: Spacing.sm,
    gap: Spacing.sm,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    includeFontPadding: false,
  },
});
