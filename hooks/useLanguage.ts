// Custom Hooks

// useLanguage hook
import { useContext } from 'react';
import { LanguageContextExport } from '@/contexts/LanguageContext';

export function useLanguage() {
  const ctx = useContext(LanguageContextExport);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
