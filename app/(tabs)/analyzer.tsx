// Scam Text Analyzer Module

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ScanLoader } from '@/components/ui/ScanLoader';
import { analyzeScamText, type ScamAnalysisResult } from '@/services/scamAnalyzer';
import { ScanHistoryRepo, UsersRepo } from '@/services/database';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const SAMPLE_TEXTS = [
  { label: 'Fake Job', text: 'Earn ₹5000 daily from home working on Telegram tasks. No investment. Join now! Call 9xxxxxxxxx' },
  { label: 'KYC Scam', text: 'Your SBI bank account has been suspended due to incomplete KYC. Update immediately to avoid permanent block: http://sbi-kyc.xyz' },
  { label: 'Lottery', text: 'Congratulations! You have won ₹25 Lakh in our lucky draw. Claim your prize by paying ₹2500 processing fee.' },
  { label: 'Clean', text: 'Your OTP for login is 482910. This OTP is valid for 10 minutes. Do not share with anyone.' },
];

export default function AnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const { refreshScore, refreshScans } = useApp();
  const { lang, t } = useLanguage();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  const addLog = (log: string) => setLogs(prev => [...prev, log]);

  const handleAnalyze = async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    setLogs([]);

    try {
      const res = await analyzeScamText(text.trim(), addLog);
      setResult(res);

      await ScanHistoryRepo.insert({
        type: 'SCAM_TEXT',
        raw_input: text.trim().slice(0, 200),
        risk_level: res.risk_level,
        threat_details: {
          category: res.category,
          score: res.overall_score,
          triggers: res.detected_triggers.map(t => t.text),
        },
      });

      // Award first scan badge
      await UsersRepo.awardBadge('first_scan');
      await refreshScore();
      await refreshScans();
    } catch {
      addLog('> ERROR: Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const riskColor =
    result?.risk_level === 'SAFE' ? Colors.neon.green :
    result?.risk_level === 'WARNING' ? Colors.neon.amber :
    Colors.neon.red;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('🤖 Scam AI', '🤖 Scam AI')}</Text>
          <Text style={styles.subtitle}>
            {t('Analyze SMS, WhatsApp & scam messages', 'SMS, WhatsApp messages ko analyze karo')}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Input */}
        <GlassCard style={styles.inputCard}>
          <Text style={styles.label}>
            {t('Paste suspicious message text here', 'Suspicious message yahan paste karo')}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('Paste message text...', 'Message text paste karo...')}
            placeholderTextColor={Colors.text.muted}
            style={styles.textArea}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {/* Sample texts */}
          <Text style={styles.samplesLabel}>
            {t('Load sample:', 'Sample load karo:')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.samplesRow}>
            {SAMPLE_TEXTS.map(sample => (
              <Pressable
                key={sample.label}
                onPress={() => setText(sample.text)}
                style={styles.sampleChip}
              >
                <Text style={styles.sampleChipText}>{sample.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <CyberButton
            label={analyzing ? t('Analyzing...', 'Analysis ho rahi hai...') : t('🔍 Analyze Text', '🔍 Text Analyze Karo')}
            onPress={handleAnalyze}
            loading={analyzing}
            variant="warning"
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        <ScanLoader logs={logs} isScanning={analyzing} />

        {/* Results */}
        {result && (
          <>
            {/* Risk Summary */}
            <GlassCard borderColor={riskColor} glowColor={riskColor} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultScoreLabel}>
                    {t('Risk Score', 'Risk Score')}
                  </Text>
                  <Text style={[styles.resultScore, { color: riskColor }]}>
                    {result.overall_score}%
                  </Text>
                </View>
                <RiskBadge level={result.risk_level} lang={lang} size="lg" />
              </View>

              <View style={[styles.categoryBadge, { backgroundColor: riskColor + '18', borderColor: riskColor + '55' }]}>
                <MaterialIcons name="label" size={14} color={riskColor} />
                <Text style={[styles.categoryText, { color: riskColor }]}>
                  {lang === 'hi' ? result.category_label_hi : result.category_label_en}
                </Text>
              </View>
            </GlassCard>

            {/* Highlighted Text */}
            {result.highlighted_text.length > 0 && (
              <GlassCard style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>
                  {t('🔦 Scam Triggers Highlighted', '🔦 Scam Triggers Highlighted')}
                </Text>
                <Text style={styles.highlightText}>
                  {result.highlighted_text.map((part, i) => (
                    <Text
                      key={i}
                      style={part.isScam ? styles.scamHighlight : styles.normalText}
                    >
                      {part.text}
                    </Text>
                  ))}
                </Text>
              </GlassCard>
            )}

            {/* Guidance */}
            {result.risk_level !== 'SAFE' && (
              <GlassCard
                borderColor={Colors.border.warning}
                style={styles.guidanceCard}
              >
                <Text style={styles.guidanceTitle}>
                  {t('📋 What You Should Do', '📋 Aapko Kya Karna Chahiye')}
                </Text>
                {(lang === 'hi' ? result.guidance_hi : result.guidance_en).map((g, i) => (
                  <View key={i} style={styles.guidanceRow}>
                    <Text style={styles.guidanceBullet}>{i + 1}.</Text>
                    <Text style={styles.guidanceText}>{g}</Text>
                  </View>
                ))}
              </GlassCard>
            )}

            {/* Trigger Details */}
            {result.detected_triggers.length > 0 && (
              <GlassCard style={styles.triggersCard}>
                <Text style={styles.triggersTitle}>
                  {t('⚠️ Detected Indicators', '⚠️ Detected Indicators')}
                </Text>
                {result.detected_triggers.map((trigger, i) => (
                  <View key={i} style={styles.triggerRow}>
                    <View style={[styles.triggerBadge,
                      trigger.severity === 'HIGH' ? { backgroundColor: Colors.neon.redGlow } :
                      { backgroundColor: Colors.neon.amberGlow }
                    ]}>
                      <Text style={[styles.triggerSeverity,
                        { color: trigger.severity === 'HIGH' ? Colors.neon.red : Colors.neon.amber }
                      ]}>
                        {trigger.severity}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.triggerText}>"{trigger.text}"</Text>
                      <Text style={styles.triggerReason}>
                        {lang === 'hi' ? trigger.reason_hi : trigger.reason_en}
                      </Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            )}
          </>
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
    color: Colors.neon.amber,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  inputCard: { marginBottom: Spacing.md },
  textArea: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    minHeight: 120,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  samplesLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginBottom: 6,
    includeFontPadding: false,
  },
  samplesRow: { marginBottom: 4 },
  sampleChip: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neon.amberDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginRight: 6,
  },
  sampleChipText: {
    fontSize: FontSize.xs,
    color: Colors.neon.amber,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  resultCard: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resultScoreLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  resultScore: {
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    includeFontPadding: false,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  highlightCard: { marginBottom: Spacing.sm },
  highlightTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  highlightText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.text.primary,
    includeFontPadding: false,
  },
  scamHighlight: {
    color: Colors.neon.red,
    backgroundColor: Colors.neon.redGlow,
    fontWeight: FontWeight.bold,
  },
  normalText: {
    color: Colors.text.primary,
  },
  guidanceCard: { marginBottom: Spacing.sm },
  guidanceTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neon.amber,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  guidanceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  guidanceBullet: {
    fontSize: FontSize.sm,
    color: Colors.neon.amber,
    fontWeight: FontWeight.bold,
    width: 18,
    includeFontPadding: false,
  },
  guidanceText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  triggersCard: { marginBottom: Spacing.sm },
  triggersTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  triggerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  triggerBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  triggerSeverity: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  triggerText: {
    fontSize: FontSize.sm,
    color: Colors.neon.red,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  triggerReason: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
    includeFontPadding: false,
  },
});
