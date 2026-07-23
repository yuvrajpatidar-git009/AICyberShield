// Security Gauge Component — Animated SVG Radial Gauge

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface SecurityGaugeProps {
  score: number;
  label: string;
  labelHi: string;
  color: string;
  size?: number;
}

export function SecurityGauge({ score, label, labelHi, color, size = 180 }: SecurityGaugeProps) {
  const animatedScore = useRef(new Animated.Value(0)).current;
  const displayScore = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    Animated.timing(displayScore, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const radius = (size - 24) / 2;
  const strokeWidth = 12;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // 270° arc (from -135° to 135°)
  const arcLength = circumference * 0.75;
  const offset = circumference * 0.25 / 2; // start from bottom-left

  const progressArc = (score / 100) * arcLength;
  const dashOffset = arcLength - progressArc;

  const startAngle = 135;
  const endAngle = 135 + (score / 100) * 270;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startX = cx + radius * Math.cos(toRad(startAngle));
  const startY = cy + radius * Math.sin(toRad(startAngle));
  const endX = cx + radius * Math.cos(toRad(endAngle));
  const endY = cy + radius * Math.sin(toRad(endAngle));

  const largeArc = (score / 100) * 270 > 180 ? 1 : 0;

  const arcPath = score > 0
    ? `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
    : '';

  const bgStartX = cx + radius * Math.cos(toRad(135));
  const bgStartY = cy + radius * Math.sin(toRad(135));
  const bgEndX = cx + radius * Math.cos(toRad(135 + 270));
  const bgEndY = cy + radius * Math.sin(toRad(135 + 270));

  const bgPath = `M ${bgStartX} ${bgStartY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Path
          d={bgPath}
          fill="none"
          stroke={Colors.bg.card}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Subtle glow track */}
        <Path
          d={bgPath}
          fill="none"
          stroke={Colors.border.subtle}
          strokeWidth={strokeWidth - 4}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        {score > 0 && (
          <Path
            d={arcPath}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Glow effect on progress */}
        {score > 0 && (
          <Path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
            opacity={0.15}
          />
        )}
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusLabel, { color }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 42,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -1,
    includeFontPadding: false,
  },
  scoreMax: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    fontWeight: FontWeight.medium,
    marginTop: -4,
    includeFontPadding: false,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    includeFontPadding: false,
  },
});
