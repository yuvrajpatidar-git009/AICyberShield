// ScanLoader — Animated terminal-style scanning log

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

interface ScanLoaderProps {
  logs: string[];
  isScanning: boolean;
}

export function ScanLoader({ logs, isScanning }: ScanLoaderProps) {
  const scrollRef = useRef<ScrollView>(null);
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    if (isScanning) blink.start();
    return () => blink.stop();
  }, [isScanning]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [logs]);

  if (logs.length === 0 && !isScanning) return null;

  return (
    <View style={styles.terminal}>
      <View style={styles.terminalHeader}>
        <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
        <View style={[styles.dot, { backgroundColor: '#FEBC2E' }]} />
        <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
        <Text style={styles.terminalTitle}>CYBER_SCAN_ENGINE v2.4.1</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.logContainer}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((log, i) => (
          <Text key={i} style={[
            styles.logLine,
            log.includes('DANGEROUS') || log.includes('Alert') ? styles.logDanger :
            log.includes('SAFE') ? styles.logSafe :
            log.includes('complete') ? styles.logSuccess :
            styles.logDefault,
          ]}>
            {log}
          </Text>
        ))}
        {isScanning && (
          <View style={styles.cursorRow}>
            <Text style={styles.logDefault}>{'> '}</Text>
            <Animated.Text style={[styles.cursor, { opacity: cursorAnim }]}>█</Animated.Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  terminal: {
    backgroundColor: '#050810',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#0A0E1A',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    fontFamily: 'monospace' as const,
    marginLeft: 8,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  logContainer: {
    maxHeight: 200,
    padding: Spacing.sm,
  },
  logLine: {
    fontSize: 11,
    fontFamily: 'monospace' as const,
    lineHeight: 18,
    includeFontPadding: false,
  },
  logDefault: {
    color: '#4CAF50',
    fontSize: 11,
    fontFamily: 'monospace' as const,
    includeFontPadding: false,
  },
  logDanger: {
    color: Colors.neon.red,
    fontSize: 11,
    fontFamily: 'monospace' as const,
    includeFontPadding: false,
  },
  logSafe: {
    color: Colors.neon.green,
    fontSize: 11,
    fontFamily: 'monospace' as const,
    includeFontPadding: false,
  },
  logSuccess: {
    color: Colors.neon.cyan,
    fontSize: 11,
    fontFamily: 'monospace' as const,
    includeFontPadding: false,
  },
  cursorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    color: '#4CAF50',
    fontSize: 11,
    fontFamily: 'monospace' as const,
    includeFontPadding: false,
  },
});
