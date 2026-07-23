// AsyncStorage-based Mock Database Repository
// Mirrors real SQL/NoSQL persistence patterns

import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGEROUS';
export type ScanType = 'URL' | 'SCAM_TEXT' | 'APP_PERMISSION' | 'PASSWORD';
export type Sender = 'USER' | 'AI_BOT';

export interface User {
  id: string;
  email: string;
  security_score: number;
  completed_checklists: string[];
  badges_earned: string[];
  created_at: string;
  password_score: number;
  health_score: number;
  health_answers: Record<string, number>;
}

export interface ScanRecord {
  id: string;
  user_id: string;
  type: ScanType;
  raw_input: string;
  risk_level: RiskLevel;
  threat_details: Record<string, unknown>;
  created_at: string;
}

export interface ChatLog {
  id: string;
  session_id: string;
  user_id: string;
  message: string;
  sender: Sender;
  timestamp: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  module_id: string;
  quiz_score: number;
  completed: boolean;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  USERS: '@acs:users',
  SCAN_HISTORY: '@acs:scan_history',
  CHAT_LOGS: '@acs:chat_logs',
  LEARNING_PROGRESS: '@acs:learning_progress',
  CURRENT_USER_ID: '@acs:current_user_id',
  CHAT_SESSION: '@acs:chat_session',
};

// ─── Generic DB Helpers ───────────────────────────────────────────────────────

async function readTable<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function writeTable<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ─── Users Repository ─────────────────────────────────────────────────────────

export const UsersRepo = {
  async getOrCreate(): Promise<User> {
    const existingId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const users = await readTable<User>(KEYS.USERS);

    if (existingId) {
      const found = users.find(u => u.id === existingId);
      if (found) return found;
    }

    const newUser: User = {
      id: uuidv4(),
      email: 'user@aicybershield.local',
      security_score: 30,
      completed_checklists: [],
      badges_earned: [],
      created_at: new Date().toISOString(),
      password_score: 0,
      health_score: 0,
      health_answers: {},
    };

    users.push(newUser);
    await writeTable(KEYS.USERS, users);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);
    return newUser;
  },

  async update(updates: Partial<User>): Promise<User> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const users = await readTable<User>(KEYS.USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates };
    await writeTable(KEYS.USERS, users);
    return users[idx];
  },

  async getCurrentUser(): Promise<User | null> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!userId) return null;
    const users = await readTable<User>(KEYS.USERS);
    return users.find(u => u.id === userId) || null;
  },

  async awardBadge(badgeId: string): Promise<User | null> {
    const user = await UsersRepo.getCurrentUser();
    if (!user) return null;
    if (user.badges_earned.includes(badgeId)) return user;
    return UsersRepo.update({
      badges_earned: [...user.badges_earned, badgeId],
    });
  },
};

// ─── Scan History Repository ──────────────────────────────────────────────────

export const ScanHistoryRepo = {
  async insert(record: Omit<ScanRecord, 'id' | 'created_at' | 'user_id'>): Promise<ScanRecord> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const scans = await readTable<ScanRecord>(KEYS.SCAN_HISTORY);
    const newRecord: ScanRecord = {
      ...record,
      id: uuidv4(),
      user_id: userId || 'anonymous',
      created_at: new Date().toISOString(),
    };
    scans.push(newRecord);
    // Keep only last 100 records
    if (scans.length > 100) scans.splice(0, scans.length - 100);
    await writeTable(KEYS.SCAN_HISTORY, scans);
    return newRecord;
  },

  async getByUser(limit = 20): Promise<ScanRecord[]> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const scans = await readTable<ScanRecord>(KEYS.SCAN_HISTORY);
    return scans
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  async getCleanRatio(): Promise<number> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const scans = await readTable<ScanRecord>(KEYS.SCAN_HISTORY);
    const userScans = scans.filter(s => s.user_id === userId);
    if (userScans.length === 0) return 0.5;
    const clean = userScans.filter(s => s.risk_level === 'SAFE').length;
    return clean / userScans.length;
  },
};

// ─── Chat Logs Repository ─────────────────────────────────────────────────────

export const ChatLogsRepo = {
  async getSessionId(): Promise<string> {
    const existing = await AsyncStorage.getItem(KEYS.CHAT_SESSION);
    if (existing) return existing;
    const newId = uuidv4();
    await AsyncStorage.setItem(KEYS.CHAT_SESSION, newId);
    return newId;
  },

  async resetSession(): Promise<string> {
    const newId = uuidv4();
    await AsyncStorage.setItem(KEYS.CHAT_SESSION, newId);
    return newId;
  },

  async insert(message: string, sender: Sender): Promise<ChatLog> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const sessionId = await ChatLogsRepo.getSessionId();
    const logs = await readTable<ChatLog>(KEYS.CHAT_LOGS);
    const newLog: ChatLog = {
      id: uuidv4(),
      session_id: sessionId,
      user_id: userId || 'anonymous',
      message,
      sender,
      timestamp: new Date().toISOString(),
    };
    logs.push(newLog);
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    await writeTable(KEYS.CHAT_LOGS, logs);
    return newLog;
  },

  async getSessionLogs(): Promise<ChatLog[]> {
    const sessionId = await ChatLogsRepo.getSessionId();
    const logs = await readTable<ChatLog>(KEYS.CHAT_LOGS);
    return logs
      .filter(l => l.session_id === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
};

// ─── Learning Progress Repository ────────────────────────────────────────────

export const LearningRepo = {
  async getAll(): Promise<LearningProgress[]> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const progress = await readTable<LearningProgress>(KEYS.LEARNING_PROGRESS);
    return progress.filter(p => p.user_id === userId);
  },

  async upsert(moduleId: string, quizScore: number, completed: boolean): Promise<LearningProgress> {
    const userId = await AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
    const progress = await readTable<LearningProgress>(KEYS.LEARNING_PROGRESS);
    const idx = progress.findIndex(p => p.user_id === userId && p.module_id === moduleId);

    const record: LearningProgress = {
      id: idx >= 0 ? progress[idx].id : uuidv4(),
      user_id: userId || 'anonymous',
      module_id: moduleId,
      quiz_score: quizScore,
      completed,
    };

    if (idx >= 0) {
      progress[idx] = record;
    } else {
      progress.push(record);
    }

    await writeTable(KEYS.LEARNING_PROGRESS, progress);
    return record;
  },

  async getCompletedCount(): Promise<number> {
    const all = await LearningRepo.getAll();
    return all.filter(p => p.completed).length;
  },
};
