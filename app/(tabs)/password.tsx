// Zero-Knowledge Password Analyzer

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { analyzePassword, type PasswordAnalysis } from '@/services/passwordAnalyzer';
import { UsersRepo } from '@/services/database';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function PasswordScreen() {
  const insets = useSafeAreaInsets();
  const { refreshScore } = useApp();
  const { lang, t } = useLanguage();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  const handleChange = useCallback(async (text: string) => {
    setPassword(text);
    if (text.length === 0) {
      setAnalysis(null);
      return;
    }
    const result = analyzePassword(text);
    setAnalysis(result);

    // Update user password score in DB
    await UsersRepo.update({ password_score: result.score });
    if (result.score >= 60) {
      await UsersRepo.awardBadge('password_master');
    }
    await refreshScore();
  }, [refreshScore]);

  const entropyColor =
    !analysis ? Colors.text.muted :
    analysis.score >= 80 ? Colors.neon.green :
    analysis.score >= 60 ? Colors.neon.cyan :
    analysis.score >= 40 ? Colors.neon.amber :
    Colors.neon.red;

  const strengthBarWidth = analysis ? `${analysis.score}%` : '0%';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('🔐 Password Analyzer', '🔐 Password Analyzer')}</Text>
          <Text style={styles.subtitle}>
            {t('100% local — never sent to any server', '100% local — koi server pe nahi jaata')}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Privacy Notice */}
        <View style={styles.privacyBanner}>
          <MaterialIcons name="lock" size={14} color={Colors.neon.green} />
          <Text style={styles.privacyText}>
            {t(
              'Your password is analyzed ONLY on your device. It never leaves your phone.',
              'Aapka password SIRF aapke device pe analyze hota hai. Phone se bahar nahi jaata.'
            )}
          </Text>
        </View>

        {/* Input */}
        <GlassCard style={styles.inputCard}>
          <Text style={styles.label}>
            {t('Enter Password to Test', 'Test karne ke liye Password daalo')}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={handleChange}
              placeholder={t('Type a password...', 'Password type karo...')}
              placeholderTextColor={Colors.text.muted}
              style={styles.input}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setShowPassword(p => !p)}
              style={styles.eyeBtn}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={Colors.text.muted}
              />
            </Pressable>
          </View>

          {/* Strength Bar */}
          {password.length > 0 && analysis && (
            <View style={styles.strengthBar}>
              <View style={styles.strengthBarBg}>
                <View style={[
                  styles.strengthBarFill,
                  { width: strengthBarWidth as any, backgroundColor: entropyColor }
                ]} />
              </View>
              <Text style={[styles.strengthLabel, { color: entropyColor }]}>
                {lang === 'hi' ? analysis.strength_label_hi : analysis.strength_label_en}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Analysis Results */}
        {analysis && password.length > 0 && (
          <>
            {/* Score Overview */}
            <GlassCard borderColor={entropyColor} glowColor={entropyColor} style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreTitle}>{t('Strength Score', 'Strength Score')}</Text>
                  <Text style={[styles.scoreValue, { color: entropyColor }]}>
                    {analysis.score}<Text style={styles.scoreMax}>/100</Text>
                  </Text>
                  <Text style={[styles.strengthText, { color: entropyColor }]}>
                    {lang === 'hi' ? analysis.strength_label_hi : analysis.strength_label_en}
                  </Text>
                </View>
                <View style={styles.statsBlock}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('Entropy', 'Entropy')}</Text>
                    <Text style={[styles.statValue, { color: entropyColor }]}>
                      {analysis.entropy} <Text style={styles.statUnit}>bits</Text>
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('Length', 'Length')}</Text>
                    <Text style={[styles.statValue, { color: entropyColor }]}>
                      {analysis.length} <Text style={styles.statUnit}>chars</Text>
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t('Char Pool', 'Char Pool')}</Text>
                    <Text style={[styles.statValue, { color: entropyColor }]}>
                      {analysis.character_pool}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Crack Time */}
              <View style={styles.crackTimeRow}>
                <MaterialIcons name="timer" size={16} color={entropyColor} />
                <Text style={styles.crackTimeLabel}>
                  {t('Time to Crack (at 10¹⁰ guesses/sec):', 'Crack karne ka time (10¹⁰ guess/sec pe):')}
                </Text>
                <Text style={[styles.crackTimeValue, { color: entropyColor }]}>
                  {lang === 'hi' ? analysis.crack_time_hi : analysis.crack_time}
                </Text>
              </View>
            </GlassCard>

            {/* Checklist */}
            <GlassCard style={styles.checksCard}>
              <Text style={styles.checksTitle}>
                {t('Security Checklist', 'Security Checklist')}
              </Text>
              {analysis.checks.map((check, i) => (
                <View key={i} style={styles.checkRow}>
                  <MaterialIcons
                    name={check.passed ? 'check-circle' : 'cancel'}
                    size={16}
                    color={check.passed ? Colors.neon.green : Colors.neon.red}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.checkLabel,
                      { color: check.passed ? Colors.text.primary : Colors.text.secondary }
                    ]}>
                      {lang === 'hi' ? check.label_hi : check.label_en}
                    </Text>
                    <Text style={styles.checkImpact}>{check.impact}</Text>
                  </View>
                </View>
              ))}
            </GlassCard>

            {/* Suggestions */}
            {analysis.suggestions_en.length > 0 && (
              <GlassCard borderColor={Colors.border.warning} style={styles.suggestionsCard}>
                <Text style={styles.suggestionsTitle}>
                  {t('💡 Improvement Tips', '💡 Improve Karne ke Tips')}
                </Text>
                {(lang === 'hi' ? analysis.suggestions_hi : analysis.suggestions_en).map((s, i) => (
                  <View key={i} style={styles.suggestionRow}>
                    <Text style={styles.suggestionBullet}>→</Text>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </View>
                ))}
              </GlassCard>
            )}

            {/* Formula Info */}
            <GlassCard style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>
                {t('📐 Entropy Formula', '📐 Entropy Formula')}
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>
                  E = L × log₂(R){'\n'}
                  L = {analysis.length} chars  |  R = {analysis.character_pool} pool{'\n'}
                  E = {analysis.length} × log₂({analysis.character_pool}) = {analysis.entropy} bits
                </Text>
              </View>
              <Text style={styles.formulaNote}>
                {t(
                  'Crack time = 2^E ÷ (2 × 10¹⁰) seconds at brute-force speed.',
                  'Crack time = 2^E ÷ (2 × 10¹⁰) seconds brute-force speed pe.'
                )}
              </Text>
            </GlassCard>
          </>
        )}

        {/* Empty State */}
        {!password && (
          <GlassCard style={styles.emptyState}>
            <MaterialIcons name="lock-outline" size={48} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>
              {t('Enter any password above', 'Upar koi bhi password daalo')}
            </Text>
            <Text style={styles.emptyText}>
              {t(
                'Get instant entropy analysis, crack time estimation, and improvement suggestions.',
                'Turant entropy analysis, crack time estimation, aur improvement suggestions pao.'
              )}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neon.green,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.neon.greenGlow,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.safe,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  privacyText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.neon.green,
    lineHeight: 16,
    includeFontPadding: false,
  },
  inputCard: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.text.primary,
    includeFontPadding: false,
    letterSpacing: 2,
  },
  eyeBtn: { padding: 8 },
  strengthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bg.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 4,
  },
  strengthLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    width: 100,
    textAlign: 'right',
    includeFontPadding: false,
  },
  scoreCard: { marginBottom: Spacing.md },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreTitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: FontWeight.extrabold,
    includeFontPadding: false,
  },
  scoreMax: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.muted,
  },
  strengthText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  statsBlock: { gap: 6, alignItems: 'flex-end' },
  statRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted, includeFontPadding: false },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, includeFontPadding: false },
  statUnit: { fontSize: FontSize.xs, fontWeight: FontWeight.regular, color: Colors.text.muted },
  crackTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  crackTimeLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    flex: 1,
    includeFontPadding: false,
  },
  crackTimeValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  checksCard: { marginBottom: Spacing.md },
  checksTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkLabel: {
    fontSize: FontSize.sm,
    includeFontPadding: false,
  },
  checkImpact: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  suggestionsCard: { marginBottom: Spacing.md },
  suggestionsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neon.amber,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  suggestionRow: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  suggestionBullet: { color: Colors.neon.amber, fontSize: FontSize.sm, includeFontPadding: false },
  suggestionText: { flex: 1, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20, includeFontPadding: false },
  formulaCard: { marginBottom: Spacing.md },
  formulaTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  formulaBox: {
    backgroundColor: '#050810',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Spacing.sm,
  },
  formulaText: {
    fontFamily: 'monospace',
    fontSize: FontSize.xs,
    color: Colors.neon.green,
    lineHeight: 20,
    includeFontPadding: false,
  },
  formulaNote: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    lineHeight: 16,
    includeFontPadding: false,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
    paddingHorizontal: Spacing.md,
    includeFontPadding: false,
  },
});
