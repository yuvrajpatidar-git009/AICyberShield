// Emergency Panic Mode — Full-screen red warning overlay

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
  Linking, Modal, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/hooks/useLanguage';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface EmergencyOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    icon: 'credit-card-off' as const,
    title_en: 'FREEZE Your Bank & UPI Instantly',
    title_hi: 'Bank & UPI TURANT Freeze Karo',
    actions_en: [
      'Call your bank helpline (number on back of card) — say "Block all transactions NOW"',
      'Open your UPI app → Settings → Disable UPI payments',
      'Call NPCI helpline: 1800-120-1740 for UPI emergency block',
    ],
    actions_hi: [
      'Bank helpline call karo (card ke peeche number) — kaho "Sab transactions block karo ABHI"',
      'UPI app kholo → Settings → UPI payments disable karo',
      'NPCI helpline: 1800-120-1740 — UPI emergency block ke liye',
    ],
  },
  {
    step: 2,
    icon: 'phonelink-erase' as const,
    title_en: 'Revoke Active Sessions Immediately',
    title_hi: 'Active Sessions Turant Revoke Karo',
    actions_en: [
      'Google: myaccount.google.com → Security → Your Devices → Sign out all',
      'WhatsApp: Settings → Linked Devices → Log out all devices',
      'Change your email & Google password RIGHT NOW',
    ],
    actions_hi: [
      'Google: myaccount.google.com → Security → Your Devices → Sign out all',
      'WhatsApp: Settings → Linked Devices → Sab devices logout karo',
      'Email & Google password ABHI change karo',
    ],
  },
  {
    step: 3,
    icon: 'report' as const,
    title_en: 'File Cyber Crime Complaint',
    title_hi: 'Cybercrime Complaint File Karo',
    actions_en: [
      'Call National Cyber Crime Helpline: 1930 (24/7)',
      'File online complaint at cybercrime.gov.in',
      'Collect all evidence: screenshots, transaction IDs, phone numbers',
    ],
    actions_hi: [
      'National Cyber Crime Helpline call karo: 1930 (24/7)',
      'cybercrime.gov.in pe online complaint karo',
      'Sab evidence ikatha karo: screenshots, transaction IDs, phone numbers',
    ],
  },
];

export function EmergencyOverlay({ visible, onClose }: EmergencyOverlayProps) {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [visible]);

  const callHelpline = () => {
    Linking.openURL('tel:1930');
  };

  const openCybercrime = () => {
    Linking.openURL('https://cybercrime.gov.in');
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialIcons name="emergency" size={40} color="#FF4D4D" />
          <Text style={styles.headerTitle}>
            {t('🚨 CYBER EMERGENCY', '🚨 CYBER EMERGENCY')}
          </Text>
          <Text style={styles.headerSub}>
            {t('Follow these steps IMMEDIATELY', 'Yeh steps TURANT follow karo')}
          </Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Steps */}
          {STEPS.map((step, idx) => (
            <Pressable
              key={step.step}
              onPress={() => setActiveStep(activeStep === idx ? -1 : idx)}
              style={[
                styles.stepCard,
                activeStep === idx && styles.stepCardActive,
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumber}>{step.step}</Text>
                </View>
                <MaterialIcons name={step.icon} size={20} color="#FF4D4D" />
                <Text style={styles.stepTitle}>
                  {lang === 'hi' ? step.title_hi : step.title_en}
                </Text>
                <MaterialIcons
                  name={activeStep === idx ? 'expand-less' : 'expand-more'}
                  size={20}
                  color="#FF4D4D"
                />
              </View>
              {activeStep === idx && (
                <View style={styles.stepActions}>
                  {(lang === 'hi' ? step.actions_hi : step.actions_en).map((action, i) => (
                    <View key={i} style={styles.actionRow}>
                      <Text style={styles.actionBullet}>▶</Text>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          ))}

          {/* Emergency Call Button */}
          <Pressable
            onPress={callHelpline}
            style={({ pressed }) => [styles.callButton, { opacity: pressed ? 0.85 : 1 }]}
          >
            <MaterialIcons name="phone" size={24} color="#fff" />
            <View>
              <Text style={styles.callButtonTitle}>
                {t('CALL 1930 NOW', 'ABHI 1930 CALL KARO')}
              </Text>
              <Text style={styles.callButtonSub}>
                {t('National Cyber Crime Helpline • 24/7', 'National Cyber Crime Helpline • 24/7')}
              </Text>
            </View>
          </Pressable>

          {/* Complaint Draft */}
          <View style={styles.draftCard}>
            <Text style={styles.draftTitle}>
              {t('📋 Complaint Draft', '📋 Complaint Draft')}
            </Text>
            <Text style={styles.draftText}>
              {t(
                `Subject: Cyber Crime Complaint\n\nI, the complainant, wish to report a cyber fraud/crime that occurred on [DATE]. The fraudster contacted me via [CHANNEL - WhatsApp/Call/SMS] and [DESCRIBE WHAT HAPPENED]. My approximate financial loss is ₹[AMOUNT]. I request immediate action under the IT Act 2000 and BNS 2023.\n\nEvidence available: [LIST SCREENSHOTS/RECORDS]`,
                `Subject: Cyber Crime Complaint\n\nMain, shikayatkarta, ek cyber fraud ki report karna chahta/chahti hoon jo [DATE] ko hua. Fraudster ne mujhse [CHANNEL - WhatsApp/Call/SMS] ke zariye sampark kiya aur [KYA HUA BATAO]. Mera aanuma arthik nuksan ₹[RAKAM] hai. Main IT Act 2000 aur BNS 2023 ke tahat turant kaarvaai ki mang karta/karti hoon.\n\nSaboot: [SCREENSHOTS/RECORDS LIST KARO]`
              )}
            </Text>
            <Pressable onPress={openCybercrime} style={styles.reportLink}>
              <MaterialIcons name="open-in-new" size={14} color={Colors.neon.cyan} />
              <Text style={styles.reportLinkText}>cybercrime.gov.in</Text>
            </Pressable>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.closeBtnText}>
            {t('✕ Exit Emergency Mode', '✕ Emergency Mode Band Karo')}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120005',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 77, 77, 0.3)',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: '#FF4D4D',
    marginTop: Spacing.sm,
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 150, 150, 0.8)',
    marginTop: 4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  stepCard: {
    backgroundColor: 'rgba(255, 77, 77, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.25)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  stepCardActive: {
    borderColor: 'rgba(255, 77, 77, 0.6)',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
    includeFontPadding: false,
  },
  stepTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#FFAAAA',
    includeFontPadding: false,
  },
  stepActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  actionBullet: {
    color: '#FF4D4D',
    fontSize: 10,
    marginTop: 3,
    includeFontPadding: false,
  },
  actionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: 'rgba(255, 200, 200, 0.9)',
    lineHeight: 20,
    includeFontPadding: false,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FF4D4D',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  callButtonTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    includeFontPadding: false,
  },
  callButtonSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    includeFontPadding: false,
  },
  draftCard: {
    backgroundColor: 'rgba(255, 77, 77, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  draftTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFAAAA',
    marginBottom: Spacing.sm,
    includeFontPadding: false,
  },
  draftText: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 180, 180, 0.75)',
    lineHeight: 18,
    fontFamily: 'monospace',
    includeFontPadding: false,
  },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  reportLinkText: {
    fontSize: FontSize.sm,
    color: Colors.neon.cyan,
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
  closeBtn: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.4)',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255, 150, 150, 0.9)',
    includeFontPadding: false,
  },
});
