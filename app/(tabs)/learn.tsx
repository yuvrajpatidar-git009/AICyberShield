// Learning Zone & Gamification Module

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
import { BadgeCard } from '@/components/feature/BadgeCard';
import { QuizCard } from '@/components/feature/QuizCard';
import { LEARNING_MODULES, BADGES } from '@/constants/config';
import { LearningRepo, UsersRepo } from '@/services/database';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

type ViewState = 'list' | 'module';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { refreshScore, user } = useApp();
  const { lang, t } = useLanguage();
  const [view, setView] = useState<ViewState>('list');
  const [activeModule, setActiveModule] = useState<typeof LEARNING_MODULES[0] | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const progress = await LearningRepo.getAll();
    const completed = new Set(progress.filter(p => p.completed).map(p => p.module_id));
    setCompletedModules(completed);
  };

  const openModule = (mod: typeof LEARNING_MODULES[0]) => {
    setActiveModule(mod);
    setQuizAnswers({});
    setCurrentQ(0);
    setQuizDone(false);
    setView('module');
  };

  const handleAnswer = async (qIdx: number, correct: boolean) => {
    const newAnswers = { ...quizAnswers, [qIdx]: correct };
    setQuizAnswers(newAnswers);

    const module = activeModule!;
    if (qIdx < module.questions.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 1200);
    } else {
      // Quiz complete
      setTimeout(async () => {
        setQuizDone(true);
        const totalCorrect = Object.values(newAnswers).filter(Boolean).length;
        const pct = Math.round((totalCorrect / module.questions.length) * 100);
        const passed = pct >= 60;

        await LearningRepo.upsert(module.id, pct, passed);

        if (passed) {
          await UsersRepo.awardBadge(module.badge_id);
          await refreshScore();
          await loadProgress();
        }
      }, 1200);
    }
  };

  const earnedBadges = new Set(user?.badges_earned ?? []);
  const totalXP = LEARNING_MODULES
    .filter(m => completedModules.has(m.id))
    .reduce((sum, m) => sum + m.xp, 0);

  const quizScore = quizDone
    ? Math.round(
        (Object.values(quizAnswers).filter(Boolean).length / (activeModule?.questions.length ?? 1)) * 100
      )
    : 0;

  const difficultyColor = (d: string) =>
    d === 'Beginner' ? Colors.neon.green :
    d === 'Intermediate' ? Colors.neon.amber :
    Colors.neon.red;

  if (view === 'module' && activeModule) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Module Header */}
        <View style={styles.moduleHeader}>
          <Pressable
            onPress={() => setView('list')}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.neon.cyan} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.moduleName}>
              {lang === 'hi' ? activeModule.title_hi : activeModule.title_en}
            </Text>
            <Text style={styles.moduleProgress}>
              {t(
                `Question ${currentQ + 1} of ${activeModule.questions.length}`,
                `Sawaal ${currentQ + 1} of ${activeModule.questions.length}`
              )}
            </Text>
          </View>
          <View style={[styles.xpBadge, { borderColor: Colors.neon.amber + '66' }]}>
            <Text style={styles.xpText}>+{activeModule.xp} XP</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {activeModule.questions.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentQ ? styles.dotDone :
                  i === currentQ ? styles.dotActive :
                  styles.dotPending
                ]}
              />
            ))}
          </View>

          {/* Show current question or all if done */}
          {!quizDone ? (
            <QuizCard
              key={currentQ}
              question={lang === 'hi'
                ? activeModule.questions[currentQ].q_hi
                : activeModule.questions[currentQ].q_en
              }
              options={lang === 'hi'
                ? activeModule.questions[currentQ].options_hi
                : activeModule.questions[currentQ].options_en
              }
              correctIndex={activeModule.questions[currentQ].correct}
              explanation={lang === 'hi'
                ? activeModule.questions[currentQ].explanation_hi
                : activeModule.questions[currentQ].explanation_en
              }
              lang={lang}
              onAnswer={(correct) => handleAnswer(currentQ, correct)}
            />
          ) : (
            <GlassCard
              borderColor={quizScore >= 60 ? Colors.border.safe : Colors.border.danger}
              glowColor={quizScore >= 60 ? Colors.neon.green : Colors.neon.red}
              style={styles.resultCard}
            >
              <Text style={[
                styles.resultEmoji,
              ]}>
                {quizScore >= 60 ? '🎉' : '📚'}
              </Text>
              <Text style={[
                styles.resultTitle,
                { color: quizScore >= 60 ? Colors.neon.green : Colors.neon.amber }
              ]}>
                {quizScore >= 60
                  ? t('Module Completed!', 'Module Complete!')
                  : t('Keep Learning!', 'Aur Seekho!')
                }
              </Text>
              <Text style={styles.resultScore}>
                {t(`Score: ${quizScore}%`, `Score: ${quizScore}%`)}
              </Text>
              {quizScore >= 60 && (
                <View style={styles.badgeEarned}>
                  <Text style={styles.badgeEarnedText}>
                    🏅 {t('Badge Earned:', 'Badge Mila:')} {
                      BADGES.find(b => b.id === activeModule.badge_id)?.[lang === 'hi' ? 'name_hi' : 'name_en']
                    }
                  </Text>
                </View>
              )}
              <View style={styles.resultActions}>
                <CyberButton
                  label={t('Try Again', 'Dobara Try Karo')}
                  onPress={() => {
                    setQuizAnswers({});
                    setCurrentQ(0);
                    setQuizDone(false);
                  }}
                  variant="ghost"
                />
                <CyberButton
                  label={t('Back to Modules', 'Modules pe Wapas')}
                  onPress={() => setView('list')}
                  variant="primary"
                />
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('🎓 Learning Zone', '🎓 Learning Zone')}</Text>
          <Text style={styles.subtitle}>
            {t('Earn badges, level up your cyber IQ', 'Badges kamao, Cyber IQ badhao')}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* XP Stats */}
        <GlassCard borderColor={Colors.border.active} style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>{t('Total XP', 'Total XP')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{completedModules.size}</Text>
              <Text style={styles.statLabel}>{t('Completed', 'Complete')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{earnedBadges.size}</Text>
              <Text style={styles.statLabel}>{t('Badges', 'Badges')}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Badges Section */}
        <Text style={styles.sectionTitle}>
          {t('🏅 Your Badges', '🏅 Aapke Badges')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {BADGES.map(badge => (
            <BadgeCard
              key={badge.id}
              icon={badge.icon}
              name={lang === 'hi' ? badge.name_hi : badge.name_en}
              color={badge.color}
              earned={earnedBadges.has(badge.id)}
            />
          ))}
        </ScrollView>

        {/* Modules */}
        <Text style={styles.sectionTitle}>
          {t('📚 Lessons', '📚 Lessons')}
        </Text>
        {LEARNING_MODULES.map(mod => {
          const isCompleted = completedModules.has(mod.id);
          const badgeConfig = BADGES.find(b => b.id === mod.badge_id);

          return (
            <Pressable
              key={mod.id}
              onPress={() => openModule(mod)}
              style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[
                styles.moduleCardInner,
                {
                  borderColor: isCompleted ? Colors.border.safe : Colors.border.subtle,
                  backgroundColor: isCompleted ? Colors.neon.greenGlow : Colors.bg.glass,
                }
              ]}>
                {/* Module Icon */}
                <View style={[
                  styles.moduleIconWrap,
                  { backgroundColor: isCompleted ? Colors.neon.green + '22' : Colors.bg.card }
                ]}>
                  <MaterialIcons
                    name={mod.icon as any}
                    size={24}
                    color={isCompleted ? Colors.neon.green : Colors.neon.cyan}
                  />
                </View>

                {/* Module Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleName}>
                    {lang === 'hi' ? mod.title_hi : mod.title_en}
                  </Text>
                  <View style={styles.moduleMetaRow}>
                    <View style={[
                      styles.difficultyBadge,
                      { borderColor: difficultyColor(mod.difficulty) + '55' }
                    ]}>
                      <Text style={[styles.difficultyText, { color: difficultyColor(mod.difficulty) }]}>
                        {mod.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.moduleQCount}>
                      {mod.questions.length} {t('questions', 'sawaal')}
                    </Text>
                    <Text style={styles.moduleXP}>+{mod.xp} XP</Text>
                  </View>
                </View>

                {/* Badge preview */}
                <View style={styles.moduleBadgePreview}>
                  {badgeConfig && (
                    <Text style={[styles.badgeEmoji, { opacity: isCompleted ? 1 : 0.3 }]}>
                      {badgeConfig.icon}
                    </Text>
                  )}
                  <MaterialIcons
                    name={isCompleted ? 'check-circle' : 'play-arrow'}
                    size={20}
                    color={isCompleted ? Colors.neon.green : Colors.neon.cyan}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}
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
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  statsCard: { marginBottom: Spacing.md },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.neon.cyan,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.subtle,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    includeFontPadding: false,
  },
  badgesScroll: {
    marginBottom: Spacing.md,
  },
  moduleCard: {
    marginBottom: Spacing.sm,
  },
  moduleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  moduleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
    includeFontPadding: false,
  },
  moduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  difficultyBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  moduleQCount: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
  moduleXP: {
    fontSize: FontSize.xs,
    color: Colors.neon.amber,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  moduleBadgePreview: {
    alignItems: 'center',
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  // Module view
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  backBtn: {
    padding: 4,
  },
  moduleProgress: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    marginTop: 2,
    includeFontPadding: false,
  },
  xpBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpText: {
    fontSize: FontSize.xs,
    color: Colors.neon.amber,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDone: { backgroundColor: Colors.neon.green },
  dotActive: { backgroundColor: Colors.neon.cyan, width: 14, height: 14, borderRadius: 7 },
  dotPending: { backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.subtle },
  resultCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  resultScore: {
    fontSize: FontSize.lg,
    color: Colors.text.secondary,
    includeFontPadding: false,
  },
  badgeEarned: {
    backgroundColor: Colors.neon.greenGlow,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border.safe,
    marginTop: Spacing.sm,
  },
  badgeEarnedText: {
    fontSize: FontSize.sm,
    color: Colors.neon.green,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
