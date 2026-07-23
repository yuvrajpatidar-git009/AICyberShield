// URL & Link Scanner Module

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable, Animated,
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
import { scanURL, type URLScanResult } from '@/services/scanEngine';
import { ScanHistoryRepo } from '@/services/database';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const EXAMPLE_URLS = [
  'https://sbi-login-verify.xyz/account/kyc',
  'https://free-recharge-claim.top/upi',
  'https://github.com',
  'http://192.168.1.1/banking/login',
];

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { refreshScore, refreshScans } = useApp();
  const { lang, t } = useLanguage();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<URLScanResult | null>(null);
  const resultAnim = useRef(new Animated.Value(0)).current;

  const addLog = (log: string) => setLogs(prev => [...prev, log]);

  const handleScan = async () => {
    if (!url.trim() || scanning) return;
    setScanning(true);
    setResult(null);
    setLogs([]);
    resultAnim.setValue(0);

    try {
      const res = await scanURL(url.trim(), addLog);
      setResult(res);

      await ScanHistoryRepo.insert({
        type: 'URL',
        raw_input: url.trim().slice(0, 200),
        risk_level: res.risk_level,
        threat_details: {
          trust_score: res.trust_score,
          threat_classification: res.threat_classification,
          red_flags: res.detected_red_flags,
          positives: res.detected_positives,
        },
      });

      await refreshScore();
      await refreshScans();

      Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true }).start();
    } catch (e) {
      addLog('> ERROR: Scan failed unexpectedly.');
    } finally {
      setScanning(false);
    }
  };

  const trustColor =
    result?.risk_level === 'SAFE' ? Colors.neon.green :
    result?.risk_level === 'WARNING' ? Colors.neon.amber :
    Colors.neon.red;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('🔍 Link Scanner', '🔍 Link Scanner')}</Text>
          <Text style={styles.subtitle}>
            {t('Detect phishing & malicious URLs', 'Phishing aur malicious URLs pakdo')}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Input Card */}
        <GlassCard style={styles.inputCard}>
          <Text style={styles.label}>
            {t('Enter URL or Link to Scan', 'URL ya Link daalo scan ke liye')}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder={t('https://example.com', 'https://example.com')}
              placeholderTextColor={Colors.text.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onSubmitEditing={handleScan}
            />
            <Pressable
              onPress={() => setUrl('')}
              style={styles.clearBtn}
            >
              {url ? <MaterialIcons name="clear" size={18} color={Colors.text.muted} /> : null}
            </Pressable>
          </View>

          {/* Example URLs */}
          <Text style={styles.exampleLabel}>
            {t('Try examples:', 'Examples try karo:')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
            {EXAMPLE_URLS.map(ex => (
              <Pressable
                key={ex}
                onPress={() => setUrl(ex)}
                style={styles.exampleChip}
              >
                <Text style={styles.exampleText} numberOfLines={1}>{ex}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <CyberButton
            label={scanning ? t('Scanning...', 'Scan ho raha hai...') : t('🔍 Scan Now', '🔍 Scan Karo')}
            onPress={handleScan}
            loading={scanning}
            variant="primary"
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        {/* Terminal Logs */}
        <ScanLoader logs={logs} isScanning={scanning} />

        {/* Result Card */}
        {result && (
          <Animated.View style={{ opacity: resultAnim, transform: [{ scale: resultAnim }] }}>
            <GlassCard borderColor={trustColor} glowColor={trustColor} style={styles.resultCard}>
              {/* Trust Score */}
              <View style={styles.trustRow}>
                <View>
                  <Text style={styles.trustLabel}>
                    {t('Trust Score', 'Trust Score')}
                  </Text>
                  <Text style={[styles.trustScore, { color: trustColor }]}>
                    {result.trust_score}%
                  </Text>
                </View>
                <RiskBadge level={result.risk_level} lang={lang} size="lg" />
              </View>

              {/* Classification */}
              <View style={styles.classRow}>
                <MaterialIcons name="category" size={16} color={trustColor} />
                <Text style={[styles.classification, { color: trustColor }]}>
                  {result.threat_classification}
                </Text>
              </View>

              {/* Certificate */}
              <View style={styles.certRow}>
                <MaterialIcons
                  name={result.certificate_status === 'HTTPS' ? 'lock' : 'lock-open'}
                  size={14}
                  color={result.certificate_status === 'HTTPS' ? Colors.neon.green : Colors.neon.amber}
                />
                <Text style={[
                  styles.certText,
                  { color: result.certificate_status === 'HTTPS' ? Colors.neon.green : Colors.neon.amber }
                ]}>
                  {result.certificate_status === 'HTTPS'
                    ? t('HTTPS Encrypted', 'HTTPS Encrypted')
                    : t('HTTP — Unencrypted', 'HTTP — Unencrypted')
                  }
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Red Flags */}
              {result.detected_red_flags.length > 0 && (
                <>
                  <Text style={styles.flagsTitle}>
                    {t('🚨 Red Flags Detected', '🚨 Red Flags Mile')}
                  </Text>
                  {result.detected_red_flags.map((flag, i) => (
                    <View key={i} style={styles.flagRow}>
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Positives */}
              {result.detected_positives.length > 0 && (
                <>
                  <Text style={styles.positivesTitle}>
                    {t('✅ Positive Signals', '✅ Positive Signals')}
                  </Text>
                  {result.detected_positives.map((pos, i) => (
                    <View key={i} style={styles.positiveRow}>
                      <Text style={styles.positiveText}>{pos}</Text>
                    </View>
                  ))}
                </>
              )}
            </GlassCard>
          </Animated.View>
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
    color: Colors.neon.cyan,
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
  inputCard: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    includeFontPadding: false,
  },
  clearBtn: {
    padding: 4,
  },
  exampleLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginBottom: 6,
    includeFontPadding: false,
  },
  examplesScroll: {
    marginBottom: 4,
  },
  exampleChip: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    marginRight: 6,
    maxWidth: 200,
  },
  exampleText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
  resultCard: {
    marginTop: Spacing.md,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trustLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  trustScore: {
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    includeFontPadding: false,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  classification: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  certText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: Spacing.sm,
  },
  flagsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neon.red,
    marginBottom: 6,
    includeFontPadding: false,
  },
  flagRow: {
    marginBottom: 4,
  },
  flagText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  positivesTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neon.green,
    marginTop: Spacing.sm,
    marginBottom: 6,
    includeFontPadding: false,
  },
  positiveRow: {
    marginBottom: 4,
  },
  positiveText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
