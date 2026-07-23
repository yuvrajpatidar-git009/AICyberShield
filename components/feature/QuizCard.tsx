// QuizCard — interactive quiz question with answer reveal

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  lang: 'en' | 'hi';
  onAnswer: (correct: boolean) => void;
}

export function QuizCard({ question, options, correctIndex, explanation, lang, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    onAnswer(idx === correctIndex);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((opt, idx) => {
          let bg = Colors.bg.glass;
          let border = Colors.border.subtle;
          let textColor = Colors.text.primary;
          let icon: 'check-circle' | 'cancel' | null = null;

          if (answered) {
            if (idx === correctIndex) {
              bg = Colors.risk.safeGlow;
              border = Colors.border.safe;
              textColor = Colors.neon.green;
              icon = 'check-circle';
            } else if (idx === selected) {
              bg = Colors.risk.dangerGlow;
              border = Colors.border.danger;
              textColor = Colors.neon.red;
              icon = 'cancel';
            }
          } else if (selected === idx) {
            border = Colors.border.active;
          }

          return (
            <Pressable
              key={idx}
              onPress={() => handleSelect(idx)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={styles.optionInner}>
                <View style={[styles.optionBullet, { borderColor: border }]}>
                  <Text style={[styles.optionBulletText, { color: textColor }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {icon && <MaterialIcons name={icon} size={18} color={textColor} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <View style={styles.explanationBox}>
          <MaterialIcons name="lightbulb" size={16} color={Colors.neon.amber} />
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.glassStrong,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  question: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: Spacing.md,
    includeFontPadding: false,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm + 4,
  },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBulletText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    includeFontPadding: false,
  },
  optionText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
    includeFontPadding: false,
  },
  explanationBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.neon.amberGlow,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border.warning,
    alignItems: 'flex-start',
  },
  explanationText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neon.amber,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
