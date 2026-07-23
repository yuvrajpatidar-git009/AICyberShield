// ChatBubble — chat message component with markdown-like formatting

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

interface ChatBubbleProps {
  message: string;
  sender: 'USER' | 'AI_BOT';
  timestamp?: string;
}

function renderMessageText(message: string) {
  const lines = message.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <Text key={i} style={styles.boldLine}>
          {line.slice(2, -2)}
        </Text>
      );
    }
    // Inline bold
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1) {
      return (
        <Text key={i} style={styles.normalLine}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <Text key={j} style={styles.bold}>{part}</Text>
              : <Text key={j}>{part}</Text>
          )}
          {i < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    }
    return (
      <Text key={i} style={styles.normalLine}>
        {line}{i < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
}

export function ChatBubble({ message, sender, timestamp }: ChatBubbleProps) {
  const isUser = sender === 'USER';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🛡</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={isUser ? styles.userText : styles.botText}>
          {renderMessageText(message)}
        </Text>
        {timestamp && (
          <Text style={styles.time}>
            {new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg.glassStrong,
    borderWidth: 1,
    borderColor: Colors.border.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  botAvatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.neon.cyanGlow,
    borderWidth: 1,
    borderColor: Colors.border.active,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.bg.glassStrong,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderBottomLeftRadius: 4,
  },
  normalLine: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    includeFontPadding: false,
  },
  boldLine: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neon.cyan,
    marginBottom: 2,
    includeFontPadding: false,
  },
  bold: {
    fontWeight: FontWeight.bold,
    color: Colors.neon.cyan,
  },
  userText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    includeFontPadding: false,
  },
  botText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    includeFontPadding: false,
  },
  time: {
    fontSize: 10,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: 'right',
    includeFontPadding: false,
  },
});
