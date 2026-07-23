// App Context — Global state management
// Synchronized with AsyncStorage-based DB layer

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UsersRepo, ScanHistoryRepo, LearningRepo, type User, type ScanRecord } from '@/services/database';
import { computeSecurityScore, type ScoreBreakdown } from '@/services/securityScore';

interface AppContextType {
  user: User | null;
  scoreBreakdown: ScoreBreakdown | null;
  recentScans: ScanRecord[];
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshScore: () => Promise<void>;
  refreshScans: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const u = await UsersRepo.getOrCreate();
    setUser(u);
  }, []);

  const refreshScore = useCallback(async () => {
    const score = await computeSecurityScore();
    setScoreBreakdown(score);
    const u = await UsersRepo.getCurrentUser();
    if (u) setUser(u);
  }, []);

  const refreshScans = useCallback(async () => {
    const scans = await ScanHistoryRepo.getByUser(10);
    setRecentScans(scans);
  }, []);

  const refreshAll = useCallback(async () => {
    await refreshUser();
    await refreshScore();
    await refreshScans();
  }, [refreshUser, refreshScore, refreshScans]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await refreshAll();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AppContext.Provider value={{
      user, scoreBreakdown, recentScans, isLoading,
      refreshUser, refreshScore, refreshScans, refreshAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const AppContextExport = AppContext;
