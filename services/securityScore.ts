// Security Score Engine
// Real-time calculation based on weighted factors

import { SCORE_WEIGHTS } from '@/constants/config';
import { UsersRepo, ScanHistoryRepo, LearningRepo } from '@/services/database';
import { LEARNING_MODULES } from '@/constants/config';

export type ScoreBreakdown = {
  total: number;
  password: number;
  healthCheck: number;
  learning: number;
  cleanScans: number;
  label: string;
  labelHi: string;
  color: string;
};

export function getScoreLabel(score: number): { en: string; hi: string; color: string } {
  if (score >= 80) return { en: 'Fully Shielded', hi: 'Poora Surakshit', color: '#00FF66' };
  if (score >= 60) return { en: 'Moderate Risk', hi: 'Moderate Risk', color: '#FFB800' };
  if (score >= 40) return { en: 'High Risk', hi: 'Zyada Khatraa', color: '#FF8C00' };
  return { en: 'Critical Risk', hi: 'Critical Khatraa', color: '#FF4D4D' };
}

export async function computeSecurityScore(): Promise<ScoreBreakdown> {
  const user = await UsersRepo.getCurrentUser();
  if (!user) {
    return { total: 0, password: 0, healthCheck: 0, learning: 0, cleanScans: 0, label: 'Unknown', labelHi: 'Anjaan', color: '#FF4D4D' };
  }

  // Component 1: Password Score (0-100 → weighted 15%)
  const passwordComponent = Math.round((user.password_score / 100) * 100 * SCORE_WEIGHTS.password);

  // Component 2: Health Check Score (0-100 → weighted 35%)
  const healthComponent = Math.round((user.health_score / 100) * 100 * SCORE_WEIGHTS.healthCheck);

  // Component 3: Learning Modules (0-100 → weighted 25%)
  const completedCount = await LearningRepo.getCompletedCount();
  const totalModules = LEARNING_MODULES.length;
  const learningRatio = totalModules > 0 ? completedCount / totalModules : 0;
  const learningComponent = Math.round(learningRatio * 100 * SCORE_WEIGHTS.learning);

  // Component 4: Clean Scans Ratio (0-100 → weighted 25%)
  const cleanRatio = await ScanHistoryRepo.getCleanRatio();
  const cleanScansComponent = Math.round(cleanRatio * 100 * SCORE_WEIGHTS.cleanScans);

  const total = Math.min(100, Math.max(0,
    passwordComponent + healthComponent + learningComponent + cleanScansComponent
  ));

  const label = getScoreLabel(total);

  // Update user's score in DB
  await UsersRepo.update({ security_score: total });

  return {
    total,
    password: passwordComponent,
    healthCheck: healthComponent,
    learning: learningComponent,
    cleanScans: cleanScansComponent,
    label: label.en,
    labelHi: label.hi,
    color: label.color,
  };
}
