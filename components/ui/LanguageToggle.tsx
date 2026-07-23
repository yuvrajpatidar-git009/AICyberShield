// LanguageToggle — Hinglish / English switch button

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[styles.option, lang === 'hi' && styles.active]}>हि</Text>
      <Text style={styles.divider}>|</Text>
      <Text style={[styles.option, lang === 'en' && styles.active]}>EN</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.glass,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  option: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    fontWeight: FontWeight.semibold,
    includeFontPadding: false,
  },
  active: {
    color: Colors.neon.cyan,
  },
  divider: {
    color: Colors.border.subtle,
    fontSize: FontSize.sm,
    includeFontPadding: false,
  },
});
