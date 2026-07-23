// AI Cyber Assistant + Emergency Panic Mode

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ChatBubble } from '@/components/feature/ChatBubble';
import { EmergencyOverlay } from '@/components/feature/EmergencyOverlay';
import { ChatLogsRepo, type ChatLog } from '@/services/database';
import { getAIResponse, QUICK_PROMPTS } from '@/services/chatService';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ChatLog[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const logs = await ChatLogsRepo.getSessionLogs();
    if (logs.length === 0) {
      // Add welcome message
      const welcome: ChatLog = {
        id: 'welcome',
        session_id: 'welcome',
        user_id: 'system',
        message: lang === 'hi'
          ? `🛡️ **Namaste! Main AI Cyber Shield Assistant hoon.**\n\nMujhse pooch sakte ho:\n• Suspicious link check karna\n• OTP share ho gaya to kya karein\n• WhatsApp/bank fraud\n• Koi bhi cyber safety sawaal\n\nNeeche Quick Prompts use karo ya apna sawaal type karo.`
          : `🛡️ **Hello! I'm your AI Cyber Shield Assistant.**\n\nAsk me about:\n• Checking suspicious links\n• What to do if you shared OTP\n• WhatsApp/bank fraud response\n• Any cyber safety question\n\nUse the Quick Prompts below or type your question.`,
        sender: 'AI_BOT',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    } else {
      setMessages(logs);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (messageText?: string) => {
    const msg = (messageText ?? input).trim();
    if (!msg || isTyping) return;
    setInput('');

    const userLog = await ChatLogsRepo.insert(msg, 'USER');
    setMessages(prev => [...prev, userLog]);
    scrollToBottom();
    setIsTyping(true);

    // Simulate AI typing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    const aiResponse = getAIResponse(msg, lang);
    const aiLog = await ChatLogsRepo.insert(aiResponse, 'AI_BOT');
    setMessages(prev => [...prev, aiLog]);
    setIsTyping(false);
    scrollToBottom();
  };

  const clearChat = async () => {
    await ChatLogsRepo.resetSession();
    setMessages([]);
    await loadHistory();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.onlineIndicator} />
            <View>
              <Text style={styles.title}>{t('AI Assistant', 'AI Assistant')}</Text>
              <Text style={styles.subtitle}>
                {t('Cyber Security Expert • Always Online', 'Cyber Security Expert • Hamesha Online')}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <LanguageToggle />
            <Pressable
              onPress={() => setEmergencyVisible(true)}
              style={({ pressed }) => [styles.emergencyBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name="emergency" size={18} color="#fff" />
              <Text style={styles.emergencyBtnText}>
                {t('SOS', 'SOS')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptsScroll}
          contentContainerStyle={styles.quickPromptsContent}
        >
          {QUICK_PROMPTS.map((prompt, i) => (
            <Pressable
              key={i}
              onPress={() => sendMessage(lang === 'hi' ? prompt.message_hi : prompt.message_en)}
              style={({ pressed }) => [
                styles.quickPrompt,
                { borderColor: prompt.color + '55', opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <MaterialIcons name={prompt.icon as any} size={14} color={prompt.color} />
              <Text style={[styles.quickPromptText, { color: prompt.color }]}>
                {lang === 'hi' ? prompt.label_hi : prompt.label_en}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={clearChat}
            style={styles.clearChatBtn}
          >
            <MaterialIcons name="refresh" size={14} color={Colors.text.muted} />
            <Text style={styles.clearChatText}>{t('New Chat', 'New Chat')}</Text>
          </Pressable>
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: Spacing.sm }}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(msg => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              sender={msg.sender}
              timestamp={msg.timestamp}
            />
          ))}
          {isTyping && (
            <View style={styles.typingRow}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('Ask about any cyber threat...', 'Koi bhi cyber threat poochho...')}
              placeholderTextColor={Colors.text.muted}
              style={styles.input}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={({ pressed }) => [
                styles.sendBtn,
                { opacity: (!input.trim() || isTyping) ? 0.4 : pressed ? 0.8 : 1 }
              ]}
            >
              <MaterialIcons name="send" size={20} color={Colors.neon.cyan} />
            </Pressable>
          </View>
        </View>
      </View>

      <EmergencyOverlay
        visible={emergencyVisible}
        onClose={() => setEmergencyVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neon.green,
    shadowColor: Colors.neon.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neon.cyan,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neon.red,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: Colors.neon.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#fff',
    includeFontPadding: false,
  },
  quickPromptsScroll: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  quickPromptsContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quickPromptText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    includeFontPadding: false,
  },
  clearChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bg.glass,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearChatText: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    includeFontPadding: false,
  },
  messagesScroll: {
    flex: 1,
  },
  typingRow: {
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typingBubble: {
    backgroundColor: Colors.bg.glassStrong,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  typingDots: {
    fontSize: 10,
    color: Colors.neon.cyan,
    letterSpacing: 4,
    includeFontPadding: false,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    backgroundColor: Colors.bg.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    maxHeight: 100,
    includeFontPadding: false,
  },
  sendBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neon.cyanGlow,
  },
});
