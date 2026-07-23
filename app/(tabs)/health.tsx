// Health Check Wizard — App Permission & Security Questionnaire

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '@/hooks/useApp';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { HEALTH_QUESTIONS } from '@/constants/config';
import { UsersRepo } from '@/services/database';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function HealthScreen() {
  const insets = useSafeAreaInsets();
  const { refreshScore, user } = useApp();
  const { lang, t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, number>>(
    user?.health_answers ?? {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    if (user?.health_answers && Object.keys(user.health_answers).length > 0) {
      setAnswers(user.health_answers);
      computeAndShow(user.health_answers);
    }
  }, [user]);

  const computeHealthScore = (ans: Record<string, number>): number => {
    let totalDeduction = 0;
    let totalWeight = 0;

    for (const q of HEALTH_QUESTIONS) {
      totalWeight += q.weight;
      if (q.risk_on.includes(ans[q.id] ?? 0)) {
        const idx = ans[q.id] ?? 0;
        const riskIdx = q.risk_on.indexOf(idx);
        const deduction = q.weight * ((riskIdx + 1) / q.risk_on.length);
        totalDeduction += deduction;
      }
    }

    const score = Math.max(0, Math.round(100 - (totalDeduction / totalWeight) * 100));
    return score;
  };

  const computeAndShow = (ans: Record<string, number>) => {
    const score = computeHealthScore(ans);
    setHealthScore(score);
    setSubmitted(true);
  };

  const handleAnswer = (questionId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    const score = computeHealthScore(answers);
    setHealthScore(score);
    setSubmitted(true);

    await UsersRepo.update({
      health_score: score,
      health_answers: answers,
    });
    await UsersRepo.awardBadge('health_check');
    await refreshScore();
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = HEALTH_QUESTIONS.length;
  const progress = (answeredCount / totalQuestions) * 100;

  const healthColor =
    healthScore >= 70 ? Colors.neon.green :
    healthScore >= 40 ? Colors.neon.amber :
    Colors.neon.red;

  const healthLabel =
    healthScore >= 70
      ? t('Low Risk', 'Kam Khatraa')
      : healthScore >= 40
        ? t('Moderate Risk', 'Moderate Khatraa')
        : t('High Risk', 'Zyada Khatraa');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('💪 Health Check', '💪 Health Check')}</Text>
          <Text style={styles.subtitle}>
            {t('Assess your device security posture', 'Apni device security ki jaanch karo')}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {t(`${answeredCount} of ${totalQuestions} questions answered`, `${answeredCount} of ${totalQuestions} sawaal answer kiye`)}
            </Text>
            <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
        </View>

        {/* Score Card (if submitted) */}
        {submitted && (
          <GlassCard borderColor={healthColor} glowColor={healthColor} style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreTitle}>{t('Security Health', 'Security Health')}</Text>
                <Text style={[styles.scoreValue, { color: healthColor }]}>
                  {healthScore}<Text style={styles.scoreMax}>/100</Text>
                </Text>
                <Text style={[styles.scoreLabel, { color: healthColor }]}>{healthLabel}</Text>
              </View>
              <View style={styles.scoreCircle}>
                <MaterialIcons
                  name={healthScore >= 70 ? 'favorite' : healthScore >= 40 ? 'warning' : 'dangerous'}
                  size={40}
                  color={healthColor}
                />
              </View>
            </View>
            {healthScore < 70 && (
              <Text style={styles.scoreAdvice}>
                {t(
                  'Complete all security checks below to improve your score and overall protection.',
                  'Apna score aur protection improve karne ke liye neeche saare security checks complete karo.'
                )}
              </Text>
            )}
          </GlassCard>
        )}

        {/* Questions */}
        {HEALTH_QUESTIONS.map((q, qi) => {
          const selectedIdx = answers[q.id] ?? -1;
          const isRisky = submitted && q.risk_on.includes(selectedIdx);

          return (
            <GlassCard
              key={q.id}
              borderColor={submitted && isRisky ? Colors.border.danger : Colors.border.subtle}
              style={styles.questionCard}
            >
              <View style={styles.questionHeader}>
                <View style={[styles.qNumber, {
                  backgroundColor: selectedIdx >= 0 ? Colors.neon.cyanGlow : Colors.bg.card
                }]}>
                  <Text style={[styles.qNumberText, {
                    color: selectedIdx >= 0 ? Colors.neon.cyan : Colors.text.muted
                  }]}>
                    {qi + 1}
                  </Text>
                </View>
                <Text style={styles.questionText}>
                  {lang === 'hi' ? q.q_hi : q.q_en}
                </Text>
                {submitted && isRisky && (
                  <MaterialIcons name="warning" size={18} color={Colors.neon.red} />
                )}
              </View>

              <View style={styles.optionsContainer}>
                {(lang === 'hi' ? q.options_hi : q.options_en).map((option, oi) => {
                  const isSelected = selectedIdx === oi;
                  const isRiskyOption = submitted && q.risk_on.includes(oi) && isSelected;
                  const isSafeOption = submitted && !q.risk_on.includes(oi) && isSelected;

                  let borderColor = Colors.border.subtle;
                  let bgColor = Colors.bg.glass;
                  let textColor = Colors.text.secondary;

                  if (isSelected) {
                    if (isRiskyOption) {
                      borderColor = Colors.border.danger;
                      bgColor = Colors.neon.redGlow;
                      textColor = Colors.neon.red;
                    } else if (isSafeOption) {
                      borderColor = Colors.border.safe;
                      bgColor = Colors.neon.greenGlow;
                      textColor = Colors.neon.green;
                    } else {
                      borderColor = Colors.border.active;
                      bgColor = Colors.neon.cyanGlow;
                      textColor = Colors.neon.cyan;
                    }
                  }

                  return (
                    <Pressable
                      key={oi}
                      onPress={() => handleAnswer(q.id, oi)}
                      style={({ pressed }) => [
                        styles.option,
                        { borderColor, backgroundColor: bgColor, opacity: pressed ? 0.8 : 1 }
                      ]}
                    >
                      <View style={[styles.optionDot, { borderColor, backgroundColor: isSelected ? borderColor : 'transparent' }]} />
                      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {submitted && isRisky && (
                <View style={styles.riskWarning}>
                  <MaterialIcons name="info" size={14} color={Colors.neon.red} />
                  <Text style={styles.riskWarningText}>
                    {t(`Risk factor detected (+${q.weight} risk weight)`, `Risk factor mila (+${q.weight} risk weight)`)}
                  </Text>
                </View>
              )}
            </GlassCard>
          );
        })}

        {/* Submit */}
        <CyberButton
          label={submitted
            ? t('✓ Re-evaluate Score', '✓ Score Dobara Calculate Karo')
            : t('📊 Calculate Security Health', '📊 Security Health Calculate Karo')
          }
          onPress={handleSubmit}
          variant={submitted ? 'ghost' : 'success'}
          fullWidth
          style={{ marginTop: Spacing.md }}
          disabled={answeredCount === 0}
        />
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
  progressCard: {
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  progressPct: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.neon.cyan,
    includeFontPadding: false,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.bg.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.neon.cyan,
    borderRadius: 3,
    minWidth: 4,
  },
  scoreCard: { marginBottom: Spacing.md },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  scoreLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  scoreAdvice: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  questionCard: {
    marginBottom: Spacing.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  qNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    flexShrink: 0,
  },
  qNumberText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  questionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: 20,
    paddingTop: 4,
    includeFontPadding: false,
  },
  optionsContainer: { gap: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
  },
  optionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
    includeFontPadding: false,
  },
  riskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: Colors.neon.redGlow,
    borderRadius: BorderRadius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border.danger,
  },
  riskWarningText: {
    fontSize: FontSize.xs,
    color: Colors.neon.red,
    includeFontPadding: false,
  },
});
