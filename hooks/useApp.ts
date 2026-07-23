// useApp hook

import { useContext } from 'react';
import { AppContextExport } from '@/contexts/AppContext';

export function useApp() {
  const ctx = useContext(AppContextExport);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
